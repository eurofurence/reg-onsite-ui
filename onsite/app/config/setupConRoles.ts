import { ColorsPalette } from "@/config/theme";
import { vipRegNumList } from "@/setupEFIteration";
import type { ConRoleInfo } from "@/types/internal";

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

export const conRoleNone: ConRoleInfo = {
  value: ConRole.none,
  label: "N/A",
  color: ColorsPalette.surface_500,
  idList: [],
  search: { flags: { staff: 0, director: 0, guest: 0 } },
  overrides: [],
};

export const setupConRoles: ConRoleInfo[] = [
  conRoleNone,
  {
    value: ConRole.staff,
    label: "Staff",
    color: ColorsPalette.orange_400,
    idList: [],
    search: { flags: { staff: 1 } },
    overrides: [],
  },
  {
    value: ConRole.director,
    label: "Director",
    color: ColorsPalette.red_400,
    idList: [],
    search: { flags: { director: 1 } },
    overrides: [ConRole.staff],
  },
  {
    value: ConRole.vip_reg,
    label: "Black Card VIP",
    color: ColorsPalette.gray_700,
    idList: vipRegNumList,
    search: { ids: vipRegNumList },
    overrides: [ConRole.staff, ConRole.director],
  },
  {
    value: ConRole.guest_of_honor,
    label: "Guest of Honor",
    color: ColorsPalette.gray_900,
    idList: [],
    search: { flags: { guest: 1 } },
    overrides: [ConRole.staff, ConRole.director, ConRole.vip_reg],
  },
];
