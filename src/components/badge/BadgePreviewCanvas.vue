<script setup lang="ts">
import { CARD_ASPECT_RATIO, clampPosAndSize, clampSquarePosAndSize } from '@/components/badge/badgeFieldUtils'
import type { BadgeTypeFields, FieldKey, FieldPosition, TextAlign } from '@/types/badgeType'
import Button from '@/volt/Button.vue'
import * as bwipjs from 'bwip-js/browser'
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'

const JUSTIFY_CONTENT_BY_ALIGN: Record<TextAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

interface Props {
  idValue: string
  nameValue: string
  countryValue: string
  bgStyle: Record<string, string>
}
const props = defineProps<Props>()
const fields = defineModel<BadgeTypeFields>('fields', { required: true })

// ---- font sizing ----

let measureContext: CanvasRenderingContext2D | null = null

function fitFontSize(text: string, pixelWidth: number, pixelHeight: number, fontFamily: string): number {
  if (!measureContext) measureContext = document.createElement('canvas').getContext('2d')
  if (!measureContext || !text || pixelWidth <= 0 || pixelHeight <= 0) return 8
  const referenceFontSizePx = 100
  measureContext.font = `${referenceFontSizePx}px ${fontFamily}`
  const referenceWidth = measureContext.measureText(text).width
  const widthFitSizePx = (pixelWidth - 4) / referenceWidth * referenceFontSizePx
  const heightCapPx = pixelHeight * 0.8
  return Math.min(Math.max(Math.min(widthFitSizePx, heightCapPx), 8), 60)
}

// ---- canvas size ----

const previewZoom = ref(1)
const canvas = ref<HTMLElement | null>(null)
const canvasWidthPx = ref(0)
const canvasHeightPx = computed(() => canvasWidthPx.value / CARD_ASPECT_RATIO)

let canvasResizeObserver: ResizeObserver | null = null
onMounted(() => {
  if (!canvas.value) return
  canvasWidthPx.value = canvas.value.getBoundingClientRect().width
  canvasResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (entry) canvasWidthPx.value = entry.contentRect.width
  })
  canvasResizeObserver.observe(canvas.value)
})
onUnmounted(() => { canvasResizeObserver?.disconnect() })

// ---- name display helpers ----

const displayName = computed(() => {
  const limit = fields.value.name.truncateAt ?? 100
  return props.nameValue.length > limit ? props.nameValue.slice(0, limit) + '...' : props.nameValue
})
const nameIsWrapping = computed(() => {
  const wrapAt = fields.value.name.wrapAt
  return wrapAt != null && displayName.value.length > wrapAt
})
const wrappedDisplayName = computed(() => {
  const wrapAt = fields.value.name.wrapAt
  if (!nameIsWrapping.value || wrapAt == null) return displayName.value
  return displayName.value.slice(0, wrapAt) + '\n' + displayName.value.slice(wrapAt)
})

// ---- custom font loading ----

function useCustomFont(fontUrl: Ref<string>, fallbackFamily: string, familyName: string) {
  const resolvedFamily = ref(fallbackFamily)
  let activeFontFace: FontFace | null = null
  let generation = 0
  watch(fontUrl, async (url) => {
    const gen = ++generation
    if (!url) {
      if (activeFontFace) { document.fonts.delete(activeFontFace); activeFontFace = null }
      resolvedFamily.value = fallbackFamily
      return
    }
    const fontFace = new FontFace(familyName, `url(${JSON.stringify(url)})`)
    try {
      await fontFace.load()
      if (gen !== generation) return
      if (activeFontFace) document.fonts.delete(activeFontFace)
      document.fonts.add(fontFace)
      activeFontFace = fontFace
      resolvedFamily.value = `"${familyName}", ${fallbackFamily}`
    } catch {
      if (gen === generation) resolvedFamily.value = fallbackFamily
    }
  }, { immediate: true })
  onUnmounted(() => { if (activeFontFace) document.fonts.delete(activeFontFace) })
  return resolvedFamily
}

const idFontFamily = useCustomFont(computed(() => fields.value.id.fontUrl), 'monospace', 'badge-font-id-preview')
const nameFontFamily = useCustomFont(computed(() => fields.value.name.fontUrl), 'sans-serif', 'badge-font-name-preview')
const countryFontFamily = useCustomFont(computed(() => fields.value.country.fontUrl), 'sans-serif', 'badge-font-country-preview')

const idFontSizePx = computed(() =>
  fitFontSize(props.idValue, fields.value.id.size.width / 100 * canvasWidthPx.value, fields.value.id.size.height / 100 * canvasHeightPx.value, idFontFamily.value))
const nameFontSizePx = computed(() => {
  const w = fields.value.name.size.width / 100 * canvasWidthPx.value
  const h = fields.value.name.size.height / 100 * canvasHeightPx.value
  if (nameIsWrapping.value) {
    const wrapAt = fields.value.name.wrapAt!
    const line1 = displayName.value.slice(0, wrapAt)
    const line2 = displayName.value.slice(wrapAt)
    return fitFontSize(line1.length >= line2.length ? line1 : line2, w, h / 2, nameFontFamily.value)
  }
  return fitFontSize(displayName.value, w, h, nameFontFamily.value)
})
const countryFontSizePx = computed(() =>
  fitFontSize(props.countryValue, fields.value.country.size.width / 100 * canvasWidthPx.value, fields.value.country.size.height / 100 * canvasHeightPx.value, countryFontFamily.value))

// ---- datamatrix ----

const dataMatrixCanvas = ref<HTMLCanvasElement | null>(null)
watchEffect(() => {
  const target = dataMatrixCanvas.value
  if (!target || canvasWidthPx.value <= 0) return
  target.width = Math.round(fields.value.datamatrix.size.width / 100 * canvasWidthPx.value)
  target.height = Math.round(fields.value.datamatrix.size.height / 100 * canvasHeightPx.value)
  bwipjs.toCanvas(target, {
    bcid: 'datamatrix',
    text: props.idValue || ' ',
    barcolor: fields.value.datamatrix.inverted ? 'FFFFFF' : '000000',
    backgroundcolor: fields.value.datamatrix.inverted ? '000000' : 'FFFFFF',
  })
})

// ---- drag / resize ----

function applyPosAndSize(field: FieldKey, pos: FieldPosition, size: { width: number; height: number }) {
  if (field === 'datamatrix') {
    fields.value.datamatrix = { ...fields.value.datamatrix, ...clampSquarePosAndSize(pos, size.width) }
    return
  }
  fields.value[field] = { ...fields.value[field], ...clampPosAndSize(pos, size) }
}

const activeField = ref<FieldKey | null>(null)
const dragMode = ref<'move' | 'resize' | null>(null)
const dragOffset = ref<FieldPosition>({ x: 0, y: 0 })
const resizeStart = ref<{ pointerX: number; pointerY: number; width: number; height: number }>({ pointerX: 0, pointerY: 0, width: 0, height: 0 })

function startDrag(field: FieldKey, event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  const rect = target.getBoundingClientRect()
  dragOffset.value = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  activeField.value = field
  dragMode.value = 'move'
}

function startResize(field: FieldKey, event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  const size = fields.value[field].size
  resizeStart.value = { pointerX: event.clientX, pointerY: event.clientY, width: size.width, height: size.height }
  activeField.value = field
  dragMode.value = 'resize'
}

function onPointerMove(event: PointerEvent) {
  if (!activeField.value || !dragMode.value || !canvas.value) return
  const canvasRect = canvas.value.getBoundingClientRect()
  const field = fields.value[activeField.value]
  if (dragMode.value === 'move') {
    applyPosAndSize(activeField.value,
      { x: (event.clientX - canvasRect.left - dragOffset.value.x) / canvasRect.width * 100, y: (event.clientY - canvasRect.top - dragOffset.value.y) / canvasRect.height * 100 },
      field.size)
    return
  }
  const deltaX = (event.clientX - resizeStart.value.pointerX) / canvasRect.width * 100
  const deltaY = (event.clientY - resizeStart.value.pointerY) / canvasRect.height * 100
  if (activeField.value === 'datamatrix') {
    fields.value.datamatrix = { ...fields.value.datamatrix, ...clampSquarePosAndSize(field.pos, resizeStart.value.width + deltaX) }
    return
  }
  applyPosAndSize(activeField.value, field.pos, { width: resizeStart.value.width + deltaX, height: resizeStart.value.height + deltaY })
}

function stopDrag() { activeField.value = null; dragMode.value = null }
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-2 overflow-x-auto w-full">
    <div class="flex items-center gap-2 text-sm text-slate-600">
      <Button text size="small" :disabled="previewZoom <= 0.5" @click="previewZoom = Math.max(0.5, +(previewZoom - 0.25).toFixed(2))">
        <i class="pi pi-search-minus" />
      </Button>
      <span class="w-12 text-center">{{ Math.round(previewZoom * 100) }}%</span>
      <Button text size="small" :disabled="previewZoom >= 3" @click="previewZoom = Math.min(3, +(previewZoom + 0.25).toFixed(2))">
        <i class="pi pi-search-plus" />
      </Button>
    </div>
    <div
      ref="canvas"
      class="relative aspect-[85.6/54] select-none rounded-xl border border-slate-300 shadow-md flex-shrink-0"
      :style="{ ...bgStyle, width: `${Math.round(384 * previewZoom)}px` }"
      @pointermove="onPointerMove"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
    >
      <div
        v-if="fields.id.enabled"
        class="absolute flex items-center overflow-hidden whitespace-nowrap rounded border border-dashed border-transparent px-1 hover:border-slate-400"
        :style="{ left: `${fields.id.pos.x}%`, top: `${fields.id.pos.y}%`, width: `${fields.id.size.width}%`, height: `${fields.id.size.height}%`, fontSize: `${idFontSizePx}px`, fontFamily: idFontFamily, color: `#${fields.id.color}`, justifyContent: JUSTIFY_CONTENT_BY_ALIGN[fields.id.align], cursor: 'move', WebkitTextStroke: fields.id.borderEnabled ? `1px #${fields.id.borderColor ?? '000000'}` : undefined }"
        @pointerdown="startDrag('id', $event)"
      >
        {{ idValue }}
        <div class="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl bg-slate-400/60" @pointerdown.stop="startResize('id', $event)" />
      </div>
      <div
        v-if="fields.name.enabled"
        class="absolute flex items-center overflow-hidden whitespace-nowrap rounded border border-dashed border-transparent px-1 font-medium hover:border-slate-400"
        :style="{ left: `${fields.name.pos.x}%`, top: `${fields.name.pos.y}%`, width: `${fields.name.size.width}%`, height: `${fields.name.size.height}%`, fontSize: `${nameFontSizePx}px`, fontFamily: nameFontFamily, color: `#${fields.name.color}`, justifyContent: JUSTIFY_CONTENT_BY_ALIGN[fields.name.align], cursor: 'move', WebkitTextStroke: fields.name.borderEnabled ? `1px #${fields.name.borderColor ?? '000000'}` : undefined, whiteSpace: nameIsWrapping ? 'pre-wrap' : undefined, lineHeight: nameIsWrapping && fields.name.wrapLineHeight != null ? `${fields.name.wrapLineHeight / 100 * canvasHeightPx}px` : undefined, alignItems: nameIsWrapping ? 'flex-start' : undefined }"
        @pointerdown="startDrag('name', $event)"
      >
        {{ wrappedDisplayName }}
        <div class="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl bg-slate-400/60" @pointerdown.stop="startResize('name', $event)" />
      </div>
      <div
        v-if="fields.country.enabled"
        class="absolute flex items-center overflow-hidden whitespace-nowrap rounded border border-dashed border-transparent px-1 font-medium hover:border-slate-400"
        :style="{ left: `${fields.country.pos.x}%`, top: `${fields.country.pos.y}%`, width: `${fields.country.size.width}%`, height: `${fields.country.size.height}%`, fontSize: `${countryFontSizePx}px`, fontFamily: countryFontFamily, color: `#${fields.country.color}`, justifyContent: JUSTIFY_CONTENT_BY_ALIGN[fields.country.align], cursor: 'move', WebkitTextStroke: fields.country.borderEnabled ? `1px #${fields.country.borderColor ?? '000000'}` : undefined }"
        @pointerdown="startDrag('country', $event)"
      >
        {{ countryValue }}
        <div class="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl bg-slate-400/60" @pointerdown.stop="startResize('country', $event)" />
      </div>
      <div
        v-if="fields.datamatrix.enabled"
        class="absolute overflow-hidden rounded border border-dashed border-transparent hover:border-slate-400"
        :style="{ left: `${fields.datamatrix.pos.x}%`, top: `${fields.datamatrix.pos.y}%`, width: `${fields.datamatrix.size.width}%`, height: `${fields.datamatrix.size.height}%`, cursor: 'move' }"
        @pointerdown="startDrag('datamatrix', $event)"
      >
        <canvas ref="dataMatrixCanvas" class="h-full w-full" />
        <div class="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl bg-slate-400/60" @pointerdown.stop="startResize('datamatrix', $event)" />
      </div>
    </div>
  </div>
</template>
