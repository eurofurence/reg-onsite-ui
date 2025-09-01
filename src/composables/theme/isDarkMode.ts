import { ref, type Ref } from "vue";

export const isDarkMode: Ref<boolean> = ref<boolean>(false);

export function invertOnDarkMode(): string {
  if (isDarkMode.value) {
    return "invert";
  }
  return "";
}
