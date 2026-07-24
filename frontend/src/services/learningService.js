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

export async function getVocabularies(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/vocabularies${query ? `?${query}` : ""}`));
}

export async function getReviewVocabularies(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/vocabularies/review${query ? `?${query}` : ""}`));
}

export async function updateVocabularyProgress(id, payload) {
  return unwrap(await apiRequest(`/vocabularies/${id}/progress`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }));
}

export async function getGrammarTopics(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/grammar${query ? `?${query}` : ""}`));
}

export async function getTeacherVocabularies(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/teacher/vocabularies${query ? `?${query}` : ""}`));
}

export async function createTeacherVocabulary(payload) {
  return unwrap(await apiRequest("/teacher/vocabularies", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function updateTeacherVocabulary(id, payload) {
  return unwrap(await apiRequest(`/teacher/vocabularies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
}

export async function deleteTeacherVocabulary(id) {
  return unwrap(await apiRequest(`/teacher/vocabularies/${id}`, { method: "DELETE" }));
}

export async function getTeacherGrammarTopics(params = {}) {
  const query = toQuery(params);
  return unwrap(await apiRequest(`/teacher/grammar${query ? `?${query}` : ""}`));
}

export async function createTeacherGrammar(payload) {
  return unwrap(await apiRequest("/teacher/grammar", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

export async function updateTeacherGrammar(id, payload) {
  return unwrap(await apiRequest(`/teacher/grammar/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
}

export async function deleteTeacherGrammar(id) {
  return unwrap(await apiRequest(`/teacher/grammar/${id}`, { method: "DELETE" }));
}
