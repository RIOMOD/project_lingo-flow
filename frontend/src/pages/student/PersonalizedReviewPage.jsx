import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPersonalizedReviewSession, submitPersonalizedReviewSession } from "../../services/personalizedReviewService";
import "../../styles/PersonalizedReviewPage.css";

export default function PersonalizedReviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionId }
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      try {
        const data = await getPersonalizedReviewSession(sessionId);
        setSession(data);
        if (data.status === "COMPLETED" && data.postAccuracy != null) {
          // Already completed session
        }
      } catch (err) {
        setError(err.message || "Không tải được bài ôn tập cá nhân hóa");
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  const questions = session?.questions || [];
  const currentQuestion = questions[currentIdx];

  function handleSelectOption(qId, optId) {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: String(optId)
      }));

      const res = await submitPersonalizedReviewSession(sessionId, payload);
      setResult(res);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi nộp bài ôn tập");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="personalized-review-page" style={{ textAlign: "center", padding: "4rem" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", borderRadius: "50%", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", animation: "spin 0.8s linear infinite" }} />
        <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: "600" }}>Đang khởi tạo bài ôn tập cá nhân hóa...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="personalized-review-page" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h3 style={{ color: "#0f172a" }}>{error || "Không tìm thấy lượt ôn tập"}</h3>
        <button type="button" onClick={() => navigate("/student/tests")} style={{ marginTop: "1rem", padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
          Quay lại danh sách bài test
        </button>
      </div>
    );
  }

  return (
    <div className="personalized-review-page">
      {/* Banner */}
      <section className="review-hero-banner">
        <span style={{ fontSize: "0.78rem", fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "3px 12px", borderRadius: "20px" }}>
          PERSONALIZED PRACTICE
        </span>
        <h2>🎯 Bài Ôn Tập Cá Nhân Hóa Khắc Phục Lỗi Sai</h2>
        <p>Hệ thống tự động phân bổ câu hỏi thuộc các nội dung bạn làm chưa tốt để giúp bạn cải thiện ngay lập tức.</p>
      </section>

      {/* Mode 1: Active Quiz Taking */}
      {!result && (
        <section className="review-quiz-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4f46e5" }}>
              Câu {currentIdx + 1} / {questions.length}
            </span>
            <span style={{ fontSize: "0.8rem", background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: "8px", fontWeight: 700 }}>
              {currentQuestion?.topic || currentQuestion?.skillType || "Ôn tập kiến thức"}
            </span>
          </div>

          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: "0.5rem 0 1rem 0" }}>
            {currentQuestion?.questionText}
          </h3>

          {/* Options List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {currentQuestion?.options?.map((opt) => {
              const isSelected = answers[currentQuestion.id] === String(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, String(opt.id))}
                  className={`quiz-option-btn ${isSelected ? "selected" : ""}`}
                >
                  <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: isSelected ? "#4f46e5" : "#e2e8f0", color: isSelected ? "#fff" : "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800 }}>
                    {isSelected ? "✓" : ""}
                  </span>
                  <span>{opt.optionText}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
              style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 700, cursor: "pointer", opacity: currentIdx === 0 ? 0.4 : 1 }}
            >
              ⬅️ Câu trước
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => i + 1)}
                style={{ padding: "8px 20px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Câu tiếp ➔
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#059669", color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)" }}
              >
                {submitting ? "Đang chấm điểm..." : "Hoàn thành & Xem kết quả 🚀"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Mode 2: Submission Results & Multi-tier Explanation */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Improvement Score Card */}
          <section className="improvement-result-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className={`improvement-badge ${result.feedbackTag}`}>
                {result.feedbackLabel}
              </span>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                {new Date(result.completedAt).toLocaleString("vi-VN")}
              </span>
            </div>

            <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
              {result.feedbackSummary}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Điểm bài test gốc</span>
                <strong style={{ fontSize: "1.2rem", fontWeight: 900, color: "#475569" }}>
                  {result.preAccuracy}%
                </strong>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Điểm sau khi ôn tập</span>
                <strong style={{ fontSize: "1.2rem", fontWeight: 900, color: "#059669" }}>
                  {result.postAccuracy}%
                </strong>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Phần trăm cải thiện</span>
                <strong style={{ fontSize: "1.25rem", fontWeight: 900, color: result.improvementPercent >= 0 ? "#059669" : "#e11d48" }}>
                  {result.improvementPercent >= 0 ? `+${result.improvementPercent}%` : `${result.improvementPercent}%`}
                </strong>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Số câu đúng</span>
                <strong style={{ fontSize: "1.2rem", fontWeight: 900, color: "#334155" }}>
                  {result.correctCount} / {result.totalQuestions} câu
                </strong>
              </div>
            </div>
          </section>

          {/* Detailed Multi-Tier Explanations Section */}
          <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>💡 Chi tiết câu trả lời & Giải thích từ Giáo viên/AI</span>
            </h3>

            {result.explanations?.map((item, index) => (
              <div key={index} className={`explanation-card ${item.isCorrect ? "correct" : "incorrect"}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: item.isCorrect ? "#059669" : "#e11d48" }}>
                    {item.isCorrect ? "✅ ĐÚNG" : "❌ SAI"}
                  </span>
                  <span style={{ fontSize: "0.72rem", background: item.source === "TEACHER" ? "#fef3c7" : "#e0e7ff", color: item.source === "TEACHER" ? "#92400e" : "#3730a3", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    {item.source === "TEACHER" ? "👨‍🏫 Giải thích Giáo viên" : "🤖 Trợ lý AI phân tích"}
                  </span>
                </div>

                <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, color: "#0f172a" }}>
                  {index + 1}. {item.questionText}
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem", marginTop: "4px" }}>
                  <div style={{ padding: "8px 12px", background: item.isCorrect ? "#ecfdf5" : "#fff1f2", borderRadius: "10px", color: item.isCorrect ? "#065f46" : "#9f1239" }}>
                    <strong>Bạn chọn:</strong> {item.userSelectedOption}
                  </div>

                  <div style={{ padding: "8px 12px", background: "#f0fdf4", borderRadius: "10px", color: "#166534" }}>
                    <strong>Đáp án đúng:</strong> {item.correctAnswer}
                  </div>
                </div>

                <div style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.5, background: "#ffffff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  💡 <strong>Giải thích lý do:</strong> {item.explanation}
                </div>

                {item.similarExample && (
                  <div style={{ fontSize: "0.85rem", color: "#4f46e5", background: "#eff6ff", padding: "8px 12px", borderRadius: "10px", border: "1px solid #bfdbfe", fontWeight: 600 }}>
                    📝 {item.similarExample}
                  </div>
                )}
              </div>
            ))}
          </section>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
            <Link to="/student/tests" style={{ padding: "12px 24px", background: "#4f46e5", color: "#fff", textDecoration: "none", borderRadius: "12px", fontWeight: 800 }}>
              Quay về Danh sách Bài test
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
