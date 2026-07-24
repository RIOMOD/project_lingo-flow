import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { getRoleHome, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
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
      const user = await register(form);
      navigate(getRoleHome(user.role), { replace: true });
    } catch (caughtError) {
      setError(caughtError.message || "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page auth-split-page">
      <div className="auth-card">
        <div className="auth-copy">
          <span className="page-badge">Student</span>
          <h2 className="page-title">Đăng ký</h2>
          <p className="page-description">
            Tài khoản tự đăng ký sẽ được gán role STUDENT. Teacher sẽ do Admin tạo hoặc cấp quyền.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Họ tên</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Tran Thi Student"
              required
            />
          </label>

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
            <span>Số điện thoại</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0900000000"
            />
          </label>

          <label className="auth-field">
            <span>Mật khẩu</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ít nhất 8 ký tự"
              minLength={8}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký Student"}
          </button>
        </form>

        <p className="auth-alt">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>

      <aside className="auth-art-panel">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85"
          alt="Nhóm học viên học tiếng Anh"
        />
        <div>
          <span>Start learning</span>
          <strong>Đăng ký Student để học FREE và dùng AI</strong>
        </div>
      </aside>
    </section>
  );
}
