import type { TransformedAttendeeInfo } from '@/types/internal/attendee'

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

export type FontSizeOverflowMode = 'shrink' | 'clip' | 'overflow'

export interface TextFieldState extends FieldState {
  color: string
  align: TextAlign
  fontUrl: string
  borderEnabled?: boolean
  borderColor?: string
  wrapAt?: number
  wrapLineHeight?: number
  truncateAt?: number
  fontSizePt?: number
  overflowMode?: FontSizeOverflowMode
}

export interface BarcodeFieldState extends FieldState {
  inverted: boolean
  style: string
  color: string
  transparentBackground: boolean
}

export type CustomFieldSource =
  | { kind: 'id' }
  | { kind: 'nickname' }
  | { kind: 'country' }
  | { kind: 'static'; text: string }
  | { kind: 'attendee'; attendeeField: keyof TransformedAttendeeInfo }

export interface CustomTextFieldState extends TextFieldState {
  id: string
  label: string
  source: CustomFieldSource
}

export interface CustomBarcodeFieldState extends BarcodeFieldState {
  id: string
  label: string
  source: CustomFieldSource
}

export interface BadgeTypeFields {
  custom: CustomTextFieldState[]
  customBarcodes: CustomBarcodeFieldState[]
}

export interface FieldInheritance {
  background: boolean
}

export function createDefaultFieldInheritance(): FieldInheritance {
  return {
    background: false,
  }
}

export interface BadgeTypeBackground {
  url: string
  fit: BackgroundFit
  alignH: BackgroundAlignH
  alignV: BackgroundAlignV
  color: string
}

export function createDefaultBadgeTypeBackground(): BadgeTypeBackground {
  return {
    url: '',
    fit: 'cover',
    alignH: 'center',
    alignV: 'center',
    color: 'ffffff',
  }
}

export interface BadgeType {
  id: string
  name: string
  background: BadgeTypeBackground
  fields: BadgeTypeFields
  parentId: string | null
  inherit: FieldInheritance
}

export function createDefaultBadgeType(name: string): BadgeType {
  return {
    id: crypto.randomUUID(),
    name,
    background: createDefaultBadgeTypeBackground(),
    parentId: null,
    inherit: createDefaultFieldInheritance(),
    fields: {
      custom: [
        {
          id: crypto.randomUUID(),
          label: 'ID',
          source: { kind: 'id' },
          pos: { x: 10, y: 70 },
          size: { width: 30, height: 12 },
          enabled: true,
          color: '000000',
          align: 'left',
          fontUrl: '',
        },
        {
          id: crypto.randomUUID(),
          label: 'Nickname',
          source: { kind: 'nickname' },
          pos: { x: 10, y: 85 },
          size: { width: 40, height: 12 },
          enabled: true,
          color: '000000',
          align: 'left',
          fontUrl: '',
        },
        {
          id: crypto.randomUUID(),
          label: 'Country',
          source: { kind: 'country' },
          pos: { x: 10, y: 55 },
          size: { width: 30, height: 12 },
          enabled: true,
          color: '000000',
          align: 'left',
          fontUrl: '',
        },
      ],
      customBarcodes: [
        {
          id: crypto.randomUUID(),
          label: 'Barcode',
          source: { kind: 'id' },
          pos: { x: 55, y: 10 },
          size: { width: 25, height: 25 * (85.6 / 54) },
          enabled: true,
          inverted: false,
          style: 'datamatrix',
          color: '000000',
          transparentBackground: false,
        },
      ],
    },
  }
}

export function createDefaultCustomTextField(): CustomTextFieldState {
  return {
    id: crypto.randomUUID(),
    label: 'New Field',
    source: { kind: 'static', text: '' },
    pos: { x: 10, y: 40 },
    size: { width: 30, height: 12 },
    enabled: true,
    color: '000000',
    align: 'left',
    fontUrl: '',
  }
}

export function createDefaultCustomBarcodeField(): CustomBarcodeFieldState {
  return {
    id: crypto.randomUUID(),
    label: 'New Barcode',
    source: { kind: 'id' },
    pos: { x: 55, y: 10 },
    size: { width: 25, height: 25 * (85.6 / 54) },
    enabled: true,
    inverted: false,
    style: 'datamatrix',
    color: '000000',
    transparentBackground: false,
  }
}
