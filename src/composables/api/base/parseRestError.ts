import type { ApiError } from "@/types/external/error";
import type { RestErrorInfo } from "@/types/internal/rest";

type DetailRetriever = (data: ApiError) => string | null;

interface ErrorInfoDescription {
  message: string;
  details: DetailRetriever;
}

function ignoreDetails(_data: ApiError): null {
  return null;
}

function extractDetails(data: ApiError): string {
  const details = data.details;
  if (typeof details === "object" && details !== null) {
    const nested = details.details;
    const nestedDetail: unknown = Array.isArray(nested) ? nested[0] : nested;
    if (nestedDetail !== undefined) {
      return String(nestedDetail);
    }
  }
  if (typeof details === "string") {
    return details;
  }
  if (details !== undefined) {
    return JSON.stringify(details);
  }
  return JSON.stringify(data);
}

function extractDetailsDetailsItem(data: any): string {
  return data.details.details[0];
}

const errorMessageMap: {
  [key: string]: ErrorInfoDescription;
} = {
  "attendee.id.invalid": {
    message: "Invalid Attendee ID!",
    details: ignoreDetails,
  },
  "attendee.id.notfound": {
    message: "Attendee ID not found!",
    details: ignoreDetails,
  },
  "auth.unauthorized": {
    message: "Authorization required! Please press the 'Login' button!",
    details: extractDetailsDetailsItem,
  },
  "auth.forbidden": {
    message: "Access forbidden!",
    details: extractDetails,
  },
  "status.unpaid.dues": {
    message: "Attendee hasn't fully paid yet!",
    details: extractDetails,
  },
  "status.unchanged.invalid": {
    message: "Status unchanged!",
    details: extractDetailsDetailsItem,
  },
  "status.write.error": {
    message: "Unable to write status!",
    details: ignoreDetails,
  },
};

export function parseRestError(
  serviceName: string,
  data: ApiError
): RestErrorInfo {
  const message: ErrorInfoDescription | undefined =
    errorMessageMap[data.message];
  if (message === undefined) {
    return {
      serviceName: serviceName,
      errorCategory: data.message,
      errorDetail: JSON.stringify(data.details),
    };
  }
  return {
    serviceName: serviceName,
    errorCategory: message.message || data.message,
    errorDetail: message.details(data) || JSON.stringify(data.details),
  };
}
