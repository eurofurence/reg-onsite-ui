import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function parseJsonResponse(response: Response): Promise<ApiError> {
  const bodyText: string = await response.text();
  try {
    return JSON.parse(bodyText);
  } catch (error) {
    return {
      message: "response.not.json",
      timestamp: new Date().toISOString(),
      requestid: "",
      details: `HTTP ${response.status}: ${bodyText}`,
    };
  }
}

export async function fetchResultWrapper<Type>(
  response: Response,
  data: Type | undefined = undefined
): FetchResultPromise<Type, ApiError> {
  let responseData: Type | ApiError;
  if (data === undefined) {
    responseData = await parseJsonResponse(response);
  } else {
    responseData = data;
  }
  return {
    ok: response.ok,
    status: response.status,
    data: responseData,
  };
}
