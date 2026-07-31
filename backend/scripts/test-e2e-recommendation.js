const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const PASSWORD = "Password123!";
const STUDENT_EMAIL = "recommendation.test@example.com";

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function request(apiPath, { method = "GET", token, body, expectedStatus = 200 } = {}) {
  const response = await fetch(`${BASE_URL}${apiPath}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => null);
  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${apiPath} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function login(email) {
  const payload = await request("/api/auth/login", {
    method: "POST",
    body: { email, password: PASSWORD },
  });
  assert(payload.success && payload.data?.accessToken, `Cannot log in as ${email}`);
  return payload.data.accessToken;
}

async function ensureTestStudent() {
  const registration = await request("/api/auth/register", {
    method: "POST",
    body: {
      fullName: "Recommendation Test Student",
      email: STUDENT_EMAIL,
      password: PASSWORD,
    },
    expectedStatus: 200,
  }).catch(async (error) => {
    if (!error.message.includes("Email is already registered")) throw error;
    return null;
  });
  return registration?.data?.accessToken || login(STUDENT_EMAIL);
}

async function createQuestion(teacherToken, runId, group, index, outcome) {
  const payload = await request("/api/teacher/questions", {
    method: "POST",
    token: teacherToken,
    body: {
      questionType: "SINGLE_CHOICE",
      questionText: `[E2E ${runId}] ${group.topic} question ${index + 1}`,
      explanation: `Review ${group.topic}`,
      skillType: group.skillType,
      topic: group.topic,
      recommendedLessonId: group.lessonId,
      points: 1,
      position: index + 1,
      options: [
        { optionText: "Correct answer", correct: true, position: 1 },
        { optionText: "Wrong answer", correct: false, position: 2 },
      ],
    },
  });
  assert(payload.success && payload.data?.id, `Question ${group.topic}/${index + 1} was not created`);
  const correctOption = payload.data.options.find((option) => option.correct === true);
  const wrongOption = payload.data.options.find((option) => option.correct === false);
  assert(correctOption && wrongOption, `Question ${payload.data.id} has invalid answer options`);
  return {
    id: payload.data.id,
    topic: group.topic,
    outcome,
    correctOptionId: correctOption.id,
    wrongOptionId: wrongOption.id,
  };
}

function assertRecommendation(item, expected) {
  assert(item, `Missing recommendation for ${expected.topic}`);
  assert(item.skillType === expected.skillType, `${expected.topic} has wrong skill`);
  assert(Number(item.accuracyPercent) === expected.accuracy, `${expected.topic} has wrong accuracy`);
  assert(Number(item.incorrectAnswers) === expected.incorrect, `${expected.topic} has wrong incorrect count`);
  assert(Number(item.totalQuestions) === 5, `${expected.topic} has wrong question count`);
  assert(Number(item.lessonId) === expected.lessonId, `${expected.topic} has wrong recommended lesson`);
}

async function run() {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, "");
  console.log(`Running recommendation E2E scenario ${runId}`);

  const health = await request("/api/health");
  assert(health.data?.status === "UP" || health.data === "UP", "Backend health check is not UP");

  const teacherToken = await login("teacher@example.com");

  const invalidQuestion = await request("/api/teacher/questions", {
    method: "POST",
    token: teacherToken,
    body: { questionType: "SINGLE_CHOICE", questionText: "", options: [] },
    expectedStatus: 400,
  });
  assert(invalidQuestion.error?.details?.some((detail) => detail.field === "questionText"),
    "Validation response does not identify questionText");

  const groups = [
    {
      skillType: "GRAMMAR",
      topic: "Past Simple",
      lessonId: 2,
      outcomes: ["correct", "wrong", "wrong", "wrong", "blank"],
    },
    {
      skillType: "VOCABULARY",
      topic: "Travel Vocabulary",
      lessonId: 3,
      outcomes: ["correct", "correct", "wrong", "wrong", "wrong"],
    },
    {
      skillType: "READING",
      topic: "Main Idea",
      lessonId: 4,
      outcomes: ["correct", "correct", "correct", "correct", "correct"],
    },
  ];

  const questions = [];
  for (const group of groups) {
    for (let index = 0; index < group.outcomes.length; index += 1) {
      questions.push(await createQuestion(teacherToken, runId, group, index, group.outcomes[index]));
    }
  }
  assert(questions.length === 15, "Expected 15 created questions");

  const testPayload = await request("/api/teacher/tests", {
    method: "POST",
    token: teacherToken,
    body: {
      courseId: 1,
      title: `[E2E] Skill recommendation ${runId}`,
      description: "20% grammar, 40% vocabulary, 100% reading",
      durationMinutes: 30,
      maxAttempts: 1,
      passScore: 60,
      status: "PUBLISHED",
      questionIds: questions.map((question) => question.id),
    },
  });
  const testId = testPayload.data?.id;
  assert(testId && testPayload.data.questions.length === 15, "Test was not created with 15 questions");

  const studentToken = await ensureTestStudent();
  const enrollment = await request("/api/courses/1/enroll-free", {
    method: "POST",
    token: studentToken,
  });
  assert(enrollment.success, "Test student could not access the free course");

  const started = await request(`/api/tests/${testId}/attempts`, {
    method: "POST",
    token: studentToken,
  });
  const attempt = started.data;
  assert(attempt?.questions?.length === 15, "Started attempt does not contain 15 questions");
  assert(attempt.answers.length === 0, "A new attempt should not contain saved answers");

  for (const question of questions) {
    if (question.outcome === "blank") continue;
    const selectedOptionId = question.outcome === "correct"
      ? question.correctOptionId
      : question.wrongOptionId;
    const saved = await request(`/api/attempts/${attempt.id}/answers/${question.id}`, {
      method: "PUT",
      token: studentToken,
      body: { selectedOptionId },
    });
    assert(saved.data.answers.some((answer) => answer.questionId === question.id),
      `Answer for question ${question.id} was not persisted`);
  }

  const submitted = await request(`/api/attempts/${attempt.id}/submit`, {
    method: "POST",
    token: studentToken,
  });
  const result = submitted.data;
  assert(result.status === "SUBMITTED", "Attempt was not submitted");
  assert(Number(result.score) === 8, "Expected raw score 8/15");
  assert(Number(result.scorePercent) === 53.33, "Expected score percent 53.33");
  assert(Number(result.correctAnswers) === 8, "Expected 8 correct answers");
  assert(Number(result.incorrectAnswers) === 7, "Expected 7 incorrect answers including one blank");
  assert(result.answers.length === 14, "Expected 14 saved answers and one blank question");

  assert(result.recommendations.length === 2, "Attempt should recommend exactly two weak topics");
  assertRecommendation(result.recommendations[0], {
    topic: "Past Simple", skillType: "GRAMMAR", accuracy: 20, incorrect: 4, lessonId: 2,
  });
  assertRecommendation(result.recommendations[1], {
    topic: "Travel Vocabulary", skillType: "VOCABULARY", accuracy: 40, incorrect: 3, lessonId: 3,
  });
  assert(!result.recommendations.some((item) => item.topic === "Main Idea"),
    "A topic at 100% accuracy must not be recommended");

  const recommendations = await request("/api/progress/recommendations", { token: studentToken });
  assert(recommendations.data.some((item) => item.topic === "Past Simple"),
    "Progress endpoint is missing Past Simple recommendation");
  assert(recommendations.data.some((item) => item.topic === "Travel Vocabulary"),
    "Progress endpoint is missing Travel Vocabulary recommendation");

  const report = {
    passed: true,
    runId,
    testAccount: { email: STUDENT_EMAIL, password: PASSWORD },
    created: { testId, attemptId: attempt.id, questionIds: questions.map((question) => question.id) },
    result: {
      score: Number(result.score),
      scorePercent: Number(result.scorePercent),
      correctAnswers: result.correctAnswers,
      incorrectAnswers: result.incorrectAnswers,
      recommendations: result.recommendations,
    },
  };
  fs.writeFileSync(path.join(__dirname, "e2e-result.json"), JSON.stringify(report, null, 2));
  console.log("PASS: recommendation E2E data and logic are correct");
  console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
