import { Response } from 'express';

export type DataResponse<T = Record<string, any>> = Response<{ data: T }>;
