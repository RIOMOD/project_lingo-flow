import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { grammarService } from "../../services/grammar.service";
import { IconChevronLeft } from "../../components/common/SidebarIcons";
import { useAiLimoPageContext } from "../../context/AiLimoContext";

export default function GrammarExerciseTakingPage() {
  const { id: topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  useAiLimoPageContext(activeQuestionId ? {
    type: "GRAMMAR",
    grammarTopicId: Number(topicId),
    questionId: Number(activeQuestionId),
  } : null);

  useEffect(() => {
    grammarService.getExerciseByTopic(topicId)
      .then(data => {
        const items = data?.items || data || [];
        setQuestions(items);
        setActiveQuestionId(items[0]?.id ?? null);
      })
      .catch(err => setError(err.response?.data?.message || err.message || "Lỗi tải bài tập"));
  }, [topicId]);

  function handleSelectOption(questionId, optionId) {
    setActiveQuestionId(questionId);
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("Bạn chưa trả lời hết các câu hỏi. Vẫn nộp bài?")) {
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.keys(answers).map(qId => ({
          questionId: Number(qId),
          selectedOptionId: answers[qId]
        }))
      };
      const result = await grammarService.submitAttempt(topicId, payload);
      navigate(`/student/grammar/result/${result.id}`, { state: { result } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi nộp bài");
      setSubmitting(false);
    }
  }

  if (error) return <div className="course-page"><p className="auth-error">{error}</p></div>;
  if (questions.length === 0) return <div className="course-page"><p>Chưa có câu hỏi cho bài tập này.</p></div>;

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="course-page">
      <section className="page-hero">
        <button className="back-btn" onClick={() => navigate(`/student/grammar/${topicId}`)}>
          <IconChevronLeft /> Trở về
        </button>
        <h2 className="page-title">Làm bài tập Ngữ pháp</h2>
        <div style={{ marginTop: "10px", background: "#e2e8f0", borderRadius: "10px", height: "10px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#3b82f6", width: `${progressPercent}%`, transition: "width 0.3s" }}></div>
        </div>
        <p style={{ marginTop: "5px", fontSize: "0.9em", color: "#64748b" }}>Tiến độ: {answeredCount}/{questions.length} câu</p>
      </section>

      <div className="exercise-container" style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {questions.map((q, idx) => (
          <div key={q.id} className="page-panel-card">
            <h4>Câu {idx + 1}: {q.questionText}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              {q.options?.map((opt) => (
                <label 
                  key={opt.id} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    padding: "10px", 
                    border: "1px solid #cbd5e1", 
                    borderRadius: "8px", 
                    cursor: "pointer",
                    background: answers[q.id] === opt.id ? "#eff6ff" : "white",
                    borderColor: answers[q.id] === opt.id ? "#3b82f6" : "#cbd5e1"
                  }}
                >
                  <input 
                    type="radio" 
                    name={`q_${q.id}`} 
                    checked={answers[q.id] === opt.id} 
                    onChange={() => handleSelectOption(q.id, opt.id)} 
                  />
                  <span>{opt.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <button className="page-action page-action-primary" style={{ padding: "12px 40px", fontSize: "1.1em" }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Đang nộp..." : "Nộp bài"}
        </button>
      </div>
    </div>
  );
}
