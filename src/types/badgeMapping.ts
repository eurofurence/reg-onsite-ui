export const NO_FLAG = 'No flag'

export interface BadgeMapping {
  packages: string[]
  flags: string[]
  rules: Record<string, string>
}

export function createEmptyBadgeMapping(): BadgeMapping {
  return { packages: [], flags: [NO_FLAG], rules: {} }
}

export function mappingKey(packageValue: string, flagValue: string): string {
  return `${packageValue}::${flagValue}`
}
