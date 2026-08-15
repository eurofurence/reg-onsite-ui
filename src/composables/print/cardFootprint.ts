import type { CardRotationDeg } from '@/types/printSettings'

export interface CardFootprint {
  imgLeftMm: number
  imgTopMm: number
  footprintWidthMm: number
  footprintHeightMm: number
}

function isQuarterTurned(cardRotationDeg: CardRotationDeg): boolean {
  return cardRotationDeg === 90 || cardRotationDeg === 270
}

// cardXMm/cardYMm mark the top-left of the card's on-page footprint. When rotated 90/270deg,
// the footprint is cardHeightMm x cardWidthMm, so the unrotated image (cardWidthMm x
// cardHeightMm) is centered within that footprint and rotated about its own center.
export function getCardFootprint(
  cardXMm: number,
  cardYMm: number,
  cardWidthMm: number,
  cardHeightMm: number,
  cardRotationDeg: CardRotationDeg,
): CardFootprint {
  const rotated = isQuarterTurned(cardRotationDeg)
  const footprintWidthMm = rotated ? cardHeightMm : cardWidthMm
  const footprintHeightMm = rotated ? cardWidthMm : cardHeightMm
  const imgLeftMm = cardXMm + (footprintWidthMm - cardWidthMm) / 2
  const imgTopMm = cardYMm + (footprintHeightMm - cardHeightMm) / 2
  return { imgLeftMm, imgTopMm, footprintWidthMm, footprintHeightMm }
}
