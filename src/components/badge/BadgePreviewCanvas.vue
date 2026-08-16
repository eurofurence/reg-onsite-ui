<script setup lang="ts">
import { clampPosAndSize, clampSquarePosAndSize } from '@/components/badge/badgeFieldUtils'
import { isBarcodeStyleSquare } from '@/composables/badge/barcodeStyle'
import {
  backgroundImageAttrs,
  barcodeMarkup,
  computeFontSizePx,
  computeTextLayout,
  fieldBoxPx,
  fontFamilyFor,
  fontFamilyNameFor,
  lineHeightPxFor,
  loadFontForMeasurement,
  resolveDisplayText,
  textAnchorFor,
  widthPxAtDpi,
} from '@/composables/print/badgeHtml'
import { printSettingsRef } from '@/composables/services/badgeConfigStore'
import type { BadgeType, BadgeTypeFields, CustomBarcodeFieldState, CustomTextFieldState, FieldPosition } from '@/types/badgeType'
import Button from '@/volt/Button.vue'
import { computed, ref, watch } from 'vue'

interface Props {
  resolvedBadgeType: BadgeType
  fieldValues: Record<string, string>
}
const props = defineProps<Props>()
const emit = defineEmits<{ 'drag-start': []; 'drag-end': [] }>()
const fields = defineModel<BadgeTypeFields>('fields', { required: true })

function isLocked(fieldId: string): boolean {
  return !fields.value.custom.some((field) => field.id === fieldId) && !fields.value.customBarcodes.some((field) => field.id === fieldId)
}

// ---- card geometry (shared math with print/PDF/SVG-download via badgeHtml.ts) ----

const dpi = computed(() => printSettingsRef.value.dpi)
const cardWidthPxAtPrintDpi = computed(() => widthPxAtDpi(printSettingsRef.value.cardWidthMm, dpi.value))
const cardHeightPxAtPrintDpi = computed(() => cardWidthPxAtPrintDpi.value * (printSettingsRef.value.cardHeightMm / printSettingsRef.value.cardWidthMm))

// ---- background: resolved independently of field edits, so dragging a field never touches the background <image> node ----

const resolvedBackgroundUrl = computed(() => props.resolvedBadgeType.background.url)

const backgroundAttrs = computed(() => backgroundImageAttrs(
  props.resolvedBadgeType.background.fit,
  props.resolvedBadgeType.background.alignH,
  props.resolvedBadgeType.background.alignV,
  cardWidthPxAtPrintDpi.value,
  cardHeightPxAtPrintDpi.value,
))

// ---- text fields: each computed independently, keyed by field id, so dragging one field only patches that field's own SVG attributes ----

interface TextFieldRender {
  fontFamily: string
  fontSizePx: number
  textAnchor: string
  textX: number
  isWrapping: boolean
  singleLineText: string
  singleLineY: number
  lines: { text: string; y: number }[]
  color: string
  borderEnabled?: boolean
  borderColor?: string
}

// Tracks, per field id, the fontUrl whose load has actually completed, so
// textFieldRender can tell "font requested" from "font ready".
const loadedFontUrlByFamily = ref<Record<string, string>>({})

function textFieldRender(field: CustomTextFieldState): TextFieldRender {
  const rawValue = props.fieldValues[field.id] ?? ''
  const displayText = resolveDisplayText(field, rawValue)
  const boxPx = fieldBoxPx(field.pos, field.size, cardWidthPxAtPrintDpi.value, cardHeightPxAtPrintDpi.value)
  const fontFamilyName = fontFamilyNameFor(field.id, props.resolvedBadgeType.id)
  // Measure/render against the fallback font until the custom font for this field's current fontUrl has actually finished loading.
  const fontLoaded = loadedFontUrlByFamily.value[field.id] === field.fontUrl
  const fontFamily = fontFamilyFor(fontLoaded ? field : { fontUrl: '' }, fontFamilyName)
  const { fontSizePx } = computeFontSizePx(field, displayText, fontFamily, boxPx, dpi.value)
  const lineHeightPx = lineHeightPxFor(field, displayText.isWrapping, fontSizePx, cardHeightPxAtPrintDpi.value)
  const layout = computeTextLayout(boxPx, fontSizePx, fontFamily, displayText.wrappedValue, field.align, displayText.isWrapping, lineHeightPx)
  return {
    fontFamily,
    fontSizePx,
    textAnchor: textAnchorFor(field.align),
    textX: layout.textX,
    isWrapping: displayText.isWrapping,
    singleLineText: displayText.wrappedValue,
    singleLineY: layout.singleLineY,
    lines: layout.lines,
    color: field.color,
    borderEnabled: field.borderEnabled,
    borderColor: field.borderColor,
  }
}

const textFieldRenders = computed<Record<string, TextFieldRender>>(() => {
  const renders: Record<string, TextFieldRender> = {}
  for (const field of props.resolvedBadgeType.fields.custom) {
    renders[field.id] = textFieldRender(field)
  }
  return renders
})

// Loads each field's custom font and tracks which fields have one loaded, so
// it can be embedded as an in-SVG @font-face (document.fonts.add() alone
// doesn't reliably repaint already laid-out SVG <text>).
const loadedFontUrls = ref<Record<string, string>>({})
watch(
  () => props.resolvedBadgeType.fields.custom.map((field) => [field.id, field.fontUrl] as const),
  (fontUrlsById) => {
    for (const [fieldId, fontUrl] of fontUrlsById) {
      if (!fontUrl) continue
      const fontFamilyName = fontFamilyNameFor(fieldId, props.resolvedBadgeType.id)
      void (async () => {
        await loadFontForMeasurement(fontFamilyName, fontUrl)
        loadedFontUrls.value = { ...loadedFontUrls.value, [fieldId]: fontUrl }
        loadedFontUrlByFamily.value = { ...loadedFontUrlByFamily.value, [fieldId]: fontUrl }
      })()
    }
  },
  { immediate: true },
)

const fontFaceCss = computed(() => {
  const rules = props.resolvedBadgeType.fields.custom
    .filter((field) => field.fontUrl && loadedFontUrls.value[field.id])
    .map((field) => {
      const fontFamilyName = fontFamilyNameFor(field.id, props.resolvedBadgeType.id)
      return `@font-face { font-family: '${fontFamilyName}'; src: url('${loadedFontUrls.value[field.id]}') format('opentype'); }`
    })
  return rules.join('\n')
})

// Vue disallows literal <style> tags in templates, so build it as v-html on <defs> instead.
const fontFaceStyleMarkup = computed(() => `<style>${fontFaceCss.value}</style>`)

// ---- barcodes: each computed independently, keyed by field id ----

interface BarcodeFieldRender {
  box: { left: number; top: number; width: number; height: number }
  viewBox: string
  innerSvg: string
}

function barcodeRender(field: CustomBarcodeFieldState): BarcodeFieldRender {
  const idValue = props.fieldValues[field.id] ?? ''
  const box = fieldBoxPx(field.pos, field.size, cardWidthPxAtPrintDpi.value, cardHeightPxAtPrintDpi.value)
  const { viewBox, innerSvg } = barcodeMarkup(field.style, field.inverted, idValue, field.color ?? '000000', field.transparentBackground ?? false)
  return { box, viewBox, innerSvg }
}

const barcodeRenders = computed<Record<string, BarcodeFieldRender>>(() => {
  const renders: Record<string, BarcodeFieldRender> = {}
  for (const field of props.resolvedBadgeType.fields.customBarcodes) {
    renders[field.id] = barcodeRender(field)
  }
  return renders
})

// ---- canvas size ----
// CSS 96px = 1 physical inch (independent of print DPI/monitor density), so previewZoom === 1 renders at true physical size.
const CSS_PX_PER_INCH = 96
const MM_PER_INCH = 25.4

const cardAspectRatio = computed(() => printSettingsRef.value.cardWidthMm / printSettingsRef.value.cardHeightMm)

const previewZoom = ref(2)
const canvas = ref<HTMLElement | null>(null)
const cardWidthCssPx = computed(() => printSettingsRef.value.cardWidthMm / MM_PER_INCH * CSS_PX_PER_INCH * previewZoom.value)

// ---- barcode square detection (for resize clamping only) ----
// isBarcodeStyleSquare renders a full SVG via bwipjs — memoize by (style, sampleText) to avoid re-rendering on every pointermove.
const barcodeSquareCache = new Map<string, boolean>()

function isBarcodeSquare(fieldId: string, style: string): boolean {
  const sampleText = props.fieldValues[fieldId] ?? ''
  const cacheKey = `${style}|${sampleText}`
  let cached = barcodeSquareCache.get(cacheKey)
  if (cached === undefined) {
    cached = isBarcodeStyleSquare(style, sampleText)
    barcodeSquareCache.set(cacheKey, cached)
  }
  return cached
}

// ---- drag / resize ----

type ActiveKind = 'text' | 'barcode'

function applyTextPosAndSize(fieldId: string, pos: FieldPosition, size: { width: number; height: number }) {
  const index = fields.value.custom.findIndex((field) => field.id === fieldId)
  if (index === -1) return
  fields.value.custom[index] = { ...fields.value.custom[index]!, ...clampPosAndSize(pos, size) }
}

function applyBarcodePosAndSize(fieldId: string, pos: FieldPosition, size: { width: number; height: number }) {
  const index = fields.value.customBarcodes.findIndex((field) => field.id === fieldId)
  if (index === -1) return
  const field = fields.value.customBarcodes[index]!
  if (isBarcodeSquare(field.id, field.style)) {
    fields.value.customBarcodes[index] = { ...field, ...clampSquarePosAndSize(pos, size.width, cardAspectRatio.value) }
    return
  }
  fields.value.customBarcodes[index] = { ...field, ...clampPosAndSize(pos, size) }
}

const activeFieldId = ref<string | null>(null)
const activeKind = ref<ActiveKind | null>(null)
const dragMode = ref<'move' | 'resize' | null>(null)
const dragOffset = ref<FieldPosition>({ x: 0, y: 0 })
const resizeStart = ref<{ pointerX: number; pointerY: number; width: number; height: number }>({ pointerX: 0, pointerY: 0, width: 0, height: 0 })

function startDrag(kind: ActiveKind, fieldId: string, event: PointerEvent) {
  if (isLocked(fieldId)) return
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  const rect = target.getBoundingClientRect()
  dragOffset.value = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  activeFieldId.value = fieldId
  activeKind.value = kind
  dragMode.value = 'move'
  emit('drag-start')
}

function startResize(kind: ActiveKind, fieldId: string, size: { width: number; height: number }, event: PointerEvent) {
  if (isLocked(fieldId)) return
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  resizeStart.value = { pointerX: event.clientX, pointerY: event.clientY, width: size.width, height: size.height }
  activeFieldId.value = fieldId
  activeKind.value = kind
  dragMode.value = 'resize'
  emit('drag-start')
}

function onPointerMove(event: PointerEvent) {
  if (!activeFieldId.value || !activeKind.value || !dragMode.value || !canvas.value) return
  const canvasRect = canvas.value.getBoundingClientRect()
  const apply = activeKind.value === 'text' ? applyTextPosAndSize : applyBarcodePosAndSize
  const collection = activeKind.value === 'text' ? fields.value.custom : fields.value.customBarcodes
  const field = collection.find((entry) => entry.id === activeFieldId.value)
  if (!field) return
  if (dragMode.value === 'move') {
    apply(activeFieldId.value,
      { x: (event.clientX - canvasRect.left - dragOffset.value.x) / canvasRect.width * 100, y: (event.clientY - canvasRect.top - dragOffset.value.y) / canvasRect.height * 100 },
      field.size)
    return
  }
  const deltaX = (event.clientX - resizeStart.value.pointerX) / canvasRect.width * 100
  const deltaY = (event.clientY - resizeStart.value.pointerY) / canvasRect.height * 100
  apply(activeFieldId.value, field.pos, { width: resizeStart.value.width + deltaX, height: resizeStart.value.height + deltaY })
}

function stopDrag() {
  const wasDragging = dragMode.value !== null
  activeFieldId.value = null
  activeKind.value = null
  dragMode.value = null
  if (wasDragging) emit('drag-end')
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-2 overflow-x-auto w-full">
    <div class="flex items-center gap-2 text-sm text-slate-600">
      <Button text size="small" :disabled="previewZoom <= 0.5" @click="previewZoom = Math.max(0.5, +(previewZoom - 0.25).toFixed(2))">
        <i class="pi pi-search-minus" />
      </Button>
      <span class="w-12 text-center">{{ Math.round(previewZoom * 100) }}%</span>
      <Button text size="small" :disabled="previewZoom >= 5" @click="previewZoom = Math.min(5, +(previewZoom + 0.25).toFixed(2))">
        <i class="pi pi-search-plus" />
      </Button>
    </div>
    <div
      ref="canvas"
      class="relative select-none rounded-xl border border-slate-300 shadow-md flex-shrink-0"
      :style="{ width: `${Math.round(cardWidthCssPx)}px`, aspectRatio: String(cardAspectRatio) }"
      @pointermove="onPointerMove"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
    >
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full overflow-hidden rounded-xl"
        :viewBox="`0 0 ${cardWidthPxAtPrintDpi} ${cardHeightPxAtPrintDpi}`"
        preserveAspectRatio="none"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <defs v-if="fontFaceCss" v-html="fontFaceStyleMarkup" />
        <rect x="0" y="0" :width="cardWidthPxAtPrintDpi" :height="cardHeightPxAtPrintDpi" :fill="`#${resolvedBadgeType.background.color}`" />
        <image
          v-if="resolvedBackgroundUrl"
          :href="resolvedBackgroundUrl"
          :x="backgroundAttrs.x"
          :y="backgroundAttrs.y"
          :width="backgroundAttrs.width"
          :height="backgroundAttrs.height"
          :preserveAspectRatio="backgroundAttrs.preserveAspectRatio"
          :transform="backgroundAttrs.transform"
        />
        <g v-for="field in resolvedBadgeType.fields.custom" :key="field.id" v-show="field.enabled">
          <text
            v-if="!textFieldRenders[field.id]?.isWrapping"
            :x="textFieldRenders[field.id]?.textX"
            :y="textFieldRenders[field.id]?.singleLineY"
            :font-family="textFieldRenders[field.id]?.fontFamily"
            :font-size="textFieldRenders[field.id]?.fontSizePx"
            :fill="`#${textFieldRenders[field.id]?.color}`"
            :text-anchor="textFieldRenders[field.id]?.textAnchor"
            :stroke="textFieldRenders[field.id]?.borderEnabled ? `#${textFieldRenders[field.id]?.borderColor ?? '000000'}` : undefined"
            :stroke-width="textFieldRenders[field.id]?.borderEnabled ? 1 : undefined"
          >{{ textFieldRenders[field.id]?.singleLineText }}</text>
          <text
            v-else
            :font-family="textFieldRenders[field.id]?.fontFamily"
            :font-size="textFieldRenders[field.id]?.fontSizePx"
            :fill="`#${textFieldRenders[field.id]?.color}`"
            :text-anchor="textFieldRenders[field.id]?.textAnchor"
            :stroke="textFieldRenders[field.id]?.borderEnabled ? `#${textFieldRenders[field.id]?.borderColor ?? '000000'}` : undefined"
            :stroke-width="textFieldRenders[field.id]?.borderEnabled ? 1 : undefined"
          >
            <tspan v-for="(line, index) in textFieldRenders[field.id]?.lines" :key="index" :x="textFieldRenders[field.id]?.textX" :y="line.y">{{ line.text }}</tspan>
          </text>
        </g>
        <g v-for="field in resolvedBadgeType.fields.customBarcodes" :key="field.id" v-show="field.enabled">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <svg
            :x="barcodeRenders[field.id]?.box.left"
            :y="barcodeRenders[field.id]?.box.top"
            :width="barcodeRenders[field.id]?.box.width"
            :height="barcodeRenders[field.id]?.box.height"
            :viewBox="barcodeRenders[field.id]?.viewBox"
            v-html="barcodeRenders[field.id]?.innerSvg"
          />
        </g>
      </svg>
      <div
        v-for="field in resolvedBadgeType.fields.custom"
        v-show="field.enabled"
        :key="field.id"
        class="absolute rounded border border-dashed border-transparent hover:border-slate-400"
        :style="{ left: `${field.pos.x}%`, top: `${field.pos.y}%`, width: `${field.size.width}%`, height: `${field.size.height}%`, cursor: isLocked(field.id) ? 'not-allowed' : 'move' }"
        @pointerdown="startDrag('text', field.id, $event)"
      >
        <div v-if="!isLocked(field.id)" class="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl bg-slate-400/60" @pointerdown.stop="startResize('text', field.id, field.size, $event)" />
      </div>
      <div
        v-for="field in resolvedBadgeType.fields.customBarcodes"
        v-show="field.enabled"
        :key="field.id"
        class="absolute rounded border border-dashed border-transparent hover:border-slate-400"
        :style="{ left: `${field.pos.x}%`, top: `${field.pos.y}%`, width: `${field.size.width}%`, height: `${field.size.height}%`, cursor: isLocked(field.id) ? 'not-allowed' : 'move' }"
        @pointerdown="startDrag('barcode', field.id, $event)"
      >
        <div v-if="!isLocked(field.id)" class="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl bg-slate-400/60" @pointerdown.stop="startResize('barcode', field.id, field.size, $event)" />
      </div>
    </div>
  </div>
</template>
