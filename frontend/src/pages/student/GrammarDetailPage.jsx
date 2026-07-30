import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGrammarTopics } from "../../services/learningService";
import { IconChevronLeft } from "../../components/common/SidebarIcons";

export default function GrammarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Assuming getGrammarTopics returns all and we filter, or we should have getById
    // Since we don't have getById exposed in service, we fetch all and filter for now
    getGrammarTopics({ size: 100 })
      .then((data) => {
        const found = data?.items?.find(t => t.id === Number(id));
        if (found) setTopic(found);
        else setError("Không tìm thấy chủ điểm");
      })
      .catch((err) => setError(err.message || "Lỗi tải dữ liệu"));
  }, [id]);

  if (error) return <div className="course-page"><p className="auth-error">{error}</p></div>;
  if (!topic) return <div className="course-page"><p>Đang tải...</p></div>;

  return (
    <div className="course-page">
      <section className="page-hero">
        <button className="back-btn" onClick={() => navigate("/student/grammar")}>
          <IconChevronLeft /> Danh sách ngữ pháp
        </button>
        <span className="page-badge">{topic.level}</span>
        <h2 className="page-title">{topic.title}</h2>
        <p className="page-description">{topic.description}</p>
        <button className="page-action page-action-primary" style={{ marginTop: "16px" }} onClick={() => navigate(`/student/grammar/${id}/exercise`)}>
          Làm bài tập ngay
        </button>
      </section>

      <section className="page-panel-card" style={{ marginTop: "20px" }}>
        <h3>Công thức</h3>
        <p style={{ background: "#f0fdf4", padding: "10px", borderRadius: "8px", fontFamily: "monospace", fontSize: "1.1em" }}>
          {topic.formula}
        </p>

        <h3 style={{ marginTop: "20px" }}>Cách dùng</h3>
        <p>{topic.usage}</p>

        <h3 style={{ marginTop: "20px" }}>Ví dụ</h3>
        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{topic.example}</pre>
        </div>

        {topic.note && (
          <>
            <h3 style={{ marginTop: "20px" }}>Ghi chú</h3>
            <p style={{ color: "#b91c1c" }}>{topic.note}</p>
          </>
        )}
      </section>
    </div>
  );
}
