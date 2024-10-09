import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import {
  metadataListForConBookChoice,
  type ConBookValue,
} from "@/config/metadata/flags/metadataForConBookChoice";
import type { ConBookInfo } from "@/types/internal/infos";

const propertyMap: Map<ConBookValue, ConBookInfo> = convertListToMap(
  metadataListForConBookChoice
);

export function getConRoleItem(value: ConBookValue): ConBookInfo {
  const result: ConBookInfo | undefined = propertyMap.get(value);
  if (result === undefined) {
    throw new Error(`Invalid conbook choice ${value}`);
  }
  return result;
}
