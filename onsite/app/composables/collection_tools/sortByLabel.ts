import type { LabeledValue } from "@/types/internal";

export function sortByLabel<Type>(array: LabeledValue<Type>[]) {
  return array.sort(
    (entry_a: LabeledValue<Type>, entry_b: LabeledValue<Type>) =>
      entry_a.label.localeCompare(entry_b.label)
  );
}
