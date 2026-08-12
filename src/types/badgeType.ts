export type TextAlign = 'left' | 'center' | 'right'

export type BackgroundFit = 'cover' | 'contain' | 'fill' | 'fit-width' | 'fit-height'
export type BackgroundAlignH = 'left' | 'center' | 'right'
export type BackgroundAlignV = 'top' | 'center' | 'bottom'

export interface FieldPosition {
  x: number
  y: number
}

export interface FieldSize {
  width: number
  height: number
}

export interface FieldState {
  pos: FieldPosition
  size: FieldSize
  enabled: boolean
}

export interface TextFieldState extends FieldState {
  color: string
  align: TextAlign
  fontUrl: string
  borderEnabled?: boolean
  borderColor?: string
  wrapAt?: number
  wrapLineHeight?: number
  truncateAt?: number
}

export interface DataMatrixFieldState extends FieldState {
  inverted: boolean
}

export type FieldKey = 'id' | 'name' | 'country' | 'datamatrix'

export interface BadgeTypeFields {
  id: TextFieldState
  name: TextFieldState
  country: TextFieldState
  datamatrix: DataMatrixFieldState
}

export interface BadgeType {
  id: string
  name: string
  backgroundUrl: string
  backgroundFit?: BackgroundFit
  backgroundAlignH?: BackgroundAlignH
  backgroundAlignV?: BackgroundAlignV
  backgroundColor?: string
  fields: BadgeTypeFields
}

export function createDefaultBadgeType(name: string): BadgeType {
  return {
    id: crypto.randomUUID(),
    name,
    backgroundUrl: '',
    backgroundFit: 'cover',
    backgroundAlignH: 'center',
    backgroundAlignV: 'center',
    backgroundColor: 'ffffff',
    fields: {
      id: {
        pos: { x: 10, y: 70 },
        size: { width: 30, height: 12 },
        enabled: true,
        color: '334155',
        align: 'left',
        fontUrl: '',
      },
      name: {
        pos: { x: 10, y: 85 },
        size: { width: 40, height: 12 },
        enabled: true,
        color: '0f172a',
        align: 'left',
        fontUrl: '',
      },
      country: {
        pos: { x: 10, y: 55 },
        size: { width: 30, height: 12 },
        enabled: true,
        color: '0f172a',
        align: 'left',
        fontUrl: '',
      },
      datamatrix: {
        pos: { x: 55, y: 10 },
        size: { width: 25, height: 25 * (85.6 / 54) },
        enabled: true,
        inverted: false,
      },
    },
  }
}
