import { getFieldGetters } from '@/composables/sort_and_filter/getFieldGetters'
import { getCountryName } from '@/composables/fields/country/getCountryName'
import type { BadgeType, CustomFieldSource } from '@/types/badgeType'
import type { TransformedAttendeeInfo } from '@/types/internal/attendee'

function resolveSourceValue(
  source: CustomFieldSource,
  attendee: TransformedAttendeeInfo,
  fieldGetters: ReturnType<typeof getFieldGetters>,
): string {
  switch (source.kind) {
    case 'id':
      return String(attendee.id ?? '')
    case 'nickname':
      return attendee.nickname ?? ''
    case 'country':
      return attendee.country ? getCountryName(attendee.country) : ''
    case 'static':
      return source.text
    case 'attendee': {
      const getter = fieldGetters[source.attendeeField]
      return getter ? String(getter(attendee)) : ''
    }
  }
}

export function buildFieldValuesForAttendee(
  badgeType: BadgeType,
  attendee: TransformedAttendeeInfo,
): Record<string, string> {
  const fieldGetters = getFieldGetters()
  const fieldValues: Record<string, string> = {}
  for (const field of badgeType.fields.custom) {
    fieldValues[field.id] = resolveSourceValue(field.source, attendee, fieldGetters)
  }
  for (const field of badgeType.fields.customBarcodes) {
    fieldValues[field.id] = resolveSourceValue(field.source, attendee, fieldGetters)
  }
  return fieldValues
}
