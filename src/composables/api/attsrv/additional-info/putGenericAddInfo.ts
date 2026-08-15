import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function postAddInfo<AddInfoType>(
  addInfoArea: string,
  regNumber: RegNumber,
  itemData: AddInfoType
): FetchResultPromise<any, ApiError> {
  const response: Response = await postApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/additional-info/${addInfoArea}`,
    itemData
  );
  return fetchResultWrapper<any>(response);
}

export async function putAddInfo<AddInfoType>(
  serviceName: string,
  addInfoArea: string,
  errorHandler: RestErrorHandler,
  regNumber: RegNumber,
  itemData: AddInfoType
): Promise<null | undefined> {
  const result: any | undefined = await restErrorWrapper<null>(
    serviceName,
    () => postAddInfo<AddInfoType>(addInfoArea, regNumber, itemData),
    errorHandler
  );
  if (result !== undefined) {
    return null;
  } else {
    return undefined;
  }
}
