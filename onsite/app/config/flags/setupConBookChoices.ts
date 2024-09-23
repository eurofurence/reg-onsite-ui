import { ColorsPalette } from "@/config/theme";
import type { ConBookInfo } from "@/types/internal";

const enum ConBookApi {
  digital = "digi-book",
}

const enum ConBook {
  physical = "",
  digital = ConBookApi.digital,
}

export type ConBookApiValue = `${ConBookApi}`;
export type ConBookValue = `${ConBook}`;

export const setupConBookChoices: ConBookInfo[] = [
  {
    value: ConBook.physical,
    label: "Physical",
    color: ColorsPalette.primary_600,
    search: { flags: { "digi-book": 0 } },
  },
  {
    value: ConBook.digital,
    label: "Digital",
    color: ColorsPalette.primary_400,
    search: { flags: { "digi-book": 1 } },
  },
];
