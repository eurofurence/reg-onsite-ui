import { getConventionSetup } from '@/composables/logic/getConventionSetup'

function validValues(list: { value: string }[]): string[] {
  return list.map(item => item.value).filter(v => v.length > 0 && !v.startsWith('<'))
}

export function getValidBadgeMappingPackages(): string[] {
  const { metadata } = getConventionSetup()
  const attendance = validValues(metadata.forAttendance.list)
  const sponsorLevels = validValues(metadata.forSponsorLevels.list)
  const pairs = attendance.flatMap(a => sponsorLevels.map(s => [a, s].sort().join(',')))
  return [...attendance, ...pairs].sort((a, b) => a.localeCompare(b))
}

export function getValidBadgeMappingFlags(): string[] {
  const { metadata } = getConventionSetup()
  return validValues([...metadata.forConBook.list, ...metadata.forConRole.list])
    .sort((a, b) => a.localeCompare(b))
}
