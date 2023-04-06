import { AppRequest } from '../models';

/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: AppRequest): string {
  if (request.query && request.query.user) {
    return request.query.user as string;
  }
  return request.user && request.user.id;
}
