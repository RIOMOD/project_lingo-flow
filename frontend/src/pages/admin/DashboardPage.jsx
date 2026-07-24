import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardStats } from "../../services/adminService";
import { getAdminCourses } from "../../services/courseService";
import { getAdminOrders } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, coursesData, ordersData] = await Promise.all([
          getAdminDashboardStats().catch(() => null),
          getAdminCourses({ status: "SUBMITTED", size: 5 }).catch(() => ({ items: [] })),
          getAdminOrders({ size: 5 }).catch(() => ({ items: [] })),
        ]);
        setStats(statsData);
        setPendingCourses(coursesData?.items ?? []);
        setRecentOrders(ordersData?.items ?? []);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin System</span>
        <h2 className="page-title">Tổng quan quản trị</h2>
        <p className="page-description">Theo dõi số liệu hệ thống, duyệt khóa học và doanh thu thực tế.</p>
      </section>

      {error && <p className="auth-error">{error}</p>}

      {loading ? (
        <p className="page-description">Đang tải số liệu hệ thống...</p>
      ) : (
        <>
          {/* Stat Cards */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tổng người dùng</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>{stats?.totalUsers ?? stats?.userCount ?? 0}</h3>
            </div>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Giảng viên</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>{stats?.totalTeachers ?? stats?.teacherCount ?? 0}</h3>
            </div>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Khóa học</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>{stats?.totalCourses ?? stats?.courseCount ?? 0}</h3>
            </div>
            <div className="page-panel-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tổng đơn hàng</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0" }}>{stats?.totalOrders ?? stats?.orderCount ?? 0}</h3>
            </div>
            <div className="page-panel-card" style={{ padding: "20px", background: "linear-gradient(135deg, rgba(42,110,212,0.1), rgba(42,110,212,0.03))" }}>
              <span style={{ fontSize: "0.85rem", color: "#2a6ed4", fontWeight: 600 }}>Doanh thu tích lũy</span>
              <h3 style={{ fontSize: "1.8rem", margin: "8px 0 0", color: "#2a6ed4" }}>
                {money.format(stats?.totalRevenue ?? stats?.revenue ?? 0)}
              </h3>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="page-panel-card" style={{ padding: "20px", marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "1.1rem" }}>Lối tắt quản lý</h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link className="page-action page-action-primary" to="/admin/course-approval">
                Duyệt khóa học ({pendingCourses.length})
              </Link>
              <Link className="page-action page-action-secondary" to="/admin/users">
                Quản lý người dùng
              </Link>
              <Link className="page-action page-action-secondary" to="/admin/teachers">
                Quản lý giảng viên
              </Link>
              <Link className="page-action page-action-secondary" to="/admin/orders">
                Đơn hàng & Giao dịch
              </Link>
              <Link className="page-action page-action-secondary" to="/admin/system-activity">
                Nhật ký hệ thống
              </Link>
            </div>
          </section>

          {/* Two column detail panels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
            {/* Pending Courses */}
            <section className="page-panel-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Khóa học chờ duyệt</h3>
                <Link to="/admin/course-approval" style={{ fontSize: "0.85rem", color: "#2a6ed4" }}>Xem tất cả</Link>
              </div>
              {pendingCourses.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Chưa có khóa học nào đang chờ duyệt.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pendingCourses.map((course) => (
                    <div key={course.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--surface-soft)", borderRadius: "8px" }}>
                      <div>
                        <strong style={{ fontSize: "0.9rem" }}>{course.title}</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          GV: {course.teacherName}
                        </p>
                      </div>
                      <Link className="page-action page-action-primary" to="/admin/course-approval" style={{ padding: "4px 10px", fontSize: "0.8rem" }}>
                        Xem
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Orders */}
            <section className="page-panel-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Đơn hàng gần đây</h3>
                <Link to="/admin/orders" style={{ fontSize: "0.85rem", color: "#2a6ed4" }}>Xem tất cả</Link>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Chưa có đơn hàng nào.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recentOrders.map((order) => (
                    <div key={order.orderCode} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--surface-soft)", borderRadius: "8px" }}>
                      <div>
                        <strong style={{ fontSize: "0.9rem" }}>{order.orderCode}</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          Trạng thái: {order.status}
                        </p>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#2a6ed4" }}>
                        {money.format(order.totalAmount || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
