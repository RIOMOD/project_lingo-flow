import { apiRequest } from "./apiClient";

function unwrap(response) {
  return response?.data;
}

export const teacherGrammarService = {
  getQuestionsByTopic: async (topicId) => {
    return unwrap(await apiRequest(`/teacher/grammar/topics/${topicId}/questions`));
  },

  createQuestion: async (topicId, data) => {
    return unwrap(await apiRequest(`/teacher/grammar/topics/${topicId}/questions`, { method: "POST", body: JSON.stringify(data) }));
  },

  updateQuestion: async (questionId, data) => {
    return unwrap(await apiRequest(`/teacher/grammar/questions/${questionId}`, { method: "PUT", body: JSON.stringify(data) }));
  },

  deleteQuestion: async (questionId) => {
    return unwrap(await apiRequest(`/teacher/grammar/questions/${questionId}`, { method: "DELETE" }));
  },

  getStudentResults: async (topicId) => {
    return unwrap(await apiRequest(`/teacher/grammar/topics/${topicId}/results`));
  }
};
