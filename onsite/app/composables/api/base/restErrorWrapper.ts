import { parseRestError } from "@/composables/api/base/parseRestError";
import { authState } from "@/composables/state/authState";
import type {
  FetchResult,
  FetchResultPromise,
  RestErrorInfo,
} from "@/types/internal/rest";
import type { ApiError } from "@/types/external/error";

export type FetchMethod<Type> = () => FetchResultPromise<Type, ApiError>;

export type RestErrorHandler = (info: RestErrorInfo) => any;

export async function restErrorWrapper<Type>(
  serviceName: string,
  fetcher: FetchMethod<Type>,
  restErrorHandler: RestErrorHandler
): Promise<Type | undefined> {
  try {
    const fetchResult: FetchResult<Type, ApiError> = await fetcher();
    // await response.body.getReader().read()
    if (fetchResult.ok) {
      return fetchResult.data as Type;
    } else if (fetchResult.status === 401) {
      authState.value.sessionActive = false;
      restErrorHandler(
        parseRestError(serviceName, fetchResult.data as ApiError)
      );
    } else {
      restErrorHandler(
        parseRestError(serviceName, fetchResult.data as ApiError)
      );
    }
  } catch (error: any) {
    restErrorHandler({
      serviceName: serviceName,
      errorCategory: "General Exception",
      errorDetail: `${error}`,
    });
  }
  return undefined;
}
