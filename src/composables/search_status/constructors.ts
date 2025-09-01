import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import {
  SearchStatusMode,
  type ErrorSearchStatus,
  type IdleNoDataSearchStatus,
  type IdleWithDataSearchStatus,
  type SearchingSearchStatus,
} from "@/types/internal/component/regnumsearch";

export function getIdleNoDataSearchStatus(): IdleNoDataSearchStatus {
  return {
    mode: SearchStatusMode.idle_no_data,
  };
}

export function getIdleWithDataSearchStatus(): IdleWithDataSearchStatus {
  return {
    mode: SearchStatusMode.idle_with_data,
  };
}

export function getSearchingSearchStatus(
  regNumber: RegNumber
): SearchingSearchStatus {
  return {
    mode: SearchStatusMode.searching,
    regNumber: regNumber,
  };
}

export function getErrorSearchStatus(
  regNumber: RegNumber,
  errorList: string[]
): ErrorSearchStatus {
  return {
    mode: SearchStatusMode.error,
    regNumber: regNumber,
    message: errorList.join("\n"),
  };
}
