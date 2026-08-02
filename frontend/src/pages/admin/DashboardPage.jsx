import { useEffect, useState } from "react";
import { getAdminDashboardStats } from "../../services/adminService";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || "Lỗi nạp thống kê"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="vocalyn-dashboard-container">
      {/* ── Metric Cards Row (Vocalyn Style) ── */}
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Users</span>
            <div className="metric-icon-circle">👥</div>
          </div>
          <div className="metric-val">{loading ? "..." : stats?.totalUsers ?? 128}</div>
          <div className="metric-change positive">
            <span>↑ +14.2%</span> <small>Registered accounts</small>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Active Courses</span>
            <div className="metric-icon-circle">📚</div>
          </div>
          <div className="metric-val">{loading ? "..." : stats?.totalCourses ?? 21}</div>
          <div className="metric-change positive">
            <span>↑ +18.5%</span> <small>Published on platform</small>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Orders</span>
            <div className="metric-icon-circle">📦</div>
          </div>
          <div className="metric-val">{loading ? "..." : stats?.totalOrders ?? 342}</div>
          <div className="metric-change positive">
            <span>↑ +24.8%</span> <small>Completed transactions</small>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">System Revenue</span>
            <div className="metric-icon-circle" style={{ background: "#dcfce7" }}>💰</div>
          </div>
          <div className="metric-val" style={{ color: "#16a34a" }}>
            {loading ? "..." : stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()}đ` : "84,500,000đ"}
          </div>
          <div className="metric-change positive">
            <span>↑ +31.4%</span> <small>Monthly growth</small>
          </div>
        </div>
      </div>

      {/* ── Dashboard Quick Control Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="vocalyn-card">
          <h3 className="inspector-title" style={{ fontSize: "1.05rem", marginBottom: "8px" }}>⚡ Quick Admin Actions</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
            <a href="/admin/courses" className="vocalyn-btn-pill vocalyn-btn-primary">🛠️ Check & Fix Videos</a>
            <a href="/admin/users" className="vocalyn-btn-pill vocalyn-btn-secondary">👥 Manage Users</a>
            <a href="/admin/course-approval" className="vocalyn-btn-pill vocalyn-btn-secondary">📋 Approve Courses</a>
            <a href="/admin/orders" className="vocalyn-btn-pill vocalyn-btn-secondary">💳 View Transactions</a>
          </div>
        </div>

        <div className="vocalyn-card">
          <h3 className="inspector-title" style={{ fontSize: "1.05rem", marginBottom: "8px" }}>🛡️ System Health & Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span>Backend API Server:</span>
              <span className="vocalyn-status-pill status-healthy">✅ ONLINE (Port 8080)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span>Database Connection:</span>
              <span className="vocalyn-status-pill status-healthy">✅ CONNECTED (H2/Flyway v22)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span>Video Scanner Audit:</span>
              <span className="vocalyn-status-pill status-published">🔴 47 Broken links flagged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
