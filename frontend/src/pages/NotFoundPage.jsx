import { Link, useLocation } from "react-router-dom";
import { demoPaths } from "../config/navigation";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="not-found-shell">
      <div className="not-found-card">
        <span className="not-found-badge">404</span>
        <h1 className="not-found-title">Không tìm thấy trang</h1>
        <p className="not-found-text">
          Đường dẫn này không tồn tại hoặc đã được thay đổi. Bạn có thể quay về trang
          chủ hoặc mở trang cá nhân theo vai trò.
        </p>
        <p className="not-found-path">{location.pathname}</p>
        <div className="not-found-actions">
          <Link to={demoPaths.home} className="not-found-button not-found-button-primary">
            Về trang chủ
          </Link>
          <Link
            to={demoPaths.studentDashboard}
            className="not-found-button not-found-button-secondary"
          >
            Trang Học viên
          </Link>
          <Link
            to={demoPaths.adminDashboard}
            className="not-found-button not-found-button-secondary"
          >
            Trang Quản trị
          </Link>
        </div>
      </div>
    </div>
  );
}
