import { useEffect, useState } from "react";
import { getGrammarTopics } from "../../services/learningService";
import { useNavigate } from "react-router-dom";

export default function GrammarPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getGrammarTopics({ search, level, size: 20 })
      .then((data) => setItems(data?.items ?? []))
      .catch((err) => setError(err.message || "Không tải được bài học ngữ pháp"));
  }, [search, level]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Grammar</span>
        <h2 className="page-title">Ngữ pháp tiếng Anh</h2>
        <p className="page-description">Công thức, cách dùng, ví dụ thực tế và ghi chú chi tiết theo từng trình độ.</p>
        <div className="course-filter-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm chủ điểm ngữ pháp..." />
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">Tất cả trình độ</option>
            <option value="BEGINNER">Mới bắt đầu (Beginner)</option>
            <option value="ELEMENTARY">Cơ bản (Elementary)</option>
            <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
            <option value="ADVANCED">Nâng cao (Advanced)</option>
          </select>
          <button className="page-action page-action-primary" onClick={() => navigate('/student/grammar/history')}>Lịch sử làm bài</button>
        </div>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {items.map((item) => (
          <div className="course-table-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.level} - {item.description}</p>
              <p>{item.formula}</p>
              <p>{item.example}</p>
            </div>
            <div className="course-row-actions">
              <button className="page-action page-action-secondary" onClick={() => navigate(`/student/grammar/${item.id}`)}>Học chi tiết</button>
              <button className="page-action page-action-primary" onClick={() => navigate(`/student/grammar/${item.id}/exercise`)}>Làm bài</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
