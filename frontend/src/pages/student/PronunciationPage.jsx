import { useState, useEffect, useRef } from "react";
import { speakText } from "../../utils/sound";
import "../../styles/PronunciationPage.css";

const practiceSentences = [
  { id: 1, text: "I am passionate about learning new languages every day.", translation: "Tôi đam mê học các ngôn ngữ mới mỗi ngày.", level: "B1" },
  { id: 2, text: "Consistency and dedication are key factors to mastering English.", translation: "Sự kiên trì và tận tụy là yếu tố then chốt để thành thạo tiếng Anh.", level: "B2" },
  { id: 3, text: "Could you please explain how to improve my speaking skills?", translation: "Bạn có thể giải thích cách nâng cao kỹ năng nói của tôi không?", level: "A2" },
  { id: 4, text: "Technology has revolutionized the way we communicate globally.", translation: "Công nghệ đã cách mạng hóa cách chúng ta giao tiếp toàn cầu.", level: "C1" },
  { id: 5, text: "Practice makes perfect when you keep going forward.", translation: "Luyện tập tạo nên sự hoàn hảo khi bạn liên tục tiến lên.", level: "A1" },
];

function calculateSimilarity(str1, str2) {
  const clean1 = str1.toLowerCase().replace(/[^\w\s]/gi, "").trim();
  const clean2 = str2.toLowerCase().replace(/[^\w\s]/gi, "").trim();
  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 100;

  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);
  
  let matches = 0;
  words1.forEach((word) => {
    if (words2.includes(word)) matches += 1;
  });

  const accuracy = Math.round((matches / Math.max(words1.length, words2.length)) * 100);
  return Math.min(100, Math.max(0, accuracy));
}

export default function PronunciationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const currentSentence = practiceSentences[currentIndex];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setTranscript(text);
      };

      rec.onerror = (evt) => {
        console.warn("Speech recognition error:", evt);
        setIsRecording(false);
        setError("Không thể nhận diện giọng nói. Vui lòng kiểm tra micro.");
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  function handleListenSample() {
    speakText(currentSentence.text);
  }

  function startRecording() {
    setError("");
    setTranscript("");
    setScore(null);
    if (!recognitionRef.current) {
      setError("Trình duyệt của bạn không hỗ trợ Micro Speech Recognition.");
      return;
    }
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.warn(err);
    }
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (transcript.trim()) {
        const simScore = calculateSimilarity(currentSentence.text, transcript);
        setScore(simScore);
      }
    }
  }

  function handleCheckScore() {
    if (!transcript.trim()) {
      setError("Bạn chưa ghi âm. Hãy nhấn nút Ghi âm và nói mẫu câu.");
      return;
    }
    const simScore = calculateSimilarity(currentSentence.text, transcript);
    setScore(simScore);
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % practiceSentences.length);
    setTranscript("");
    setScore(null);
    setError("");
  }

  return (
    <div className="pronunciation-page">
      <div className="pronunciation-container">
        <section className="pronunciation-hero">
          <span className="page-badge">AI Speech</span>
          <h2>Luyện phát âm & Giao tiếp AI</h2>
          <p>Luyện nói tiếng Anh chuẩn Native với công nghệ AI nhận diện giọng nói và chấm điểm phát âm.</p>
        </section>

        {error && <div className="pronunciation-alert error">{error}</div>}

        <section className="pronunciation-card">
          <div className="sentence-header">
            <span className="level-badge">{currentSentence.level}</span>
            <span>Câu {currentIndex + 1} / {practiceSentences.length}</span>
          </div>

          <div className="sentence-body">
            <h3 className="target-text">{currentSentence.text}</h3>
            <p className="translation-text">{currentSentence.translation}</p>
          </div>

          <div className="sentence-actions">
            <button className="pron-btn listen-btn" type="button" onClick={handleListenSample}>
              🔊 Nghe mẫu chuẩn
            </button>

            {!isRecording ? (
              <button className="pron-btn record-btn" type="button" onClick={startRecording}>
                🎙️ Bắt đầu phát âm
              </button>
            ) : (
              <button className="pron-btn stop-btn" type="button" onClick={stopRecording}>
                ⏹️ Dừng & Chấm điểm
              </button>
            )}
          </div>

          {isRecording && (
            <div className="recording-status">
              <span className="pulse-dot" />
              <span>Đang lắng nghe giọng nói của bạn... Hãy phát âm câu trên!</span>
            </div>
          )}

          {transcript && (
            <div className="transcript-box">
              <small>Giọng nói nhận diện được:</small>
              <p>"{transcript}"</p>
              {!score && (
                <button className="pron-btn check-btn" type="button" onClick={handleCheckScore}>
                  🔍 Chấm điểm phát âm
                </button>
              )}
            </div>
          )}

          {score !== null && (
            <div className={`score-result-card ${score >= 70 ? "pass" : "retry"}`}>
              <div className="score-circle">
                <strong>{score}%</strong>
                <small>Chính xác</small>
              </div>
              <div className="score-details">
                <h4>{score >= 85 ? "Phát âm xuất sắc! 🎉" : score >= 70 ? "Phát âm tốt! 👍" : "Hãy luyện tập thêm nhé! 💪"}</h4>
                <p>
                  {score >= 70
                    ? "Bạn phát âm rất chuẩn ngữ điệu và từ vựng. Tiếp tục phát huy nhé!"
                    : "Một số từ phát âm chưa rõ. Hãy nhấn 'Nghe mẫu chuẩn' và thử lại."}
                </p>
              </div>
            </div>
          )}

          <div className="card-footer">
            <button className="pron-btn next-btn" type="button" onClick={handleNext}>
              Câu tiếp theo ➔
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
