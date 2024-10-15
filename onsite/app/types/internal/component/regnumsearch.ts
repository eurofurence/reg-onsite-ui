import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export const enum SearchStatusMode {
  idle_no_data = "idle_no_data",
  idle_with_data = "idle_with_data",
  searching = "searching",
  error = "error",
}

export interface IdleWithDataSearchStatus {
  mode: SearchStatusMode.idle_with_data;
}

export interface IdleNoDataSearchStatus {
  mode: SearchStatusMode.idle_no_data;
}

export interface SearchingSearchStatus {
  mode: SearchStatusMode.searching;
  regNumber: RegNumber;
}

export interface ErrorSearchStatus {
  mode: SearchStatusMode.error;
  regNumber: RegNumber;
  message: string;
}

export type SearchStatus =
  | IdleWithDataSearchStatus
  | IdleNoDataSearchStatus
  | SearchingSearchStatus
  | ErrorSearchStatus;
