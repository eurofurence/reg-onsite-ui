import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { postApi } from "@/composables/api/base/postApi";
import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import type {
  MailPreviewRequest,
  MailPreviewResult,
} from "@/types/internal/mails";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchMailPreview(
  request: MailPreviewRequest,
): FetchResultPromise<MailPreviewResult, ApiError> {
  const response = await postApi("onsite/api/v1/mail/preview", request);
  return fetchResultWrapper<MailPreviewResult>(response);
}

export async function postMailPreview(
  errorHandler: RestErrorHandler,
  request: MailPreviewRequest,
): Promise<MailPreviewResult | undefined> {
  return restErrorWrapper<MailPreviewResult>(
    "Backend Service",
    () => fetchMailPreview(request),
    errorHandler,
  );
}