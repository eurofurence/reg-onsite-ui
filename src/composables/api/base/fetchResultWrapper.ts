import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

export async function fetchResultWrapper<Type>(
  response: Response,
  data: Type | undefined = undefined
): FetchResultPromise<Type, ApiError> {
  let responseData: Type | ApiError;
  if (data === undefined) {
    responseData = (await response.json()) as ApiError;
  } else {
    responseData = data as Type;
  }
  return {
    ok: response.ok,
    status: response.status,
    data: responseData,
  };
}
