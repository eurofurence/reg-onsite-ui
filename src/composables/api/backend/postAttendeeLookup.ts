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
}

export interface LookupResult {
  matches: AttendeeMatch[];
  item: string | null;
  found: boolean;
  input: LookupRow;
}

interface LookupResponse { results: LookupResult[]; }

async function fetchAttendeeLookup(rows: LookupRow[]): FetchResultPromise<LookupResponse, ApiError> {
  const response = await postApi("onsite/api/v1/attendees/match", { rows });
  return fetchResultWrapper<LookupResponse>(response);
}

export async function postAttendeeLookup(
  errorHandler: RestErrorHandler,
  rows: LookupRow[],
): Promise<LookupResult[] | undefined> {
  const result = await restErrorWrapper<LookupResponse>(
    "Backend Service",
    () => fetchAttendeeLookup(rows),
    errorHandler,
  );
  return result?.results;
}
