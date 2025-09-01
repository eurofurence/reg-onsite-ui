import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchAddInfo<AddInfoType>(
  addInfoArea: string,
  regNumber: RegNumber
): FetchResultPromise<AddInfoType | null, ApiError> {
  const response: Response = await getApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/additional-info/${addInfoArea}`
  );
  const data: any = await response.json();
  if (data?.message === "addinfo.notfound.error") {
    return {
      ok: true,
      status: response.status,
      data: null,
    };
  }
  return fetchResultWrapper<AddInfoType>(response, data);
}

export async function getAddInfo<AddInfoType>(
  serviceName: string,
  addInfoArea: string,
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<AddInfoType | null | undefined> {
  return await restErrorWrapper<AddInfoType | null>(
    serviceName,
    () => fetchAddInfo<AddInfoType>(addInfoArea, regNumber),
    errorHandler
  );
}
