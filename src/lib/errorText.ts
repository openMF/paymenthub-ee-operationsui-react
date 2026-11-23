import { isAxiosError } from 'axios'

/** A short description of a failed call: the HTTP status when there was a response, else the error message. */
export function errorText(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    const { status, statusText } = error.response
    return statusText ? `HTTP ${status} ${statusText}` : `HTTP ${status}`
  }
  if (error instanceof Error && error.message) return error.message
  return 'unknown error'
}
