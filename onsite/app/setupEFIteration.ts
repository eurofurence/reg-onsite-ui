import {
  AttendeeApiAttendance,
  type AttendanceApiValue,
} from "@/config/metadata/packages/metadataForAttendance";
import {
  type GoodiesLevelValue,
  GoodiesLevel,
} from "@/config/metadata/packages/metadataForPerks";
import { type ConRoleValue } from "@/config/metadata/flags/metadataForConRoles";
import {
  type TShirtTypeValue,
  metadataListForTShirtTypesInternal,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { LabeledValue } from "@/types/internal/infos";
import type { GenericGoodieConfig } from "@/types/internal/goodies";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";

export const configConStartDate: Date = new Date("2024-09-18");
export const configConDays: number = 4;

export const vipRegNumList: number[] = [];

export const configDayAttendanceItems: LabeledValue<AttendanceApiValue>[] =
  getMetadataList({
    [AttendeeApiAttendance.day_wed]: {
      label: "Wed (Sep-18)",
    },
    [AttendeeApiAttendance.day_thu]: {
      label: "Thu (Sep-19)",
    },
    [AttendeeApiAttendance.day_fri]: {
      label: "Fri (Sep-20)",
    },
    [AttendeeApiAttendance.day_sat]: {
      label: "Sat (Sep-21)",
    },
  });

export const enum AbstractGoodieWithoutVariants {
  // 2024
  staff_coin_2024 = "coin_2024",
  pin_2024 = "pin_2024",
  luggage_strap_2024 = "luggage_strap_2024",
  bag_2024 = "bag_2024",
  led_badge_2024 = "led_badge_2024",
  // 2023
  pin_2023 = "pin_2023",
  cup_2023 = "cup_2023",
  scarf_2023 = "scarf_2023",
}

export const enum AbstractGoodieWithVariants {
  tshirt_2024 = "tshirt_2024",
  tshirt_2023 = "tshirt_2023",
}
export type AbstractGoodieWithVariantsValue = `${AbstractGoodieWithVariants}`;

export type AbstractGoodie =
  | AbstractGoodieWithoutVariants
  | AbstractGoodieWithVariants;
export type AbstractGoodieValue = `${AbstractGoodie}`;

export type ConcreteGoodieValue =
  | `${AbstractGoodieWithoutVariants}`
  | `${AbstractGoodieWithVariants.tshirt_2024}_${TShirtTypeValue}`
  | `${AbstractGoodieWithVariants.tshirt_2023}_${TShirtTypeValue}`;

export type GoodieConfig =
  | GenericGoodieConfig<AbstractGoodieWithoutVariants, null, null>
  | GenericGoodieConfig<
      AbstractGoodieWithVariants.tshirt_2023,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >
  | GenericGoodieConfig<
      AbstractGoodieWithVariants.tshirt_2024,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const configTinketItems: GoodieConfig[] = getMetadataList<GoodieConfig>({
  [AbstractGoodieWithVariants.tshirt_2024]: {
    label: "T-Shirt",
    variants: metadataListForTShirtTypesInternal,
  },
  [AbstractGoodieWithoutVariants.staff_coin_2024]: {
    label: "Staff Coin",
  },
  [AbstractGoodieWithoutVariants.pin_2024]: {
    label: "Pin",
  },
  [AbstractGoodieWithoutVariants.luggage_strap_2024]: {
    label: "Luggage Strap",
  },
  [AbstractGoodieWithoutVariants.bag_2024]: {
    label: "Bag",
  },
  [AbstractGoodieWithoutVariants.led_badge_2024]: {
    label: "LED Badge",
  },
  // 2023
  [AbstractGoodieWithVariants.tshirt_2023]: {
    label: "T-Shirt (2023)",
    variants: metadataListForTShirtTypesInternal,
  },
  [AbstractGoodieWithoutVariants.pin_2023]: {
    label: "Pin (2023)",
  },
  [AbstractGoodieWithoutVariants.cup_2023]: {
    label: "Cup (2023)",
  },
  [AbstractGoodieWithoutVariants.scarf_2023]: {
    label: "Scarf (2023)",
  },
});

export const configPackageToItemsMap: Partial<
  Record<GoodiesLevelValue, AbstractGoodieValue[]>
> = {
  [GoodiesLevel.tshirt]: [AbstractGoodieWithVariants.tshirt_2024],
  [GoodiesLevel.sponsor]: [
    AbstractGoodieWithVariants.tshirt_2024,
    AbstractGoodieWithoutVariants.pin_2024,
    AbstractGoodieWithoutVariants.luggage_strap_2024,
  ],
  [GoodiesLevel.super_sponsor]: [
    AbstractGoodieWithVariants.tshirt_2024,
    AbstractGoodieWithoutVariants.pin_2024,
    AbstractGoodieWithoutVariants.luggage_strap_2024,
    AbstractGoodieWithoutVariants.bag_2024,
    AbstractGoodieWithoutVariants.led_badge_2024,
  ],
};

export const configFlagsToItemsMap: Partial<
  Record<ConRoleValue, AbstractGoodieValue[]>
> = {
  staff: [AbstractGoodieWithoutVariants.staff_coin_2024],
  director: [AbstractGoodieWithoutVariants.staff_coin_2024],
};

export const configRegNumbersToItemsMap: Record<string, AbstractGoodieValue[]> =
  {};

interface ConfigPortalGoodieSubset {
  sponsordesk: AbstractGoodieValue[];
  constore: AbstractGoodieValue[];
}

export const configSponsordeskSubset: AbstractGoodieValue[] =
  configPackageToItemsMap.sponsor2 || [];

export const configConstoreSubset: AbstractGoodieValue[] =
  configTinketItems.map((goodieConfig: GoodieConfig) => goodieConfig.value);

export const configPortalGoodieSubset: ConfigPortalGoodieSubset = {
  sponsordesk: configSponsordeskSubset,
  constore: configConstoreSubset,
};
