const values = [
  {
    title: "Học theo tiến độ cá nhân",
    text: "Student theo dõi khóa đang học, bài đã hoàn thành, điểm và những phần cần ôn lại.",
  },
  {
    title: "Nội dung có quy trình",
    text: "Teacher tạo khóa học, chương, bài học, vocab, grammar và gửi Admin duyệt trước khi xuất bản.",
  },
  {
    title: "Thương mại rõ ràng",
    text: "Giỏ hàng, coupon, thanh toán, invoice và ownership được tính lại ở backend.",
  },
  {
    title: "AI học tập an toàn",
    text: "Chatbot và writing feedback dùng API key ở backend, có giới hạn usage và log an toàn.",
  },
];

export default function AboutPage() {
  return (
    <section className="public-info-page">
      <article className="public-info-hero">
        <span className="page-badge">About</span>
        <h2>Hệ thống hỗ trợ học tiếng Anh thông minh</h2>
        <p>
          English Smart Learning gồm catalog khóa học, học thử, tiến độ học tập,
          bài tập, thanh toán và AI feedback trong một trải nghiệm thống nhất.
        </p>
      </article>

      <div className="public-info-grid">
        {values.map((item) => (
          <article className="public-info-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
