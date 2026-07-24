import { Link, useLocation } from "react-router-dom";
import { demoPaths } from "../config/navigation";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="not-found-shell">
      <div className="not-found-card">
        <span className="not-found-badge">404</span>
        <h1 className="not-found-title">Khong tim thay trang</h1>
        <p className="not-found-text">
          Route nay chua ton tai hoac da doi duong dan. Ban co the quay ve trang
          chu hoac mo dashboard demo theo role.
        </p>
        <p className="not-found-path">{location.pathname}</p>
        <div className="not-found-actions">
          <Link to={demoPaths.home} className="not-found-button not-found-button-primary">
            Ve trang chu
          </Link>
          <Link
            to={demoPaths.studentDashboard}
            className="not-found-button not-found-button-secondary"
          >
            Mo Student
          </Link>
          <Link
            to={demoPaths.adminDashboard}
            className="not-found-button not-found-button-secondary"
          >
            Mo Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
