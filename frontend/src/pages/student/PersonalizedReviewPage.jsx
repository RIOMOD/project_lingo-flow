import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPersonalizedReviewSession, submitPersonalizedReviewSession } from "../../services/personalizedReviewService";
import "../../styles/PersonalizedReviewPage.css";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

/** Parse richExplanation string (lines separated by \n\n or \n) into display sections */
function parseRichExplanation(raw) {
  if (!raw) return [];
  return raw
    .split(/\n{1,2}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("📌")) return { icon: "📌", type: "answer", text: line.replace(/^📌\s*/, "") };
      if (line.startsWith("💡")) return { icon: "💡", type: "explain", text: line.replace(/^💡\s*/, "") };
      if (line.startsWith("📚")) return { icon: "📚", type: "rule", text: line.replace(/^📚\s*/, "") };
      if (line.startsWith("🕐")) return { icon: "🕐", type: "usage", text: line.replace(/^🕐\s*/, "") };
      if (line.startsWith("✏️")) return { icon: "✏️", type: "example", text: line.replace(/^✏️\s*/, "") };
      return { icon: "•", type: "info", text: line };
    });
}

const SECTION_COLORS = {
  answer:  { bg: "#e0e7ff", border: "#c7d2fe", color: "#3730a3" },
  explain: { bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
  rule:    { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
  usage:   { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
  example: { bg: "#fdf4ff", border: "#e9d5ff", color: "#7c3aed" },
  info:    { bg: "#f8fafc", border: "#e2e8f0", color: "#334155" },
};

export default function PersonalizedReviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  // answers: { [questionId]: selectedOptionId (as string) }
  const [answers, setAnswers] = useState({});
  // feedback: { [questionId]: { isCorrect, correctOptionId, correctOptionText, selectedOptionText, explanation, richExplanation, lessonId, lessonTitle, courseSlug, courseId } }
  const [feedback, setFeedback] = useState({});
  // expandedRich: set of questionIds where rich panel is expanded
  const [expandedRich, setExpandedRich] = useState(new Set());

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

  function getOptions(question) {
    return question?.options || [];
  }

  function handleSelectOption(question, opt) {
    const qId = question.id;
    if (feedback[qId]) return; // Already answered — locked

    const opts = getOptions(question);
    const selectedId = String(opt.id);

    const correctOptId = question.correctOptionId != null ? String(question.correctOptionId) : null;
    const isCorrect = correctOptId != null && selectedId === correctOptId;

    const correctOpt = opts.find((o) => correctOptId != null && String(o.id) === correctOptId);
    const correctOptionText = correctOpt?.optionText || question.correctAnswer || "Xem giải thích bên dưới";

    // Use richExplanation if available, else fall back to explanation
    const richExp = question.richExplanation || null;
    let explanation = question.explanation;
    if (!explanation || explanation.trim() === "") {
      explanation = isCorrect
        ? `Chính xác! "${correctOptionText}" là đáp án đúng.`
        : `Đáp án đúng là: "${correctOptionText}". Hãy xem lại bài học để nắm rõ hơn.`;
    }

    // Lesson navigation data
    const lessonId = question.recommendedLessonId || null;
    const lessonTitle = question.recommendedLessonTitle || null;
    const courseSlug = question.recommendedLessonCourseSlug || null;
    const courseId = question.recommendedLessonCourseId || null;

    setAnswers((prev) => ({ ...prev, [qId]: selectedId }));
    setFeedback((prev) => ({
      ...prev,
      [qId]: {
        isCorrect,
        correctOptionId: correctOptId,
        correctOptionText,
        selectedOptionId: selectedId,
        selectedOptionText: opt.optionText,
        explanation,
        richExplanation: richExp,
        lessonId,
        lessonTitle,
        courseSlug,
        courseId,
      },
    }));
    // Auto-expand rich explanation on wrong answer
    if (!isCorrect && richExp) {
      setExpandedRich((prev) => new Set([...prev, qId]));
    }
  }

  function toggleRichPanel(qId) {
    setExpandedRich((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
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

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;
  const correctLocalCount = Object.values(feedback).filter((f) => f.isCorrect).length;

  // ── Loading ──
  if (loading) {
    return (
      <div className="personalized-review-page" style={{ textAlign: "center", padding: "4rem" }}>
        <div style={{ display: "inline-block", width: "44px", height: "44px", borderRadius: "50%", border: "4px solid #e0e7ff", borderTopColor: "#4f46e5", animation: "spin 0.75s linear infinite" }} />
        <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Đang tải bài ôn tập cá nhân hóa...</p>
      </div>
    );
  }

  // ── Error ──
  if (error || !session) {
    return (
      <div className="personalized-review-page" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h3 style={{ color: "#0f172a" }}>{error || "Không tìm thấy lượt ôn tập"}</h3>
        <button type="button" onClick={() => navigate("/student/tests")} style={{ marginTop: "1rem", padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>
          Quay lại danh sách bài test
        </button>
      </div>
    );
  }

  const qFeedback = currentQuestion ? feedback[currentQuestion.id] : null;
  const currentOpts = getOptions(currentQuestion);
  const isRichExpanded = currentQuestion ? expandedRich.has(currentQuestion.id) : false;

  return (
    <div className="personalized-review-page">

      {/* ── Hero Banner ── */}
      <section className="review-hero-banner">
        <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "3px 14px", borderRadius: "20px", letterSpacing: "0.05em" }}>
          PERSONALIZED PRACTICE
        </span>
        <h2>🎯 Bài Ôn Tập Cá Nhân Hóa</h2>
        <p>Hệ thống tự động chọn lại các câu bạn làm sai và bổ sung câu tương tự để củng cố kiến thức.</p>
      </section>

      {/* ── Progress Bar & Nav Dots ── */}
      {!result && questions.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
            <span>{answeredCount}/{questions.length} câu đã trả lời</span>
            <span style={{ color: "#059669", fontWeight: 800 }}>
              {correctLocalCount} đúng · {answeredCount - correctLocalCount} sai
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "99px",
              background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
              width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%`,
              transition: "width 0.35s ease"
            }} />
          </div>
          {/* Navigation dots */}
          <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
            {questions.map((q, idx) => {
              const fb = feedback[q.id];
              const isActive = idx === currentIdx;
              const bg = fb ? (fb.isCorrect ? "#10b981" : "#f43f5e") : (answers[q.id] ? "#818cf8" : "#e2e8f0");
              return (
                <button key={q.id} type="button" onClick={() => setCurrentIdx(idx)} title={q.topic || q.skillType || ""}
                  style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    border: isActive ? "2.5px solid #4f46e5" : "2px solid transparent",
                    background: bg, color: "#fff", fontWeight: 800, fontSize: "0.72rem",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isActive ? "0 0 0 3px rgba(79,70,229,0.18)" : "none",
                    transition: "all 0.2s ease", flexShrink: 0
                  }}>
                  {fb ? (fb.isCorrect ? "✓" : "✕") : idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quiz Card ── */}
      {!result && currentQuestion && (
        <section className="review-quiz-card">

          {/* Card header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.85rem", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#4f46e5", letterSpacing: "0.03em" }}>
              Câu {currentIdx + 1} / {questions.length}
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {currentQuestion.skillType && (
                <span style={{ fontSize: "0.72rem", background: "#f1f5f9", color: "#64748b", padding: "2px 9px", borderRadius: "6px", fontWeight: 700 }}>
                  {currentQuestion.skillType}
                </span>
              )}
              {currentQuestion.topic && (
                <span style={{ fontSize: "0.72rem", background: "#e0e7ff", color: "#3730a3", padding: "2px 9px", borderRadius: "6px", fontWeight: 700 }}>
                  {currentQuestion.topic}
                </span>
              )}
              {/* Lesson Link (top-right, always visible if available) */}
              {currentQuestion.recommendedLessonId && currentQuestion.recommendedLessonCourseSlug && (
                <a
                  href={`/student/courses/${currentQuestion.recommendedLessonCourseSlug}/learn?lessonId=${currentQuestion.recommendedLessonId}`}
                  target="_blank"
                  rel="noreferrer"
                  title={`Xem bài học: ${currentQuestion.recommendedLessonTitle || "Bài học liên quan"}`}
                  style={{
                    fontSize: "0.72rem", background: "#fef3c7", color: "#92400e",
                    padding: "3px 10px", borderRadius: "6px", fontWeight: 700,
                    textDecoration: "none", border: "1px solid #fde68a",
                    display: "flex", alignItems: "center", gap: "4px"
                  }}>
                  📖 Ôn lý thuyết
                </a>
              )}
            </div>
          </div>

          {/* Question text */}
          <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "1rem 0 1.2rem 0", lineHeight: 1.6 }}>
            {currentQuestion.questionText}
          </p>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {currentOpts.map((opt, optIdx) => {
              const hasFeedback = !!qFeedback;
              const isSelected = answers[currentQuestion.id] === String(opt.id);
              const isCorrectOpt = hasFeedback && qFeedback.correctOptionId === String(opt.id);
              const isWrongSelected = hasFeedback && isSelected && !qFeedback.isCorrect;

              let borderColor = "#e2e8f0";
              let bg = "#fff";
              let labelBg = "#f1f5f9";
              let labelColor = "#64748b";
              let textColor = "#334155";
              let shadow = "none";

              if (hasFeedback) {
                if (isCorrectOpt) {
                  borderColor = "#10b981"; bg = "#ecfdf5"; labelBg = "#10b981"; labelColor = "#fff"; textColor = "#065f46"; shadow = "0 2px 12px rgba(16,185,129,0.15)";
                } else if (isWrongSelected) {
                  borderColor = "#f43f5e"; bg = "#fff1f2"; labelBg = "#f43f5e"; labelColor = "#fff"; textColor = "#9f1239"; shadow = "0 2px 12px rgba(244,63,94,0.12)";
                }
              } else if (isSelected) {
                borderColor = "#4f46e5"; bg = "#eef2ff"; labelBg = "#4f46e5"; labelColor = "#fff"; textColor = "#3730a3"; shadow = "0 2px 10px rgba(79,70,229,0.15)";
              }

              const icon = hasFeedback ? (isCorrectOpt ? "✓" : isWrongSelected ? "✕" : "") : (isSelected ? "●" : "");

              return (
                <button key={opt.id} type="button"
                  onClick={() => !hasFeedback && handleSelectOption(currentQuestion, opt)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "13px 16px", borderRadius: "12px",
                    border: `2px solid ${borderColor}`, background: bg, color: textColor,
                    fontWeight: isSelected || isCorrectOpt ? 700 : 500,
                    fontSize: "0.93rem", textAlign: "left",
                    cursor: hasFeedback ? "default" : "pointer",
                    transition: "all 0.2s ease", boxShadow: shadow, width: "100%"
                  }}>
                  <span style={{
                    minWidth: "30px", height: "30px", borderRadius: "50%",
                    background: labelBg, color: labelColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: icon ? "0.9rem" : "0.78rem", fontWeight: 800, flexShrink: 0
                  }}>
                    {icon || OPTION_LABELS[optIdx]}
                  </span>
                  <span style={{ flex: 1, lineHeight: 1.5 }}>{opt.optionText}</span>
                </button>
              );
            })}
          </div>

          {/* ── Instant Feedback Panel ── */}
          {qFeedback && (
            <div style={{
              marginTop: "1.25rem", borderRadius: "14px", overflow: "hidden",
              border: `2px solid ${qFeedback.isCorrect ? "#10b981" : "#f43f5e"}`,
              boxShadow: qFeedback.isCorrect ? "0 4px 20px rgba(16,185,129,0.12)" : "0 4px 20px rgba(244,63,94,0.1)",
              animation: "fadeInUp 0.3s ease"
            }}>
              {/* Feedback header */}
              <div style={{
                padding: "11px 16px",
                background: qFeedback.isCorrect
                  ? "linear-gradient(90deg, #059669, #10b981)"
                  : "linear-gradient(90deg, #e11d48, #f43f5e)",
                color: "#fff", fontWeight: 800, fontSize: "0.95rem",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {qFeedback.isCorrect
                    ? "✅ Chính xác! Bạn trả lời đúng rồi!"
                    : "❌ Chưa đúng — Xem giải thích để hiểu rõ hơn"}
                </span>
                {/* Lesson link in header if lesson exists */}
                {qFeedback.lessonId && qFeedback.courseSlug && (
                  <a
                    href={`/student/courses/${qFeedback.courseSlug}/learn?lessonId=${qFeedback.lessonId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "0.78rem", background: "rgba(255,255,255,0.2)", color: "#fff",
                      padding: "4px 12px", borderRadius: "8px", fontWeight: 700,
                      textDecoration: "none", border: "1px solid rgba(255,255,255,0.35)",
                      whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px"
                    }}>
                    📖 {qFeedback.lessonTitle ? `Học: ${qFeedback.lessonTitle.substring(0, 20)}${qFeedback.lessonTitle.length > 20 ? "…" : ""}` : "Xem bài học"}
                  </a>
                )}
              </div>

              {/* Feedback body */}
              <div style={{ padding: "14px 16px", background: qFeedback.isCorrect ? "#f0fdf4" : "#fff1f2", display: "flex", flexDirection: "column", gap: "10px" }}>
                {!qFeedback.isCorrect && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.86rem" }}>
                    <div style={{ padding: "10px 12px", background: "#ffe4e6", borderRadius: "10px", border: "1px solid #fecdd3", color: "#9f1239" }}>
                      <div style={{ fontWeight: 800, marginBottom: "3px" }}>👉 Bạn đã chọn</div>
                      <div>{qFeedback.selectedOptionText}</div>
                    </div>
                    <div style={{ padding: "10px 12px", background: "#dcfce7", borderRadius: "10px", border: "1px solid #bbf7d0", color: "#166534" }}>
                      <div style={{ fontWeight: 800, marginBottom: "3px" }}>🎯 Đáp án đúng</div>
                      <div>{qFeedback.correctOptionText}</div>
                    </div>
                  </div>
                )}
                {qFeedback.isCorrect && (
                  <div style={{ padding: "10px 12px", background: "#dcfce7", borderRadius: "10px", border: "1px solid #bbf7d0", color: "#166534", fontSize: "0.86rem" }}>
                    <div style={{ fontWeight: 800, marginBottom: "3px" }}>🎯 Đáp án đúng</div>
                    <div>{qFeedback.correctOptionText}</div>
                  </div>
                )}

                {/* Brief explanation */}
                <div style={{
                  fontSize: "0.88rem", color: "#334155", lineHeight: 1.6,
                  background: "#fff", padding: "12px 14px", borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}>
                  <strong>💡 Giải thích:</strong> {qFeedback.explanation}
                </div>

                {/* ── Rich Explanation Toggle ── */}
                {qFeedback.richExplanation && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleRichPanel(currentQuestion.id)}
                      style={{
                        width: "100%", padding: "9px 14px", borderRadius: "10px",
                        border: "1.5px dashed #c7d2fe", background: isRichExpanded ? "#e0e7ff" : "#fff",
                        color: "#4338ca", fontWeight: 700, fontSize: "0.84rem",
                        cursor: "pointer", textAlign: "left",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        transition: "all 0.2s ease"
                      }}>
                      <span>📚 {isRichExpanded ? "Ẩn kiến thức chi tiết" : "Xem kiến thức chi tiết & Quy tắc"}</span>
                      <span style={{ fontSize: "1rem", transform: isRichExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>▾</span>
                    </button>

                    {isRichExpanded && (
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px", animation: "fadeInUp 0.25s ease" }}>
                        {parseRichExplanation(qFeedback.richExplanation).map((section, idx) => {
                          const colors = SECTION_COLORS[section.type] || SECTION_COLORS.info;
                          return (
                            <div key={idx} style={{
                              padding: "12px 14px", borderRadius: "10px",
                              background: colors.bg, border: `1px solid ${colors.border}`,
                              color: colors.color, fontSize: "0.86rem", lineHeight: 1.65,
                              whiteSpace: "pre-line"
                            }}>
                              <strong>{section.icon} </strong>{section.text}
                            </div>
                          );
                        })}
                        {/* Lesson CTA inside rich panel */}
                        {qFeedback.lessonId && qFeedback.courseSlug && (
                          <a
                            href={`/student/courses/${qFeedback.courseSlug}/learn?lessonId=${qFeedback.lessonId}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "flex", alignItems: "center", gap: "10px",
                              padding: "13px 16px", borderRadius: "12px",
                              background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                              color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.88rem",
                              boxShadow: "0 4px 14px rgba(79,70,229,0.25)"
                            }}>
                            <span style={{ fontSize: "1.3rem" }}>📖</span>
                            <div>
                              <div style={{ fontSize: "0.75rem", opacity: 0.85, marginBottom: "2px" }}>Bài học liên quan</div>
                              <div>{qFeedback.lessonTitle || "Xem bài học đầy đủ"}</div>
                            </div>
                            <span style={{ marginLeft: "auto", fontSize: "1.1rem" }}>→</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-advance hint */}
                {currentIdx < questions.length - 1 && (
                  <button type="button" onClick={() => setCurrentIdx((i) => i + 1)}
                    style={{ alignSelf: "flex-end", padding: "7px 16px", borderRadius: "8px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                    Câu tiếp theo ➔
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
            <button type="button" disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)}
              style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 700, cursor: currentIdx === 0 ? "not-allowed" : "pointer", opacity: currentIdx === 0 ? 0.4 : 1 }}>
              ⬅️ Câu trước
            </button>

            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>
              {answeredCount}/{questions.length} đã trả lời
            </span>

            {currentIdx < questions.length - 1 ? (
              <button type="button" onClick={() => setCurrentIdx((i) => i + 1)}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.28)" }}>
                Câu tiếp ➔
              </button>
            ) : (
              <button type="button" disabled={submitting || !allAnswered} onClick={handleSubmit}
                style={{
                  padding: "10px 22px", borderRadius: "10px", border: "none",
                  background: allAnswered ? "#059669" : "#94a3b8",
                  color: "#fff", fontWeight: 800, cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
                  boxShadow: allAnswered ? "0 4px 14px rgba(5,150,105,0.3)" : "none",
                  transition: "all 0.2s ease"
                }}
                title={!allAnswered ? `Còn ${questions.length - answeredCount} câu chưa trả lời` : "Nộp bài"}>
                {submitting ? "Đang chấm điểm..." : allAnswered ? "Hoàn thành & Xem kết quả 🚀" : `Trả lời thêm ${questions.length - answeredCount} câu`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Results Screen ── */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Score Card */}
          <section className="improvement-result-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span className={`improvement-badge ${result.feedbackTag}`}>{result.feedbackLabel}</span>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                {result.completedAt ? new Date(result.completedAt).toLocaleString("vi-VN") : ""}
              </span>
            </div>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
              {result.feedbackSummary}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", background: "#f8fafc", padding: "1.2rem", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
              <StatCard label="Điểm bài test gốc" value={`${result.preAccuracy}%`} color="#475569" />
              <StatCard label="Điểm bài ôn tập" value={`${result.postAccuracy}%`} color="#059669" />
              <StatCard label="Cải thiện" value={result.improvementPercent >= 0 ? `+${result.improvementPercent}%` : `${result.improvementPercent}%`} color={result.improvementPercent >= 0 ? "#059669" : "#e11d48"} />
              <StatCard label="Số câu đúng" value={`${result.correctCount}/${result.totalQuestions}`} color="#334155" />
            </div>
          </section>

          {/* Detailed Explanations per question */}
          <section style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              💡 Chi tiết từng câu & Kiến thức cần nắm
            </h3>
            {result.explanations?.map((item, index) => {
              // Find original question for rich explanation & lesson link
              const origQ = questions[index];
              const richExp = origQ?.richExplanation || null;
              const lessonId = origQ?.recommendedLessonId || null;
              const lessonTitle = origQ?.recommendedLessonTitle || null;
              const courseSlug = origQ?.recommendedLessonCourseSlug || null;

              return (
                <div key={index} className={`explanation-card ${item.isCorrect ? "correct" : "incorrect"}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: item.isCorrect ? "#059669" : "#e11d48" }}>
                      {item.isCorrect ? "✅ ĐÚNG" : "❌ SAI"} — Câu {index + 1}
                    </span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", background: item.source === "TEACHER" ? "#fef3c7" : "#e0e7ff", color: item.source === "TEACHER" ? "#92400e" : "#3730a3", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                        {item.source === "TEACHER" ? "👨‍🏫 Giáo viên" : "🤖 AI phân tích"}
                      </span>
                      {lessonId && courseSlug && (
                        <a href={`/student/courses/${courseSlug}/learn?lessonId=${lessonId}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: "0.7rem", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, textDecoration: "none", border: "1px solid #fde68a" }}>
                          📖 Bài học
                        </a>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: "0 0 8px 0", fontSize: "0.93rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                    {item.questionText}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.84rem", marginBottom: "8px" }}>
                    <div style={{ padding: "8px 12px", background: item.isCorrect ? "#dcfce7" : "#ffe4e6", borderRadius: "9px", color: item.isCorrect ? "#166534" : "#9f1239", border: `1px solid ${item.isCorrect ? "#bbf7d0" : "#fecdd3"}` }}>
                      <strong>Bạn chọn:</strong> {item.userSelectedOption}
                    </div>
                    <div style={{ padding: "8px 12px", background: "#dcfce7", borderRadius: "9px", color: "#166534", border: "1px solid #bbf7d0" }}>
                      <strong>Đáp án đúng:</strong> {item.correctAnswer}
                    </div>
                  </div>

                  {/* Brief explanation */}
                  <div style={{ fontSize: "0.87rem", color: "#334155", lineHeight: 1.55, background: "#fff", padding: "10px 13px", borderRadius: "9px", border: "1px solid #e2e8f0", marginBottom: richExp ? "8px" : "0" }}>
                    💡 <strong>Giải thích:</strong> {item.explanation}
                  </div>

                  {/* Rich explanation in results */}
                  {richExp && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {parseRichExplanation(richExp).map((section, si) => {
                        const colors = SECTION_COLORS[section.type] || SECTION_COLORS.info;
                        // Skip answer line (already shown above)
                        if (section.type === "answer") return null;
                        return (
                          <div key={si} style={{
                            padding: "10px 13px", borderRadius: "9px",
                            background: colors.bg, border: `1px solid ${colors.border}`,
                            color: colors.color, fontSize: "0.84rem", lineHeight: 1.6,
                            whiteSpace: "pre-line"
                          }}>
                            <strong>{section.icon} </strong>{section.text}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {item.similarExample && (
                    <div style={{ marginTop: "8px", fontSize: "0.84rem", color: "#4f46e5", background: "#eff6ff", padding: "8px 12px", borderRadius: "9px", border: "1px solid #bfdbfe", fontWeight: 600 }}>
                      📝 {item.similarExample}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
            <Link to="/student/tests" style={{ padding: "12px 28px", background: "#4f46e5", color: "#fff", textDecoration: "none", borderRadius: "12px", fontWeight: 800, boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}>
              Quay về Danh sách Bài test
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div>
      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 600, marginBottom: "3px" }}>{label}</span>
      <strong style={{ fontSize: "1.2rem", fontWeight: 900, color }}>{value}</strong>
    </div>
  );
}
