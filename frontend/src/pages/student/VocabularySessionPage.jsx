import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/VocabularySession.css";

// Mock activity sets for each topic. In a real app these would be fetched from the backend.
const topicActivities = {
  "Daily Conversation": [
    {
      activityType: "DISCOVERY",
      word: "Greeting",
      ipa: "/ˈɡriːtɪŋ/",
      meaning: "Lời chào",
      exampleSentence: "She said, ‘Good morning!’ to everyone.",
      question: "Dựa vào câu ví dụ, bạn đoán từ 'Greeting' có nghĩa là gì?",
      options: ["Chào tạm biệt", "Lời chào", "Câu hỏi", "Lời cảm ơn"],
      answer: "Lời chào",
      imageUrl: "https://picsum.photos/seed/daily/600/300"
    },
    {
      activityType: "RECOGNITION",
      word: "Polite",
      question: "Từ nào đồng nghĩa với 'Lịch sự'?",
      options: ["Rude", "Polite", "Lazy", "Harsh"],
      answer: "Polite",
      imageUrl: "https://picsum.photos/seed/polite/600/300"
    },
    {
      activityType: "PRODUCTION",
      word: "Apologize",
      question: "Điền từ còn thiếu: I must ______ for being late.",
      options: [],
      answer: "apologize",
      imageUrl: "https://picsum.photos/seed/apologize/600/300"
    }
  ],
  "Technology & Science": [
    {
      activityType: "DISCOVERY",
      word: "Resilient",
      ipa: "/rɪˈzɪl.jənt/",
      meaning: "Có khả năng phục hồi nhanh chóng",
      exampleSentence: "She is a very resilient girl; she recovered quickly from the illness.",
      question: "Dựa vào câu ví dụ, bạn đoán từ 'Resilient' có nghĩa là gì?",
      options: ["Yếu đuối", "Có khả năng phục hồi", "Thông minh", "Lười biếng"],
      answer: "Có khả năng phục hồi",
      imageUrl: "https://picsum.photos/seed/tech1/600/300"
    },
    {
      activityType: "RECOGNITION",
      word: "Meticulous",
      question: "Từ nào đồng nghĩa với 'Tỉ mỉ, cẩn thận'?",
      options: ["Careless", "Meticulous", "Sloppy", "Hasty"],
      answer: "Meticulous",
      imageUrl: "https://picsum.photos/seed/tech2/600/300"
    },
    {
      activityType: "PRODUCTION",
      word: "Flourish",
      question: "Điền từ còn thiếu: The business continues to _______ under new management.",
      options: [],
      answer: "flourish",
      imageUrl: "https://picsum.photos/seed/tech3/600/300"
    }
  ],
  "Travel & Culture": [
    {
      activityType: "DISCOVERY",
      word: "Destination",
      ipa: "/ˌdɛstɪˈneɪʃən/",
      meaning: "Điểm đến",
      exampleSentence: "Paris is a popular travel destination.",
      question: "Dựa vào câu ví dụ, từ 'Destination' có nghĩa là gì?",
      options: ["Xuất phát", "Đích đến", "Hành trình", "Khởi hành"],
      answer: "Đích đến",
      imageUrl: "https://picsum.photos/seed/travel1/600/300"
    },
    {
      activityType: "RECOGNITION",
      word: "Culture",
      question: "Từ nào đồng nghĩa với 'Nền văn hóa'?",
      options: ["Tradition", "Culture", "History", "Geography"],
      answer: "Culture",
      imageUrl: "https://picsum.photos/seed/travel2/600/300"
    },
    {
      activityType: "PRODUCTION",
      word: "Explore",
      question: "Điền từ còn thiếu: I love to ______ new cities during vacations.",
      options: [],
      answer: "explore",
      imageUrl: "https://picsum.photos/seed/travel3/600/300"
    }
  ],
  "Business English": [
    {
      activityType: "DISCOVERY",
      word: "Revenue",
      ipa: "/ˈrevənju/",
      meaning: "Doanh thu",
      exampleSentence: "The company's revenue increased by 10% last quarter.",
      question: "Dựa vào câu ví dụ, từ 'Revenue' có nghĩa là gì?",
      options: ["Chi phí", "Lợi nhuận", "Doanh thu", "Thuế"],
      answer: "Doanh thu",
      imageUrl: "https://picsum.photos/seed/biz1/600/300"
    },
    {
      activityType: "RECOGNITION",
      word: "Negotiation",
      question: "Từ nào đồng nghĩa với 'Đàm phán'?",
      options: ["Agreement", "Negotiation", "Contract", "Meeting"],
      answer: "Negotiation",
      imageUrl: "https://picsum.photos/seed/biz2/600/300"
    },
    {
      activityType: "PRODUCTION",
      word: "Invest",
      question: "Điền từ còn thiếu: Companies often ______ in research and development.",
      options: [],
      answer: "invest",
      imageUrl: "https://picsum.photos/seed/biz3/600/300"
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
    const topicKey = topic.replace(/&/g, "and"); // make a simple key
    const chosen = topicActivities[topicKey] || Object.values(topicActivities)[0];
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
          
          <h2 className="vocab-question">{currentActivity.question}</h2>
          
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
