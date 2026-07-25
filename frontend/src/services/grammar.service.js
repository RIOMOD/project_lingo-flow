import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

export const grammarService = {
  getExerciseByTopic: async (topicId) => {
    return unwrap(await apiRequest(`/grammar/topics/${topicId}/exercise`));
  },

  submitAttempt: async (topicId, data) => {
    return unwrap(await apiRequest(`/grammar/topics/${topicId}/submit`, { method: "POST", body: JSON.stringify(data) }));
  },

  getMyAttempts: async () => {
    return unwrap(await apiRequest(`/grammar/attempts/me`));
  },

  getAttemptById: async (attemptId) => {
    return unwrap(await apiRequest(`/grammar/attempts/${attemptId}`));
  }
};
