const maxRetries = 10;
const baseDelaySeconds = 1;

/**
 * Call `fetch` with exponential backoff on status 429 responses.
 *
 * If the response was not a 429, return the response -- which could be an error
 * the caller should handle.
 *
 * @param {string} url
 * @param {any} options
 */
export default async function fetchWithBackoff(url, options) {
  for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
    let response;
    try {
      response = await fetch(url, options);
      // Return response unless we got 429 Too Many Requests
      if (response.status !== 429) {
        return response;
      }
    } catch (/** @type {any} */ error) {
      // Network error, warn and retry
      console.warn(`Retrying ${url}: ${error.message}`);
    }

    // Wait and retry
    let retryAfterSeconds = baseDelaySeconds;
    const retryAfterHeader = response?.headers?.get("Retry-After");
    if (retryAfterHeader) {
      retryAfterSeconds = parseInt(retryAfterHeader);
    }

    // Use exponential backoff with jitter to avoid thundering herd problem
    const jitter = Math.random();
    const backoffSeconds = jitter * Math.pow(2, retryCount);
    const delaySeconds = retryAfterSeconds + backoffSeconds;
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }

  throw new Error("fetchWithBackoff: Max retries exceeded");
}
