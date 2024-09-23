import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import {
  TShirtSize,
  type TShirtSizeValue,
  setupTShirtSizes,
} from "@/config/tshirt/setupTShirtSizes";
import type { LabeledValue } from "@/types/internal";
import { TShirtShape, type TShirtShapeValue } from "@/config/setupTShirtShapes";

export const enum TShirtType {
  regular_xs = "XS",
  contoured_xs = "wXS",
  regular_s = "S",
  contoured_s = "wS",
  regular_m = "M",
  contoured_m = "wM",
  regular_l = "L",
  contoured_l = "wL",
  regular_xl = "XL",
  contoured_xl = "wXL",
  regular_xxl = "XXL",
  contoured_xxl = "wXXL",
  regular_2xl = "2XL",
  contoured_2xl = "w2XL",
  regular_3xl = "3XL",
  contoured_3xl = "w3XL",
  regular_4xl = "4XL",
  contoured_4xl = "w4XL",
}

export type TShirtTypeValue = `${TShirtType}`;

export interface TShirtInfo extends LabeledValue<TShirtTypeValue> {
  size: TShirtSizeValue;
  shape: TShirtShapeValue;
}

const tshirtSizeMap: Map<
  TShirtSizeValue,
  LabeledValue<TShirtSizeValue>
> = convertListToMap(setupTShirtSizes);

function getLabel(size: TShirtSizeValue, shape: TShirtShapeValue): string {
  const sizeLabel: string = tshirtSizeMap.get(size)?.label || size;
  return `${sizeLabel} (${shape})`;
}

function getTShirtInfo(
  size: TShirtSizeValue,
  shape: TShirtShapeValue
): TShirtInfo {
  var result: TShirtInfo = {
    value: `${shape == TShirtShape.contoured ? "w" : ""}${size}`,
    label: getLabel(size, shape),
    size: size,
    shape: shape,
  };
  if (shape == TShirtShape.contoured) {
    result.cssClass = "text-red-500 font-bold";
  }
  return result;
}

export const setupTShirtTypesInternal: TShirtInfo[] = [
  getTShirtInfo(TShirtSize.size_xs, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_xs, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_s, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_s, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_m, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_m, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_l, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_l, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_xl, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_xl, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_xxl, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_xxl, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_3xl, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_3xl, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_4xl, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_4xl, TShirtShape.contoured),
];

export const setupTShirtTypePlaceholder: {
  value: null;
  label: string;
  shape: null;
} = {
  label: "Not Specified",
  value: null,
  shape: null,
};

export const setupTShirtTypes: (
  | TShirtInfo
  | typeof setupTShirtTypePlaceholder
)[] = [setupTShirtTypePlaceholder, ...setupTShirtTypesInternal];
