import type {
  FlagApiValue,
  PackageApiValue,
} from "@/types/external/attsrv/attendees/attendee";
import type { NoFlagValues, NoPackageValues } from "@/types/internal/missing";

export type PackageValue = PackageApiValue | NoPackageValues;
export type FlagValue = FlagApiValue | NoFlagValues;
