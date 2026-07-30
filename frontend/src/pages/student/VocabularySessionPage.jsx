import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { recordVocabularyProgress } from "../../services/progressService";
import { speakText } from "../../utils/sound";
import "../../styles/VocabularySession.css";

// Rich activity sets for each topic with DISCOVERY, RECOGNITION, and PRODUCTION steps
const topicActivities = {
  "Daily Conversation": [
    {
      activityType: "DISCOVERY",
      word: "Greeting",
      ipa: "/ˈɡriːtɪŋ/",
      meaning: "Lời chào",
      exampleSentence: "She said, ‘Good morning!’ as a warm greeting to everyone.",
      question: "Dựa vào câu ví dụ, bạn đoán từ 'Greeting' có nghĩa là gì?",
      options: ["Chào tạm biệt", "Lời chào", "Câu hỏi", "Lời cảm ơn"],
      answer: "Lời chào",
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Polite",
      question: "Từ nào đồng nghĩa với 'Lịch sự, nhã nhặn'?",
      options: ["Rude", "Polite", "Lazy", "Harsh"],
      answer: "Polite",
      imageUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Apologize",
      question: "Điền từ còn thiếu: I must ______ for being late to the meeting.",
      options: [],
      answer: "apologize",
      imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "DISCOVERY",
      word: "Hospitality",
      ipa: "/ˌhɒspɪˈtæləti/",
      meaning: "Lòng hiếu khách, sự đón tiếp nồng hậu",
      exampleSentence: "We enjoyed the wonderful hospitality of our hosts during our stay.",
      question: "Dựa vào câu ví dụ, từ 'Hospitality' có nghĩa là gì?",
      options: ["Bệnh viện", "Lòng hiếu khách", "Thái độ lạnh lùng", "Sự tức giận"],
      answer: "Lòng hiếu khách",
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Empathetic",
      question: "Từ nào mô tả người 'Thấu cảm, biết lắng nghe và thấu hiểu'?",
      options: ["Apathetic", "Empathetic", "Selfish", "Aggressive"],
      answer: "Empathetic",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Conversation",
      question: "Điền từ còn thiếu: We had a very pleasant _______ over coffee this morning.",
      options: [],
      answer: "conversation",
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80"
    }
  ],
  "Technology & Science": [
    {
      activityType: "DISCOVERY",
      word: "Algorithm",
      ipa: "/ˈæl.ɡə.rɪ.ðəm/",
      meaning: "Thuật toán",
      exampleSentence: "Search engines use a complex algorithm to rank webpages.",
      question: "Dựa vào câu ví dụ, từ 'Algorithm' có nghĩa là gì?",
      options: ["Giao diện", "Thuật toán", "Máy chủ", "Mạng không dây"],
      answer: "Thuật toán",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Meticulous",
      question: "Từ nào đồng nghĩa với 'Tỉ mỉ, cẩn thận tuyệt đối'?",
      options: ["Careless", "Meticulous", "Sloppy", "Hasty"],
      answer: "Meticulous",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Innovation",
      question: "Điền từ còn thiếu: Technological _______ drives modern economic growth.",
      options: [],
      answer: "innovation",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "DISCOVERY",
      word: "Resilient",
      ipa: "/rɪˈzɪl.jənt/",
      meaning: "Có khả năng phục hồi nhanh chóng",
      exampleSentence: "The system is resilient against cyber attacks.",
      question: "Dựa vào câu ví dụ, bạn đoán từ 'Resilient' có nghĩa là gì?",
      options: ["Mong mong dễ vỡ", "Khả năng phục hồi tốt", "Chậm chạp", "Lỗi phần mềm"],
      answer: "Khả năng phục hồi tốt",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Cybersecurity",
      question: "Từ nào nghĩa là 'An ninh mạng, bảo mật thông tin'?",
      options: ["Cloud storage", "Cybersecurity", "Hardware", "Database"],
      answer: "Cybersecurity",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Flourish",
      question: "Điền từ còn thiếu: The tech ecosystem continues to _______ in Silicon Valley.",
      options: [],
      answer: "flourish",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80"
    }
  ],
  "Travel & Culture": [
    {
      activityType: "DISCOVERY",
      word: "Destination",
      ipa: "/ˌdɛstɪˈneɪʃən/",
      meaning: "Điểm đến",
      exampleSentence: "Da Nang is a popular travel destination in Vietnam.",
      question: "Dựa vào câu ví dụ, từ 'Destination' có nghĩa là gì?",
      options: ["Xuất phát", "Điểm đến", "Hành lý", "Vé máy bay"],
      answer: "Điểm đến",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Itinerary",
      question: "Từ nào có nghĩa là 'Lịch trình chi tiết của chuyến đi'?",
      options: ["Passport", "Itinerary", "Souvenir", "Flight"],
      answer: "Itinerary",
      imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Explore",
      question: "Điền từ còn thiếu: I love to ______ new cultures during my annual vacations.",
      options: [],
      answer: "explore",
      imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "DISCOVERY",
      word: "Authentic",
      ipa: "/ɔːˈθɛntɪk/",
      meaning: "Chân thực, nguyên bản",
      exampleSentence: "We enjoyed authentic local dishes at the street market.",
      question: "Dựa vào câu ví dụ, từ 'Authentic' có nghĩa là gì?",
      options: ["Giả mạo", "Đắt đỏ", "Chân thực, nguyên bản", "Nhập khẩu"],
      answer: "Chân thực, nguyên bản",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Heritage",
      question: "Từ nào đồng nghĩa với 'Di sản văn hóa'?",
      options: ["Landscape", "Heritage", "Architecture", "Excursion"],
      answer: "Heritage",
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Souvenir",
      question: "Điền từ còn thiếu: She bought a handcraft _______ to remember her trip.",
      options: [],
      answer: "souvenir",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80"
    }
  ],
  "Business English": [
    {
      activityType: "DISCOVERY",
      word: "Revenue",
      ipa: "/ˈrevənju/",
      meaning: "Doanh thu",
      exampleSentence: "The company's total revenue increased by 15% this quarter.",
      question: "Dựa vào câu ví dụ, từ 'Revenue' có nghĩa là gì?",
      options: ["Chi phí phát sinh", "Doanh thu", "Nợ ngân hàng", "Thuế thu nhập"],
      answer: "Doanh thu",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Negotiation",
      question: "Từ nào có nghĩa là 'Quá trình đàm phán thương lượng'?",
      options: ["Bankruptcy", "Negotiation", "Audit", "Recruitment"],
      answer: "Negotiation",
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Invest",
      question: "Điền từ còn thiếu: Smart venture firms usually ______ in high-potential startups.",
      options: [],
      answer: "invest",
      imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "DISCOVERY",
      word: "Entrepreneur",
      ipa: "/ˌɒntrəprəˈnɜːr/",
      meaning: "Doanh nhân khởi nghiệp",
      exampleSentence: "The young entrepreneur launched a successful tech company.",
      question: "Dựa vào câu ví dụ, từ 'Entrepreneur' có nghĩa là gì?",
      options: ["Nhân viên làm thuê", "Doanh nhân khởi nghiệp", "Khách hàng", "Đối thủ cạnh tranh"],
      answer: "Doanh nhân khởi nghiệp",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "RECOGNITION",
      word: "Lucrative",
      question: "Từ nào mô tả một cơ hội kinh doanh 'Sinh lời cao'?",
      options: ["Unprofitable", "Lucrative", "Risky", "Loss-making"],
      answer: "Lucrative",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80"
    },
    {
      activityType: "PRODUCTION",
      word: "Collaborate",
      question: "Điền từ còn thiếu: We need to _______ closely with our global strategy team.",
      options: [],
      answer: "collaborate",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
    }
  ]
};

export default function VocabularySessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") || "Daily Conversation";
  
  const [activities, setActivities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [feedback, setFeedback] = useState(null); // 'success' | 'error' | null
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const currentActivity = activities[currentIndex];
  const progressPercent = ((currentIndex) / (activities.length || 1)) * 100;

  // Load activities based on the selected topic (default to first topic if unknown)
  useEffect(() => {
    const norm = (s) => (s || "").toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();
    const foundKey = Object.keys(topicActivities).find((k) => norm(k) === norm(topic));
    const chosen = foundKey ? topicActivities[foundKey] : topicActivities["Daily Conversation"];
    setActivities(chosen);
    setCurrentIndex(0);
    setFeedback(null);
    setSelectedOption(null);
    setTextInput("");
  }, [topic]);

  const handleOptionClick = (option) => {
    // Allow re‑clicking after an error, only block after a correct answer
    if (feedback === 'success') return; // No further interaction once correct
    setSelectedOption(option);
    
    if (option === currentActivity.answer) {
      setFeedback('success');
    } else {
      setFeedback('error');
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    // Allow retry after wrong answer, block only after success
    if (feedback === 'success' || !textInput) return;
    
    if (textInput.toLowerCase().trim() === currentActivity.answer.toLowerCase()) {
      setFeedback('success');
    } else {
      setFeedback('error');
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    setTextInput("");
    
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      setSessionCompleted(true);
      
      // Store per-topic vocabulary progress using exact normalized key
      try {
        const norm = (s) => (s || "").toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();
        const activeKey = Object.keys(topicActivities).find((k) => norm(k) === norm(topic)) || topic;
        const stored = JSON.parse(localStorage.getItem("vocab_topic_progress") || "{}");
        const currentCount = Number(stored[activeKey]) || 0;
        stored[activeKey] = currentCount + 3; // Add 3 words per completed session
        localStorage.setItem("vocab_topic_progress", JSON.stringify(stored));
      } catch (e) {
        console.warn("Failed to store per-topic vocab progress:", e);
      }

      recordVocabularyProgress(3).catch(err => console.warn("Failed to record vocab progress:", err));
    }
  };

  const handleClose = () => {
    navigate('/student/vocabulary');
  };

  if (sessionCompleted) {
    return (
      <div className="vocab-session-page">
        <div className="vocab-session-main">
          <div className="vocab-complete-screen">
            <h2>Session Complete! 🎉</h2>
            <p>Tuyệt vời! Bạn đã hoàn thành {activities.length} câu hỏi.</p>
            <div className="vocab-stats" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
              <div className="vocab-stat-card">
                <h3>+150</h3>
                <p>XP Đạt được</p>
              </div>
              <div className="vocab-stat-card">
                <h3>5</h3>
                <p>Từ Mới Mastered</p>
              </div>
            </div>
            <button className="vocab-start-btn" onClick={handleClose}>Quay lại Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentActivity) return null;

  return (
    <div className="vocab-session-page">
      <header className="vocab-session-header">
        <button className="vocab-session-close" onClick={handleClose}>×</button>
        <div className="vocab-session-progress">
          <div className="vocab-session-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </header>

      <main className="vocab-session-main">
        <div className="vocab-activity-container">
          <div className="vocab-activity-type">
            {currentActivity.activityType === 'DISCOVERY' && 'Khám phá từ mới'}
            {currentActivity.activityType === 'RECOGNITION' && 'Nhận diện từ vựng'}
            {currentActivity.activityType === 'PRODUCTION' && 'Sử dụng từ vựng'}
          </div>
          
          <div className="vocab-question-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <h2 className="vocab-question" style={{ margin: 0 }}>{currentActivity.question}</h2>
            <button
              className="vocab-audio-btn"
              type="button"
              onClick={() => speakText(currentActivity.answer || currentActivity.question)}
              title="Phát âm từ vựng"
              style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                color: '#0d9488',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'all 0.2s'
              }}
            >
              🔊
            </button>
          </div>
          
          {currentActivity.imageUrl && (
            <img src={currentActivity.imageUrl} alt="Illustration" className="vocab-image" />
          )}

          {currentActivity.options.length > 0 ? (
            <div className="vocab-options">
              {currentActivity.options.map((opt, i) => {
                let btnClass = "vocab-option-btn";
                if (feedback) {
                  if (opt === currentActivity.answer) btnClass += " correct";
                  else if (opt === selectedOption) btnClass += " incorrect";
                }
                return (
                  <button 
                    key={i} 
                    className={btnClass}
                    onClick={() => handleOptionClick(opt)}
                    disabled={feedback === 'success'}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit}>
              <input 
                type="text" 
                className="vocab-input-box" 
                placeholder="Nhập câu trả lời..."
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                disabled={feedback === 'success'}
                autoFocus
              />
              {!feedback && <button type="submit" className="vocab-start-btn" style={{ width: 'auto' }}>Kiểm tra</button>}
            </form>
          )}

          {feedback && (
  <div className={`vocab-feedback ${feedback}`}>
    {feedback === 'success' ? 'Chính xác! Làm tốt lắm.' : `Chưa đúng. Đáp án là: ${currentActivity.answer}`}
  </div>
)}
{feedback === 'error' && (
  <div className="vocab-footer">
    <button className="vocab-next-btn" onClick={() => {
      setFeedback(null);
      setSelectedOption(null);
      setTextInput('');
    }} autoFocus>
      Thử lại
    </button>
  </div>
)}
{feedback === 'success' && (
  <div className="vocab-footer">
    <button className="vocab-next-btn" onClick={handleNext} autoFocus>
      {currentIndex === activities.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
    </button>
  </div>
)}
        </div>
      </main>
    </div>
  );
}
