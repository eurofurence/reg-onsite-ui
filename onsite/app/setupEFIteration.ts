import {
  DayAttendance,
  type DayAttendanceValue,
} from "@/config/packages/setupDayAttendance";
import type { GoodiesLevelValue } from "@/config/packages/setupPackages";
import type { ConRoleValue } from "@/config/flags/setupConRoles";
import {
  type TShirtTypeValue,
  setupTShirtTypesInternal,
} from "@/config/tshirt/setupTShirtTypes";
import type { GenericTrinketConfig, LabeledValue } from "@/types/internal";

export const configConStartDate: Date = new Date("2024-09-18");

export const vipRegNumList: number[] = [];

export const configDayAttendanceItems: LabeledValue<DayAttendanceValue>[] = [
  {
    value: DayAttendance.day_wed,
    label: "Wed (Sep-18)",
  },
  {
    value: DayAttendance.day_thu,
    label: "Thu (Sep-19)",
  },
  {
    value: DayAttendance.day_fri,
    label: "Fri (Sep-20)",
  },
  {
    value: DayAttendance.day_sat,
    label: "Sat (Sep-21)",
  },
];

export const enum AbstractTrinketWithoutVariants {
  // 2024
  coin_2024 = "coin_2024",
  pin_2024 = "pin_2024",
  luggage_strap_2024 = "luggage_strap_2024",
  bag_2024 = "bag_2024",
  led_badge_2024 = "led_badge_2024",
  // 2023
  pin_2023 = "pin_2023",
  cup_2023 = "cup_2023",
  scarf_2023 = "scarf_2023",
}

export const enum AbstractTrinketWithVariants {
  tshirt_2024 = "tshirt_2024",
  tshirt_2023 = "tshirt_2023",
}
export type AbstractTrinketWithVariantsValue = `${AbstractTrinketWithVariants}`;

export type AbstractTrinket =
  | AbstractTrinketWithoutVariants
  | AbstractTrinketWithVariants;
export type AbstractTrinketValue = `${AbstractTrinket}`;

export type ConcreteTrinketValue =
  | `${AbstractTrinketWithoutVariants}`
  | `${AbstractTrinketWithVariants.tshirt_2024}_${TShirtTypeValue}`
  | `${AbstractTrinketWithVariants.tshirt_2023}_${TShirtTypeValue}`;

export type TrinketConfig =
  | GenericTrinketConfig<AbstractTrinketWithoutVariants, null, null>
  | GenericTrinketConfig<
      AbstractTrinketWithVariants.tshirt_2023,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >
  | GenericTrinketConfig<
      AbstractTrinketWithVariants.tshirt_2024,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const configTinketItems: TrinketConfig[] = [
  {
    value: AbstractTrinketWithVariants.tshirt_2024,
    label: "T-Shirt",
    variants: setupTShirtTypesInternal,
  },
  {
    value: AbstractTrinketWithoutVariants.coin_2024,
    label: "Coin",
  },
  {
    value: AbstractTrinketWithoutVariants.pin_2024,
    label: "Pin",
  },
  {
    value: AbstractTrinketWithoutVariants.luggage_strap_2024,
    label: "Luggage Strap",
  },
  {
    value: AbstractTrinketWithoutVariants.bag_2024,
    label: "Bag",
  },
  {
    value: AbstractTrinketWithoutVariants.led_badge_2024,
    label: "LED Badge",
  },
  // 2023
  {
    value: AbstractTrinketWithVariants.tshirt_2023,
    label: "T-Shirt (2023)",
    variants: setupTShirtTypesInternal,
  },
  {
    value: AbstractTrinketWithoutVariants.pin_2023,
    label: "Pin (2023)",
  },
  {
    value: AbstractTrinketWithoutVariants.cup_2023,
    label: "Cup (2023)",
  },
  {
    value: AbstractTrinketWithoutVariants.scarf_2023,
    label: "Scarf (2023)",
  },
];

export const configPackageToItemsMap: Partial<
  Record<GoodiesLevelValue, AbstractTrinketValue[]>
> = {
  tshirt: [AbstractTrinketWithVariants.tshirt_2024],
  sponsor: [
    AbstractTrinketWithVariants.tshirt_2024,
    AbstractTrinketWithoutVariants.pin_2024,
    AbstractTrinketWithoutVariants.luggage_strap_2024,
  ],
  sponsor2: [
    AbstractTrinketWithVariants.tshirt_2024,
    AbstractTrinketWithoutVariants.pin_2024,
    AbstractTrinketWithoutVariants.luggage_strap_2024,
    AbstractTrinketWithoutVariants.bag_2024,
    AbstractTrinketWithoutVariants.led_badge_2024,
  ],
};

export const configFlagsToItemsMap: Partial<
  Record<ConRoleValue, AbstractTrinketValue[]>
> = {
  staff: [AbstractTrinketWithoutVariants.coin_2024],
  director: [AbstractTrinketWithoutVariants.coin_2024],
};

export const configRegNumbersToItemsMap: Record<
  string,
  AbstractTrinketValue[]
> = {};

interface ConfigPortalTrinketSubset {
  sponsordesk: AbstractTrinketValue[];
  constore: AbstractTrinketValue[];
}

export const configSponsordeskSubset: AbstractTrinketValue[] =
  configPackageToItemsMap.sponsor2 || [];

export const configConstoreSubset: AbstractTrinketValue[] =
  configTinketItems.map((trinketConfig: TrinketConfig) => trinketConfig.value);

export const configPortalTrinketSubset: ConfigPortalTrinketSubset = {
  sponsordesk: configSponsordeskSubset,
  constore: configConstoreSubset,
};
