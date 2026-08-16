import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

export interface CatalogItem {
  name: string;
  description?: string;
  grossPriceCents: number;
  vatRate?: number;
  quantity?: number;
}

async function fetchStartSumUpItemCheckout(
  readerId: string,
  items: CatalogItem[],
  attendeeContext?: string,
): FetchResultPromise<{ job_id: string }, ApiError> {
  const response = await postApi(
    `onsite/api/v1/sumup/readers/${readerId}/item-checkout`,
    {
      items: items.map((item) => ({
        name: item.name,
        description: item.description ?? "",
        gross_price_cents: item.grossPriceCents,
        vat_rate: item.vatRate ?? 0,
        quantity: item.quantity ?? 1,
      })),
      attendee_context: attendeeContext ?? null,
    },
  );
  return fetchResultWrapper<{ job_id: string }>(response);
}

export async function startSumUpItemCheckout(
  errorHandler: RestErrorHandler,
  readerId: string,
  items: CatalogItem[],
  attendeeContext?: string,
): Promise<{ job_id: string } | undefined> {
  return await restErrorWrapper<{ job_id: string }>(
    "Backend Service",
    () => fetchStartSumUpItemCheckout(readerId, items, attendeeContext),
    errorHandler,
  );
}
