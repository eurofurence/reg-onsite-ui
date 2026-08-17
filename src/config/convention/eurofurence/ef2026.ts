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

export const enum AbstractEFGoodieWithoutVariants2026 {
  key_chain_2026 = "key_chain_2026",
  paper_fan_2026 = "paper_fan_2026",
  festival_3cups_2026 = "festival_3cups_2026",
  messenger_bag_2026 = "messenger_bag_2026",
  sponsor_pin_2026 = "attendee_pin_2026",

  staff_coin_2026 = "staff_coin_2026",

  drum_sticks_2026 = "drum_sticks_2026",

  critter_bookmark1_2026 = "critter_bookmark1_2026",
  critter_bookmark2_2026 = "critter_bookmark2_2026",
  critter_postcard_2026 = "critter_postcard_2026",
  critter_sticker1_2026 = "critter_sticker1_2026",
  critter_sticker2_2026 = "critter_sticker2_2026",
  critter_festival_cup_2026 = "critter_festival_cup_2026",
  critter_fidgetball_2026 = "critter_fidgetball_2026",
  critter_loop_scarf_2026 = "critter_loop_scarf_2026",
  critter_bottle_opener_2026 = "critter_bottle_opener_2026",
  critter_festival_wristband_2026 = "critter_festival_wristband_2026",
  critter_volunteer_pin_2026 = "critter_volunteer_pin_2026",

  staff_pin_bag_accounting_and_finances_2026 = "staff_pin_bag_accounting_and_finances_2026",
  staff_pin_bag_art_show_2026 = "staff_pin_bag_art_show_2026",
  staff_pin_bag_awareness_and_inclusion_2026 = "staff_pin_bag_awareness_and_inclusion_2026",
  staff_pin_bag_board_of_directors_2026 =  "staff_pin_bag_board_of_directors_2026",
  staff_pin_bag_brand_and_merchandising_2026 =  "staff_pin_bag_brand_and_merchandising_2026",
  staff_pin_bag_charity_2026 = "staff_pin_bag_charity_2026",
  staff_pin_bag_closing_ceremony_2026 =  "staff_pin_bag_closing_ceremony_2026",
  staff_pin_bag_con_book_2026 = "staff_pin_bag_con_book_2026",
  staff_pin_bag_convention_store_2026 = "staff_pin_bag_convention_store_2026",
  staff_pin_bag_conops_2026 = "staff_pin_bag_conops_2026",
  staff_pin_bag_critter_operations_2026 = "staff_pin_bag_critter_operations_2026",
  staff_pin_bag_dance_competition_2026 = "staff_pin_bag_dance_competition_2026",
  staff_pin_bag_dances_2026 = "staff_pin_bag_dances_2026",
  staff_pin_bag_dead_dog_party_2026 = "staff_pin_bag_dead_dog_party_2026",
  staff_pin_bag_dealers_den_2026 = "staff_pin_bag_dealers_den_2026",
  staff_pin_bag_funding_and_cooperations_2026 = "staff_pin_bag_funding_and_cooperations_2026",
  staff_pin_bag_fursuit_support_2026 = "staff_pin_bag_fursuit_support_2026",
  staff_pin_bag_furry_tails_theatre_2026 = "staff_pin_bag_furry_tails_theatre_2026",
  staff_pin_bag_games_corner_2026 = "staff_pin_bag_games_corner_2026",
  staff_pin_bag_guest_of_honor_relations_2026 = "staff_pin_bag_guest_of_honor_relations_2026",
  staff_pin_bag_information_technology_2026 = "staff_pin_bag_information_technology_2026",
  staff_pin_bag_internal_coordination_2026 = "staff_pin_bag_internal_coordination_2026",
  staff_pin_bag_local_and_public_affairs_2026 = "staff_pin_bag_local_and_public_affairs_2026",
  staff_pin_bag_logistics_2026 = "staff_pin_bag_logistics_2026",
  staff_pin_bag_marketing_and_communications_2026 = "staff_pin_bag_marketing_and_communications_2026",
  staff_pin_bag_marketing_and_public_relations_2026 = "staff_pin_bag_marketing_and_public_relations_2026",
  staff_pin_bag_mascot_2026 = "staff_pin_bag_mascot_2026",
  staff_pin_bag_opening_ceremony_2026 = "staff_pin_bag_opening_ceremony_2026",
  staff_pin_bag_pawpet_show_2026 = "staff_pin_bag_pawpet_show_2026",
  staff_pin_bag_people_and_culture_2026 = "staff_pin_bag_people_and_culture_2026",
  staff_pin_bag_photography_2026 = "staff_pin_bag_photography_2026",
  staff_pin_bag_press_and_media_relations_2026 = "staff_pin_bag_press_and_media_relations_2026",
  staff_pin_bag_production_management_2026 = "staff_pin_bag_production_management_2026",
  staff_pin_bag_programming_2026 = "staff_pin_bag_programming_2026",
  staff_pin_bag_registration_2026 = "staff_pin_bag_registration_2026",
  staff_pin_bag_registration_software_development_2026 = "staff_pin_bag_registration_software_development_2026",
  staff_pin_bag_screen_operations_2026 = "staff_pin_bag_screen_operations_2026",
  staff_pin_bag_security_2026 = "staff_pin_bag_security_2026",
  staff_pin_bag_staff_lounge_2026 = "staff_pin_bag_staff_lounge_2026",
  staff_pin_bag_stage_2026 = "staff_pin_bag_stage_2026",
  staff_pin_bag_statistics_2026 = "staff_pin_bag_statistics_2026",
  staff_pin_bag_summerboat_2026 = "staff_pin_bag_summerboat_2026",
  staff_pin_bag_telecommunications_2026 = "staff_pin_bag_telecommunications_2026",
  staff_pin_bag_the_daily_eurofurence_2026 = "staff_pin_bag_the_daily_eurofurence_2026",
  staff_pin_bag_theming_and_experience_2026 = "staff_pin_bag_theming_and_experience_2026",
  staff_pin_bag_video_2026 = "staff_pin_bag_video_2026",
  staff_pin_bag_virtual_reality_2026 = "staff_pin_bag_virtual_reality_2026",
  staff_pin_bag_website_2026 = "staff_pin_bag_website_2026",
}

export const enum AbstractEFGoodieWithVariants2026 {
  tshirt_2026 = "tshirt_2026",
  tshirt_staff_2026 = "tshirt_staff_2026",
}

export type ConcreteEFGoodieValue2026 =
  | `${AbstractEFGoodieWithoutVariants2026}`
  | `${AbstractEFGoodieWithVariants2026.tshirt_2026}_${TShirtTypeValue}`
  | `${AbstractEFGoodieWithVariants2026.tshirt_staff_2026}_${TShirtTypeValue}`;

export type EFGoodieConfig2026 =
  | GenericGoodieConfig<AbstractEFGoodieWithoutVariants2026, null, null>
  | GenericGoodieConfig<
      AbstractEFGoodieWithVariants2026.tshirt_2026,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >
  | GenericGoodieConfig<
      AbstractEFGoodieWithVariants2026.tshirt_staff_2026,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2026: MetadataRecord<EFGoodieConfig2026> =
  {
    [AbstractEFGoodieWithVariants2026.tshirt_2026]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractEFGoodieWithVariants2026.tshirt_staff_2026]: {
      label: "Staff T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractEFGoodieWithoutVariants2026.key_chain_2026]: {
      label: "Key Chain",
    },
    [AbstractEFGoodieWithoutVariants2026.paper_fan_2026]: {
      label: "Paper Fan",
    },
    [AbstractEFGoodieWithoutVariants2026.festival_3cups_2026]: {
      label: "3 Festival Cups",
    },
    [AbstractEFGoodieWithoutVariants2026.messenger_bag_2026]: {
      label: "Messenger Bag",
    },
    [AbstractEFGoodieWithoutVariants2026.sponsor_pin_2026]: {
      label: "Pin",
    },
    [AbstractEFGoodieWithoutVariants2026.drum_sticks_2026]: {
      label: "Drum Sticks - MUST BE PAID! ⚠️",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_coin_2026]: {
      label: "Staff Coin",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_bookmark1_2026]: {
      label: "Benefit: Bookmark EF",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_bookmark2_2026]: {
      label: "Benefit: Bookmark Art",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_postcard_2026]: {
      label: "Benefit: Postcard",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_sticker1_2026]: {
      label: "Benefit: Sticker EF Head",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_sticker2_2026]: {
      label: "Benefit: Sticker I volunteer",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_festival_cup_2026]: {
      label: "Benefit: Festival Cup",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_fidgetball_2026]: {
      label: "Benefit: Fidget Ball",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_loop_scarf_2026]: {
      label: "Benefit: Loop Scarf",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_bottle_opener_2026]: {
      label: "Benefit: Bottle Opener",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_festival_wristband_2026]: {
      label: "Benefit: Festival Wristband",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_volunteer_pin_2026]: {
      label: "Benefit: Volunteer Pin",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_accounting_and_finances_2026]: {
      label: "Staff Pin Bag: Accounting and Finances",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_art_show_2026]: {
      label: "Staff Pin Bag: Art Show",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_awareness_and_inclusion_2026]: {
      label: "Staff Pin Bag: Awareness and Inclusion",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_board_of_directors_2026]: {
      label: "Staff Pin Bag: Board of Directors",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_brand_and_merchandising_2026]: {
      label: "Staff Pin Bag: Brand and Merchandising",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_charity_2026]: {
      label: "Staff Pin Bag: Charity",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_closing_ceremony_2026]: {
      label: "Staff Pin Bag: Closing Ceremony",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_con_book_2026]: {
      label: "Staff Pin Bag: Con Book",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_convention_store_2026]: {
      label: "Staff Pin Bag: Convention Store",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_conops_2026]: {
      label: "Staff Pin Bag: ConOps",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_critter_operations_2026]: {
      label: "Staff Pin Bag: Critter Operations",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_dance_competition_2026]: {
      label: "Staff Pin Bag: Dance Competition",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_dances_2026]: {
      label: "Staff Pin Bag: Dances",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_dead_dog_party_2026]: {
      label: "Staff Pin Bag: Dead Dog Party",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_dealers_den_2026]: {
      label: "Staff Pin Bag: Dealers Den",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_funding_and_cooperations_2026]: {
      label: "Staff Pin Bag: Funding and Cooperations",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_fursuit_support_2026]: {
      label: "Staff Pin Bag: Fursuit Support",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_furry_tails_theatre_2026]: {
      label: "Staff Pin Bag: Furry Tails Theatre",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_games_corner_2026]: {
      label: "Staff Pin Bag: Games Corner",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_guest_of_honor_relations_2026]: {
      label: "Staff Pin Bag: Guest of Honor Relations",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_information_technology_2026]: {
      label: "Staff Pin Bag: Information Technology",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_internal_coordination_2026]: {
      label: "Staff Pin Bag: Internal Coordination",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_local_and_public_affairs_2026]: {
      label: "Staff Pin Bag: Local and Public Affairs",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_logistics_2026]: {
      label: "Staff Pin Bag: Logistics",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_marketing_and_communications_2026]: {
      label: "Staff Pin Bag: Marketing and Communications",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_marketing_and_public_relations_2026]: {
      label: "Staff Pin Bag: Marketing and Public Relations",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_mascot_2026]: {
      label: "Staff Pin Bag: Mascot",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_opening_ceremony_2026]: {
      label: "Staff Pin Bag: Opening Ceremony",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_pawpet_show_2026]: {
      label: "Staff Pin Bag: Pawpet Show",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_people_and_culture_2026]: {
      label: "Staff Pin Bag: People and Culture",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_photography_2026]: {
      label: "Staff Pin Bag: Photography",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_press_and_media_relations_2026]: {
      label: "Staff Pin Bag: Press and Media Relations",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_production_management_2026]: {
      label: "Staff Pin Bag: Production Management",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_programming_2026]: {
      label: "Staff Pin Bag: Programming",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_registration_2026]: {
      label: "Staff Pin Bag: Registration",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_registration_software_development_2026]: {
      label: "Staff Pin Bag: Registration Software Development",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_screen_operations_2026]: {
      label: "Staff Pin Bag: Screen Operations",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_security_2026]: {
      label: "Staff Pin Bag: Security",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_staff_lounge_2026]: {
      label: "Staff Pin Bag: Staff Lounge",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_stage_2026]: {
      label: "Staff Pin Bag: Stage",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_statistics_2026]: {
      label: "Staff Pin Bag: Statistics",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_summerboat_2026]: {
      label: "Staff Pin Bag: Summerboat",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_telecommunications_2026]: {
      label: "Staff Pin Bag: Telecommunications",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_the_daily_eurofurence_2026]: {
      label: "Staff Pin Bag: The Daily Eurofurence",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_theming_and_experience_2026]: {
      label: "Staff Pin Bag: Theming and Experience",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_video_2026]: {
      label: "Staff Pin Bag: Video",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_virtual_reality_2026]: {
      label: "Staff Pin Bag: Virtual Reality",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_pin_bag_website_2026]: {
      label: "Staff Pin Bag: Website",
    },
  };

export const iterationEF2026: ConventionIterationSettings = {
  conDates: { start: new Date("2026-08-19"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.contributor]: [
        AbstractEFGoodieWithoutVariants2026.key_chain_2026,
      ],
      [GoodiesLevel.tshirt]: [
        AbstractEFGoodieWithVariants2026.tshirt_2026,
      ],
      [GoodiesLevel.sponsor]: [
        AbstractEFGoodieWithVariants2026.tshirt_2026,
        AbstractEFGoodieWithoutVariants2026.sponsor_pin_2026,
        AbstractEFGoodieWithoutVariants2026.paper_fan_2026,
        AbstractEFGoodieWithoutVariants2026.festival_3cups_2026,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractEFGoodieWithVariants2026.tshirt_2026,
        AbstractEFGoodieWithoutVariants2026.sponsor_pin_2026,
        AbstractEFGoodieWithoutVariants2026.paper_fan_2026,
        AbstractEFGoodieWithoutVariants2026.festival_3cups_2026,
        AbstractEFGoodieWithoutVariants2026.messenger_bag_2026,
      ],
    },
    forFlag: {
      staff: [
        AbstractEFGoodieWithoutVariants2026.critter_bookmark1_2026,
        AbstractEFGoodieWithoutVariants2026.critter_bookmark2_2026,
        AbstractEFGoodieWithoutVariants2026.critter_postcard_2026,
        AbstractEFGoodieWithoutVariants2026.critter_sticker1_2026,
        AbstractEFGoodieWithoutVariants2026.critter_sticker2_2026,
        AbstractEFGoodieWithoutVariants2026.critter_festival_cup_2026,
        AbstractEFGoodieWithoutVariants2026.critter_fidgetball_2026,
        AbstractEFGoodieWithoutVariants2026.critter_loop_scarf_2026,
        AbstractEFGoodieWithoutVariants2026.critter_bottle_opener_2026,
        AbstractEFGoodieWithoutVariants2026.critter_volunteer_pin_2026,
        AbstractEFGoodieWithoutVariants2026.critter_festival_wristband_2026,
        AbstractEFGoodieWithoutVariants2026.staff_coin_2026,
      ],
      director: [],
    },
    forRegNumber: {},
  },
};
