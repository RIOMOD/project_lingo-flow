import { useEffect, useState } from "react";
import { getAdminDashboardStats } from "../../services/adminService";
import { getAdminOrders, getAdminTransactions } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function ReportPage() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      try {
        const [sData, oData, tData] = await Promise.all([
          getAdminDashboardStats().catch(() => null),
          getAdminOrders({ size: 50 }).catch(() => ({ items: [] })),
          getAdminTransactions({ size: 50 }).catch(() => ({ items: [] })),
        ]);
        setStats(sData);
        setOrders(oData?.items ?? []);
        setTransactions(tData?.items ?? []);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  const totalRevenue = stats?.totalRevenue ?? stats?.revenue ?? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const successOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "PAID" || o.status === "SUCCESS");
  const successRate = orders.length > 0 ? Math.round((successOrders.length / orders.length) * 100) : 100;

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin System</span>
        <h2 className="page-title">Báo cáo & Thống kê hệ thống</h2>
        <p className="page-description">Tổng hợp doanh thu, tỷ lệ thanh toán thành công và hoạt động của nền tảng.</p>
      </section>

      {loading ? (
        <p className="page-description">Đang tổng hợp báo cáo...</p>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Doanh thu tổng cộng</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0", color: "#2a6ed4" }}>{money.format(totalRevenue)}</h3>
            </div>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tổng số đơn hàng</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>{orders.length}</h3>
            </div>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Giao dịch hoàn tất</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0", color: "#2e7d32" }}>{transactions.length}</h3>
            </div>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tỷ lệ đơn thành công</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>{successRate}%</h3>
            </div>
          </section>

          {/* Breakdown Section */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
            <section className="page-panel-card" style={{ padding: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem" }}>Phân bố loại khóa học</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "4px" }}>
                    <span>Khóa học tính phí (PAID)</span>
                    <strong style={{ color: "#2a6ed4" }}>{stats?.paidCourseCount ?? 0} khóa</strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "70%", background: "#2a6ed4", borderRadius: "4px" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "4px" }}>
                    <span>Khóa học miễn phí (FREE)</span>
                    <strong style={{ color: "#2e7d32" }}>{stats?.freeCourseCount ?? 0} khóa</strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "30%", background: "#2e7d32", borderRadius: "4px" }} />
                  </div>
                </div>
              </div>
            </section>

            <section className="page-panel-card" style={{ padding: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem" }}>Phân bố tài khoản người dùng</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "4px" }}>
                    <span>Học viên (STUDENT)</span>
                    <strong>{stats?.studentCount ?? stats?.totalUsers ?? 0} người</strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "85%", background: "#0288d1", borderRadius: "4px" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "4px" }}>
                    <span>Giảng viên (TEACHER)</span>
                    <strong>{stats?.teacherCount ?? 0} người</strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "15%", background: "#7b1fa2", borderRadius: "4px" }} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
