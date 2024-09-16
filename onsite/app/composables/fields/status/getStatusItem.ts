import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import { type StatusValues, setupStatus } from "@/config/setupStatus";
import type { StatusInfo } from "@/types/internal";

const propertyMap: Map<StatusValues, StatusInfo> =
  convertListToMap(setupStatus);

export function getStatusItem(value: StatusValues): StatusInfo {
  const result: StatusInfo | undefined = propertyMap.get(value);
  if (result === undefined) {
    throw new Error(`Invalid status ${value}`);
  }
  return result;
}
