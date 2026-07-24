import { useState } from "react";
import { requestWritingFeedback } from "../../services/aiService";

function ScoreCard({ label, value }) {
  return (
    <article className="page-panel-card">
      <strong>{Number(value || 0).toFixed(1)}</strong>
      <p>{label}</p>
    </article>
  );
}

export default function WritingCorrectionPage() {
  const [form, setForm] = useState({
    title: "",
    level: "B1",
    taskPrompt: "",
    text: "",
  });
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFeedback(null);
    try {
      const response = await requestWritingFeedback(form);
      setFeedback(response);
    } catch (err) {
      setError(err.message || "Khong cham duoc bai viet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">AI Writing</span>
        <h2 className="page-title">Sua va cham bai viet</h2>
        <p className="page-description">Nhan corrected text, giai thich loi bang tieng Viet, cau tu nhien hon va diem chi tiet.</p>
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="course-detail-body">
        <form className="page-panel-card auth-form" onSubmit={handleSubmit}>
          <h3>Bai viet</h3>
          <label className="auth-field">
            Tieu de
            <input value={form.title} onChange={(event) => setField("title", event.target.value)} />
          </label>
          <label className="auth-field">
            Level
            <select value={form.level} onChange={(event) => setField("level", event.target.value)}>
              {["A1", "A2", "B1", "B2", "C1"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="auth-field">
            De bai
            <input
              value={form.taskPrompt}
              onChange={(event) => setField("taskPrompt", event.target.value)}
              placeholder="Vi du: Describe your favorite learning method"
            />
          </label>
          <label className="auth-field">
            Noi dung
            <textarea
              required
              rows="10"
              value={form.text}
              onChange={(event) => setField("text", event.target.value)}
              placeholder="Paste your writing here..."
            />
          </label>
          <button className="page-action page-action-primary" disabled={loading} type="submit">
            {loading ? "Dang cham..." : "Cham voi AI"}
          </button>
        </form>

        {feedback && (
          <article className="page-panel-card">
            <h3>Ket qua</h3>
            <p><strong>Provider:</strong> {feedback.provider}{feedback.fallback ? " fallback" : ""}</p>
            <section className="course-grid">
              <ScoreCard label="Overall" value={feedback.overallScore} />
              <ScoreCard label="Grammar" value={feedback.grammarScore} />
              <ScoreCard label="Vocabulary" value={feedback.vocabularyScore} />
              <ScoreCard label="Coherence" value={feedback.coherenceScore} />
              <ScoreCard label="Task response" value={feedback.taskResponseScore} />
            </section>
            <h4>Ban sua</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>{feedback.correctedText}</p>
            <h4>Giai thich loi</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>{feedback.feedback}</p>
            <h4>Cach noi tu nhien hon</h4>
            <p>{feedback.naturalSuggestion}</p>
            <h4>Bai hoc goi y</h4>
            <div className="course-table">
              {(feedback.suggestedLessons ?? []).map((item) => (
                <div className="course-table-row" key={item}>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
