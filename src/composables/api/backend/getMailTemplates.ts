import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { getApi } from "@/composables/api/base/getApi";
import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import type {
  MailTemplate,
  MailTemplateList,
} from "@/types/internal/mails";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchMailTemplates(): FetchResultPromise<
  MailTemplateList,
  ApiError
> {
  const response = await getApi("onsite/api/v1/mail/templates");
  return fetchResultWrapper<MailTemplateList>(response);
}

export async function getMailTemplates(
  errorHandler: RestErrorHandler,
): Promise<MailTemplate[] | undefined> {
  const result = await restErrorWrapper<MailTemplateList>(
    "Backend Service",
    fetchMailTemplates,
    errorHandler,
  );
  return result?.templates;
}
