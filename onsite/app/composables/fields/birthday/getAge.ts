import { configConStartDate } from "@/setupEFIteration";

const epochConStartDate = configConStartDate.valueOf();

export function getAge(birthday: string): number {
  const epochBirthday: number = new Date(birthday).valueOf();
  const years: number =
    new Date(epochConStartDate - epochBirthday).getFullYear() - 1970;
  return years;
}
