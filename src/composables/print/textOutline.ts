import * as fontkit from 'fontkit'
import type { TextAlign } from '@/types/badgeType'
import type { FieldBox, TextLine } from '@/composables/print/badgeHtml'

// Converts text to filled SVG <path> outlines via fontkit, for fonts jsPDF
// cannot embed directly (see isUnsupportedCffOpenType in downloadBadge.ts).

function runWidthPx(font: fontkit.Font, text: string, fontSizePx: number): number {
  const run = font.layout(text)
  const scale = fontSizePx / font.unitsPerEm
  return run.advanceWidth * scale
}

function penStartX(box: FieldBox, align: TextAlign, lineWidthPx: number): number {
  if (align === 'left') return box.left
  if (align === 'right') return box.left + box.width - lineWidthPx
  return box.left + box.width / 2 - lineWidthPx / 2
}

// fontkit glyph paths are y-up; SVG is y-down, hence the negated y scale.
function lineToPathData(font: fontkit.Font, text: string, fontSizePx: number, penX: number, baselineY: number): string {
  const scale = fontSizePx / font.unitsPerEm
  const run = font.layout(text)
  let x = penX
  let y = baselineY
  const segments: string[] = []
  run.glyphs.forEach((glyph, index) => {
    const position = run.positions[index]!
    const glyphPath = glyph.path
      .scale(scale, -scale)
      .translate(x + position.xOffset * scale, y - position.yOffset * scale)
    const d = glyphPath.toSVG()
    if (d) segments.push(d)
    x += position.xAdvance * scale
    y += position.yAdvance * scale
  })
  return segments.join(' ')
}

export interface OutlinedTextField {
  fieldId: string
  color: string
  pathData: string
}

export function buildOutlinedTextField(
  fontBuffer: ArrayBuffer,
  fieldId: string,
  color: string,
  box: FieldBox,
  fontSizePx: number,
  align: TextAlign,
  lines: TextLine[],
): OutlinedTextField {
  const font = fontkit.create(new Uint8Array(fontBuffer) as unknown as Buffer) as fontkit.Font
  const pathSegments = lines.map((line) => {
    const lineWidthPx = runWidthPx(font, line.text, fontSizePx)
    const penX = penStartX(box, align, lineWidthPx)
    return lineToPathData(font, line.text, fontSizePx, penX, line.y)
  })
  return { fieldId, color, pathData: pathSegments.join(' ') }
}
