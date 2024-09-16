import { parseRestError } from "@/composables/api/base/parseRestError";
import { authState } from "@/composables/state/authState";
import type { ApiError } from "@/types/external";
import type {
  FetchResult,
  FetchResultPromise,
  RestErrorInfo,
} from "@/types/internal";

export type FetchMethod<Type> = () => FetchResultPromise<Type>;

export type RestErrorHandler = (info: RestErrorInfo) => any;

export async function restErrorWrapper<Type>(
  serviceName: string,
  fetcher: FetchMethod<Type>,
  restErrorHandler: RestErrorHandler
): Promise<Type | undefined> {
  try {
    const fetchResult: FetchResult<Type> = await fetcher();
    // await response.body.getReader().read()
    if (fetchResult.ok) {
      return <Type>fetchResult.data;
    } else if (fetchResult.status === 401) {
      authState.value.sessionActive = false;
      restErrorHandler(parseRestError(serviceName, <ApiError>fetchResult.data));
    } else {
      restErrorHandler(parseRestError(serviceName, <ApiError>fetchResult.data));
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
