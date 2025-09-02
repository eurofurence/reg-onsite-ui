import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { GoodiesLevel } from "@/config/metadata/packages/metadataForPerks";
import {
  metadataListForTShirtTypesInternal,
  type TShirtTypeValue,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type {
  ConDays,
  ConventionIterationSettings,
} from "@/types/internal/convention";
import type { GenericGoodieConfig } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";

export const enum AbstractEFGoodieWithoutVariants2025 {
  towel_2025 = "towel_2025",
  messenger_bag_2025 = "messenger_bag_2025",
  staff_coin_2025 = "staff_coin_2025",
  attendee_pin_2025 = "attendee_pin_2025",
  // Workaround for staff pin distribution
  staff_pins_security_2025 = "staff_pins_security_2025",
  staff_pins_fursuit_support_2025 = "staff_pins_fursuit_support_2025",
  staff_pins_pawpet_show_2025 = "staff_pins_pawpet_show_2025",
  staff_pins_conops_2025 = "staff_pins_conops_2025",
  staff_pins_fursuit_theater_productions_2025 = "staff_pins_fursuit_theater_productions_2025",
  staff_pins_stage_2025 = "staff_pins_stage_2025",
  staff_pins_information_technology_2025 = "staff_pins_information_technology_2025",
  staff_pins_registration_2025 = "staff_pins_registration_2025",
  staff_pins_awareness_inclusion_2025 = "staff_pins_awareness_inclusion_2025",
  staff_pins_critter_operations_2025 = "staff_pins_critter_operations_2025",
  staff_pins_charity_2025 = "staff_pins_charity_2025",
  staff_pins_dealers_den_2025 = "staff_pins_dealers_den_2025",
  staff_pins_opening_ceremony_2025 = "staff_pins_opening_ceremony_2025",
  staff_pins_art_show_2025 = "staff_pins_art_show_2025",
  staff_pins_video_2025 = "staff_pins_video_2025",
  staff_pins_marketing_communications_2025 = "staff_pins_marketing_communications_2025",
  staff_pins_screen_operations_2025 = "staff_pins_screen_operations_2025",
  staff_pins_the_daily_eurofurence_2025 = "staff_pins_the_daily_eurofurence_2025",
  staff_pins_virtual_reality_2025 = "staff_pins_virtual_reality_2025",
  staff_pins_programming_2025 = "staff_pins_programming_2025",
  staff_pins_theming_experience_2025 = "staff_pins_theming_experience_2025",
  staff_pins_dance_competition_2025 = "staff_pins_dance_competition_2025",
  staff_pins_logistics_2025 = "staff_pins_logistics_2025",
  staff_pins_website_2025 = "staff_pins_website_2025",
  staff_pins_con_book_2025 = "staff_pins_con_book_2025",
  staff_pins_photography_2025 = "staff_pins_photography_2025",
  staff_pins_telecommunications_2025 = "staff_pins_telecommunications_2025",
  staff_pins_con_store_2025 = "staff_pins_con_store_2025",
  staff_pins_people_culture_2025 = "staff_pins_people_culture_2025",
  staff_pins_press_and_media_relations_2025 = "staff_pins_press_and_media_relations_2025",
  staff_pins_internal_coordination_2025 = "staff_pins_internal_coordination_2025",
  staff_pins_staff_lounge_2025 = "staff_pins_staff_lounge_2025",
  staff_pins_statistics_2025 = "staff_pins_statistics_2025",
  staff_pins_dead_dog_party_2025 = "staff_pins_dead_dog_party_2025",
  staff_pins_board_of_directors_2025 = "staff_pins_board_of_directors_2025",
  staff_pins_registration_software_development_2025 = "staff_pins_registration_software_development_2025",
  staff_pins_funding_cooperations_2025 = "staff_pins_funding_cooperations_2025",
  staff_pins_summerboat_2025 = "staff_pins_summerboat_2025",
  staff_pins_guest_of_honor_relations_2025 = "staff_pins_guest_of_honor_relations_2025",
  staff_pins_closing_ceremony_2025 = "staff_pins_closing_ceremony_2025",
  staff_pins_dances_2025 = "staff_pins_dances_2025",
  staff_pins_accounting_and_finances_2025 = "staff_pins_accounting_and_finances_2025",
  staff_pins_games_corner_2025 = "staff_pins_games_corner_2025",
  staff_pins_local_and_public_affairs_2025 = "staff_pins_local_and_public_affairs_2025",
}

export const enum AbstractEFGoodieWithVariants2025 {
  tshirt_2025 = "tshirt_2025",
}

export type ConcreteEFGoodieValue2025 =
  | `${AbstractEFGoodieWithoutVariants2025}`
  | `${AbstractEFGoodieWithVariants2025.tshirt_2025}_${TShirtTypeValue}`;

export type EFGoodieConfig2025 =
  | GenericGoodieConfig<AbstractEFGoodieWithoutVariants2025, null, null>
  | GenericGoodieConfig<
      AbstractEFGoodieWithVariants2025.tshirt_2025,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2025: MetadataRecord<EFGoodieConfig2025> =
  {
    [AbstractEFGoodieWithVariants2025.tshirt_2025]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractEFGoodieWithoutVariants2025.towel_2025]: {
      label: "Towel",
    },
    [AbstractEFGoodieWithoutVariants2025.messenger_bag_2025]: {
      label: "Messenger Bag",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_coin_2025]: {
      label: "Staff Coin",
    },
    [AbstractEFGoodieWithoutVariants2025.attendee_pin_2025]: {
      label: "Pin",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_security_2025]: {
      label: "Staff Pin Bag for Security - 105 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_fursuit_support_2025]: {
      label: "Staff Pin Bag for Fursuit Support - 51 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_pawpet_show_2025]: {
      label: "Staff Pin Bag for Pawpet Show - 49 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_conops_2025]: {
      label: "Staff Pin Bag for ConOps - 45 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_fursuit_theater_productions_2025]:
      {
        label: "Staff Pin Bag for Fursuit Theater Productions - 44 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_stage_2025]: {
      label: "Staff Pin Bag for Stage - 36 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_information_technology_2025]:
      {
        label: "Staff Pin Bag for Information Technology - 33 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_registration_2025]: {
      label: "Staff Pin Bag for Registration - 28 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_awareness_inclusion_2025]: {
      label: "Staff Pin Bag for Awareness & Inclusion - 27 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_critter_operations_2025]: {
      label: "Staff Pin Bag for Critter Operations - 27 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_charity_2025]: {
      label: "Staff Pin Bag for Charity - 23 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_dealers_den_2025]: {
      label: "Staff Pin Bag for Dealers' Den - 20 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_opening_ceremony_2025]: {
      label: "Staff Pin Bag for Opening Ceremony - 18 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_art_show_2025]: {
      label: "Staff Pin Bag for Art Show - 17 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_video_2025]: {
      label: "Staff Pin Bag for Video - 17 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_marketing_communications_2025]:
      {
        label: "Staff Pin Bag for Marketing & Communications - 14 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_screen_operations_2025]: {
      label: "Staff Pin Bag for Screen Operations - 14 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_the_daily_eurofurence_2025]:
      {
        label: "Staff Pin Bag for The Daily Eurofurence - 14 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_virtual_reality_2025]: {
      label: "Staff Pin Bag for Virtual Reality - 13 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_programming_2025]: {
      label: "Staff Pin Bag for Programming - 12 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_theming_experience_2025]: {
      label: "Staff Pin Bag for Theming & Experience - 12 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_dance_competition_2025]: {
      label: "Staff Pin Bag for Dance Competition - 11 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_logistics_2025]: {
      label: "Staff Pin Bag for Logistics - 10 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_website_2025]: {
      label: "Staff Pin Bag for Website - 10 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_con_book_2025]: {
      label: "Staff Pin Bag for Con Book - 9 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_photography_2025]: {
      label: "Staff Pin Bag for Photography - 9 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_telecommunications_2025]: {
      label: "Staff Pin Bag for Telecommunications - 9 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_con_store_2025]: {
      label: "Staff Pin Bag for Con Store - 8 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_people_culture_2025]: {
      label: "Staff Pin Bag for People & Culture - 8 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_press_and_media_relations_2025]:
      {
        label: "Staff Pin Bag for Press and Media Relations - 8 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_internal_coordination_2025]:
      {
        label: "Staff Pin Bag for Internal Coordination - 7 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_staff_lounge_2025]: {
      label: "Staff Pin Bag for Staff Lounge - 7 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_statistics_2025]: {
      label: "Staff Pin Bag for Statistics - 7 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_dead_dog_party_2025]: {
      label: "Staff Pin Bag for Dead Dog Party - 6 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_board_of_directors_2025]: {
      label: "Staff Pin Bag for Board of Directors - 5 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_registration_software_development_2025]:
      {
        label: "Staff Pin Bag for Registration Software Development - 5 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_funding_cooperations_2025]:
      {
        label: "Staff Pin Bag for Funding & Cooperations - 4 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_summerboat_2025]: {
      label: "Staff Pin Bag for Summerboat - 4 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_guest_of_honor_relations_2025]:
      {
        label: "Staff Pin Bag for Guest of Honor Relations - 3 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_closing_ceremony_2025]: {
      label: "Staff Pin Bag for Closing Ceremony - 2 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_dances_2025]: {
      label: "Staff Pin Bag for Dances - 2 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_accounting_and_finances_2025]:
      {
        label: "Staff Pin Bag for Accounting and Finances - 1 pins",
      },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_games_corner_2025]: {
      label: "Staff Pin Bag for Games Corner - 1 pins",
    },
    [AbstractEFGoodieWithoutVariants2025.staff_pins_local_and_public_affairs_2025]:
      {
        label: "Staff Pin Bag for Local and Public Affairs - 1 pins",
      },
  };

export const iterationEF2025: ConventionIterationSettings = {
  conDates: { start: new Date("2025-09-03"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [
	AbstractEFGoodieWithVariants2025.tshirt_2025,
      ],
      [GoodiesLevel.sponsor]: [
        AbstractEFGoodieWithVariants2025.attendee_pin_2025,
        AbstractEFGoodieWithVariants2025.tshirt_2025,
        AbstractEFGoodieWithoutVariants2025.towel_2025,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractEFGoodieWithVariants2025.attendee_pin_2025,
        AbstractEFGoodieWithVariants2025.tshirt_2025,
        AbstractEFGoodieWithoutVariants2025.towel_2025,
        AbstractEFGoodieWithoutVariants2025.messenger_bag_2025,
      ],
    },
    forFlag: {
      staff: [AbstractEFGoodieWithoutVariants2025.staff_coin_2025],
      director: [AbstractEFGoodieWithoutVariants2025.staff_coin_2025],
    },
    forRegNumber: {},
  },
};
