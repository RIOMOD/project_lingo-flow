import React, { useEffect, useState } from "react";
import { getAdminAiFeedbacks } from "../../services/aiService";

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🤖 Quản Lý Phản Hồi AI</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi đánh giá (Like/Dislike) và góp ý của học viên để liên tục cải thiện bộ mô hình AI.
          </p>
        </div>

        <button
          onClick={fetchFeedbacks}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          🔄 Tải lại
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: "", label: "Tất cả phản hồi", icon: "📊" },
          { key: "LIKE", label: "Hài lòng (Like)", icon: "👍" },
          { key: "DISLIKE", label: "Chưa hài lòng (Dislike)", icon: "👎" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilterRating(tab.key);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterRating === tab.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}

        <div className="ml-auto text-xs text-slate-500 font-medium">
          Tổng số: <strong className="text-indigo-600 dark:text-indigo-400">{totalElements}</strong> phản hồi
        </div>
      </div>

      {/* List / Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-4xl">💬</span>
          <p className="mt-2 text-sm text-slate-500">Chưa có phản hồi nào phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      item.rating === "LIKE"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {item.rating === "LIKE" ? "👍 Hài lòng" : "👎 Chưa hài lòng"}
                  </span>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.userFullName || "Học viên"}
                    </span>{" "}
                    ({item.userEmail})
                  </div>
                </div>

                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

              {/* User Comment if any */}
              {item.comment && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-medium">
                  💡 <strong>Góp ý học viên:</strong> "{item.comment}"
                </div>
              )}

              {/* User Question vs AI Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <span>👤</span> Câu hỏi của học viên:
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {item.userMessage || "(Không tìm thấy câu hỏi trước đó)"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                    <span>🤖</span> Câu trả lời từ AI:
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {item.aiResponse || "(Không tìm thấy câu trả lời AI)"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Trang trước
          </button>
          <span className="text-xs text-slate-500">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
