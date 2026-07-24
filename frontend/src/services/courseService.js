import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

export async function getCourses(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const suffix = query.toString() ? `?${query}` : "";
  return unwrap(await apiRequest(`/courses${suffix}`, { skipAuth: true }));
}

export async function getCourseBySlug(slug) {
  return unwrap(await apiRequest(`/courses/${slug}`, { skipAuth: true }));
}

export async function getCourseChapters(courseId) {
  return unwrap(await apiRequest(`/courses/${courseId}/chapters`));
}

export async function getLesson(courseId, lessonId) {
  return unwrap(await apiRequest(`/courses/${courseId}/lessons/${lessonId}`));
}

export async function getCourseAccess(courseId) {
  return unwrap(await apiRequest(`/courses/${courseId}/access`));
}

export async function enrollFree(courseId) {
  return unwrap(await apiRequest(`/courses/${courseId}/enroll-free`, { method: "POST" }));
}

// ─── Teacher APIs ───────────────────────────────────────────────────────────

export async function getTeacherCourses(params = {}) {
  const query = new URLSearchParams(params).toString();
  return unwrap(await apiRequest(`/teacher/courses${query ? `?${query}` : ""}`));
}

export async function createCourse(payload) {
  return unwrap(await apiRequest("/teacher/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function updateCourse(id, payload) {
  return unwrap(await apiRequest(`/teacher/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
}

export async function deleteCourse(id) {
  return unwrap(await apiRequest(`/teacher/courses/${id}`, { method: "DELETE" }));
}

export async function submitCourseReview(id) {
  return unwrap(await apiRequest(`/teacher/courses/${id}/submit-review`, { method: "POST" }));
}

export async function getTeacherCourseChapters(courseId) {
  return unwrap(await apiRequest(`/teacher/courses/${courseId}/chapters`));
}

export async function createChapter(courseId, payload) {
  return unwrap(await apiRequest(`/teacher/courses/${courseId}/chapters`, {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function updateChapter(chapterId, payload) {
  return unwrap(await apiRequest(`/teacher/chapters/${chapterId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
}

export async function deleteChapter(chapterId) {
  return unwrap(await apiRequest(`/teacher/chapters/${chapterId}`, { method: "DELETE" }));
}

export async function createLesson(chapterId, payload) {
  return unwrap(await apiRequest(`/teacher/chapters/${chapterId}/lessons`, {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function updateLesson(lessonId, payload) {
  return unwrap(await apiRequest(`/teacher/lessons/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
}

export async function deleteLesson(lessonId) {
  return unwrap(await apiRequest(`/teacher/lessons/${lessonId}`, { method: "DELETE" }));
}

// ─── Admin APIs ──────────────────────────────────────────────────────────────

export async function getAdminCourses(params = {}) {
  const query = new URLSearchParams(params).toString();
  return unwrap(await apiRequest(`/admin/courses${query ? `?${query}` : ""}`));
}

export async function approveCourse(id) {
  return unwrap(await apiRequest(`/admin/courses/${id}/approve`, { method: "POST" }));
}

export async function rejectCourse(id, reason = "") {
  return unwrap(await apiRequest(`/admin/courses/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  }));
}

export async function publishCourse(id) {
  return unwrap(await apiRequest(`/admin/courses/${id}/publish`, { method: "POST" }));
}

export async function hideCourse(id) {
  return unwrap(await apiRequest(`/admin/courses/${id}/hide`, { method: "POST" }));
}

export async function archiveCourse(id) {
  return unwrap(await apiRequest(`/admin/courses/${id}/archive`, { method: "POST" }));
}
