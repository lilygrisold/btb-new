import { Response } from 'express';

/**
 * Standardized API response helper
 * @param res - Express response object
 * @param status - HTTP status code
 * @param data - Response payload
 * @param message - Human-readable message
 */
const sendResponse = (
  res: Response,
  status: number,
  data: unknown,
  message: string = "No message included."
): Response => {
  return res.status(status).json({ status, data, message });
};

export { sendResponse };
