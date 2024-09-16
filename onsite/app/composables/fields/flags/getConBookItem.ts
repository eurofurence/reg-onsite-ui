import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import {
  setupConBookChoices,
  type ConBookValue,
} from "@/config/setupConBookChoices";
import type { ConBookInfo } from "@/types/internal";

const propertyMap: Map<ConBookValue, ConBookInfo> =
  convertListToMap(setupConBookChoices);

export function getConRoleItem(value: ConBookValue): ConBookInfo {
  const result: ConBookInfo | undefined = propertyMap.get(value);
  if (result === undefined) {
    throw new Error(`Invalid conbook choice ${value}`);
  }
  return result;
}
