import { ColorsPalette } from "@/composables/theme/colors";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { ConRoleInfo } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import type { ConventionIterationSettings } from "@/types/internal/convention";

const enum ConRoleApi {
  staff = "staff",
  director = "director",
  vip_reg = "vip_reg",
  guest_of_honor = "guest",
}

export const enum ConRole {
  none = "",
  staff = ConRoleApi.staff,
  director = ConRoleApi.director,
  vip_reg = ConRoleApi.vip_reg,
  guest_of_honor = ConRoleApi.guest_of_honor,
}

export type ConRoleValue = `${ConRole}`;
export type ConRoleApiValue = `${ConRoleApi}`;

export function getMetadataRecordForConRoles(
  iterationSettings: ConventionIterationSettings
): MetadataRecord<ConRoleInfo> {
  return {
    [ConRole.none]: {
      label: "N/A",
      color: ColorsPalette.surface_500,
      idList: [],
      search: {
        flags: {
          [ConRole.staff]: 0,
          [ConRole.director]: 0,
          [ConRole.guest_of_honor]: 0,
        },
      },
      overrides: [],
    },
    [ConRole.staff]: {
      label: "Staff",
      color: ColorsPalette.orange_400,
      idList: [],
      search: { flags: { [ConRole.staff]: 1 } },
      overrides: [],
    },
    [ConRole.director]: {
      label: "Director",
      color: ColorsPalette.red_400,
      idList: [],
      search: { flags: { [ConRole.director]: 1 } },
      overrides: [ConRole.staff],
    },
    [ConRole.vip_reg]: {
      label: "Black Card VIP",
      color: ColorsPalette.gray_700,
      idList: iterationSettings.vip.regNumberList,
      search: { ids: iterationSettings.vip.regNumberList },
      overrides: [ConRole.staff, ConRole.director],
    },
    [ConRole.guest_of_honor]: {
      label: "Guest of Honor",
      color: ColorsPalette.gray_900,
      idList: [],
      search: { flags: { [ConRole.guest_of_honor]: 1 } },
      overrides: [ConRole.staff, ConRole.director, ConRole.vip_reg],
    },
  };
}
