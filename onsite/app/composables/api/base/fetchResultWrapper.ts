import type { ApiError } from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

export async function fetchResultWrapper<Type>(
  response: Response,
  data: Type | undefined = undefined
): FetchResultPromise<Type> {
  if (data === undefined) {
    data = await response.json();
  }
  return {
    ok: response.ok,
    status: response.status,
    data: <Type | ApiError>data,
  };
}
