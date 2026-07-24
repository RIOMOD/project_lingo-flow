import { useEffect, useState } from "react";

function selectedIds(answer) {
  if (!answer?.selectedOptionIds) return [];
  try { return JSON.parse(answer.selectedOptionIds); } catch { return []; }
}

export default function AssessmentQuestion({ question, answer, disabled, onAnswer, saving }) {
  const [text, setText] = useState(answer?.answerText || "");
  const multiple = selectedIds(answer);
  useEffect(() => setText(answer?.answerText || ""), [answer?.answerText, question.id]);
  const choiceType = ["SINGLE_CHOICE", "TRUE_FALSE", "LISTENING_MULTIPLE_CHOICE"].includes(question.questionType);

  function toggleMultiple(optionId) {
    const next = multiple.includes(optionId) ? multiple.filter((id) => id !== optionId) : [...multiple, optionId];
    onAnswer({ selectedOptionIds: next });
  }

  return <div className="assessment-question-card">
    <div className="assessment-question-meta"><span>{question.questionType?.replaceAll("_", " ")}</span><strong>{question.points || 1} điểm</strong></div>
    <h3>{question.questionText}</h3>
    {(choiceType || question.questionType === "MULTIPLE_CHOICE") && <div className="assessment-options">{(question.options ?? []).map((option) => {
      const checked = question.questionType === "MULTIPLE_CHOICE" ? multiple.includes(option.id) : answer?.selectedOptionId === option.id;
      return <label className={`assessment-option ${checked ? "is-selected" : ""} ${disabled && option.correct ? "is-correct" : ""}`} key={option.id}><input type={question.questionType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={`question-${question.id}`} checked={checked} disabled={disabled} onChange={() => question.questionType === "MULTIPLE_CHOICE" ? toggleMultiple(option.id) : onAnswer({ selectedOptionId: option.id })} /><span>{option.optionText}</span></label>;
    })}</div>}
    {["FILL_IN_THE_BLANK", "WRITING", "SENTENCE_ORDERING", "MATCHING"].includes(question.questionType) && <label className="assessment-text-answer"><span>{question.questionType === "WRITING" ? "Bài viết của bạn" : "Câu trả lời của bạn"}</span>{question.questionType === "WRITING" ? <textarea rows="7" value={text} disabled={disabled} onChange={(event) => setText(event.target.value)} onBlur={() => onAnswer({ answerText: text })} /> : <input value={text} disabled={disabled} onChange={(event) => setText(event.target.value)} onBlur={() => onAnswer({ answerText: text })} />}</label>}
    {saving && <small className="assessment-saving">Đang tự động lưu...</small>}
    {disabled && <div className={`assessment-explanation ${answer?.correct ? "is-correct" : "is-incorrect"}`}><strong>{answer?.correct ? "Chính xác!" : "Chưa chính xác."}</strong><p>{question.explanation || "Hãy xem lại nội dung liên quan và thử lại."}</p></div>}
  </div>;
}
