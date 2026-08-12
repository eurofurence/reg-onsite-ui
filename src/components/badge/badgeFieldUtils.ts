import type { FieldPosition, FieldSize } from '@/types/badgeType'

export const CARD_WIDTH_CM = 85.6 / 10
export const CARD_HEIGHT_CM = 54 / 10
export const CARD_ASPECT_RATIO = CARD_WIDTH_CM / CARD_HEIGHT_CM
export const MIN_FIELD_WIDTH_PERCENT = 5
export const MIN_FIELD_HEIGHT_PERCENT = 4

export function clampPosAndSize(pos: FieldPosition, size: FieldSize): { pos: FieldPosition; size: FieldSize } {
  const clampedSize = {
    width: Math.min(Math.max(size.width, MIN_FIELD_WIDTH_PERCENT), 100),
    height: Math.min(Math.max(size.height, MIN_FIELD_HEIGHT_PERCENT), 100),
  }
  return {
    pos: {
      x: Math.min(Math.max(pos.x, 0), 100 - clampedSize.width),
      y: Math.min(Math.max(pos.y, 0), 100 - clampedSize.height),
    },
    size: clampedSize,
  }
}

export function clampSquarePosAndSize(pos: FieldPosition, widthPercent: number): { pos: FieldPosition; size: FieldSize } {
  const maxWidthPercent = Math.min(100, 100 / CARD_ASPECT_RATIO)
  const clampedWidth = Math.min(Math.max(widthPercent, MIN_FIELD_WIDTH_PERCENT), maxWidthPercent)
  const heightPercent = clampedWidth * CARD_ASPECT_RATIO
  return clampPosAndSize(pos, { width: clampedWidth, height: heightPercent })
}
