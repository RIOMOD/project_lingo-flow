import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

export async function generatePersonalizedReview(sourceAttemptId = null) {
  const query = sourceAttemptId ? `?sourceAttemptId=${sourceAttemptId}` : "";
  return unwrap(await apiRequest(`/personalized-review/generate${query}`, { method: "POST" }));
}

export async function getPersonalizedReviewSession(sessionId) {
  return unwrap(await apiRequest(`/personalized-review/${sessionId}`));
}

export async function submitPersonalizedReviewSession(sessionId, answersPayload) {
  return unwrap(await apiRequest(`/personalized-review/${sessionId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers: answersPayload })
  }));
}

export async function getPersonalizedReviewHistory(params = {}) {
  const query = new URLSearchParams(params).toString();
  return unwrap(await apiRequest(`/personalized-review/history${query ? `?${query}` : ""}`));
}
