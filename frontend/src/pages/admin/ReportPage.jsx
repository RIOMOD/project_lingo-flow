import { useEffect, useState } from "react";
import { getAdminDashboardStats } from "../../services/adminService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

function BarStat({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.87rem", marginBottom: "4px" }}>
        <span>{label}</span>
        <strong style={{ color }}>{value} ({pct}%)</strong>
      </div>
      <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = (stats?.studentCount ?? 0) + (stats?.teacherCount ?? 0) + (stats?.adminCount ?? 0);
  const totalCourses = (stats?.paidCourseCount ?? 0) + (stats?.freeCourseCount ?? 0);

  function exportStats() {
    if (!stats) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Users", stats.totalUsers ?? 0],
      ["Student Count", stats.studentCount ?? 0],
      ["Teacher Count", stats.teacherCount ?? 0],
      ["Total Courses", stats.totalCourses ?? 0],
      ["Paid Courses", stats.paidCourseCount ?? 0],
      ["Free Courses", stats.freeCourseCount ?? 0],
      ["Total Orders", stats.totalOrders ?? 0],
      ["Total Revenue (VND)", stats.totalRevenue ?? 0],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lingo_report_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="vocalyn-dashboard-container">
      {/* Main Metrics */}
      <div className="vocalyn-metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Doanh Thu Nền Tảng</span>
            <div className="metric-icon-circle" style={{ background: "#dcfce7" }}>💰</div>
          </div>
          <div className="metric-val" style={{ color: "#16a34a", fontSize: "1.3rem" }}>
            {loading ? "..." : money.format(stats?.totalRevenue ?? 0)}
          </div>
          <div className="metric-change positive"><span>↑ Tổng doanh thu</span></div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Tổng Đơn Hàng</span>
            <div className="metric-icon-circle">📦</div>
          </div>
          <div className="metric-val">{loading ? "..." : (stats?.totalOrders ?? 0)}</div>
          <div className="metric-change positive"><span>↑ Completed Purchases</span></div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Tổng Người Dùng</span>
            <div className="metric-icon-circle">👥</div>
          </div>
          <div className="metric-val">{loading ? "..." : (stats?.totalUsers ?? 0)}</div>
          <div className="metric-change positive"><span>↑ Registered Accounts</span></div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Khóa Học Đang Hoạt Động</span>
            <div className="metric-icon-circle">📚</div>
          </div>
          <div className="metric-val">{loading ? "..." : (stats?.totalCourses ?? 0)}</div>
          <div className="metric-change positive"><span>↑ Platform Courses</span></div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {/* User Distribution */}
        <div className="vocalyn-card" style={{ padding: "18px" }}>
          <h3 className="inspector-title" style={{ fontSize: "0.95rem", marginBottom: "14px" }}>👥 Phân Bố Người Dùng</h3>
          {loading ? <p className="course-sub-text">Đang tải...</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <BarStat label="Học viên (STUDENT)" value={stats?.studentCount ?? 0} total={totalUsers || 1} color="#2563eb" />
              <BarStat label="Giảng viên (TEACHER)" value={stats?.teacherCount ?? 0} total={totalUsers || 1} color="#7c3aed" />
              <BarStat label="Quản trị viên (ADMIN)" value={stats?.adminCount ?? 1} total={totalUsers || 1} color="#dc2626" />
            </div>
          )}
        </div>

        {/* Course Distribution */}
        <div className="vocalyn-card" style={{ padding: "18px" }}>
          <h3 className="inspector-title" style={{ fontSize: "0.95rem", marginBottom: "14px" }}>📚 Phân Bố Khóa Học</h3>
          {loading ? <p className="course-sub-text">Đang tải...</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <BarStat label="Khóa tính phí (PAID)" value={stats?.paidCourseCount ?? 0} total={totalCourses || 1} color="#f59e0b" />
              <BarStat label="Khóa miễn phí (FREE)" value={stats?.freeCourseCount ?? 0} total={totalCourses || 1} color="#10b981" />
            </div>
          )}
        </div>

        {/* Quick Summary */}
        <div className="vocalyn-card" style={{ padding: "18px" }}>
          <h3 className="inspector-title" style={{ fontSize: "0.95rem", marginBottom: "14px" }}>📊 Tóm Tắt Nền Tảng</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.84rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span>Doanh thu trung bình/đơn</span>
              <strong style={{ color: "#16a34a" }}>
                {(stats?.totalOrders && stats?.totalRevenue)
                  ? money.format(Math.round(stats.totalRevenue / stats.totalOrders))
                  : "—"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span>Tỷ lệ giảng viên/học viên</span>
              <strong>
                {stats?.teacherCount && stats?.studentCount
                  ? `1 : ${Math.round(stats.studentCount / stats.teacherCount)}`
                  : "—"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span>KH tính phí / miễn phí</span>
              <strong>
                {stats?.paidCourseCount !== undefined
                  ? `${stats.paidCourseCount} / ${stats.freeCourseCount ?? 0}`
                  : "—"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span>Tổng người dùng</span>
              <strong>{stats?.totalUsers ?? "—"}</strong>
            </div>
          </div>

          <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" style={{ width: "100%", marginTop: "14px", textAlign: "center" }} onClick={exportStats}>
            ⬇️ Xuất Báo Cáo CSV
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="vocalyn-card" style={{ padding: "18px" }}>
        <h3 className="inspector-title" style={{ fontSize: "0.95rem", marginBottom: "12px" }}>🔗 Truy Cập Nhanh Báo Cáo Chi Tiết</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a href="/admin/orders" className="vocalyn-btn-pill vocalyn-btn-secondary">📦 Xem Đơn Hàng</a>
          <a href="/admin/transactions" className="vocalyn-btn-pill vocalyn-btn-secondary">💳 Xem Giao Dịch</a>
          <a href="/admin/refunds" className="vocalyn-btn-pill vocalyn-btn-secondary">🔄 Xem Hoàn Tiền</a>
          <a href="/admin/coupons" className="vocalyn-btn-pill vocalyn-btn-secondary">🏷️ Xem Mã Giảm Giá</a>
          <a href="/admin/system-activity" className="vocalyn-btn-pill vocalyn-btn-secondary">📜 Nhật Ký Hệ Thống</a>
        </div>
      </div>
    </div>
  );
}
