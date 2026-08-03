import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPersonalizedReviewSession, submitPersonalizedReviewSession } from "../../services/personalizedReviewService";
import "../../styles/PersonalizedReviewPage.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function PersonalizedReviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionId }
  // Track which questions have been answered & need feedback shown
  const [feedback, setFeedback] = useState({}); // { questionId: { isCorrect, correctOptionId, explanation } }

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      try {
        const data = await getPersonalizedReviewSession(sessionId);
        setSession(data);
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

  // Get options for a question, with fallback
  function getOptions(question) {
    if (!question) return [];
    const opts = question.options || [];
    if (opts.length > 0) return opts;
    // Build frontend fallback if options missing
    return [
      { id: question.id * 10 + 1, optionText: question.correctAnswer || "Phương án A", correct: true, position: 1 },
      { id: question.id * 10 + 2, optionText: "Phương án B", correct: false, position: 2 },
      { id: question.id * 10 + 3, optionText: "Phương án C", correct: false, position: 3 },
      { id: question.id * 10 + 4, optionText: "Phương án D", correct: false, position: 4 },
    ];
  }

  function handleSelectOption(question, opt) {
    const qId = question.id;
    // Only allow selection if no feedback shown for this question yet
    if (feedback[qId]) return;

    const opts = getOptions(question);
    const correctOpt = opts.find((o) => o.correct === true);
    const correctOptId = correctOpt ? String(correctOpt.id) : null;
    const selectedId = String(opt.id);
    const isCorrect = opt.correct === true || selectedId === correctOptId;

    // Explanation: from question or fallback text
    const explanation =
      question.explanation ||
      (isCorrect
        ? "Bạn đã chọn đúng đáp án!"
        : `Đáp án đúng là: "${correctOpt?.optionText || question.correctAnswer || ""}". Hãy xem lại nội dung bài học tương ứng.`);

    setAnswers((prev) => ({ ...prev, [qId]: selectedId }));
    setFeedback((prev) => ({
      ...prev,
      [qId]: {
        isCorrect,
        correctOptionId: correctOptId,
        selectedOptionId: selectedId,
        explanation,
        correctOptionText: correctOpt?.optionText || question.correctAnswer || "",
        selectedOptionText: opt.optionText,
      },
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: String(optId),
      }));

      const res = await submitPersonalizedReviewSession(sessionId, payload);
      setResult(res);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi nộp bài ôn tập");
    } finally {
      setSubmitting(false);
    }
  }

  // Count answered questions
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;

  // ── Loading ──
  if (loading) {
    return (
      <div className="personalized-review-page" style={{ textAlign: "center", padding: "4rem" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", borderRadius: "50%", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", animation: "spin 0.8s linear infinite" }} />
        <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: "600" }}>Đang khởi tạo bài ôn tập cá nhân hóa...</p>
      </div>
    );
  }

  // ── Error ──
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

  const qFeedback = currentQuestion ? feedback[currentQuestion.id] : null;
  const currentOpts = getOptions(currentQuestion);

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

      {/* Progress Bar */}
      {!result && questions.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
            <span>Tiến trình: {answeredCount} / {questions.length} câu đã trả lời</span>
            <span style={{ color: "#4f46e5" }}>{Math.round((answeredCount / questions.length) * 100)}%</span>
          </div>
          <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "8px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", width: `${(answeredCount / questions.length) * 100}%`, transition: "width 0.4s ease" }} />
          </div>
          {/* Question nav dots */}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
            {questions.map((q, idx) => {
              const fb = feedback[q.id];
              const isActive = idx === currentIdx;
              const dotColor = fb ? (fb.isCorrect ? "#059669" : "#e11d48") : (answers[q.id] ? "#4f46e5" : "#e2e8f0");
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: "30px", height: "30px", borderRadius: "50%", border: isActive ? "2px solid #4f46e5" : "2px solid transparent",
                    background: dotColor, color: "#fff", fontWeight: 800, fontSize: "0.75rem",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isActive ? "0 0 0 3px rgba(79,70,229,0.2)" : "none", transition: "all 0.2s ease"
                  }}
                >
                  {fb ? (fb.isCorrect ? "✓" : "✕") : idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 1: Active Quiz Taking */}
      {!result && currentQuestion && (
        <section className="review-quiz-card">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4f46e5" }}>
              Câu {currentIdx + 1} / {questions.length}
            </span>
            <span style={{ fontSize: "0.8rem", background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: "8px", fontWeight: 700 }}>
              {currentQuestion?.topic || currentQuestion?.skillType || "Ôn tập kiến thức"}
            </span>
          </div>

          {/* Question text */}
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "1rem 0 1.25rem 0", lineHeight: 1.55 }}>
            {currentQuestion?.questionText}
          </h3>

          {/* Options List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {currentOpts.map((opt, optIdx) => {
              const selectedId = answers[currentQuestion.id];
              const isSelected = selectedId === String(opt.id);
              const hasFeedback = !!qFeedback;
              const isCorrectOpt = opt.correct === true || String(opt.id) === qFeedback?.correctOptionId;
              const isWrongSelected = hasFeedback && isSelected && !qFeedback.isCorrect;

              let bgColor = "#fff";
              let borderColor = "#e2e8f0";
              let textColor = "#334155";
              let iconEl = null;

              if (hasFeedback) {
                if (isCorrectOpt) {
                  bgColor = "#ecfdf5";
                  borderColor = "#10b981";
                  textColor = "#065f46";
                  iconEl = "✅";
                } else if (isWrongSelected) {
                  bgColor = "#fff1f2";
                  borderColor = "#f43f5e";
                  textColor = "#9f1239";
                  iconEl = "❌";
                }
              } else if (isSelected) {
                bgColor = "#eef2ff";
                borderColor = "#4f46e5";
                textColor = "#3730a3";
                iconEl = "●";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => !hasFeedback && handleSelectOption(currentQuestion, opt)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 16px", borderRadius: "12px",
                    border: `2px solid ${borderColor}`,
                    background: bgColor, color: textColor,
                    fontWeight: isSelected || (hasFeedback && isCorrectOpt) ? 700 : 500,
                    fontSize: "0.95rem", textAlign: "left",
                    cursor: hasFeedback ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected || (hasFeedback && isCorrectOpt) ? "0 2px 10px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {/* Option label circle */}
                  <span style={{
                    minWidth: "30px", height: "30px", borderRadius: "50%",
                    background: hasFeedback
                      ? (isCorrectOpt ? "#10b981" : isWrongSelected ? "#f43f5e" : "#e2e8f0")
                      : (isSelected ? "#4f46e5" : "#f1f5f9"),
                    color: hasFeedback
                      ? (isCorrectOpt || isWrongSelected ? "#fff" : "#94a3b8")
                      : (isSelected ? "#fff" : "#64748b"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: 800, flexShrink: 0
                  }}>
                    {OPTION_LABELS[optIdx]}
                  </span>
                  <span style={{ flex: 1 }}>{opt.optionText || opt.text || "Phương án lựa chọn"}</span>
                  {iconEl && <span style={{ fontSize: "1.1rem", marginLeft: "auto" }}>{iconEl}</span>}
                </button>
              );
            })}
          </div>

          {/* ── Instant Feedback Box ── */}
          {qFeedback && (
            <div style={{
              marginTop: "1.25rem", borderRadius: "14px", overflow: "hidden",
              border: `2px solid ${qFeedback.isCorrect ? "#10b981" : "#f43f5e"}`,
              boxShadow: `0 4px 16px ${qFeedback.isCorrect ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)"}`
            }}>
              {/* Header */}
              <div style={{
                padding: "10px 16px",
                background: qFeedback.isCorrect ? "#10b981" : "#f43f5e",
                color: "#fff", fontWeight: 800, fontSize: "1rem",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
                {qFeedback.isCorrect ? "✅ Chính xác! Bạn đã làm đúng!" : "❌ Chưa đúng! Xem giải thích bên dưới"}
              </div>
              {/* Body */}
              <div style={{ padding: "14px 16px", background: qFeedback.isCorrect ? "#f0fdf4" : "#fff1f2", display: "flex", flexDirection: "column", gap: "10px" }}>
                {!qFeedback.isCorrect && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.88rem" }}>
                    <div style={{ padding: "8px 12px", background: "#fff1f2", borderRadius: "10px", border: "1px solid #fecdd3", color: "#9f1239" }}>
                      <strong>👉 Bạn chọn:</strong><br />{qFeedback.selectedOptionText}
                    </div>
                    <div style={{ padding: "8px 12px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0", color: "#065f46" }}>
                      <strong>🎯 Đáp án đúng:</strong><br />{qFeedback.correctOptionText}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.6, background: "#fff", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <strong>💡 Giải thích:</strong> {qFeedback.explanation}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
              style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 700, cursor: currentIdx === 0 ? "not-allowed" : "pointer", opacity: currentIdx === 0 ? 0.4 : 1, transition: "opacity 0.2s" }}
            >
              ⬅️ Câu trước
            </button>

            <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
              {answeredCount}/{questions.length} đã trả lời
            </span>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => i + 1)}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}
              >
                Câu tiếp ➔
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !allAnswered}
                onClick={handleSubmit}
                style={{
                  padding: "10px 24px", borderRadius: "10px", border: "none",
                  background: allAnswered ? "#059669" : "#94a3b8",
                  color: "#fff", fontWeight: 800, cursor: allAnswered ? "pointer" : "not-allowed",
                  boxShadow: allAnswered ? "0 4px 12px rgba(5, 150, 105, 0.35)" : "none",
                  transition: "all 0.2s ease"
                }}
                title={!allAnswered ? `Còn ${questions.length - answeredCount} câu chưa trả lời` : ""}
              >
                {submitting ? "Đang chấm điểm..." : allAnswered ? "Hoàn thành & Xem kết quả 🚀" : `Còn ${questions.length - answeredCount} câu chưa trả lời`}
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
                {result.completedAt ? new Date(result.completedAt).toLocaleString("vi-VN") : ""}
              </span>
            </div>

            <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
              {result.feedbackSummary}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Điểm bài test gốc</span>
                <strong style={{ fontSize: "1.2rem", fontWeight: 900, color: "#475569" }}>{result.preAccuracy}%</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Điểm sau khi ôn tập</span>
                <strong style={{ fontSize: "1.2rem", fontWeight: 900, color: "#059669" }}>{result.postAccuracy}%</strong>
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
