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

  const qType = question.questionType || question.type || "MULTIPLE_CHOICE";
  const qText = question.questionText || question.prompt || "Nội dung câu hỏi";
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
    <div className="assessment-question-card" style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <div className="assessment-question-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", background: "#e0f2fe", color: "#0369a1", padding: "0.25rem 0.6rem", borderRadius: "6px" }}>
          {qType.replaceAll("_", " ")}
        </span>
        <strong style={{ fontSize: "0.85rem", color: "#64748b" }}>{points} Điểm</strong>
      </div>

      <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", margin: "1rem 0", lineHeight: "1.5" }}>
        {qText}
      </h3>

      {choiceType && options.length > 0 && (
        <div className="assessment-options" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.2rem" }}>
          {options.map((option) => {
            const optionId = option.id;
            const optionLabel = option.optionText || option.content || option.text;
            const checked = multiple.includes(optionId) || 
                            answer?.selectedOptionId === optionId || 
                            answer?.selectedOptionId === String(optionId);

            return (
              <label 
                className={`assessment-option ${checked ? "is-selected" : ""} ${disabled && (option.correct || option.isCorrect) ? "is-correct" : ""}`} 
                key={optionId}
                onClick={() => handleSelectOption(optionId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "12px",
                  border: checked ? "2px solid #0d9488" : "1px solid #cbd5e1",
                  background: checked ? "#f0fdfa" : "#ffffff",
                  cursor: disabled ? "default" : "pointer",
                  fontWeight: checked ? "700" : "500",
                  boxShadow: checked ? "0 4px 12px rgba(13, 148, 136, 0.12)" : "none",
                  transition: "all 0.15s ease-in-out"
                }}
              >
                <input 
                  type={isMultiple ? "checkbox" : "radio"} 
                  name={`question-${question.id}`} 
                  checked={checked} 
                  disabled={disabled} 
                  onChange={() => handleSelectOption(optionId)} 
                  style={{ width: "18px", height: "18px", accentColor: "#0d9488", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.98rem", color: checked ? "#0f766e" : "#1e293b" }}>{optionLabel}</span>
              </label>
            );
          })}
        </div>
      )}

      {["FILL_IN_THE_BLANK", "WRITING", "SENTENCE_ORDERING", "MATCHING"].includes(qType) && (
        <label className="assessment-text-answer" style={{ display: "block", marginTop: "1rem" }}>
          <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#475569" }}>
            {qType === "WRITING" ? "Bài viết của bạn" : "Câu trả lời của bạn"}
          </span>
          {qType === "WRITING" ? (
            <textarea 
              rows="6" 
              value={text} 
              disabled={disabled} 
              onChange={(event) => setText(event.target.value)} 
              onBlur={() => onAnswer({ answerText: text })} 
              style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1" }}
            />
          ) : (
            <input 
              value={text} 
              disabled={disabled} 
              onChange={(event) => setText(event.target.value)} 
              onBlur={() => onAnswer({ answerText: text })} 
              style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1" }}
            />
          )}
        </label>
      )}

      {saving && <small className="assessment-saving" style={{ color: "#0d9488", display: "block", marginTop: "0.5rem" }}>Đang tự động lưu...</small>}

      {disabled && (
        <div 
          className={`assessment-explanation ${answer?.correct ? "is-correct" : "is-incorrect"}`}
          style={{
            marginTop: "1.5rem",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            background: answer?.correct ? "#f0fdf4" : "#fef2f2",
            border: answer?.correct ? "1px solid #bbf7d0" : "1px solid #fecaca",
            color: answer?.correct ? "#166534" : "#991b1b"
          }}
        >
          <strong>{answer?.correct ? "✓ Chính xác!" : "✕ Chưa chính xác."}</strong>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
            {question.explanation || "Hãy xem lại nội dung liên quan và thử lại."}
          </p>
        </div>
      )}
    </div>
  );
}
