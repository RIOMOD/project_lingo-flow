import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  return query.toString();
}

export async function getAdminUsers(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/admin/users${query ? `?${query}` : ""}`));
}

export async function getAdminUserDetail(userId) {
  return unwrap(await apiRequest(`/admin/users/${userId}`));
}

export async function createTeacher(payload) {
  return unwrap(
    await apiRequest("/admin/users/teachers", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
}

export async function updateAdminUser(userId, payload) {
  return unwrap(
    await apiRequest(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  );
}

export async function updateAdminUserStatus(userId, status) {
  return unwrap(
    await apiRequest(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  );
}

export async function updateAdminUserRole(userId, role) {
  return unwrap(
    await apiRequest(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })
  );
}

export async function lockUser(userId, locked) {
  return unwrap(
    await apiRequest(`/admin/users/${userId}/lock`, {
      method: "PUT",
      body: JSON.stringify({ locked }),
    })
  );
}

export async function getAdminDashboardStats() {
  const res = await apiRequest("/admin/dashboard");
  return res?.data ?? res;
}

export async function getAdminAuditLogs(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/admin/audit-logs${query ? `?${query}` : ""}`));
}
