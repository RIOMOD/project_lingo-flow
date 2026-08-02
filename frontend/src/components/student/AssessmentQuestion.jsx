import { useEffect, useState } from "react";

function selectedIds(answer) {
  if (!answer) return [];
  if (Array.isArray(answer.selectedOptionIds)) return answer.selectedOptionIds;
  if (typeof answer.selectedOptionIds === "string" && answer.selectedOptionIds.trim()) {
    try { return JSON.parse(answer.selectedOptionIds); } catch { /* ignore */ }
  }
  if (answer.selectedOptionId) return [answer.selectedOptionId];
  return [];
}

export default function AssessmentQuestion({ question, answer, disabled, onAnswer, saving }) {
  const [text, setText] = useState(answer?.answerText || "");
  const multiple = selectedIds(answer);

  useEffect(() => {
    setText(answer?.answerText || "");
  }, [answer?.answerText, question?.id]);

  if (!question) return null;

  const rawType = question.questionType || question.type || "SINGLE_CHOICE";
  const qType = rawType;
  const qText = question.questionText || question.prompt || question.content || question.title || question.text || "Nội dung câu hỏi";
  const points = question.points || 1;
  const options = question.options ?? [];

  const isMultiple = qType === "MULTIPLE_CHOICE";
  const choiceType = isMultiple || ["SINGLE_CHOICE", "TRUE_FALSE", "LISTENING_MULTIPLE_CHOICE"].includes(qType);

  function handleSelectOption(optionId) {
    if (disabled) return;
    if (isMultiple) {
      const next = multiple.includes(optionId)
        ? multiple.filter((id) => id !== optionId)
        : [...multiple, optionId];
      onAnswer({ selectedOptionId: optionId, selectedOptionIds: next });
    } else {
      onAnswer({ selectedOptionId: optionId, selectedOptionIds: [optionId] });
    }
  }

  return (
    <div 
      className="assessment-question-card" 
      style={{ 
        background: "#ffffff", 
        padding: "0.9rem 1.15rem", 
        borderRadius: "14px", 
        border: "1px solid #e2e8f0",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box"
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="assessment-question-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", background: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.55rem", borderRadius: "6px", letterSpacing: "0.03em" }}>
            {qType.replaceAll("_", " ")}
          </span>
          <strong style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "700" }}>{points} Điểm</strong>
        </div>

        <h3 style={{ fontSize: "1.02rem", fontWeight: "700", color: "#0f172a", margin: "0.3rem 0 0.65rem 0", lineHeight: "1.4" }}>
          {qText}
        </h3>

        {choiceType && options.length > 0 && (
          <div className="assessment-options" style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {options.map((option) => {
              const optionId = option.id;
              const optionLabel = option.optionText || option.content || option.text;
              const checked = isMultiple 
                ? multiple.includes(optionId)
                : answer?.selectedOptionId === optionId || answer?.selectedOptionId === String(optionId) || (multiple.length > 0 && multiple[multiple.length - 1] === optionId);

              return (
                <div 
                  className={`assessment-option ${checked ? "is-selected" : ""} ${disabled && (option.correct || option.isCorrect) ? "is-correct" : ""}`} 
                  key={optionId}
                  onClick={() => handleSelectOption(optionId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    padding: "0.55rem 0.95rem",
                    borderRadius: "10px",
                    border: checked ? "2px solid #0d9488" : "1px solid #cbd5e1",
                    background: checked ? "#f0fdfa" : "#ffffff",
                    cursor: disabled ? "default" : "pointer",
                    fontWeight: checked ? "700" : "500",
                    boxShadow: checked ? "0 2px 8px rgba(13, 148, 136, 0.08)" : "none",
                    transition: "all 0.15s ease-in-out"
                  }}
                >
                  <input 
                    type={isMultiple ? "checkbox" : "radio"} 
                    name={`question-${question.id}`} 
                    checked={Boolean(checked)} 
                    disabled={disabled} 
                    onChange={() => handleSelectOption(optionId)}
                    style={{ width: "16px", height: "16px", accentColor: "#0d9488", cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "0.92rem", color: checked ? "#0f766e" : "#1e293b", lineHeight: "1.35" }}>{optionLabel}</span>
                </div>
              );
            })}
          </div>
        )}

        {["FILL_IN_THE_BLANK", "WRITING", "SENTENCE_ORDERING", "MATCHING"].includes(qType) && (
          <label className="assessment-text-answer" style={{ display: "block", marginTop: "0.5rem" }}>
            <span style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", color: "#475569", fontSize: "0.88rem" }}>
              {qType === "WRITING" ? "Bài viết của bạn" : "Câu trả lời của bạn"}
            </span>
            {qType === "WRITING" ? (
              <textarea 
                rows="3" 
                value={text} 
                disabled={disabled} 
                onChange={(event) => setText(event.target.value)} 
                onBlur={() => onAnswer({ answerText: text })} 
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
              />
            ) : (
              <input 
                value={text} 
                disabled={disabled} 
                onChange={(event) => setText(event.target.value)} 
                onBlur={() => onAnswer({ answerText: text })} 
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
              />
            )}
          </label>
        )}
      </div>

      {(saving || disabled) && (
        <div style={{ paddingTop: "0.4rem", flexShrink: 0 }}>
          {saving && <small className="assessment-saving" style={{ color: "#0d9488", display: "block", fontWeight: "600", fontSize: "0.8rem" }}>Đang tự động lưu...</small>}

          {disabled && (
            <div 
              className={`assessment-explanation ${answer?.correct ? "is-correct" : "is-incorrect"}`}
              style={{
                marginTop: "0.4rem",
                padding: "0.6rem 0.85rem",
                borderRadius: "9px",
                background: answer?.correct ? "#f0fdf4" : "#fef2f2",
                border: answer?.correct ? "1px solid #bbf7d0" : "1px solid #fecaca",
                color: answer?.correct ? "#15803d" : "#b91c1c",
                fontSize: "0.85rem"
              }}
            >
              <strong>{answer?.correct ? "✓ Chính xác" : "✗ Chưa đúng"}</strong>
              {question.explanation && <p style={{ margin: "0.2rem 0 0 0" }}>{question.explanation}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
