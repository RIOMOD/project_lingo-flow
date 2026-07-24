import { apiRequest } from "./apiClient";
import { clearTokens, getRefreshToken, saveTokens } from "./tokenStorage";

export async function registerStudent(payload) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
    skipRefresh: true,
  });
  saveTokens(response.data);
  return response.data;
}

export async function login(payload) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
    skipRefresh: true,
  });
  saveTokens(response.data);
  return response.data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        skipRefresh: true,
      });
    } catch {
      // Local logout should still continue if the server is unavailable.
    }
  }
  clearTokens();
}

export async function getCurrentUser() {
  const response = await apiRequest("/auth/me");
  return response.data;
}

