import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiShippingAddInfo } from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

export async function fetchShippingAddInfo(
  regNumber: number
): FetchResultPromise<ApiShippingAddInfo | null> {
  const response: Response = await getApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/additional-info/shipping`
  );
  const data = await response.json();
  if (data?.message === "addinfo.notfound.error") {
    return {
      ok: true,
      status: response.status,
      data: null,
    };
  }
  return fetchResultWrapper<ApiShippingAddInfo>(response, data);
}

export async function getShippingAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<ApiShippingAddInfo | null | undefined> {
  return await restErrorWrapper<ApiShippingAddInfo | null>(
    "Attendee Shipping Service",
    () => fetchShippingAddInfo(regNumber),
    errorHandler
  );
}
