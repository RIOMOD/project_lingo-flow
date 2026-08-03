import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./tokenStorage";

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
if (rawBaseUrl.startsWith("http") && !rawBaseUrl.endsWith("/api") && !rawBaseUrl.endsWith("/api/")) {
  rawBaseUrl = rawBaseUrl.replace(/\/+$/, "") + "/api";
}
const API_BASE_URL = rawBaseUrl;

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const validationDetails = body?.error?.details;
    const message = Array.isArray(validationDetails) && validationDetails.length > 0
      ? validationDetails.map((detail) => `${detail.field}: ${detail.message}`).join("; ")
      : body?.message || body?.error?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.body = body;

    // Detect if account has been locked or token revoked
    if (response.status === 401 || response.status === 403 || message.toLowerCase().includes("locked") || message.toLowerCase().includes("bị khóa")) {
      if (typeof window !== "undefined" && getAccessToken()) {
        window.dispatchEvent(new CustomEvent("account_locked", { detail: { message } }));
      }
    }

    throw error;
  }

  return body;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const body = await parseResponse(response);
  saveTokens(body.data);
  return body.data.accessToken;
}

export async function apiRequest(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers ?? {});
  const accessToken = getAccessToken();

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken && !skipAuth) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response;
  try {
    response = await fetch(url, { ...fetchOptions, headers });
  } catch (error) {
    throw new Error("Không thể kết nối máy chủ. Hãy kiểm tra backend đang chạy ở cổng 8080.", { cause: error });
  }

  if (response.status === 401 && accessToken && !skipAuth && !skipRefresh) {
    try {
      const newAccessToken = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      const retryResponse = await fetch(url, { ...fetchOptions, headers });
      return parseResponse(retryResponse);
    } catch (error) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("account_locked", { detail: { message: "Phiên đăng nhập đã bị hủy hoặc tài khoản bị khóa." } }));
      }
      throw error;
    }
  }

  return parseResponse(response);
}

export { API_BASE_URL };
