import { useEffect, useState } from "react";
import { getGrammarTopics } from "../../services/learningService";

export default function GrammarPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getGrammarTopics({ search, level, size: 20 })
      .then((data) => setItems(data?.items ?? []))
      .catch((err) => setError(err.message || "Khong tai duoc ngu phap"));
  }, [search, level]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Grammar</span>
        <h2 className="page-title">Ngu phap</h2>
        <p className="page-description">Cong thuc, cach dung, vi du va ghi chu theo level.</p>
        <div className="course-filter-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim chu diem" />
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">Moi level</option>
            <option value="BEGINNER">Beginner</option>
            <option value="ELEMENTARY">Elementary</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
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
          </div>
        ))}
      </section>
    </div>
  );
}
