import type { LabeledValue } from "@/types/internal";

export const enum TShirtSize {
  size_xs = "XS",
  size_s = "S",
  size_m = "M",
  size_l = "L",
  size_xl = "XL",
  size_xxl = "XXL",
  size_2xl = "2XL",
  size_3xl = "3XL",
  size_4xl = "4XL",
}

export type TShirtSizeValue = `${TShirtSize}`;

export const setupTShirtSizes: LabeledValue<TShirtSizeValue>[] = [
  {
    value: "XS",
    label: "X-Small",
  },
  {
    value: "S",
    label: "Small",
  },
  {
    value: "M",
    label: "Medium",
  },
  {
    value: "L",
    label: "Large",
  },
  {
    value: "XL",
    label: "X-Large",
  },
  {
    value: "XXL",
    label: "XX-Large",
  },
  {
    value: "3XL",
    label: "3X-Large",
  },
  {
    value: "4XL",
    label: "4X-Large",
  },
];
