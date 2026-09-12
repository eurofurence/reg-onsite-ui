import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { postApi } from "@/composables/api/base/postApi";
import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import type {
  MailSendSummary,
  MassMailRequest,
} from "@/types/internal/mails";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchMassMail(
  request: MassMailRequest,
): FetchResultPromise<MailSendSummary, ApiError> {
  const response = await postApi("onsite/api/v1/mail/mass", request);
  return fetchResultWrapper<MailSendSummary>(response);
}

export async function postMassMail(
  errorHandler: RestErrorHandler,
  request: MassMailRequest,
): Promise<MailSendSummary | undefined> {
  return restErrorWrapper<MailSendSummary>(
    "Backend Service",
    () => fetchMassMail(request),
    errorHandler,
  );
}
