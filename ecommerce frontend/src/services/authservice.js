const KEYCLOAK_URL = "http://localhost:8180";
const REALM = "ecommerce-app";
const CLIENT_ID = "AuthFlowClient";

console.log("KEYCLOAK URL:", import.meta.env.VITE_KEYCLOAK_URL);
console.log("REALM:", import.meta.env.VITE_KEYCLOAK_REALM);
console.log("CLIENT:", import.meta.env.VITE_KEYCLOAK_CLIENT_ID);



export function hasRole(role) {
  const token = getAccessToken();

  if (!token) {
    return false;
  }

  try {
    const payloadPart = token.split(".")[1];

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      atob(normalized)
    );

    const realmRoles =
      payload?.realm_access?.roles || [];

    return realmRoles.includes(role);
  } catch (error) {
    console.error(
      "Could not read roles from token:",
      error
    );

    return false;
  }
}

export function saveTokens(data) {
  if (!data?.access_token) {
    throw new Error("No access token received.");
  }

  localStorage.setItem(
    "novacart-access-token",
    data.access_token
  );

  if (data.refresh_token) {
    localStorage.setItem(
      "novacart-refresh-token",
      data.refresh_token
    );
  }
}

let refreshPromise = null;

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(
    "novacart-refresh-token"
  );

  if (!refreshToken) {
    logout();

    throw new Error(
      "Your session expired. Please sign in again."
    );
  }

  // Prevent multiple simultaneous API failures from
  // sending multiple refresh requests.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const realm = encodeURIComponent(REALM);

    const tokenUrl =
      `${KEYCLOAK_URL}/realms/${realm}` +
      "/protocol/openid-connect/token";

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: refreshToken
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      logout();

      throw new Error(
        "Your session expired. Please sign in again."
      );
    }

    // Keycloak may rotate both tokens.
    saveTokens(data);

    return data.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}



export async function login(username, password) {
  console.log("LOGIN CONFIG CHECK", {
    KEYCLOAK_URL,
    REALM,
    CLIENT_ID
  });
  if (!KEYCLOAK_URL || !REALM || !CLIENT_ID) {
    throw new Error("Missing Keycloak environment configuration.");
  }

  const realm = encodeURIComponent(REALM);
  const tokenUrl = `${KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: CLIENT_ID,
    username,
    password,
    scope: "openid profile email"
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Login failed with status ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(
      data.error_description || data.error || "Login failed"
    );
  }

  if (!data.access_token) {
    throw new Error("Keycloak did not return an access token.");
  }

  saveTokens(data);

  return data;
}

export function getAccessToken() {
  return localStorage.getItem("novacart-access-token") || "";
}

export function getUsername() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return "User";

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    );
    const payload = JSON.parse(atob(padded));

    return (
      payload.preferred_username ||
      payload.email ||
      payload.name ||
      "User"
    );
  } catch (error) {
    console.error("Could not decode access token", error);
    return "User";
  }
}

export function logout() {
  localStorage.removeItem("novacart-access-token");
  localStorage.removeItem("novacart-refresh-token");
}


export function getEmail() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    );

    const payload = JSON.parse(
      atob(padded)
    );

    return payload.email || null;

  } catch (error) {
    console.error(
      "Could not get email from token",
      error
    );

    return null;
  }
}
