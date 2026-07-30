import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teacherGrammarService } from "../../services/teacherGrammar.service";
import { IconChevronLeft } from "../../components/common/SidebarIcons";

export default function GrammarStudentResultsPage() {
  const { id: topicId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  async function loadResults() {
    try {
      const data = await teacherGrammarService.getStudentResults(topicId);
      setResults(data?.items || data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi tải kết quả");
    }
  }

  useEffect(() => {
    loadResults();
  }, [topicId]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <button className="back-btn" onClick={() => navigate(`/teacher/grammar/${topicId}/questions`)}>
          <IconChevronLeft /> Quản lý câu hỏi
        </button>
        <h2 className="page-title">Kết quả học sinh (Topic ID: {topicId})</h2>
        <p className="page-description">Danh sách các lần làm bài của học sinh trên chủ điểm này.</p>
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="course-table page-panel-card" style={{ marginTop: "20px" }}>
        <h3>Danh sách làm bài ({results.length})</h3>
        {results.length === 0 && <p>Chưa có học sinh nào làm bài.</p>}
        {results.map((r) => (
          <div className="course-table-row" key={r.id}>
            <div>
              <strong>Lần làm bài #{r.id}</strong> - {new Date(r.createdAt).toLocaleString()}
              <p>Điểm: <strong>{r.score}/10</strong> ({r.percentage}%) - {r.evaluation}</p>
              <p>Số câu đúng: {r.correctAnswers}/{r.totalQuestions}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
