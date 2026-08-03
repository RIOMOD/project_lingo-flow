import React, { useEffect, useState } from "react";
import { getAdminAiFeedbacks } from "../../services/aiService";
import FormattedMessage from "../../components/common/FormattedMessage";
import "../../styles/AdminAiFeedbackPage.css";

export default function AdminAiFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await getAdminAiFeedbacks(filterRating, page, 20);
      setFeedbacks(res?.content || []);
      setTotalPages(res?.totalPages || 1);
      setTotalElements(res?.totalElements || 0);
    } catch (err) {
      console.error("Lỗi tải danh sách phản hồi AI:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filterRating, page]);

  return (
    <div className="admin-feedback-page">
      {/* Header Banner Card */}
      <div className="admin-feedback-header">
        <div>
          <h1 className="admin-feedback-title">
            <span>🤖 Quản Lý Phản Hồi AI</span>
          </h1>
          <p className="admin-feedback-desc">
            Theo dõi đánh giá (Like/Dislike) và góp ý của học viên để liên tục tinh chỉnh bộ mô hình AI.
          </p>
        </div>

        <button
          onClick={fetchFeedbacks}
          className="admin-feedback-refresh-btn"
          type="button"
        >
          🔄 Tải lại
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="admin-feedback-filters">
        {[
          { key: "", label: "Tất cả phản hồi", icon: "📊" },
          { key: "LIKE", label: "Hài lòng (Like)", icon: "👍" },
          { key: "DISLIKE", label: "Chưa hài lòng (Dislike)", icon: "👎" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setFilterRating(tab.key);
              setPage(0);
            }}
            className={`admin-feedback-tab ${filterRating === tab.key ? "active" : ""}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        <div className="admin-feedback-total">
          Tổng số: <strong>{totalElements}</strong> phản hồi
        </div>
      </div>

      {/* Feedbacks List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ display: "inline-block", width: "32px", height: "32px", borderRadius: "50%", border: "3px solid #cbd5e1", borderTopColor: "#4f46e5", animation: "spin 0.8s linear infinite" }} />
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#64748b" }}>Đang tải phản hồi...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="admin-feedback-empty">
          <div className="admin-feedback-empty-icon">💬</div>
          <p style={{ margin: 0, fontWeight: 600 }}>Chưa có phản hồi nào phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div className="admin-feedback-list">
          {feedbacks.map((item) => (
            <div key={item.id} className="admin-feedback-card">
              {/* Card Header */}
              <div className="admin-feedback-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={`admin-feedback-badge ${item.rating === "LIKE" ? "like" : "dislike"}`}>
                    {item.rating === "LIKE" ? "👍 Hài lòng" : "👎 Chưa hài lòng"}
                  </span>
                  <div className="admin-feedback-user-info">
                    <span className="admin-feedback-user-name">
                      {item.userFullName || "Học viên"}
                    </span>{" "}
                    ({item.userEmail})
                  </div>
                </div>

                <span className="admin-feedback-time">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

              {/* Student Comment Callout */}
              {item.comment && (
                <div className="admin-feedback-comment-box">
                  💡 <strong>Góp ý của học viên:</strong> "{item.comment}"
                </div>
              )}

              {/* QA Comparison Grid */}
              <div className="admin-feedback-qa-grid">
                <div className="admin-feedback-qa-box user">
                  <div className="admin-feedback-qa-label user">
                    <span>👤</span> Câu hỏi của học viên:
                  </div>
                  <div className="admin-feedback-qa-text">
                    {item.userMessage || "(Không tìm thấy câu hỏi trước đó)"}
                  </div>
                </div>

                <div className="admin-feedback-qa-box ai">
                  <div className="admin-feedback-qa-label ai">
                    <span>🤖</span> Câu trả lời từ AI:
                  </div>
                  <div className="admin-feedback-qa-text">
                    {item.aiResponse ? (
                      <FormattedMessage text={item.aiResponse} />
                    ) : (
                      "(Không tìm thấy câu trả lời AI)"
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="admin-feedback-pagination">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="admin-feedback-page-btn"
          >
            Trang trước
          </button>
          <span className="admin-feedback-page-info">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="admin-feedback-page-btn"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
