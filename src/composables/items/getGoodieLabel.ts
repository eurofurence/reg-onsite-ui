import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { ConcreteGoodieValue } from "@/config/convention";

const allGoodies = getConventionSetup().metadata.forAbstractGoodies.list;

export function getGoodieLabel(concreteValue: ConcreteGoodieValue): string {
  for (const goodie of allGoodies) {
    if (!goodie.variants) {
      if (goodie.value === concreteValue) return goodie.label;
    } else {
      for (const variant of goodie.variants) {
        if (`${goodie.value}_${variant.value}` === concreteValue) {
          return `${goodie.label} (${variant.label})`;
        }
      }
    }
  }
  return concreteValue;
}
