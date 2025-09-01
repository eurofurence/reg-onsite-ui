import type { ConcreteGoodieValue } from "@/config/convention";

export type DefaultSponsorDeskSettings = {};

export interface SponsorDeskSettings extends DefaultSponsorDeskSettings {
  available: ConcreteGoodieValue[]; // This property is dynamically created and not part of the hardcoded default
}
