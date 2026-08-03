import React, { useState } from "react";
import { createPortal } from "react-dom";
import { submitAiFeedback } from "../../services/aiService";

export default function MessageActions({ messageId, text }) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null); // "LIKE" | "DISLIKE" | null
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (rating === "LIKE") return;
    setRating("LIKE");
    try {
      await submitAiFeedback({ messageId, rating: "LIKE" });
      triggerToast("Cảm ơn bạn đã thích phản hồi này! 👍");
    } catch {
      // Silent catch
    }
  };

  const handleDislikeClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleDislikeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRating("DISLIKE");
    try {
      await submitAiFeedback({ messageId, rating: "DISLIKE", comment });
      triggerToast("Cảm ơn phản hồi! Hệ thống sẽ cải thiện câu trả lời. 💡");
      setShowModal(false);
    } catch {
      triggerToast("Có lỗi xảy ra khi gửi phản hồi.");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px", fontSize: "12px", color: "#64748b", userSelect: "none" }}>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "transparent",
          border: "none",
          padding: "3px 8px",
          borderRadius: "6px",
          color: copied ? "#10b981" : "#64748b",
          cursor: "pointer",
          fontSize: "12px",
          whiteSpace: "nowrap",
          fontWeight: 500,
          transition: "all 0.15s ease"
        }}
        title="Sao chép câu trả lời"
      >
        {copied ? (
          <>
            <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Đã chép</span>
          </>
        ) : (
          <>
            <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Sao chép</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleLike}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "transparent",
          border: "none",
          padding: "3px 8px",
          borderRadius: "6px",
          color: rating === "LIKE" ? "#10b981" : "#64748b",
          cursor: "pointer",
          fontSize: "12px",
          whiteSpace: "nowrap",
          fontWeight: 500,
          transition: "all 0.15s ease"
        }}
        title="Hài lòng"
      >
        <svg style={{ width: "14px", height: "14px" }} fill={rating === "LIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleDislikeClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "transparent",
          border: "none",
          padding: "3px 8px",
          borderRadius: "6px",
          color: rating === "DISLIKE" ? "#f43f5e" : "#64748b",
          cursor: "pointer",
          fontSize: "12px",
          whiteSpace: "nowrap",
          fontWeight: 500,
          transition: "all 0.15s ease"
        }}
        title="Chưa hài lòng"
      >
        <svg style={{ width: "14px", height: "14px" }} fill={rating === "DISLIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
        </svg>
      </button>

      {toastMsg && (
        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>
          {toastMsg}
        </span>
      )}

      {/* Dislike Feedback Modal rendered directly on document.body using React Portal */}
      {showModal &&
        createPortal(
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              padding: "16px",
              boxSizing: "border-box"
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "450px",
                width: "100%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                boxSizing: "border-box"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>💡 Góp ý cải thiện câu trả lời AI</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", fontSize: "16px", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDislikeSubmit} style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
                  Điều gì khiến câu trả lời chưa như ý muốn của bạn? (Không bắt buộc)
                </label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ví dụ: AI trả lời chưa đúng trọng tâm, dịch sai từ vựng, thông tin chưa đầy đủ..."
                  style={{
                    width: "100%",
                    fontSize: "13px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />

                <div style={{ display: "flex", justify: "flex-end", gap: "8px", marginTop: "16px" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#64748b",
                      backgroundColor: "#f1f5f9",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ffffff",
                      backgroundColor: "#4f46e5",
                      border: "none",
                      borderRadius: "8px",
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? "Đang gửi..." : "Gửi góp ý"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
