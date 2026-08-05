import { getCsrfToken } from "next-auth/react";

/**
 * A wrapper around native fetch that automatically injects the NextAuth CSRF token
 * into the headers for all non-GET requests.
 *
 * This ensures that state-changing API calls are protected against CSRF without
 * having to manually fetch and attach the token in every component.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || "GET";
  const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  const headers = new Headers(init?.headers);

  if (isStateChanging && !headers.has("x-csrf-token")) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers.set("x-csrf-token", csrfToken);
    }
  }

  // Also ensure Content-Type is set to application/json by default for bodies,
  // unless FormData is being used (which sets its own boundary).
  if (
    isStateChanging &&
    init?.body &&
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
