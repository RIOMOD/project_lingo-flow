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
      setError(err.message || "Không chấm được bài viết");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">AI Writing</span>
        <h2 className="page-title">Sửa và chấm bài viết</h2>
        <p className="page-description">Nhận bản sửa bài chi tiết, giải thích lỗi bằng tiếng Việt, gợi ý diễn đạt tự nhiên hơn và bảng điểm chi tiết.</p>
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="course-detail-body">
        <form className="page-panel-card auth-form" onSubmit={handleSubmit}>
          <h3>Bài viết</h3>
          <label className="auth-field">
            Tiêu đề bài viết
            <input value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="Nhập tiêu đề..." />
          </label>
          <label className="auth-field">
            Trình độ (CEFR)
            <select value={form.level} onChange={(event) => setField("level", event.target.value)}>
              {["A1", "A2", "B1", "B2", "C1"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="auth-field">
            Đề bài / Yêu cầu
            <input
              value={form.taskPrompt}
              onChange={(event) => setField("taskPrompt", event.target.value)}
              placeholder="Ví dụ: Describe your favorite learning method"
            />
          </label>
          <label className="auth-field">
            Nội dung bài viết
            <textarea
              required
              rows="10"
              value={form.text}
              onChange={(event) => setField("text", event.target.value)}
              placeholder="Dán hoặc nhập nội dung bài viết tiếng Anh của bạn tại đây..."
            />
          </label>
          <button className="page-action page-action-primary" disabled={loading} type="submit">
            {loading ? "Đang chấm..." : "Chấm bài với AI"}
          </button>
        </form>

        {feedback && (
          <article className="page-panel-card">
            <h3>Kết quả chấm điểm</h3>
            <p><strong>Provider:</strong> {feedback.provider}{feedback.fallback ? " fallback" : ""}</p>
            <section className="course-grid">
              <ScoreCard label="Tổng quan" value={feedback.overallScore} />
              <ScoreCard label="Ngữ pháp" value={feedback.grammarScore} />
              <ScoreCard label="Từ vựng" value={feedback.vocabularyScore} />
              <ScoreCard label="Mạch lạc" value={feedback.coherenceScore} />
              <ScoreCard label="Đáp ứng đề" value={feedback.taskResponseScore} />
            </section>
            <h4>Bản sửa chi tiết</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>{feedback.correctedText}</p>
            <h4>Giải thích lỗi chi tiết</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>{feedback.feedback}</p>
            <h4>Gợi ý diễn đạt tự nhiên hơn</h4>
            <p>{feedback.naturalSuggestion}</p>
            <h4>Bài học gợi ý ôn tập</h4>
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
