import {
  TShirtShape,
  type TShirtShapeValue,
} from "@/config/metadata/tshirt/metadataForTShirtShapes";
import {
  TShirtSize,
  type TShirtSizeValue,
  metadataRecordForTShirtSizes,
} from "@/config/metadata/tshirt/metadataForTShirtSizes";
import type { Nullable } from "@/types/internal/common";
import type { LabeledValue } from "@/types/internal/infos";

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

function getTShirtInfo(
  size: TShirtSizeValue,
  shape: TShirtShapeValue
): TShirtInfo {
  const sizeLabel: string = metadataRecordForTShirtSizes[size].label;
  let result: TShirtInfo = {
    value: `${shape == TShirtShape.contoured ? "w" : ""}${size}`,
    label: `${sizeLabel} (${shape})`,
    size: size,
    shape: shape,
  };
  if (shape == TShirtShape.contoured) {
    result.cssClass = "text-red-500 font-bold";
  }
  return result;
}

export const metadataListForTShirtTypesInternal: TShirtInfo[] = [
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
  getTShirtInfo(TShirtSize.size_2xl, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_2xl, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_3xl, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_3xl, TShirtShape.contoured),
  getTShirtInfo(TShirtSize.size_4xl, TShirtShape.regular),
  getTShirtInfo(TShirtSize.size_4xl, TShirtShape.contoured),
];

export type PlaceHolderTShirtType = Omit<Nullable<TShirtInfo>, "label"> & {
  label: string;
};

export const metadataForTShirtTypePlaceholder: PlaceHolderTShirtType = {
  label: "Not Specified",
  size: null,
  value: null,
  shape: null,
};

export const metadataListForTShirtTypes: (
  | TShirtInfo
  | PlaceHolderTShirtType
)[] = [metadataForTShirtTypePlaceholder, ...metadataListForTShirtTypesInternal];
