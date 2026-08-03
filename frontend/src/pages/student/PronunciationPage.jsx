import React, { useState, useEffect, useRef } from "react";
import { speakText } from "../../utils/sound";
import "../../styles/PronunciationPage.css";

const practiceSentences = [
  {
    id: 1,
    text: "I am passionate about learning new languages every day.",
    ipa: "/aɪ æm ˈpæʃənət əˈbaʊt ˈlɜːnɪŋ njuː ˈlæŋɡwɪʤɪz ˈɛvri deɪ/",
    translation: "Tôi đam mê học các ngôn ngữ mới mỗi ngày.",
    level: "B1",
    topic: "Giao tiếp hàng ngày"
  },
  {
    id: 2,
    text: "Consistency and dedication are key factors to mastering English.",
    ipa: "/kənˈsɪstənsi ænd ˌdɛdɪˈkeɪʃən ɑː kiː ˈfæktəz tuː ˈmɑːstərɪŋ ˈɪŋɡlɪʃ/",
    translation: "Sự kiên trì và tận tụy là yếu tố then chốt để thành thạo tiếng Anh.",
    level: "B2",
    topic: "Học tập & Phát triển"
  },
  {
    id: 3,
    text: "Could you please explain how to improve my speaking skills?",
    ipa: "/kʊd juː pliːz ɪkˈspleɪn haʊ tuː ɪmˈpruːv maɪ ˈspiːkɪŋ skɪlz/",
    translation: "Bạn có thể giải thích cách nâng cao kỹ năng nói của tôi không?",
    level: "A2",
    topic: "Giao tiếp hàng ngày"
  },
  {
    id: 4,
    text: "Technology has revolutionized the way we communicate globally.",
    ipa: "/tɛkˈnɒləʤi hæz ˌrɛvəˈluːʃənaɪzd ðə weɪ wiː kəˈmjuːnɪkeɪt ˈɡləʊbəli/",
    translation: "Công nghệ đã cách mạng hóa cách chúng ta giao tiếp toàn cầu.",
    level: "C1",
    topic: "Công nghệ & Xã hội"
  },
  {
    id: 5,
    text: "Practice makes perfect when you keep going forward.",
    ipa: "/ˈpræktɪs meɪks ˈpɜːfɪkt wɛn juː kiːp ˈɡəʊɪŋ ˈfɔːwəd/",
    translation: "Luyện tập tạo nên sự hoàn hảo khi bạn liên tục tiến lên.",
    level: "A1",
    topic: "Tục ngữ & Động lực"
  },
  {
    id: 6,
    text: "Effective communication requires active listening and clear expression.",
    ipa: "/ɪˈfɛktɪv kəˌmjuːnɪˈkeɪʃən rɪˈkwaɪəz ˈæktɪv ˈlɪsnɪŋ ænd klɪər ɪksˈprɛʃən/",
    translation: "Giao tiếp hiệu quả đòi hỏi sự lắng nghe chủ động và diễn đạt rõ ràng.",
    level: "B2",
    topic: "Kỹ năng làm việc"
  }
];

function cleanWord(word) {
  return word.toLowerCase().replace(/[^\w]/g, "");
}

function analyzePronunciation(targetText, userText) {
  if (!targetText || !userText) return { score: 0, wordAnalysis: [] };

  const targetWords = targetText.split(/\s+/);
  const userWords = userText.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);

  let matchCount = 0;
  const wordAnalysis = targetWords.map((word) => {
    const clean = cleanWord(word);
    const found = userWords.includes(clean);
    if (found) matchCount += 1;
    return {
      word,
      status: found ? "correct" : "missing"
    };
  });

  const accuracy = Math.round((matchCount / targetWords.length) * 100);
  return {
    score: Math.min(100, Math.max(0, accuracy)),
    wordAnalysis
  };
}

export default function PronunciationPage() {
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState(0.9);
  const [showSimulateInput, setShowSimulateInput] = useState(false);
  const [simulatedText, setSimulatedText] = useState("");

  const recognitionRef = useRef(null);

  // Filter sentences by level
  const filteredSentences = selectedLevel === "ALL"
    ? practiceSentences
    : practiceSentences.filter((s) => s.level === selectedLevel);

  const safeIndex = Math.min(currentIndex, filteredSentences.length - 1);
  const currentSentence = filteredSentences[safeIndex] || practiceSentences[0];

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
        if (evt.error === "not-allowed") {
          setError("Chưa cấp quyền Micro. Vui lòng cho phép trình duyệt truy cập Micro.");
        } else {
          setError("Không thể nhận diện giọng nói. Vui lòng thử lại hoặc dùng chế độ mô phỏng.");
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Auto score when transcript is finalized and recording stops
  useEffect(() => {
    if (!isRecording && transcript.trim()) {
      const res = analyzePronunciation(currentSentence.text, transcript);
      setAnalysis(res);
    }
  }, [isRecording, transcript, currentSentence]);

  function handleListenSample(speed = 0.9) {
    setPlaybackSpeed(speed);
    speakText(currentSentence.text, "en-US", speed);
  }

  function startRecording() {
    setError("");
    setTranscript("");
    setAnalysis(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Trình duyệt không hỗ trợ nhận diện giọng nói tự động. Bạn có thể sử dụng ô gõ văn bản bên dưới để kiểm tra phát âm!");
      setShowSimulateInput(true);
      return;
    }

    // Safely cleanup existing recognition instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      let finalCapturedText = "";

      rec.onresult = (event) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        finalCapturedText = currentText;
        setTranscript(currentText);
      };

      rec.onerror = (evt) => {
        console.warn("Speech recognition error:", evt);
        if (evt.error === "no-speech") {
          // Keep recording active during silence
          return;
        }
        setIsRecording(false);
        if (evt.error === "not-allowed") {
          setError("Chưa cấp quyền Micro. Vui lòng nhấn biểu tượng Micro trên ổ khóa địa chỉ trang web để Cho phép (Allow).");
          setShowSimulateInput(true);
        } else if (evt.error !== "aborted") {
          setError("Kết nối Micro bị ngắt. Vui lòng nhấn nút Bắt đầu để thử lại.");
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (finalCapturedText.trim()) {
          const res = analyzePronunciation(currentSentence.text, finalCapturedText.trim());
          setAnalysis(res);
        }
      };

      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Recording start failed:", err);
      setIsRecording(false);
      setError("Không thể khởi động Micro. Bạn có thể dùng ô gõ mô phỏng bên dưới.");
      setShowSimulateInput(true);
    }
  }

  function stopRecording() {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }

  function handleSimulatedSubmit(e) {
    e.preventDefault();
    if (!simulatedText.trim()) return;
    setTranscript(simulatedText.trim());
    const res = analyzePronunciation(currentSentence.text, simulatedText.trim());
    setAnalysis(res);
    setShowSimulateInput(false);
  }

  function handleNext() {
    if (currentIndex < filteredSentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    resetState();
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredSentences.length - 1);
    }
    resetState();
  }

  function resetState() {
    setTranscript("");
    setAnalysis(null);
    setError("");
    setSimulatedText("");
  }

  function handleQuickDemo() {
    setError("");
    setShowSimulateInput(false);
    const demoText = currentSentence.text;
    setTranscript(demoText);
    const res = analyzePronunciation(currentSentence.text, demoText);
    setAnalysis(res);
  }

  return (
    <div className="pronunciation-page">
      <div className="pronunciation-container">
        {/* Banner Hero */}
        <section className="pronunciation-hero">
          <span className="page-badge">AI Speech & Pronunciation</span>
          <h2>Luyện Phát Âm & Giao Tiếp AI</h2>
          <p>Luyện nói tiếng Anh chuẩn Native với công nghệ AI nhận diện giọng nói, hỗ trợ phát âm IPA và chấm điểm chi tiết từng từ.</p>
        </section>

        {/* Level Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", margin: "0.25rem 0" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>Trình độ:</span>
          {["ALL", "A1", "A2", "B1", "B2", "C1"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                resetState();
              }}
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: 700,
                border: selectedLevel === lvl ? "1px solid #0d9488" : "1px solid #cbd5e1",
                background: selectedLevel === lvl ? "#0d9488" : "#ffffff",
                color: selectedLevel === lvl ? "#ffffff" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {lvl === "ALL" ? "Tất cả bài luyện" : lvl}
            </button>
          ))}
        </div>

        {error && (
          <div className="pronunciation-alert error" style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 14px", borderRadius: "12px", border: "1px solid #fecdd3", fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>⚠️ {error}</span>
            <button type="button" onClick={() => setShowSimulateInput(true)} style={{ background: "#991b1b", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 700 }}>
              Mở chế độ gõ kiểm tra
            </button>
          </div>
        )}

        {/* Practice Card */}
        <section className="pronunciation-card">
          <div className="sentence-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="level-badge">{currentSentence.level}</span>
              <span style={{ fontSize: "0.8rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", color: "#475569", fontWeight: 600 }}>
                {currentSentence.topic}
              </span>
            </div>
            <span>Câu {safeIndex + 1} / {filteredSentences.length}</span>
          </div>

          <div className="sentence-body">
            <h3 className="target-text">{currentSentence.text}</h3>

            {/* IPA Phonetics */}
            <div style={{ fontSize: "0.95rem", color: "#0d9488", fontFamily: "monospace", fontWeight: 700, margin: "0.2rem 0 0.6rem 0", background: "#f0fdfa", display: "inline-block", padding: "3px 12px", borderRadius: "8px", border: "1px solid #ccfbf1" }}>
              {currentSentence.ipa}
            </div>

            <p className="translation-text">{currentSentence.translation}</p>
          </div>

          {/* Audio & Mic Actions */}
          <div className="sentence-actions">
            <button className="pron-btn listen-btn" type="button" onClick={() => handleListenSample(0.9)} title="Nghe với tốc độ chuẩn">
              🔊 Nghe mẫu (1.0x)
            </button>

            <button className="pron-btn listen-btn" type="button" onClick={() => handleListenSample(0.65)} style={{ background: "#f8fafc" }} title="Nghe chậm để luyện từng từ">
              🐢 Nghe chậm (0.75x)
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

            <button className="pron-btn demo-btn" type="button" onClick={handleQuickDemo} style={{ background: "#e0e7ff", color: "#3730a3", border: "1px solid #c7d2fe" }} title="Thử chấm điểm với câu mẫu">
              🧪 Thử phát âm mẫu
            </button>
          </div>

          {isRecording && (
            <div className="recording-status" style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fef2f2", color: "#991b1b", padding: "1.1rem", borderRadius: "14px", border: "1px solid #fecdd3", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 800, fontSize: "0.92rem" }}>
                <span className="pulse-dot" />
                <span>🔴 Đang ghi âm & Nhận diện giọng nói theo thời gian thực...</span>
              </div>

              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#7f1d1d", padding: "10px 14px", background: "#ffffff", borderRadius: "12px", border: "1.5px dashed #fca5a5", minHeight: "42px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                {transcript ? (
                  <span style={{ wordBreak: "break-word" }}>"{transcript}"</span>
                ) : (
                  <span style={{ fontSize: "0.88rem", color: "#94a3b8", fontWeight: 500, fontStyle: "italic" }}>
                    (Hãy đọc to câu tiếng Anh trên, chữ của bạn sẽ tự động xuất hiện ở đây theo thời gian thực...)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Simulated Speech Input for Unsupported Browsers */}
          {showSimulateInput && (
            <form onSubmit={handleSimulatedSubmit} style={{ marginTop: "1rem", padding: "12px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                🧪 Chế độ mô phỏng phát âm (Gõ từ bạn vừa nói để kiểm tra):
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={simulatedText}
                  onChange={(e) => setSimulatedText(e.target.value)}
                  placeholder={currentSentence.text}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
                <button type="submit" style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                  Chấm điểm
                </button>
              </div>
            </form>
          )}

          {/* Final Recognized Transcript & Analysis */}
          {!isRecording && transcript && (
            <div className="transcript-box">
              <small>Giọng nói nhận diện được:</small>
              <p>"{transcript}"</p>
            </div>
          )}

          {/* Detailed Score Result Card */}
          {analysis && (
            <div className={`score-result-card ${analysis.score >= 70 ? "pass" : "retry"}`}>
              <div className="score-circle">
                <strong style={{ color: analysis.score >= 70 ? "#059669" : "#e11d48" }}>{analysis.score}%</strong>
                <small>Chính xác</small>
              </div>

              <div className="score-details" style={{ flex: 1 }}>
                <h4>
                  {analysis.score >= 85 ? "Phát âm xuất sắc! 🎉" : analysis.score >= 70 ? "Phát âm khá tốt! 👍" : "Cần luyện tập thêm nhé! 💪"}
                </h4>
                <p style={{ fontSize: "0.88rem", marginBottom: "0.6rem" }}>
                  {analysis.score >= 70
                    ? "Bạn phát âm đúng hầu hết các từ. Hãy chú ý nối âm và ngữ điệu để tự nhiên hơn!"
                    : "Một số từ phát âm chưa chính xác. Nhấn 'Nghe chậm' để luyện từng từ nhé."}
                </p>

                {/* Word by Word Highlight Analysis */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {analysis.wordAnalysis.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        background: item.status === "correct" ? "#dcfce7" : "#fee2e2",
                        color: item.status === "correct" ? "#15803d" : "#b91c1c",
                        border: `1px solid ${item.status === "correct" ? "#86efac" : "#fca5a5"}`
                      }}
                    >
                      {item.word} {item.status === "correct" ? "✓" : "✗"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button className="pron-btn listen-btn" type="button" onClick={handlePrev}>
              ⬅️ Câu trước
            </button>

            <button className="pron-btn next-btn" type="button" onClick={handleNext}>
              Câu tiếp theo ➔
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
