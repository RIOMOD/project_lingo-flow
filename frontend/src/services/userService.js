import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

export async function getProfile() {
  return unwrap(await apiRequest("/users/profile"));
}

export async function updateProfile(payload) {
  return unwrap(await apiRequest("/users/profile", { method: "PUT", body: JSON.stringify(payload) }));
}

export async function getMyCourses(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  return unwrap(await apiRequest(`/users/me/courses${query.toString() ? `?${query}` : ""}`));
}

