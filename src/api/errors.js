/**
 * Extracts a human-readable message from any FastAPI error response.
 * Backend errors come in three shapes we've seen so far:
 *  1. detail: "Some string"                          (HTTPException with string detail)
 *  2. detail: [{ msg, loc, type }, ...]               (Pydantic validation errors)
 *  3. detail: { message, balance, required, ... }     (custom exceptions like InsufficientPointsError)
 */
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const detail = err?.response?.data?.detail

  if (!detail) return fallback

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg?.replace('Value error, ', '') || fallback).join(' ')
  }

  if (typeof detail === 'object' && detail.message) {
    return detail.message
  }

  return fallback
}