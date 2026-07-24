import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

function query(params = {}) {
  const data = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") data.set(key, value);
  });
  return data.toString();
}

export async function getExercises(params = {}) {
  const suffix = query(params);
  return unwrap(await apiRequest(`/exercises${suffix ? `?${suffix}` : ""}`));
}

export async function getTests(params = {}) {
  const suffix = query(params);
  return unwrap(await apiRequest(`/tests${suffix ? `?${suffix}` : ""}`));
}

export async function startExercise(id) {
  return unwrap(await apiRequest(`/exercises/${id}/attempts`, { method: "POST" }));
}

export async function startTest(id) {
  return unwrap(await apiRequest(`/tests/${id}/attempts`, { method: "POST" }));
}

export async function saveAnswer(attemptId, questionId, payload) {
  return unwrap(await apiRequest(`/attempts/${attemptId}/answers/${questionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
}

export async function submitAttempt(attemptId) {
  return unwrap(await apiRequest(`/attempts/${attemptId}/submit`, { method: "POST" }));
}

export async function getAttempts(params = {}) {
  const suffix = query(params);
  return unwrap(await apiRequest(`/attempts${suffix ? `?${suffix}` : ""}`));
}

export async function getAttempt(id) {
  return unwrap(await apiRequest(`/attempts/${id}`));
}

export async function createQuestion(payload) {
  return unwrap(await apiRequest("/teacher/questions", { method: "POST", body: JSON.stringify(payload) }));
}

export async function createExercise(payload) {
  return unwrap(await apiRequest("/teacher/exercises", { method: "POST", body: JSON.stringify(payload) }));
}

export async function createTest(payload) {
  return unwrap(await apiRequest("/teacher/tests", { method: "POST", body: JSON.stringify(payload) }));
}

export async function getTeacherResults(params = {}) {
  const suffix = query(params);
  return unwrap(await apiRequest(`/teacher/assessment-results${suffix ? `?${suffix}` : ""}`));
}
