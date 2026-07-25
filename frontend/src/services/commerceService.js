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

export async function getCart() {
  return unwrap(await apiRequest("/cart"));
}

export async function addCartItem(courseId) {
  return unwrap(await apiRequest("/cart/items", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  }));
}

export async function removeCartItem(courseId) {
  return unwrap(await apiRequest(`/cart/items/${courseId}`, { method: "DELETE" }));
}

export async function clearCart() {
  return unwrap(await apiRequest("/cart", { method: "DELETE" }));
}

export async function applyCoupon(code) {
  return unwrap(await apiRequest("/cart/coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  }));
}

export async function removeCoupon() {
  return unwrap(await apiRequest("/cart/coupon", { method: "DELETE" }));
}

export async function createOrder() {
  return unwrap(await apiRequest("/orders", { method: "POST" }));
}

export async function getOrders(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/orders${query ? `?${query}` : ""}`));
}

export async function getOrder(orderCode) {
  return unwrap(await apiRequest(`/orders/${orderCode}`));
}

export async function cancelOrder(orderCode) {
  return unwrap(await apiRequest(`/orders/${orderCode}/cancel`, { method: "POST" }));
}

export async function createPayment(orderCode) {
  return unwrap(await apiRequest(`/payments/${orderCode}/create`, { method: "POST" }));
}

export async function getPaymentStatus(orderCode) {
  return unwrap(await apiRequest(`/payments/${orderCode}/status`));
}

export async function getAdminOrders(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/admin/orders${query ? `?${query}` : ""}`));
}

export async function getAdminTransactions(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/admin/transactions${query ? `?${query}` : ""}`));
}

export async function getAdminCoupons(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/admin/coupons${query ? `?${query}` : ""}`));
}

export async function getAdminRefunds(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/admin/refunds${query ? `?${query}` : ""}`));
}

export async function activateCoupon(id) {
  return unwrap(await apiRequest(`/admin/coupons/${id}/activate`, { method: "POST" }));
}

export async function deactivateCoupon(id) {
  return unwrap(await apiRequest(`/admin/coupons/${id}/deactivate`, { method: "POST" }));
}

export async function approveRefund(id, note = "") {
  return unwrap(await apiRequest(`/admin/refunds/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ note }),
  }));
}

export async function rejectRefund(id, note = "") {
  return unwrap(await apiRequest(`/admin/refunds/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ note }),
  }));
}

export async function getAdminDashboardStats() {
  return unwrap(await apiRequest("/admin/dashboard/stats"));
}

