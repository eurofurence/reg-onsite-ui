import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { IsoBirthdayStr } from "@/types/external/attsrv/attendees/attendee";
import type { AgeInYears } from "@/types/internal/attendee";

const epochConStartDate = getConventionSetup().conDates.start.valueOf();

export function getAge(birthday: IsoBirthdayStr | null): AgeInYears | null {
  if (birthday === null) {
    return null;
  }
  const epochBirthday: number = new Date(birthday).valueOf();
  const years: AgeInYears = (new Date(
    epochConStartDate - epochBirthday
  ).getFullYear() - 1970) as AgeInYears;
  return years;
}
