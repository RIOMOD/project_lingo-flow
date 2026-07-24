import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { getRoleHome, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(form);
      const fallbackPath = getRoleHome(user.role);
      const redirectTo = location.state?.from?.pathname ?? fallbackPath;
      navigate(redirectTo, { replace: true });
    } catch (caughtError) {
      setError(caughtError.message || "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page auth-split-page">
      <div className="auth-card">
        <div className="auth-copy">
          <span className="page-badge">Authentication</span>
          <h2 className="page-title">Đăng nhập</h2>
          <p className="page-description">
            Đăng nhập bằng tài khoản Student, Teacher hoặc Admin để vào đúng không gian làm việc.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
            />
          </label>

          <label className="auth-field">
            <span>Mật khẩu</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="password"
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="auth-alt">
          Chưa có tài khoản? <Link to="/register">Đăng ký Student</Link>
        </p>
      </div>

      <aside className="auth-art-panel">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85"
          alt="Học trực tuyến với máy tính"
        />
        <div>
          <span>Welcome back</span>
          <strong>Tiếp tục bài học và tiến độ của bạn</strong>
        </div>
      </aside>
    </section>
  );
}
