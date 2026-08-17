import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

export interface LookupRow {
  regId?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  idpId?: string;
  item?: string;
}

export interface AttendeeMatch {
  id: RegNumber;
  nickname: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  idpId: string | null;
  telegram: string | null;
  packages: string[];
  flags: string[];
}

export interface LookupResult {
  matches: AttendeeMatch[];
  item: string | null;
  found: boolean;
  input: LookupRow;
}

interface LookupResponse { results: LookupResult[]; }

export interface LookupFilter {
  requiredPackages?: string[];
  requiredFlags?: string[];
}

async function fetchAttendeeLookup(
  rows: LookupRow[],
  filter: LookupFilter,
): FetchResultPromise<LookupResponse, ApiError> {
  const response = await postApi("onsite/api/v1/attendees/match", { rows, ...filter });
  return fetchResultWrapper<LookupResponse>(response);
}

export async function postAttendeeLookup(
  errorHandler: RestErrorHandler,
  rows: LookupRow[],
  filter: LookupFilter = {},
): Promise<LookupResult[] | undefined> {
  const result = await restErrorWrapper<LookupResponse>(
    "Backend Service",
    () => fetchAttendeeLookup(rows, filter),
    errorHandler,
  );
  return result?.results;
}
