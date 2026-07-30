import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { grammarService } from "../../services/grammar.service";
import { IconChevronLeft } from "../../components/common/SidebarIcons";

export default function GrammarHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    grammarService.getMyAttempts()
      .then(data => setHistory(data?.items || data || []))
      .catch(err => setError(err.response?.data?.message || "Lỗi tải lịch sử"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <button className="back-btn" onClick={() => navigate("/student/grammar")}>
          <IconChevronLeft /> Về danh sách
        </button>
        <h2 className="page-title">Lịch sử làm bài Ngữ pháp</h2>
        <p className="page-description">Xem lại các bài tập đã làm và kết quả đạt được.</p>
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="course-table page-panel-card" style={{ marginTop: "20px" }}>
        {history.length === 0 && <p>Bạn chưa làm bài tập nào.</p>}
        {history.map((h, i) => (
          <div className="course-table-row" key={h.id}>
            <div style={{ flex: 1 }}>
              <strong>{h.topicTitle}</strong>
              <p style={{ color: "#64748b", fontSize: "0.9em", marginTop: "5px" }}>Ngày làm: {new Date(h.createdAt).toLocaleString()}</p>
              <p style={{ marginTop: "5px" }}>Điểm: <strong>{h.score}/10</strong> ({h.percentage}%) - {h.evaluation}</p>
            </div>
            <div className="course-row-actions">
              <button className="page-action page-action-primary" onClick={() => navigate(`/student/grammar/result/${h.id}`)}>Xem lại kết quả</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
