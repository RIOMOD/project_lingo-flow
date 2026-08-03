import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

export async function sendAiChat(payload) {
  return unwrap(await apiRequest("/ai/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function getAiConversations() {
  return unwrap(await apiRequest("/ai/conversations"));
}

export async function getAiConversation(id) {
  return unwrap(await apiRequest(`/ai/conversations/${id}`));
}

export async function deleteAiConversation(id) {
  await apiRequest(`/ai/conversations/${id}`, { method: "DELETE" });
}

export async function requestWritingFeedback(payload) {
  return unwrap(await apiRequest("/ai/writing-feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function getAiUsage() {
  return unwrap(await apiRequest("/ai/usage"));
}

export async function submitAiFeedback(payload) {
  return unwrap(await apiRequest("/ai/feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function getAdminAiFeedbacks(rating = "", page = 0, size = 20) {
  const query = new URLSearchParams();
  if (rating) query.append("rating", rating);
  query.append("page", page);
  query.append("size", size);
  return unwrap(await apiRequest(`/ai/admin/feedbacks?${query.toString()}`));
}
