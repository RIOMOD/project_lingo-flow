import { useState } from "react";

const PERMISSION_GROUPS = [
  {
    category: "Quản trị người dùng & Phân quyền",
    permissions: [
      { key: "USER_VIEW", name: "Xem danh sách người dùng", admin: true, teacher: false, student: false },
      { key: "USER_EDIT", name: "Chỉnh sửa thông tin & Khóa tài khoản", admin: true, teacher: false, student: false },
      { key: "TEACHER_CREATE", name: "Khởi tạo tài khoản Giảng viên", admin: true, teacher: false, student: false },
      { key: "ROLE_CHANGE", name: "Thay đổi vai trò người dùng", admin: true, teacher: false, student: false },
    ],
  },
  {
    category: "Quản lý Khóa học & Giáo trình",
    permissions: [
      { key: "COURSE_CREATE", name: "Tạo khóa học mới", admin: true, teacher: true, student: false },
      { key: "CHAPTER_LESSON_EDIT", name: "Xây dựng chương & bài học", admin: true, teacher: true, student: false },
      { key: "COURSE_SUBMIT", name: "Gửi khóa học lên Admin duyệt", admin: false, teacher: true, student: false },
      { key: "COURSE_APPROVE_REJECT", name: "Duyệt & Từ chối khóa học", admin: true, teacher: false, student: false },
      { key: "COURSE_PUBLISH_HIDE", name: "Xuất bản & Ẩn khóa học", admin: true, teacher: false, student: false },
      { key: "COURSE_LEARN", name: "Học bài & Theo dõi tiến độ", admin: true, teacher: true, student: true },
    ],
  },
  {
    category: "Quản lý Đơn hàng & Tài chính",
    permissions: [
      { key: "ORDER_VIEW", name: "Xem tất cả đơn hàng hệ thống", admin: true, teacher: false, student: false },
      { key: "COUPON_MANAGE", name: "Tạo & kích hoạt Mã giảm giá", admin: true, teacher: false, student: false },
      { key: "REFUND_PROCESS", name: "Duyệt & Từ chối hoàn tiền", admin: true, teacher: false, student: false },
      { key: "TRANSACTION_VIEW", name: "Nhật ký giao dịch thanh toán", admin: true, teacher: false, student: false },
    ],
  },
  {
    category: "Hệ thống & Báo cáo",
    permissions: [
      { key: "AUDIT_LOG_VIEW", name: "Xem Nhật ký hoạt động (Audit log)", admin: true, teacher: false, student: false },
      { key: "REPORTS_VIEW", name: "Báo cáo thống kê tổng quan", admin: true, teacher: false, student: false },
    ],
  },
];

export default function RoleManagementPage() {
  const [activeTab, setActiveTab] = useState("ALL");

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin System</span>
        <h2 className="page-title">Ma trận phân quyền (Role & Permissions)</h2>
        <p className="page-description">Quy định chi tiết quyền hạn tác động đến hệ thống theo 3 vai trò: Admin, Teacher và Student.</p>
      </section>

      {/* Role Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="page-panel-card" style={{ padding: "20px", borderLeft: "4px solid #e53935" }}>
          <span className="lb-badge lb-status-rejected">ADMIN</span>
          <h3 style={{ margin: "8px 0 4px", fontSize: "1.2rem" }}>Quản trị viên</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Toàn quyền kiểm soát hệ thống, phê duyệt khóa học, quản lý đơn hàng & nhật ký.
          </p>
        </div>

        <div className="page-panel-card" style={{ padding: "20px", borderLeft: "4px solid #2a6ed4" }}>
          <span className="lb-badge lb-badge-type">TEACHER</span>
          <h3 style={{ margin: "8px 0 4px", fontSize: "1.2rem" }}>Giảng viên</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Tạo & chỉnh sửa khóa học, biên soạn chương/bài học, quản lý kho từ vựng/ngữ pháp.
          </p>
        </div>

        <div className="page-panel-card" style={{ padding: "20px", borderLeft: "4px solid #43a047" }}>
          <span className="lb-badge lb-badge-duration">STUDENT</span>
          <h3 style={{ margin: "8px 0 4px", fontSize: "1.2rem" }}>Học viên</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Đăng ký & mua khóa học, học bài, làm bài tập trắc nghiệm và theo dõi tiến độ.
          </p>
        </div>
      </section>

      {/* Permission Matrix Table */}
      <section className="course-table page-panel-card">
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", padding: "14px 18px", background: "var(--surface-soft)", fontWeight: 600, fontSize: "0.9rem", borderBottom: "1px solid var(--border-soft)" }}>
          <span>Tên quyền hạn</span>
          <span style={{ textAlign: "center", color: "#c62828" }}>ADMIN</span>
          <span style={{ textAlign: "center", color: "#1565c0" }}>TEACHER</span>
          <span style={{ textAlign: "center", color: "#2e7d32" }}>STUDENT</span>
        </div>

        {PERMISSION_GROUPS.map((group, gIdx) => (
          <div key={gIdx}>
            <div style={{ padding: "10px 18px", background: "rgba(42,110,212,0.05)", fontWeight: 600, fontSize: "0.85rem", color: "#2a6ed4", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {group.category}
            </div>
            {group.permissions.map((p) => (
              <div key={p.key} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", padding: "12px 18px", alignItems: "center", borderBottom: "1px solid var(--border-soft)", fontSize: "0.88rem" }}>
                <div>
                  <strong>{p.name}</strong>
                  <code style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>{p.key}</code>
                </div>
                <span style={{ textAlign: "center", fontSize: "1.1rem" }}>{p.admin ? "✓" : "—"}</span>
                <span style={{ textAlign: "center", fontSize: "1.1rem" }}>{p.teacher ? "✓" : "—"}</span>
                <span style={{ textAlign: "center", fontSize: "1.1rem" }}>{p.student ? "✓" : "—"}</span>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
