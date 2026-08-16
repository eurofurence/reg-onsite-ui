import { renderBadgeSvg, renderBadgeSvgForPdf } from '@/composables/print/badgeHtml'
import { addBadgePage, createBadgeRenderJob, downloadBlob } from '@/composables/print/downloadBadge'
import { printSettingsRef } from '@/composables/services/badgeConfigStore'
import type { BadgeType } from '@/types/badgeType'
import { getOrientedPageDimensionsMm } from '@/types/printSettings'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'

export interface BadgeExportEntry {
  resolvedBadgeType: BadgeType
  fieldValues: Record<string, string>
  filenameBase: string
}

const BATCH_RENDER_CONCURRENCY = 8

export class BatchCancelledError extends Error {
  constructor() {
    super('Export cancelled')
    this.name = 'BatchCancelledError'
  }
}

export interface BatchItemFailure<T> {
  index: number
  item: T
  error: unknown
}

interface MapWithConcurrencyResult<T, R> {
  results: R[]
  failures: BatchItemFailure<T>[]
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapItem: (item: T) => Promise<R>,
  signal?: AbortSignal,
): Promise<MapWithConcurrencyResult<T, R>> {
  const results: R[] = new Array(items.length)
  const failures: BatchItemFailure<T>[] = []
  let nextIndex = 0
  async function runWorker() {
    for (let currentIndex = nextIndex; currentIndex < items.length; currentIndex = nextIndex) {
      if (signal?.aborted) return
      nextIndex += 1
      const item = items[currentIndex]
      if (item === undefined) continue
      try {
        results[currentIndex] = await mapItem(item)
      } catch (error) {
        failures.push({ index: currentIndex, item, error })
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker())
  await Promise.all(workers)
  if (signal?.aborted) throw new BatchCancelledError()
  return { results, failures }
}

// Runs mapItem across items with bounded concurrency, but yields results strictly in
// order via onResult as soon as each item's turn comes up — lets CPU-bound rendering
// for later items overlap with sequential, order-dependent consumption of earlier ones
// (e.g. writing pages into a single shared jsPDF document, which can't be done out of
// order or concurrently). Items whose mapItem or onResult throws are recorded as
// failures and skipped, rather than aborting the remaining items in the batch.
async function mapWithConcurrencyOrdered<T, R>(
  items: T[],
  concurrency: number,
  mapItem: (item: T) => Promise<R>,
  onResult: (result: R, item: T, index: number) => Promise<void>,
  signal?: AbortSignal,
): Promise<BatchItemFailure<T>[]> {
  const pending = new Map<number, Promise<R>>()
  const failures: BatchItemFailure<T>[] = []
  let nextToStart = 0
  let nextToConsume = 0

  function fillPending() {
    while (pending.size < concurrency && nextToStart < items.length) {
      const index = nextToStart
      nextToStart += 1
      const item = items[index]
      if (item === undefined) continue
      pending.set(index, mapItem(item))
    }
  }

  while (nextToConsume < items.length) {
    if (signal?.aborted) throw new BatchCancelledError()
    fillPending()
    const result = pending.get(nextToConsume)
    if (result === undefined) break
    const item = items[nextToConsume]
    if (item === undefined) break
    pending.delete(nextToConsume)
    try {
      const resolved = await result
      if (signal?.aborted) throw new BatchCancelledError()
      await onResult(resolved, item, nextToConsume)
    } catch (error) {
      if (error instanceof BatchCancelledError) throw error
      failures.push({ index: nextToConsume, item, error })
    }
    nextToConsume += 1
  }
  return failures
}

function uniqueFilename(filenameBase: string, extension: string, usedFilenames: Set<string>): string {
  let filename = `${filenameBase}.${extension}`
  let suffix = 2
  while (usedFilenames.has(filename)) {
    filename = `${filenameBase}-${suffix}.${extension}`
    suffix += 1
  }
  usedFilenames.add(filename)
  return filename
}

export interface RenderBadgeSvgsResult {
  svgsByEntry: Map<BadgeExportEntry, string>
  failures: BatchItemFailure<BadgeExportEntry>[]
}

// Renders SVGs for entries with bounded concurrency, without saving/downloading
// anything — callers merge results across retry attempts and only save once every
// entry has either succeeded or been explicitly skipped by the user. Used both to
// build the SVG zip archive and to render pages for printing.
export async function renderBadgeSvgs(
  entries: BadgeExportEntry[],
  onProgress?: (renderedCount: number, totalCount: number) => void,
  signal?: AbortSignal,
): Promise<RenderBadgeSvgsResult> {
  const printSettings = printSettingsRef.value
  let renderedCount = 0
  const { results: svgs, failures } = await mapWithConcurrency(entries, BATCH_RENDER_CONCURRENCY, async (entry) => {
    const svg = await renderBadgeSvg(
      entry.resolvedBadgeType,
      entry.fieldValues,
      printSettings.cardWidthMm,
      printSettings.cardHeightMm,
      printSettings.dpi,
    )
    renderedCount += 1
    onProgress?.(renderedCount, entries.length)
    return svg
  }, signal)
  const svgsByEntry = new Map<BadgeExportEntry, string>()
  entries.forEach((entry, index) => {
    const svg = svgs[index]
    if (svg !== undefined) svgsByEntry.set(entry, svg)
  })
  return { svgsByEntry, failures }
}

export function saveBadgesZip(
  entries: BadgeExportEntry[],
  svgsByEntry: Map<BadgeExportEntry, string>,
): Promise<Blob> {
  const zip = new JSZip()
  const usedFilenames = new Set<string>()
  entries.forEach((entry) => {
    const svg = svgsByEntry.get(entry)
    if (svg === undefined) return
    zip.file(uniqueFilename(entry.filenameBase, 'svg', usedFilenames), svg)
  })
  return zip.generateAsync({ type: 'blob' })
}

export async function downloadBadgesZip(
  entries: BadgeExportEntry[],
  archiveFilenameBase: string,
  onProgress?: (renderedCount: number, totalCount: number) => void,
  signal?: AbortSignal,
): Promise<BatchItemFailure<BadgeExportEntry>[]> {
  const { svgsByEntry, failures } = await renderBadgeSvgs(entries, onProgress, signal)
  const blob = await saveBadgesZip(entries, svgsByEntry)
  downloadBlob(blob, `${archiveFilenameBase}.zip`)
  return failures
}

// forceSave saves the PDF even if some entries failed — used once the caller has
// decided (via the retry dialog) to skip the remaining failures and finalize with
// whatever succeeded. Without it, a failed attempt never saves a partial PDF: the
// caller re-runs downloadBadgesPdf over the full non-skipped entry list instead,
// since a single shared jsPDF document can't be incrementally patched across retries.
export async function downloadBadgesPdf(
  entries: BadgeExportEntry[],
  filenameBase: string,
  onProgress?: (renderedCount: number, totalCount: number) => void,
  signal?: AbortSignal,
  forceSave = false,
): Promise<BatchItemFailure<BadgeExportEntry>[]> {
  const printSettings = printSettingsRef.value
  const pageDimensions = getOrientedPageDimensionsMm(printSettings)
  const orientation = pageDimensions.width > pageDimensions.height ? 'landscape' : 'portrait'

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pageDimensions.width, pageDimensions.height],
  })
  const job = createBadgeRenderJob()
  let pagesWritten = 0

  // Rendering each badge's SVG is pure CPU work with no shared state, so it can run
  // concurrently across entries; writing into the PDF must stay sequential (a single
  // shared jsPDF document can't be drawn into out of order or from multiple pages at
  // once). mapWithConcurrencyOrdered overlaps the two: later entries render while an
  // earlier entry's page is still being written. pagesWritten (not the entry's
  // original index) gates addPage so a failed entry doesn't leave a stray blank page.
  const failures = await mapWithConcurrencyOrdered(
    entries,
    BATCH_RENDER_CONCURRENCY,
    (entry) => renderBadgeSvgForPdf(
      entry.resolvedBadgeType,
      entry.fieldValues,
      printSettings.cardWidthMm,
      printSettings.cardHeightMm,
      printSettings.dpi,
    ),
    async ({ svg, textFieldLayouts }, entry, index) => {
      if (pagesWritten > 0) {
        doc.addPage([pageDimensions.width, pageDimensions.height], orientation)
      }
      await addBadgePage(doc, entry.resolvedBadgeType, svg, textFieldLayouts, printSettings.cardRotationDeg, job)
      pagesWritten += 1
      if (printSettings.doubleSided) {
        const backRotationDeg = printSettings.cardRotationDeg + (printSettings.backSideRotated180 ? 180 : 0)
        doc.addPage([pageDimensions.width, pageDimensions.height], orientation)
        await addBadgePage(doc, entry.resolvedBadgeType, svg, textFieldLayouts, backRotationDeg, job)
        pagesWritten += 1
      }
      onProgress?.(index + 1, entries.length)
    },
    signal,
  )

  if (pagesWritten > 0 && (forceSave || failures.length === 0)) {
    doc.save(`${filenameBase}.pdf`)
  }
  return failures
}
