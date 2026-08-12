export interface PrintRow {
  id: string
  idValue: string
  nameValue: string
  countryValue: string
  packageValue: string
  flagValue: string
  badgeTypeId: string
}

export function createEmptyPrintRow(badgeTypeId: string): PrintRow {
  return {
    id: crypto.randomUUID(),
    idValue: '',
    nameValue: '',
    countryValue: '',
    packageValue: '',
    flagValue: '',
    badgeTypeId,
  }
}
