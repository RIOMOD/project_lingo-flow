import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

export async function getProgressDashboard() {
  return unwrap(await apiRequest("/progress/dashboard"));
}

export async function getCourseProgress() {
  return unwrap(await apiRequest("/progress/courses"));
}

export async function startLessonProgress(lessonId, payload = {}) {
  return unwrap(await apiRequest(`/progress/lessons/${lessonId}/start`, {
    method: "POST",
    skipRefresh: true,
    body: JSON.stringify(payload),
  }));
}

export async function completeLessonProgress(lessonId, payload = {}) {
  return unwrap(await apiRequest(`/progress/lessons/${lessonId}/complete`, {
    method: "POST",
    skipRefresh: true,
    body: JSON.stringify(payload),
  }));
}

export async function trackLessonProgress(lessonId, payload = {}) {
  return unwrap(await apiRequest(`/progress/lessons/${lessonId}`, {
    method: "PUT",
    skipRefresh: true,
    body: JSON.stringify(payload),
  }));
}

export async function getTeacherProgressDashboard() {
  return unwrap(await apiRequest("/teacher/progress/dashboard"));
}

export async function recordVocabularyProgress(masteredCount = 5) {
  return unwrap(await apiRequest("/progress/vocabulary/complete", {
    method: "POST",
    body: JSON.stringify({ masteredCount }),
  }));
}
