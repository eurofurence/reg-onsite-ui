import type {
  FlagApiValue,
  PackageApiValue,
} from "@/types/external/attsrv/attendees/attendee";

export type PackageValue = PackageApiValue | "";
export type FlagValue = FlagApiValue | "";

export interface ConventionSettings {
  maxRegNumber: number;
  minAge: number;
  logoLink: string;
  idpDashboardLink: string;
  privacyLink: string;
  imprintLink: string;
}
