import { Response } from 'express';

export type DataResponse<T = Record<string, any>> = Response<{ data: T }>;

export type Pagination = {
  limit: number;
  offset: number;
  total: number;
  sort: string;
};
