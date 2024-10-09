export interface RestErrorInfo {
  serviceName: string;
  errorCategory: string;
  errorDetail: string;
}

export interface FetchResult<ResultType, ErrorType> {
  ok: boolean;
  status: number;
  data: ResultType | ErrorType;
}

export type FetchResultPromise<ResultType, ErrorType> = Promise<
  FetchResult<ResultType, ErrorType>
>;
