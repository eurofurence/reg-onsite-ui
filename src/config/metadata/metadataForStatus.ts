import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { ColorsPalette } from "@/composables/theme/colors";
import type { StatusInfo } from "@/types/internal/infos";

export const enum AttendeeApiStatus {
  new = "new",
  approved = "approved",
  partially_paid = "partially paid",
  paid = "paid",
  checked_in = "checked in",
  cancelled = "cancelled",
  deleted = "deleted",
}

export type AttendeeApiStatusValues = `${AttendeeApiStatus}`;

export const metadataRecordForStatus: MetadataRecord<StatusInfo> = {
  [AttendeeApiStatus.approved]: {
    label: "Approved",
    color: ColorsPalette.orange_400,
    icon: "pi pi-hourglass",
  },
  [AttendeeApiStatus.partially_paid]: {
    label: "Partially paid",
    color: ColorsPalette.yellow_400,
    icon: "pi pi-exclamation-triangle",
  },
  [AttendeeApiStatus.paid]: {
    label: "Paid",
    color: ColorsPalette.green_400,
    icon: "pi pi-check",
  },
  [AttendeeApiStatus.checked_in]: {
    label: "Checked in",
    color: ColorsPalette.primary_600,
    icon: "pi pi-id-card",
  },
  [AttendeeApiStatus.cancelled]: {
    label: "Cancelled",
    color: ColorsPalette.gray_700,
    icon: "pi pi-times",
  },
  [AttendeeApiStatus.deleted]: {
    label: "Deleted",
    color: ColorsPalette.gray_700,
    icon: "pi pi-trash",
  },
  [AttendeeApiStatus.new]: {
    label: "New",
    color: ColorsPalette.gray_700,
    icon: "pi pi-user-plus",
  },
};
