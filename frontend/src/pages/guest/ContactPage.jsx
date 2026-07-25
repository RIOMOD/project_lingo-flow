import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ fullName: "", email: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success("Đã ghi nhận liên hệ. Chức năng gửi email sẽ nối backend sau.");
    setForm({ fullName: "", email: "", message: "" });
  };

  return (
    <section className="public-info-page public-contact-page">
      <article className="public-info-hero">
        <span className="page-badge">Contact</span>
        <h2>Liên hệ với LingoSmart</h2>
        <p>
          Gửi câu hỏi về khóa học, thanh toán, tài khoản Teacher hoặc tích hợp
          AI. Đội vận hành sẽ tiếp nhận và phản hồi theo luồng hỗ trợ.
        </p>
      </article>

      <form className="public-contact-form" onSubmit={handleSubmit}>
        <label>
          <span>Họ tên</span>
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          <span>Nội dung</span>
          <textarea name="message" value={form.message} onChange={handleChange} rows={6} required />
        </label>
        <button className="page-action page-action-primary" type="submit">
          Gửi liên hệ
        </button>
      </form>
    </section>
  );
}
