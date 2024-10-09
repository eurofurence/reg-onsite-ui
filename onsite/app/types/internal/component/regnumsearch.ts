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
  regNumber: number;
}

export interface ErrorSearchStatus {
  mode: SearchStatusMode.error;
  regNumber: number;
  message: string;
}

export type SearchStatus =
  | IdleWithDataSearchStatus
  | IdleNoDataSearchStatus
  | SearchingSearchStatus
  | ErrorSearchStatus;
