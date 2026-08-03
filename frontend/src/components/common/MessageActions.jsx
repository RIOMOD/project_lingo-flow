import React, { useState } from "react";
import { submitAiFeedback } from "../../services/aiService";

export default function MessageActions({ messageId, text }) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null); // "LIKE" | "DISLIKE" | null
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (rating === "LIKE") return;
    setRating("LIKE");
    try {
      await submitAiFeedback({ messageId, rating: "LIKE" });
      triggerToast("Cảm ơn bạn đã thích phản hồi này! 👍");
    } catch {
      // Silent catch
    }
  };

  const handleDislikeClick = () => {
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
    <div className="message-actions-container mt-2 flex items-center gap-3 text-xs text-slate-400 select-none">
      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-1 hover:text-slate-200 transition-colors ${copied ? "text-green-400 font-medium" : ""}`}
        title="Sao chép nội dung"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Đã chép</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Sao chép</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleLike}
        className={`flex items-center gap-1 hover:text-emerald-400 transition-colors ${rating === "LIKE" ? "text-emerald-400 font-bold" : ""}`}
        title="Hài lòng"
      >
        <svg className="w-3.5 h-3.5" fill={rating === "LIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleDislikeClick}
        className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${rating === "DISLIKE" ? "text-rose-400 font-bold" : ""}`}
        title="Chưa hài lòng"
      >
        <svg className="w-3.5 h-3.5" fill={rating === "DISLIKE" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
        </svg>
      </button>

      {toastMsg && (
        <span className="text-[11px] text-emerald-400 font-medium animate-pulse ml-1">
          {toastMsg}
        </span>
      )}

      {/* Modal góp ý khi Dislike */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-slate-800">
          <div className="bg-white dark:bg-slate-900 dark:text-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>💡 Góp ý cải thiện câu trả lời AI</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDislikeSubmit} className="mt-4">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Điều gì khiến câu trả lời chưa như ý muốn của bạn? (Không bắt buộc)
              </label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ví dụ: AI trả lời chưa đúng trọng tâm, dịch sai từ vựng, thông tin chưa đầy đủ..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? "Đang gửi..." : "Gửi góp ý"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
