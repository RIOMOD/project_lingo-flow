import { useEffect, useState } from "react";
import { getGrammarTopics } from "../../services/learningService";
import "../../styles/GrammarPage.css";

const DEFAULT_GRAMMAR_TOPICS = [
  {
    id: "g1",
    title: "Thì Hiện Tại Đơn (Present Simple)",
    level: "BEGINNER",
    description: "Diễn tả thói quen lặp đi lặp lại, hành động thường xuyên hoặc sự thật hiển nhiên.",
    formula: "S + V(s/es) + O  |  S + do/does + not + V_inf",
    usage: "Dùng cho thói quen hàng ngày, lịch trình cố định hoặc chân lý khách quan.",
    example: "She walks to school every morning. / Water boils at 100°C.",
    note: "💡 Thêm 'es' với động từ tận cùng là -o, -s, -ch, -x, -sh, -z (ví dụ: goes, watches)."
  },
  {
    id: "g2",
    title: "Thì Hiện Tại Tiếp Diễn (Present Continuous)",
    level: "BEGINNER",
    description: "Diễn tả hành động đang diễn ra ngay tại thời điểm nói hoặc kế hoạch chắc chắn trong tương lai gần.",
    formula: "S + am/is/are + V-ing  |  S + am/is/are + not + V-ing",
    usage: "Sự việc diễn ra lúc nói, sự thay đổi xu hướng, kế hoạch đã lên lịch.",
    example: "Listen! The baby is sleeping. / We are flying to London tomorrow.",
    note: "⚠️ Không chia thì tiếp diễn với các động từ chỉ trạng thái (love, know, believe, want)."
  },
  {
    id: "g3",
    title: "Thì Quá Khứ Đơn (Past Simple)",
    level: "ELEMENTARY",
    description: "Diễn tả hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ có mốc thời gian rõ ràng.",
    formula: "S + V2/V-ed  |  S + did + not + V_inf",
    usage: "Hành động đã hoàn thành trong quá khứ (yesterday, last week, in 2020).",
    example: "I visited Hoi An Ancient Town with my family last summer.",
    note: "📌 Cần ghi nhớ bảng Động từ bất quy tắc (Irregular Verbs) thông dụng."
  },
  {
    id: "g4",
    title: "Thì Hiện Tại Hoàn Thành (Present Perfect)",
    level: "INTERMEDIATE",
    description: "Diễn tả hành động xảy ra trong quá khứ nhưng kết quả vẫn còn liên quan đến hiện tại.",
    formula: "S + have/has + V3/V-ed  |  S + have/has + not + V3/V-ed",
    usage: "Trải nghiệm bản thân, hành động vừa mới hoàn thành, sự việc kéo dài từ quá khứ tới nay.",
    example: "I have lived in Hanoi for 5 years. / Have you ever tried Japanese sushi?",
    note: "🔍 Dấu hiệu nhận biết: since, for, already, yet, ever, never, just, recently."
  },
  {
    id: "g5",
    title: "Câu Điều Kiện Loại 1 & 2 (Conditionals Type 1 & 2)",
    level: "INTERMEDIATE",
    description: "Diễn tả điều kiện có thật ở hiện tại/tương lai (Loại 1) hoặc giả định không có thật ở hiện tại (Loại 2).",
    formula: "L1: If + S + V(pres), S + will + V_inf  |  L2: If + S + V2/were, S + would + V_inf",
    usage: "Loại 1: Sự việc có khả năng cao xảy ra. Loại 2: Giả thiết trái ngược với thực tế hiện tại.",
    example: "If it rains tomorrow, we will stay home. / If I were you, I would take this IELTS course.",
    note: "💡 Ở câu điều kiện Loại 2 trang trọng, 'were' được dùng cho tất cả các ngôi."
  },
  {
    id: "g6",
    title: "Câu Bị Động (Passive Voice)",
    level: "INTERMEDIATE",
    description: "Nhấn mạnh đối tượng chịu tác động của hành động thay vì người thực hiện.",
    formula: "S + be + V3/V-ed (+ by Agent)",
    usage: "Khi không biết người thực hiện hoặc khi hành động/đối tượng quan trọng hơn tác nhân.",
    example: "The smartphone was invented in the 20th century.",
    note: "⚠️ Bỏ 'by someone/by people' khi tác nhân không rõ ràng hoặc mang tính chung chung."
  },
  {
    id: "g7",
    title: "Mệnh Đề Quan Hệ (Relative Clauses)",
    level: "ADVANCED",
    description: "Bổ nghĩa cho danh từ đứng trước bằng các đại từ quan hệ Who, Whom, Which, That, Whose.",
    formula: "Noun + Who/Which/That/Whose + Clause",
    usage: "Nối hai câu đơn thành một câu phức logic, mạch lạc hơn.",
    example: "The professor who teaches Advanced AI is very kind and supportive.",
    note: "📌 Đại từ 'That' không đứng sau dấu phẩy trong mệnh đề quan hệ không xác định."
  },
  {
    id: "g8",
    title: "Đảo Ngữ Với Trạng Từ Phủ Định (Inversion)",
    level: "ADVANCED",
    description: "Đưa trạng từ phủ định lên đầu câu và đảo trợ động từ lên trước chủ ngữ để nhấn mạnh.",
    formula: "Negative Adverb (Never/Hardly/Seldom) + Aux + S + V",
    usage: "Dùng trong văn phong trang trọng, bài thi IELTS Academic Writing Task 2.",
    example: "Hardly had I arrived home when it began to rain heavily.",
    note: "⭐ Cấu trúc giúp ăn điểm tuyệt đối về tiêu chuẩn Grammatical Range & Accuracy trong IELTS."
  }
];

export default function GrammarPage() {
  const [items, setItems] = useState(DEFAULT_GRAMMAR_TOPICS);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getGrammarTopics({ search, level, size: 20 })
      .then((data) => {
        if (isMounted) {
          if (data?.items && data.items.length > 0) {
            setItems(data.items);
          } else {
            let filtered = DEFAULT_GRAMMAR_TOPICS;
            if (level) {
              filtered = filtered.filter((item) => item.level === level);
            }
            if (search) {
              const q = search.toLowerCase();
              filtered = filtered.filter(
                (item) =>
                  item.title.toLowerCase().includes(q) ||
                  item.description.toLowerCase().includes(q) ||
                  item.formula.toLowerCase().includes(q)
              );
            }
            setItems(filtered);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          let filtered = DEFAULT_GRAMMAR_TOPICS;
          if (level) {
            filtered = filtered.filter((item) => item.level === level);
          }
          if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
              (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.formula.toLowerCase().includes(q)
            );
          }
          setItems(filtered);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, level]);

  return (
    <div className="grammar-page">
      <section className="page-hero">
        <span className="page-badge">Grammar Hub</span>
        <h2 className="page-title">Ngữ pháp tiếng Anh toàn diện</h2>
        <p className="page-description">
          Tổng hợp công thức, cách dùng, ví dụ minh họa và ghi chú thực tế theo từng cấp độ từ Cơ bản đến Nâng cao.
        </p>
        <div className="course-filter-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="🔍 Tìm kiếm chủ điểm ngữ pháp (Thì, Bị động, Đảo ngữ...)"
          />
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">Tất cả trình độ</option>
            <option value="BEGINNER">🟢 Mới bắt đầu (Beginner)</option>
            <option value="ELEMENTARY">🔵 Cơ bản (Elementary)</option>
            <option value="INTERMEDIATE">🟠 Trung cấp (Intermediate)</option>
            <option value="ADVANCED">🔴 Nâng cao (Advanced)</option>
          </select>
        </div>
      </section>

      <section className="grammar-grid">
        {items.map((item) => (
          <article className="grammar-card" key={item.id}>
            <div>
              <div className="grammar-card-header">
                <span className={`grammar-level-badge ${item.level}`}>{item.level}</span>
              </div>
              <h3 className="grammar-card-title">{item.title}</h3>
              <p className="grammar-card-desc">{item.description}</p>

              {item.formula && (
                <div className="grammar-box">
                  <div className="grammar-box-title">📐 Công thức:</div>
                  <div className="grammar-formula">{item.formula}</div>
                </div>
              )}

              {item.usage && (
                <div className="grammar-box">
                  <div className="grammar-box-title">📌 Cách dùng:</div>
                  <div style={{ fontSize: "0.88rem", color: "#475569" }}>{item.usage}</div>
                </div>
              )}

              {item.example && (
                <div className="grammar-box">
                  <div className="grammar-box-title">💡 Ví dụ thực tế:</div>
                  <div className="grammar-example">"{item.example}"</div>
                </div>
              )}
            </div>

            {item.note && <div className="grammar-note">{item.note}</div>}
          </article>
        ))}
      </section>

      {items.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Không tìm thấy bài học ngữ pháp phù hợp với từ khóa tìm kiếm.
        </div>
      )}
    </div>
  );
}
