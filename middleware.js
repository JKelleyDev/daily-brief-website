/**
 * @file middleware.js
 * @description Vercel Edge middleware that attaches security headers to every
 * outbound response. Runs before the cache on every request.
 * @module middleware
 * @author Jordan Kelley
 */

import { next } from '@vercel/edge';

/**
 * Adds security-related HTTP response headers to every request.
 *
 * Headers applied:
 * - `Referrer-Policy: origin-when-cross-origin`
 * - `X-Frame-Options: DENY`
 * - `X-Content-Type-Options: nosniff`
 * - `X-DNS-Prefetch-Control: on`
 * - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
 *
 * @param {Request} req - The incoming request object.
 * @returns {Response} The response with security headers attached.
 */
export default function middleware(req) {
  return next({
    headers: {
      'Referrer-Policy': 'origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-DNS-Prefetch-Control': 'on',
      'Strict-Transport-Security':
        'max-age=31536000; includeSubDomains; preload',
    },
  });
}
