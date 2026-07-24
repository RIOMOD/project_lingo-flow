import { useEffect, useState } from "react";
import { createExercise, createQuestion, createTest, getTeacherResults } from "../../services/assessmentService";
import { getTeacherCourses } from "../../services/courseService";

export default function QuestionBankPage() {
  const [questionId, setQuestionId] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState({
    exerciseId: "",
    questionType: "MULTIPLE_CHOICE",
    questionText: "",
    explanation: "",
    points: 1,
    correctAnswer: "",
    position: 1,
    options: [
      { optionText: "A", correct: true, position: 1 },
      { optionText: "B", correct: false, position: 2 },
    ],
  });
  const [assessment, setAssessment] = useState({ courseId: "1", title: "", description: "", durationMinutes: 20, maxAttempts: 2, status: "DRAFT" });

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getTeacherResults({ size: 10 }).then((data) => setResults(data?.items ?? [])).catch(() => {});
    getTeacherCourses({ size: 50 }).then((data) => setCourses(data?.items ?? [])).catch(() => {});
  }, []);

  function setOption(index, field, value) {
    setQuestion((current) => ({
      ...current,
      options: current.options.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  }

  async function submitQuestion(event) {
    event.preventDefault();
    try {
      const saved = await createQuestion({ ...question, exerciseId: question.exerciseId ? Number(question.exerciseId) : null, points: Number(question.points), position: Number(question.position) });
      setQuestionId(saved.id);
    } catch (err) {
      setError(err.message || "Khong tao duoc cau hoi");
    }
  }

  async function submitExercise() {
    try {
      await createExercise({ ...assessment, courseId: Number(assessment.courseId), status: "PUBLISHED", exerciseType: "MIXED" });
      window.alert("Da tao bai tap");
    } catch (err) {
      setError(err.message || "Khong tao duoc bai tap");
    }
  }

  async function submitTest() {
    try {
      await createTest({ ...assessment, courseId: Number(assessment.courseId), status: "PUBLISHED", questionIds: questionId ? [Number(questionId)] : [] });
      window.alert("Da tao bai kiem tra");
    } catch (err) {
      setError(err.message || "Khong tao duoc bai kiem tra");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Question bank</h2>
        <p className="page-description">Tao cau hoi, dap an, bai tap, bai kiem tra va xem ket qua hoc vien.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <form className="page-panel-card course-form" onSubmit={submitQuestion}>
        <input value={question.exerciseId} onChange={(event) => setQuestion({ ...question, exerciseId: event.target.value })} placeholder="Exercise ID neu gan truc tiep" />
        <select value={question.questionType} onChange={(event) => setQuestion({ ...question, questionType: event.target.value })}>
          {["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_THE_BLANK", "SENTENCE_ORDERING", "MATCHING", "LISTENING_MULTIPLE_CHOICE", "WRITING"].map((type) => <option key={type}>{type}</option>)}
        </select>
        <textarea value={question.questionText} onChange={(event) => setQuestion({ ...question, questionText: event.target.value })} placeholder="Noi dung cau hoi" required />
        <textarea value={question.explanation} onChange={(event) => setQuestion({ ...question, explanation: event.target.value })} placeholder="Giai thich dap an" />
        {question.options.map((option, index) => (
          <div className="course-filter-row" key={option.position}>
            <input value={option.optionText} onChange={(event) => setOption(index, "optionText", event.target.value)} />
            <label><input type="checkbox" checked={option.correct} onChange={(event) => setOption(index, "correct", event.target.checked)} /> Dung</label>
          </div>
        ))}
        <button className="page-action page-action-primary" type="submit">Tao cau hoi</button>
        {questionId && <p>Cau hoi vua tao: {questionId}</p>}
      </form>
      <section className="page-panel-card">
        <div className="course-filter-row">
          <select value={assessment.courseId} onChange={(event) => setAssessment({ ...assessment, courseId: event.target.value })} required>
            <option value="">-- Chọn khóa học --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input value={assessment.title} onChange={(event) => setAssessment({ ...assessment, title: event.target.value })} placeholder="Ten bai" />
          <input value={assessment.durationMinutes} onChange={(event) => setAssessment({ ...assessment, durationMinutes: Number(event.target.value) })} type="number" />
        </div>
        <div className="page-actions">
          <button className="page-action page-action-primary" onClick={submitExercise}>Tao bai tap</button>
          <button className="page-action page-action-secondary" onClick={submitTest}>Tao bai kiem tra tu cau hoi vua tao</button>
        </div>
      </section>
      <section className="course-table page-panel-card">
        <h3>Ket qua hoc vien</h3>
        {results.map((item) => <div className="course-table-row" key={item.id}><div><strong>{item.title}</strong><p>{item.status} - {item.score ?? "Chua cham"}</p></div></div>)}
      </section>
    </div>
  );
}
