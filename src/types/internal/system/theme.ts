import type { Branded } from "@/composables/brand";

export type FontSize = Branded<number, "FontSize">;
export type RelativeSize = Branded<number, "RelativeSize">;

export interface UserThemeSettings {
  isDarkMode: boolean;
  fontSize: FontSize;
  headerSize: RelativeSize;
}
