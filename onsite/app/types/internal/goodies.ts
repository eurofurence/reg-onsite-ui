import type { LabeledValue } from "@/types/internal/infos";
import type {
  AbstractGoodieWithVariantsValue,
  ConcreteGoodieValue,
} from "@/config/convention";

export type DefaultVariantValues = Map<
  AbstractGoodieWithVariantsValue,
  string | null
>;

export interface GenericGoodieConfig<
  ValueType,
  VariantType extends LabeledValue<VariantValueType>[] | null,
  VariantValueType extends string | null
> extends LabeledValue<ValueType> {
  variants?: VariantType;
}

interface GoodieConfigNode {
  value: string;
  label: string;
  variants?: LabeledValue<string>[] | null;
  issuedCount?: number;
  reservedCount?: number;
  reservedIssuedCount?: number;
  plannedCount?: number;
}

export interface GoodieTreeNode {
  key: ConcreteGoodieValue;
  data: GoodieConfigNode;
  children?: GoodieTreeNode[];
}
