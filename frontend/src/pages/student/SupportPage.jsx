import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "../../styles/SupportPage.css";

const FAQS = [
  {
    id: 1,
    question: "Làm thế nào để bắt đầu khóa học đã thanh toán?",
    answer: "Sau khi hoàn tất thanh toán thành công, bạn chỉ cần truy cập vào mục 'Khóa học của tôi' trên thanh menu bên trái. Tất cả các khóa học đã đăng ký sẽ kích hoạt tự động và bạn có thể bấm 'Vào học ngay'."
  },
  {
    id: 2,
    question: "Tôi gặp lỗi không nhận diện micro khi Luyện Phát Âm AI thì xử lý thế nào?",
    answer: "Vui lòng kiểm tra quyền truy cập Micro trên trình duyệt (bấm vào biểu tượng ổ khóa ở thanh địa chỉ URL -> chọn Cho phép Micro). Đảm bảo thiết bị của bạn đã kết nối micro hoạt động tốt và khuyên dùng trình duyệt Chrome/Edge mới nhất."
  },
  {
    id: 3,
    question: "Điểm kinh nghiệm (XP) và Chuỗi học tập (Streak) được tính ra sao?",
    answer: "Mỗi khi bạn hoàn thành 1 bài học, bài tập hoặc phiên từ vựng, hệ thống sẽ cộng điểm XP tương ứng. Để giữ chuỗi Streak liên tục, bạn cần hoàn thành ít nhất 1 hoạt động học tập mỗi ngày trước 24:00."
  },
  {
    id: 4,
    question: "Tôi muốn yêu cầu hoàn tiền khóa học thì cần làm gì?",
    answer: "LingoFlow hỗ trợ chính sách hoàn tiền 100% trong vòng 7 ngày nếu bạn chưa học quá 20% tổng số bài giảng. Bạn có thể gửi ticket hỗ trợ bên dưới với chủ đề 'Thanh toán & Hoàn tiền' để bộ phận CSKH xử lý trong vòng 24h."
  },
  {
    id: 5,
    question: "Tính năng AI sửa bài Writing & Chatbot AI có giới hạn lượt dùng không?",
    answer: "Mỗi tài khoản Học viên được cấp 50 lượt gọi AI miễn phí hằng ngày. Lượt dùng sẽ tự động làm mới vào 00:00 mỗi đêm."
  }
];

export default function SupportPage() {
  const { showToast } = useToast();
  const [openFaq, setOpenFaq] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketForm, setTicketForm] = useState({
    topic: "TECHNICAL",
    priority: "MEDIUM",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  function toggleFaq(id) {
    setOpenFaq((prev) => (prev === id ? null : id));
  }

  function handleFormChange(e) {
    setTicketForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmitTicket(e) {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      showToast("Vui lòng điền đầy đủ tiêu đề và nội dung cần hỗ trợ.", "error");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("Yêu cầu hỗ trợ của bạn đã được gửi thành công! Kỹ thuật viên sẽ phản hồi qua email trong 15 phút.", "success");
      setTicketForm({ topic: "TECHNICAL", priority: "MEDIUM", subject: "", message: "" });
    }, 800);
  }

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="support-page">
      {/* Hero Banner & Search */}
      <section className="support-hero">
        <div className="support-hero-header">
          <div className="support-hero-title">
            <h2>Trung tâm Hỗ trợ & Trợ giúp LingoFlow 🎧</h2>
            <p>Giải đáp thắc mắc, hướng dẫn sử dụng công cụ AI và hỗ trợ kỹ thuật 24/7</p>
          </div>
          <div className="support-status-chip">
            <span>🟢</span> Trực tuyến · Phản hồi trong 5 phút
          </div>
        </div>

        <div className="support-search-box">
          <input
            type="text"
            placeholder="Nhập từ khóa hoặc câu hỏi cần giải đáp (ví dụ: đổi mật khẩu, nạp tiền, luyện phát âm AI...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button">Tìm kiếm</button>
        </div>
      </section>

      {/* Quick Help Categories */}
      <div className="support-categories-grid">
        <div className="support-category-card">
          <div className="support-category-icon">💳</div>
          <h3>Thanh toán & Khóa học</h3>
          <p>Hướng dẫn mua khóa học, hoàn tiền, xuất hóa đơn VAT và tra cứu đơn hàng.</p>
          <div className="support-category-list">
            <span className="support-category-item">Cách mua khóa học qua VNPAY / Momo ➔</span>
            <span className="support-category-item">Chính sách hoàn tiền 7 ngày ➔</span>
            <span className="support-category-item">Tải hóa đơn điện tử ➔</span>
          </div>
        </div>

        <div className="support-category-card">
          <div className="support-category-icon">🎓</div>
          <h3>Lộ trình & Thi thử</h3>
          <p>Cách học ngữ pháp, thi thử TOEIC, lưu từ vựng và tích lũy điểm XP Streak.</p>
          <div className="support-category-list">
            <span className="support-category-item">Mẹo giữ chuỗi học tập Streak ➔</span>
            <span className="support-category-item">Xem lại lịch sử thi thử TOEIC ➔</span>
            <span className="support-category-item">Cách ôn từ vựng theo chủ đề ➔</span>
          </div>
        </div>

        <div className="support-category-card">
          <div className="support-category-icon">🤖</div>
          <h3>Công cụ AI & Kỹ thuật</h3>
          <p>Sửa lỗi micro phát âm, hướng dẫn dùng Chatbot AI và AI sửa bài viết Writing.</p>
          <div className="support-category-list">
            <span className="support-category-item">Sửa lỗi không nhận giọng nói Micro ➔</span>
            <span className="support-category-item">Cách dùng 50 lượt AI hằng ngày ➔</span>
            <span className="support-category-item">Tải báo cáo chấm điểm PDF ➔</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="support-section">
        <div className="support-section-header">
          <span>💡</span>
          <h3>Câu hỏi thường gặp (FAQ)</h3>
        </div>

        <div className="faq-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                  <button className="faq-question" type="button" onClick={() => toggleFaq(faq.id)}>
                    <span>{faq.question}</span>
                    <span>{isOpen ? "➖" : "➕"}</span>
                  </button>
                  {isOpen && <div className="faq-answer">{faq.answer}</div>}
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", color: "#64748b", padding: "1rem" }}>
              Không tìm thấy câu hỏi nào phù hợp với từ khóa "{searchQuery}".
            </p>
          )}
        </div>
      </section>

      {/* Ticket Form & Contact Grid */}
      <div className="support-grid-2">
        <section className="support-section">
          <div className="support-section-header">
            <span>📩</span>
            <h3>Gửi yêu cầu hỗ trợ trực tiếp (Ticket)</h3>
          </div>

          <form className="support-ticket-form" onSubmit={handleSubmitTicket}>
            <div className="support-form-row">
              <div className="support-form-group">
                <label htmlFor="topic">Chủ đề hỗ trợ</label>
                <select id="topic" name="topic" value={ticketForm.topic} onChange={handleFormChange}>
                  <option value="TECHNICAL">⚙️ Lỗi kỹ thuật / Micro / AI</option>
                  <option value="BILLING">💳 Thanh toán & Đơn hàng</option>
                  <option value="LESSON">📖 Bài học & Nội dung luyện thi</option>
                  <option value="FEEDBACK">💬 Góp ý cải tiến sản phẩm</option>
                </select>
              </div>

              <div className="support-form-group">
                <label htmlFor="priority">Mức độ ưu tiên</label>
                <select id="priority" name="priority" value={ticketForm.priority} onChange={handleFormChange}>
                  <option value="LOW">Thường (Xử lý trong 24h)</option>
                  <option value="MEDIUM">Quan trọng (Xử lý trong 4h)</option>
                  <option value="HIGH">Khẩn cấp (Xử lý trong 15-30p)</option>
                </select>
              </div>
            </div>

            <div className="support-form-group">
              <label htmlFor="subject">Tiêu đề yêu cầu</label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Mô tả ngắn gọn vấn đề bạn gặp phải..."
                value={ticketForm.subject}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="support-form-group">
              <label htmlFor="message">Nội dung chi tiết</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Vui lòng cung cấp chi tiết lỗi, tên bài học hoặc mã đơn hàng (nếu có)..."
                value={ticketForm.message}
                onChange={handleFormChange}
                required
              />
            </div>

            <button type="submit" className="btn-assessment-submit" disabled={submitting} style={{ alignSelf: "flex-start" }}>
              {submitting ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ ➔"}
            </button>
          </form>
        </section>

        {/* Contact Info Sidebar */}
        <div className="support-contact-cards">
          <div className="contact-card-item">
            <div className="contact-card-icon">📞</div>
            <div className="contact-card-info">
              <strong>Hotline Hỗ trợ 24/7</strong>
              <p>1900 6868 (Miễn phí)</p>
            </div>
          </div>

          <div className="contact-card-item">
            <div className="contact-card-icon">✉️</div>
            <div className="contact-card-info">
              <strong>Email Hỗ trợ</strong>
              <p>support@lingoflow.com</p>
            </div>
          </div>

          <div className="contact-card-item">
            <div className="contact-card-icon">💬</div>
            <div className="contact-card-info">
              <strong>Zalo Official Account</strong>
              <p>LingoFlow Việt Nam</p>
            </div>
          </div>

          <div className="contact-card-item">
            <div className="contact-card-icon">⏰</div>
            <div className="contact-card-info">
              <strong>Thời gian làm việc</strong>
              <p style={{ color: "#475569" }}>08:00 - 22:00 (Thứ 2 - CN)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
