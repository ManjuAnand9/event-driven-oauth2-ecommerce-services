import {
  refreshAccessToken
} from "./authservice";

const API_GATEWAY =
  import.meta.env.VITE_API_GATEWAY ||
  "http://localhost:8081";

export function getAccessToken() {
  return (
    localStorage.getItem("novacart-access-token") ||
    ""
  );
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(
      "novacart-access-token",
      token
    );
  } else {
    localStorage.removeItem(
      "novacart-access-token"
    );
  }
}

export async function apiFetch(
  path,
  {
    skipAuth = false,
    ...options
  } = {}
) {
  async function sendRequest(token) {
    const headers = new Headers(
      options.headers || {}
    );

    if (
      !skipAuth &&
      token &&
      !headers.has("Authorization")
    ) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return fetch(`${API_GATEWAY}${path}`, {
      ...options,
      headers
    });
  }

  let token = getAccessToken();
  let response = await sendRequest(token);

  // Try refreshing only once.
  if (
    response.status === 401 &&
    !skipAuth &&
    token
  ) {
    try {
      token = await refreshAccessToken();
      response = await sendRequest(token);
    } catch {
      localStorage.removeItem(
        "novacart-access-token"
      );

      localStorage.removeItem(
        "novacart-refresh-token"
      );
    }
  }

  const contentType =
    response.headers.get("content-type") || "";

  let body = null;

  if (
    contentType.includes("application/json")
  ) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = text || null;
  }

  if (!response.ok) {
    const error = new Error(
      response.status === 401
        ? "Your session expired. Please sign in again."
        : body?.message ||
        body?.error ||
        (typeof body === "string"
          ? body
          : null) ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.body = body;

    throw error;
  }

  return {
    status: response.status,
    body
  };
}