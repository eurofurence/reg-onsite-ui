import type { LabeledValue } from "@/types/internal/infos";

export function sortByLabel<Type extends LabeledValue<ValueType>, ValueType>(
  array: Type[]
) {
  return array.sort((entry_a: Type, entry_b: Type) =>
    entry_a.label.localeCompare(entry_b.label)
  );
}
