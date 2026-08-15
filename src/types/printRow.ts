export interface PrintRow {
  id: string
  idValue: string
  nicknameValue: string
  countryValue: string
  packageValue: string
  flagValue: string
  badgeTypeId: string
  customValues: Record<string, string>
}

export function createEmptyPrintRow(badgeTypeId: string): PrintRow {
  return {
    id: crypto.randomUUID(),
    idValue: '',
    nicknameValue: '',
    countryValue: '',
    packageValue: '',
    flagValue: '',
    badgeTypeId,
    customValues: {},
  }
}
