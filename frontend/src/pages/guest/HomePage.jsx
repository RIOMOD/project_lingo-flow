import { Link } from "react-router-dom";

const heroImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=85";

const features = [
  {
    title: "Lộ trình học rõ ràng",
    text: "Khóa học được chia theo chương, bài học, từ vựng, ngữ pháp và bài tập để học viên không bị lạc nhịp.",
  },
  {
    title: "AI sửa bài viết",
    text: "Nhận gợi ý sửa câu, giải thích lỗi bằng tiếng Việt và đề xuất cách diễn đạt tự nhiên hơn.",
  },
  {
    title: "Theo dõi tiến độ",
    text: "Dashboard giúp Student xem streak, điểm, bài đã hoàn thành và phần cần ôn lại.",
  },
];

const steps = [
  "Khám phá khóa học FREE hoặc PAID",
  "Học thử bài preview trước khi đăng ký",
  "Vào học, làm bài tập và nhận phản hồi AI",
];

export default function HomePage() {
  return (
    <div className="guest-home">
      <section className="guest-home-hero">
        <div className="guest-home-copy">
          <span className="guest-kicker">AI English Learning</span>
          <h1>Học tiếng Anh thông minh, có lộ trình và phản hồi AI</h1>
          <p>
            LingoSmart kết hợp khóa học có cấu trúc, tiến độ học tập, bài tập và
            AI writing feedback để giúp bạn học đều hơn mỗi ngày.
          </p>

          <div className="guest-hero-actions">
            <Link className="guest-button guest-button-primary" to="/courses">
              Khám phá khóa học
            </Link>
            <Link className="guest-button guest-button-secondary" to="/register">
              Đăng ký miễn phí
            </Link>
          </div>

          <div className="guest-trust-row" aria-label="Thong ke noi bat">
            <div>
              <strong>FREE</strong>
              <span>Khóa học bắt đầu</span>
            </div>
            <div>
              <strong>PAID</strong>
              <span>Khóa học chuyên sâu</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Chat và sửa writing</span>
            </div>
          </div>
        </div>

        <div className="guest-home-visual">
          <img src={heroImage} alt="Học viên đang học tiếng Anh trực tuyến" />
          <div className="guest-floating-card guest-floating-card-top">
            <span>Weekly progress</span>
            <strong>+32%</strong>
          </div>
          <div className="guest-floating-card guest-floating-card-bottom">
            <span>Writing feedback</span>
            <strong>AI ready</strong>
          </div>
        </div>
      </section>

      <section className="guest-section">
        <div className="guest-section-head">
          <span className="guest-kicker">Learning system</span>
          <h2>Một trải nghiệm học đầy đủ cho Student</h2>
          <p>
            Từ lúc khám phá khóa học đến khi vào học, làm bài và xem tiến độ,
            mọi bước đều được kết nối với backend.
          </p>
        </div>

        <div className="guest-feature-grid">
          {features.map((item) => (
            <article className="guest-feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guest-path-section">
        <div className="guest-path-copy">
          <span className="guest-kicker">How it works</span>
          <h2>Bắt đầu nhanh trong 3 bước</h2>
        </div>
        <div className="guest-path-list">
          {steps.map((step, index) => (
            <article className="guest-path-item" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
