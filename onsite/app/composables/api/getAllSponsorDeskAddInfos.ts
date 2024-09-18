import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { getRecordEntries } from "@/composables/collection_tools/getRecordEntries";
import type {
  ApiAllSponsorDeskAddInfo,
  ApiAllSponsorDeskAddInfoRaw,
  ApiSponsorDeskAddInfo,
} from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";
import { getEmptySponsorDeskAddInfo } from "@/composables/items/getEmptySponsorDeskAddInfo";

export async function fetchAllSponsorDeskAddInfo(): FetchResultPromise<ApiAllSponsorDeskAddInfoRaw> {
  const response: Response = await getApi(
    `attsrv/api/rest/v1/additional-info/sponsordesk`
  );
  return fetchResultWrapper<ApiAllSponsorDeskAddInfoRaw>(response);
}

export async function getAllSponsorDeskAddInfos(
  errorHandler: RestErrorHandler
): Promise<ApiAllSponsorDeskAddInfo | null> {
  const result: ApiAllSponsorDeskAddInfoRaw | undefined =
    await restErrorWrapper<ApiAllSponsorDeskAddInfoRaw>(
      "Attendee Items Service",
      fetchAllSponsorDeskAddInfo,
      errorHandler
    );
  if (result === undefined) {
    return null;
  } else {
    var sponsorMap: Map<number, ApiSponsorDeskAddInfo> = new Map<
      number,
      ApiSponsorDeskAddInfo
    >();
    getRecordEntries(result.values).forEach(
      ([key, value]: [string, string]) => {
        const attendeeSponsorData = {
          ...getEmptySponsorDeskAddInfo(),
          ...JSON.parse(value),
        }
        sponsorMap.set(Number.parseInt(key), attendeeSponsorData);
      }
    );
    return {
      area: result.area,
      infos: sponsorMap,
    };
  }
}
