export const NO_FLAG = 'No flag'

export interface BadgeMapping {
  packages: string[]
  flags: string[]
  rules: Record<string, string>
}

export function createEmptyBadgeMapping(): BadgeMapping {
  return { packages: [], flags: [NO_FLAG], rules: {} }
}

export function withNoFlag(badgeMapping: BadgeMapping): BadgeMapping {
  if (badgeMapping.flags.includes(NO_FLAG)) {
    return badgeMapping
  }
  return { ...badgeMapping, flags: [NO_FLAG, ...badgeMapping.flags] }
}

export function mappingKey(packageValue: string, flagValue: string): string {
  return `${packageValue}::${flagValue}`
}
