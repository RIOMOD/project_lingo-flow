import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { grammarService } from "../../services/grammar.service";
import { IconChevronLeft, IconCheck } from "../../components/common/SidebarIcons";

export default function GrammarResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!result) {
      grammarService.getAttemptById(id)
        .then(data => setResult(data))
        .catch(err => setError(err.response?.data?.message || "Lỗi tải kết quả"));
    }
  }, [id, result]);

  if (error) return <div className="course-page"><p className="auth-error">{error}</p></div>;
  if (!result) return <div className="course-page"><p>Đang tải kết quả...</p></div>;

  return (
    <div className="course-page">
      <section className="page-hero" style={{ textAlign: "center" }}>
        <button className="back-btn" onClick={() => navigate("/student/grammar")} style={{ position: "absolute", left: "40px", top: "100px" }}>
          <IconChevronLeft /> Về danh sách
        </button>
        <h2 className="page-title">Kết quả làm bài</h2>
        <h1 style={{ fontSize: "3rem", margin: "10px 0", color: "#3b82f6" }}>{result.score}/10</h1>
        <p className="page-description" style={{ fontSize: "1.2rem" }}>
          Bạn làm đúng <strong>{result.correctAnswers}/{result.totalQuestions}</strong> câu ({result.percentage}%)
        </p>
        <div style={{ marginTop: "10px" }}>
          <span className="badge" style={{ fontSize: "1.1rem", padding: "8px 16px", background: result.percentage >= 60 ? "#dcfce7" : "#fee2e2", color: result.percentage >= 60 ? "#166534" : "#991b1b" }}>
            Đánh giá: {result.evaluation}
          </span>
        </div>
      </section>

      <section className="page-panel-card" style={{ marginTop: "30px" }}>
        <h3>Chi tiết từng câu</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
          {result.answers?.map((ans, idx) => {
            const isCorrect = ans.isCorrect;
            return (
              <div key={ans.questionId} style={{ padding: "15px", border: `1px solid ${isCorrect ? '#86efac' : '#fca5a5'}`, borderRadius: "8px", background: isCorrect ? '#f0fdf4' : '#fef2f2' }}>
                <h4>Câu {idx + 1} <span style={{ color: isCorrect ? 'green' : 'red' }}>[{isCorrect ? "Đúng" : "Sai"}]</span></h4>
                {ans.explanation && (
                  <p style={{ marginTop: "10px", color: "#475569", fontSize: "0.95em" }}>
                    <strong>Giải thích:</strong> {ans.explanation}
                  </p>
                )}
                {!isCorrect && (
                  <p style={{ marginTop: "5px", color: "#b91c1c", fontSize: "0.95em" }}>
                    <em>* Bạn đã chọn sai hoặc chưa chọn đáp án đúng. Vui lòng xem lại kiến thức.</em>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
