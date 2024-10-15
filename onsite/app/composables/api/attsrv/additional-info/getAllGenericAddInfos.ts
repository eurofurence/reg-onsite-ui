import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { getRecordEntries } from "@/composables/collection_tools/getRecordEntries";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";
import type {
  ApiAllAddInfo,
  ApiAllAddInfoRaw,
} from "@/types/external/attsrv/additional-info/common";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

async function fetchAllAddInfo(
  addInfoArea: string
): FetchResultPromise<ApiAllAddInfoRaw, ApiError> {
  const response: Response = await getApi(
    `attsrv/api/rest/v1/additional-info/${addInfoArea}`
  );
  return fetchResultWrapper<ApiAllAddInfoRaw>(response);
}

export async function getAllAddInfos<AddInfoType>(
  serviceName: string,
  addInfoArea: string,
  errorHandler: RestErrorHandler,
  emptyAddInfo: AddInfoType
): Promise<ApiAllAddInfo<AddInfoType> | undefined> {
  const result: ApiAllAddInfoRaw | undefined =
    await restErrorWrapper<ApiAllAddInfoRaw>(
      serviceName,
      () => fetchAllAddInfo(addInfoArea),
      errorHandler
    );
  if (result === undefined) {
    return undefined;
  } else {
    var addInfoMap: Map<RegNumber, AddInfoType> = new Map<
      RegNumber,
      AddInfoType
    >();
    getRecordEntries(result.values).forEach(
      ([key, value]: [string, string]) => {
        const addInfoEntry = {
          ...emptyAddInfo,
          ...JSON.parse(value),
        };
        addInfoMap.set(Number.parseInt(key) as RegNumber, addInfoEntry);
      }
    );
    return {
      area: result.area,
      infos: addInfoMap,
    };
  }
}
