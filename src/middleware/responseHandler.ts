import { Response, } from 'express';
import { ErrorResponse, ResponseData, } from '../utils/types.js';

export function sendResponse(res: Response, statusCode: number, data: unknown, message: string | null = null,): void {
  const response: ResponseData = {
    status: 'success',
    message,
    data,
  };

  // // Filter out null or undefined values to clean up the response
  // Object.keys(response,).forEach((key,) => {
  //   if (response[key as keyof ResponseData] === null
  //       || response[key as keyof ResponseData] === undefined) {
  //     delete response[key as keyof ResponseData];
  //   }
  // },);

  res.status(statusCode,).json(response,);
}

export function sendError(res: Response, error: ErrorResponse,): void {
  const response: ResponseData = {
    status: error.name || 'error',
    message: error.message || 'Internal server error',
  };

  res.status(error.statusCode || 500,).json(response,);
}
