import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

export interface ApiPackagePayment {
  name: string;
  fully_paid_at: string | null;
}

type ApiPackagePaymentsResponse = {
  packages: ApiPackagePayment[];
};

async function fetchPackagePayments(
  regNumber: RegNumber
): FetchResultPromise<ApiPackagePaymentsResponse, ApiError> {
  const response: Response = await getApi(
    `onsite/api/v1/attendees/${regNumber}/packages/payments`
  );
  return fetchResultWrapper<ApiPackagePaymentsResponse>(response);
}

export async function getPackagePayments(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiPackagePayment[] | undefined> {
  const result: ApiPackagePaymentsResponse | undefined =
    await restErrorWrapper<ApiPackagePaymentsResponse>(
      "Backend Service",
      () => fetchPackagePayments(regNumber),
      errorHandler
    );
  return result?.packages;
}
