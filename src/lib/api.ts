
/**
 * WedPlan API Client
 *
 * Authentication:
 * - Uses Better Auth session cookies.
 * - Supports same-origin Next.js rewrites or a direct backend URL.
 * - Does not attach stale Bearer tokens.
 * - Every request has a timeout to prevent infinite loading.
 */

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/** How long a single request may stay pending before it is aborted. */
const REQUEST_TIMEOUT_MS = 25_000;

/* ================= TEMPORARY DEBUG TRACE ================= */

/** TEMPORARY - set to `false` (or delete) once Stripe verification is confirmed. */
const API_DEBUG = true;

const traceApi = (label: string, payload?: unknown) => {
  if (!API_DEBUG) return;

  if (payload === undefined) console.info("[api]", label);
  else console.info("[api]", label, payload);
};

/** Only trace subscription traffic so the console stays readable. */
const isTracedEndpoint = (endpoint: string) =>
  endpoint.includes("/subscription");

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Error thrown by `apiRequest` for every failure mode (HTTP error, network
 * failure, timeout) so callers can react to the HTTP status instead of
 * guessing from a message string.
 *
 * `status` is the HTTP status code, or `0` when the server could not be
 * reached / the request timed out.
 */
export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

/** Read a response body without ever throwing a raw `SyntaxError`. */
async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      // A gateway/proxy can return HTTP 200 with an HTML or empty body.
      throw new ApiRequestError(
        "The server returned an unreadable response. Please try again.",
        response.status,
      );
    }
  }

  // Non-JSON bodies (HTML error pages, plain text) are returned as text so
  // callers can display them, but they can never be mistaken for success.
  const text = await response.text();

  return text.trim().length > 0 ? text : undefined;
}

function extractErrorMessage(
  result: unknown,
  fallback: string,
): string {
  if (typeof result === "object" && result !== null) {
    const errorData = result as ApiErrorResponse;

    return errorData.message || errorData.error || fallback;
  }

  if (typeof result === "string" && result.trim().length > 0) {
    // HTML error pages are useless to a user - keep the status message.
    return result.trim().startsWith("<") ? fallback : result;
  }

  return fallback;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const headers = new Headers(options.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  const controller = new AbortController();

  // Respect an existing caller-provided AbortSignal.
  const externalSignal = options.signal;

  if (externalSignal?.aborted) {
    controller.abort(externalSignal.reason);
  } else {
    externalSignal?.addEventListener(
      "abort",
      () => controller.abort(externalSignal.reason),
      { once: true },
    );
  }

  // Stop requests that remain pending for more than 25 seconds.
  const timeoutId = setTimeout(() => {
    controller.abort(new Error("API request timed out."));
  }, REQUEST_TIMEOUT_MS);

  const traced = isTracedEndpoint(cleanEndpoint);

  if (traced) {
    traceApi("fetch start", {
      url: `${API_URL}${cleanEndpoint}`,
      method: options.method ?? "GET",
      timeoutMs: REQUEST_TIMEOUT_MS,
    });
  }

  try {
    const response = await fetch(`${API_URL}${cleanEndpoint}`, {
      ...options,
      credentials: "include",
      headers,
      cache: "no-store",
      signal: controller.signal,
    });

    if (traced) {
      traceApi("response headers", {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get("content-type"),
      });
    }

    const result = await readResponseBody(response);

    if (traced) {
      traceApi("body parsed", result);
    }

    if (!response.ok) {
      throw new ApiRequestError(
        extractErrorMessage(
          result,
          `API request failed: ${response.status}`,
        ),
        response.status,
      );
    }

    return result as T;
  } catch (error) {
    // The caller aborted on purpose - do not disguise it as a timeout.
    if (externalSignal?.aborted) {
      if (traced) traceApi("caller aborted request");

      throw error;
    }

    if (controller.signal.aborted) {
      if (traced) traceApi("timed out after 25s");

      throw new ApiRequestError(
        "Request timed out. Please check your connection and try again.",
        0,
      );
    }

    if (error instanceof ApiRequestError) {
      if (traced) {
        traceApi("request failed", {
          status: error.status,
          message: error.message,
        });
      }

      throw error;
    }

    if (error instanceof Error) {
      if (traced) traceApi("network error", error.message);

      throw new ApiRequestError(error.message, 0);
    }

    if (traced) traceApi("unknown error", error);

    throw new ApiRequestError("Unable to connect to the WedPlan server.", 0);
  } finally {
    if (traced) traceApi("fetch settled (timeout cleared)");

    clearTimeout(timeoutId);
  }
}
