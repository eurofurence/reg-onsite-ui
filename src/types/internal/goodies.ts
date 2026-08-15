import type {
  AbstractGoodieWithVariantsValue,
  ConcreteGoodieValue,
} from "@/config/convention";
import type { LabeledValue } from "@/types/internal/infos";

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
  entitledCount?: number;
  soldCount?: number;
  inventoryCount?: number;
  neededReserveCount?: number;
  freeToSellCount?: number;
}

export interface GoodieTreeNode {
  // Leaf nodes use their real ConcreteGoodieValue; parent (goodie) nodes with
  // children use a distinct "abstract:<value>" key so they never collide
  // with a concrete leaf's key.
  key: ConcreteGoodieValue | `abstract:${string}`;
  data: GoodieConfigNode;
  children?: GoodieTreeNode[];
}
