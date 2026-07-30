import { useState } from "react";
import { requestWritingFeedback } from "../../services/aiService";
import "../../styles/WritingCorrectionPage.css";

const SAMPLES = [
  {
    title: "My Favorite Learning Method",
    level: "B1",
    taskPrompt: "Describe your favorite learning method and why it works for you.",
    text: "I really like learning English online because it is very convenient for me. I can study anytime and anywhere I want. Moreover, using AI apps help me correct my grammar and vocabulary errors immediately."
  },
  {
    title: "Advantages of Technology in Education",
    level: "B2",
    taskPrompt: "Discuss the advantages and disadvantages of technology in modern education.",
    text: "Technology has transformed modern education in numerous ways. On one hand, students can access vast educational resources instantly from anywhere in the world. On the other hand, excessive screen time may reduce face-to-face social interaction."
  }
];

const CEFR_LEVELS = [
  { id: "A1", label: "A1 - Căn bản" },
  { id: "A2", label: "A2 - Sơ cấp" },
  { id: "B1", label: "B1 - Trung cấp" },
  { id: "B2", label: "B2 - Trên trung cấp" },
  { id: "C1", label: "C1 - Cao cấp" },
];

function ScoreTile({ label, value, icon, color }) {
  return (
    <div className={`writing-score-tile score-${color}`}>
      <div className="writing-score-icon">{icon}</div>
      <div className="writing-score-value">{Number(value || 0).toFixed(1)}</div>
      <div className="writing-score-label">{label}</div>
    </div>
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

  function loadSample(sample) {
    setForm(sample);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.text.trim()) return;
    setLoading(true);
    setError("");
    setFeedback(null);
    try {
      const response = await requestWritingFeedback(form);
      setFeedback(response);
    } catch (err) {
      setError(err.message || "Không thể chấm bài viết vào lúc này.");
    } finally {
      setLoading(false);
    }
  }

  const wordCount = form.text.trim() ? form.text.trim().split(/\s+/).length : 0;

  return (
    <div className="writing-page">
      {/* Header Banner */}
      <header className="writing-header">
        <div className="writing-header-left">
          <div className="writing-header-avatar">✍️</div>
          <div>
            <div className="writing-header-title-row">
              <h2 className="writing-header-title">AI Sửa & Chấm Bài Viết</h2>
              <span className="writing-status-badge">✨ AI Ready 24/7</span>
            </div>
            <p className="writing-header-sub">
              Chấm điểm tự động theo chuẩn CEFR & IELTS · Phân tích ngữ pháp & Gợi ý diễn đạt tự nhiên
            </p>
          </div>
        </div>
      </header>

      {error && <div className="writing-error-banner" role="alert">⚠️ {error}</div>}

      {/* Main Workspace */}
      <div className="writing-workspace">
        {/* Left Form Card */}
        <form className="writing-form-card" onSubmit={handleSubmit}>
          <div className="writing-form-header">
            <span>📝</span>
            <div className="writing-form-title">Soạn thảo & Chấm điểm Bài viết</div>
          </div>

          <div className="writing-field">
            <label className="writing-label">Tiêu đề bài viết</label>
            <input
              className="writing-input"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Ví dụ: My Favorite Learning Method"
            />
          </div>

          <div className="writing-field">
            <label className="writing-label">Trình độ mục tiêu (CEFR)</label>
            <div className="writing-level-pills">
              {CEFR_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  className={`writing-level-pill ${form.level === lvl.id ? "active" : ""}`}
                  onClick={() => setField("level", lvl.id)}
                >
                  {lvl.id}
                </button>
              ))}
            </div>
          </div>

          <div className="writing-field">
            <label className="writing-label">Đề bài / Chủ đề (Yêu cầu)</label>
            <input
              className="writing-input"
              value={form.taskPrompt}
              onChange={(event) => setField("taskPrompt", event.target.value)}
              placeholder="Ví dụ: Describe your favorite learning method..."
            />
          </div>

          <div className="writing-field">
            <div className="writing-textarea-header">
              <label className="writing-label">Nội dung đoạn văn / bài viết</label>
              <span className={`writing-word-counter ${wordCount > 300 ? "is-good" : ""}`}>
                {wordCount} từ
              </span>
            </div>
            <textarea
              className="writing-textarea"
              required
              rows="8"
              value={form.text}
              onChange={(event) => setField("text", event.target.value)}
              placeholder="Nhập hoặc dán đoạn văn tiếng Anh của bạn tại đây..."
            />
          </div>

          <button className="writing-submit-btn" disabled={loading || !form.text.trim()} type="submit">
            {loading ? (
              <>
                <span className="writing-spinner" /> AI Đang Phân Tích...
              </>
            ) : (
              "✨ Chấm Bài & Sửa Lỗi Với AI"
            )}
          </button>
        </form>

        {/* Right Feedback Panel */}
        <section className="writing-result-card">
          {!feedback && !loading && (
            <div className="writing-empty-state">
              <div className="writing-empty-hero-icon">🤖</div>
              <div className="writing-empty-title">Bạn muốn sửa bài viết nào hôm nay?</div>
              <p className="writing-empty-desc">
                Nhập nội dung bài viết ở bên trái hoặc chọn 1 bài mẫu bên dưới để thử nghiệm AI:
              </p>
              <div className="writing-samples-list">
                {SAMPLES.map((sample, idx) => (
                  <div
                    key={idx}
                    className="writing-sample-card"
                    onClick={() => loadSample(sample)}
                  >
                    <div className="writing-sample-icon">📄</div>
                    <div className="writing-sample-info">
                      <div className="writing-sample-title">{sample.title}</div>
                      <div className="writing-sample-meta">
                        Trình độ: <strong>{sample.level}</strong> · Bấm để tải nội dung
                      </div>
                    </div>
                    <span className="writing-sample-badge">Thử ngay ➔</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="writing-empty-state">
              <div className="writing-loading-glow">✨</div>
              <div className="writing-empty-title">AI đang chấm bài & sửa lỗi...</div>
              <p className="writing-empty-desc">
                Hệ thống đang kiểm tra cấu trúc câu, từ vựng, ngữ pháp và lập bảng điểm chi tiết.
              </p>
            </div>
          )}

          {feedback && (
            <div className="writing-feedback-content">
              <div className="writing-result-header">
                <h3>🏆 Kết Quả Chấm Bài & Nhận Xét Chi Tiết</h3>
                <span className="writing-provider-tag">
                  Powered by {feedback.provider}
                </span>
              </div>

              {/* Score Tiles Grid */}
              <div className="writing-scores-grid">
                <ScoreTile label="Tổng quan" value={feedback.overallScore} icon="⭐" color="blue" />
                <ScoreTile label="Ngữ pháp" value={feedback.grammarScore} icon="✍️" color="emerald" />
                <ScoreTile label="Từ vựng" value={feedback.vocabularyScore} icon="📚" color="purple" />
                <ScoreTile label="Mạch lạc" value={feedback.coherenceScore} icon="🧩" color="amber" />
                <ScoreTile label="Đáp ứng" value={feedback.taskResponseScore} icon="🎯" color="rose" />
              </div>

              {/* Corrected Text Box */}
              <div className="writing-section-box is-corrected">
                <div className="writing-section-title green">✨ Bản Bài Viết Đã Sửa Chuẩn:</div>
                <p className="writing-section-text">{feedback.correctedText}</p>
              </div>

              {/* Detailed Vietnamese Feedback */}
              <div className="writing-section-box is-feedback">
                <div className="writing-section-title blue">💡 Phân Tích Lỗi & Nhận Xét Chi Tiết:</div>
                <p className="writing-section-text">{feedback.feedback}</p>
              </div>

              {/* Natural Suggestion */}
              {feedback.naturalSuggestion && (
                <div className="writing-section-box is-suggestion">
                  <div className="writing-section-title purple">
                    🚀 Gợi Ý Diễn Đạt Tự Nhiên (Native Style):
                  </div>
                  <p className="writing-suggestion-quote">"{feedback.naturalSuggestion}"</p>
                </div>
              )}

              {/* Suggested Lessons */}
              {feedback.suggestedLessons && feedback.suggestedLessons.length > 0 && (
                <div className="writing-section-box is-lessons">
                  <div className="writing-section-title amber">
                    📚 Kiến Thức Ngữ Pháp Nên Củng Cố:
                  </div>
                  <div className="writing-lessons-tags">
                    {feedback.suggestedLessons.map((item, idx) => (
                      <span key={idx} className="writing-lesson-pill">
                        📖 {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
