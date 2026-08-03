import React, { useState, useEffect, useRef } from "react";
import { speakText } from "../../utils/sound";
import "../../styles/PronunciationPage.css";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const practiceSentences = [
  {
    id: 1,
    text: "I am passionate about learning new languages every day.",
    ipa: "/aɪ æm ˈpæʃənət əˈbaʊt ˈlɜːnɪŋ njuː ˈlæŋɡwɪʤɪz ˈɛvri deɪ/",
    translation: "Tôi đam mê học các ngôn ngữ mới mỗi ngày.",
    level: "B1",
    topic: "Giao tiếp hàng ngày",
  },
  {
    id: 2,
    text: "Consistency and dedication are key factors to mastering English.",
    ipa: "/kənˈsɪstənsi ænd ˌdɛdɪˈkeɪʃən ɑː kiː ˈfæktəz tuː ˈmɑːstərɪŋ ˈɪŋɡlɪʃ/",
    translation: "Sự kiên trì và tận tụy là yếu tố then chốt để thành thạo tiếng Anh.",
    level: "B2",
    topic: "Học tập & Phát triển",
  },
  {
    id: 3,
    text: "Could you please explain how to improve my speaking skills?",
    ipa: "/kʊd juː pliːz ɪkˈspleɪn haʊ tuː ɪmˈpruːv maɪ ˈspiːkɪŋ skɪlz/",
    translation: "Bạn có thể giải thích cách nâng cao kỹ năng nói của tôi không?",
    level: "A2",
    topic: "Giao tiếp hàng ngày",
  },
  {
    id: 4,
    text: "Technology has revolutionized the way we communicate globally.",
    ipa: "/tɛkˈnɒləʤi hæz ˌrɛvəˈluːʃənaɪzd ðə weɪ wiː kəˈmjuːnɪkeɪt ˈɡləʊbəli/",
    translation: "Công nghệ đã cách mạng hóa cách chúng ta giao tiếp toàn cầu.",
    level: "C1",
    topic: "Công nghệ & Xã hội",
  },
  {
    id: 5,
    text: "Practice makes perfect when you keep going forward.",
    ipa: "/ˈpræktɪs meɪks ˈpɜːfɪkt wɛn juː kiːp ˈɡəʊɪŋ ˈfɔːwəd/",
    translation: "Luyện tập tạo nên sự hoàn hảo khi bạn liên tục tiến lên.",
    level: "A1",
    topic: "Tục ngữ & Động lực",
  },
  {
    id: 6,
    text: "Effective communication requires active listening and clear expression.",
    ipa: "/ɪˈfɛktɪv kəˌmjuːnɪˈkeɪʃən rɪˈkwaɪəz ˈæktɪv ˈlɪsnɪŋ ænd klɪər ɪksˈprɛʃən/",
    translation: "Giao tiếp hiệu quả đòi hỏi sự lắng nghe chủ động và diễn đạt rõ ràng.",
    level: "B2",
    topic: "Kỹ năng làm việc",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Normalize string: lowercase, strip punctuation */
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/** Clean a specific word for comparison */
function cleanWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Levenshtein distance for fuzzy word match */
function levenshtein(a, b) {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  const dp = Array.from({ length: la + 1 }, (_, i) =>
    Array.from({ length: lb + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[la][lb];
}

/**
 * Align target words and spoken words using Dynamic Programming (Sequence Alignment)
 * to return actual and precise matching status.
 */
function alignWords(targetWords, spokenWords) {
  const n = targetWords.length;
  const m = spokenWords.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  const matchScore = (tWord, sWord) => {
    const tw = cleanWord(tWord);
    const sw = cleanWord(sWord);
    if (!tw || !sw) return 0;
    if (tw === sw) return 2; // Exact match
    const tol = Math.max(1, Math.floor(tw.length / 4));
    if (levenshtein(tw, sw) <= tol) return 1; // Fuzzy match
    return 0;
  };

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const score = matchScore(targetWords[i - 1], spokenWords[j - 1]);
      if (score > 0) {
        dp[i][j] = dp[i - 1][j - 1] + score;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const wordAnalysis = Array(n).fill(null);
  let i = n, j = m;
  while (i > 0) {
    if (j > 0) {
      const score = matchScore(targetWords[i - 1], spokenWords[j - 1]);
      if (score > 0 && dp[i][j] === dp[i - 1][j - 1] + score) {
        wordAnalysis[i - 1] = {
          word: targetWords[i - 1],
          status: "correct",
          closestSpoken: spokenWords[j - 1],
        };
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j])) {
      wordAnalysis[i - 1] = {
        word: targetWords[i - 1],
        status: "missing",
        closestSpoken: "",
      };
      i--;
    } else {
      j--;
    }
  }

  return wordAnalysis;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PronunciationPage() {
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Recording states: idle | countdown | listening | processing | result
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);

  // Real voice transcripts
  const [spokenText, setSpokenText] = useState("");
  const [interimText, setInterimText] = useState("");

  // Cumulative verified word indices that user pronounced correctly
  const [verifiedIndices, setVerifiedIndices] = useState(new Set());

  // Result and score of the current/last speech
  const [analysis, setAnalysis] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | "wrong" | "pass"
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Audio visualizer
  const [audioVolume, setAudioVolume] = useState(0);
  const [micPermission, setMicPermission] = useState("unknown"); // unknown | granted | denied

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const countdownRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const isStoppingRef = useRef(false);

  const filteredSentences =
    selectedLevel === "ALL"
      ? practiceSentences
      : practiceSentences.filter((s) => s.level === selectedLevel);

  const safeIndex = Math.min(currentIndex, filteredSentences.length - 1);
  const currentSentence = filteredSentences[safeIndex] || practiceSentences[0];

  const targetWords = currentSentence.text.split(/\s+/);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  // ── Reset state when changing sentence/level ──
  useEffect(() => {
    stopAllMedia();
    setPhase("idle");
    setSpokenText("");
    setInterimText("");
    setVerifiedIndices(new Set());
    setAnalysis(null);
    setFeedback(null);
    setFeedbackMsg("");
    setAttempts(0);
    setAudioVolume(0);
    finalTranscriptRef.current = "";
    isStoppingRef.current = false;
  }, [currentIndex, selectedLevel]);

  // ─────────────────────────────────────────────────────────────────────────
  // Media Controllers
  // ─────────────────────────────────────────────────────────────────────────
  function stopAllMedia() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setAudioVolume(0);
  }

  async function startVolumeMonitor() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStreamRef.current = stream;
      setMicPermission("granted");

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return stream;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      function tick() {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        setAudioVolume(Math.min(100, Math.round((avg / 80) * 100)));
        animFrameRef.current = requestAnimationFrame(tick);
      }
      tick();
      return stream;
    } catch (err) {
      setMicPermission("denied");
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Voice Recognition Core
  // ─────────────────────────────────────────────────────────────────────────
  async function doStartListening() {
    finalTranscriptRef.current = "";
    isStoppingRef.current = false;
    setSpokenText("");
    setInterimText("");

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setPhase("result");
      setSpokenText("(Trình duyệt không hỗ trợ nhận diện giọng nói)");
      setFeedbackMsg("Trình duyệt của bạn không hỗ trợ Web Speech API. Vui lòng dùng Chrome hoặc Edge.");
      setFeedback("wrong");
      speakText("Bạn phát âm sai rồi", "vi-VN", 1.0);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 3;

      rec.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += t + " ";
          } else {
            interim += t;
          }
        }
        if (final) {
          finalTranscriptRef.current += final;
          setSpokenText(finalTranscriptRef.current.trim());
        }
        setInterimText(interim);
      };

      rec.onerror = (evt) => {
        if (["no-speech", "aborted"].includes(evt.error)) return;
        console.warn("SpeechRecognition error:", evt.error);
      };

      rec.onend = () => {
        if (!isStoppingRef.current && phase === "listening") {
          try {
            rec.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = rec;
      rec.start();
      setPhase("listening");
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setPhase("idle");
    }
  }

  async function handleStartRecording() {
    setFeedback(null);
    setFeedbackMsg("");
    setAnalysis(null);
    setSpokenText("");
    setInterimText("");
    finalTranscriptRef.current = "";
    isStoppingRef.current = false;

    try {
      await startVolumeMonitor();
    } catch (_) {
      setFeedbackMsg("⚠️ Không thể truy cập microphone. Vui lòng cấp quyền mic và thử lại.");
      return;
    }

    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        doStartListening();
      }
    }, 1000);
  }

  async function handleStopRecording() {
    isStoppingRef.current = true;
    setPhase("processing");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    // Short wait to capture last chunks
    await new Promise((r) => setTimeout(r, 600));

    const spoken = (finalTranscriptRef.current || "").trim();
    const interim = interimText.trim();
    const finalText = spoken || interim;

    setInterimText("");
    setSpokenText(finalText);

    if (!finalText) {
      setAttempts((a) => a + 1);
      setFeedback("wrong");
      setFeedbackMsg("Không nhận diện được giọng nói nào. Vui lòng nói to và rõ hơn.");
      speakText("Bạn phát âm sai rồi", "vi-VN", 1.0);
      setPhase("result");
      return;
    }

    // ───────────────────────────────────────────────────────────────────────
    // Actual & Precise Comparison using dynamic programming sequence alignment
    // ───────────────────────────────────────────────────────────────────────
    const spokenWords = normalize(finalText).split(/\s+/).filter(Boolean);
    const wordAnalysis = alignWords(targetWords, spokenWords);

    // Update verified indices (unlock correct words)
    const newVerified = new Set(verifiedIndices);
    wordAnalysis.forEach((item, idx) => {
      if (item.status === "correct") {
        newVerified.add(idx);
      }
    });
    setVerifiedIndices(newVerified);

    const matchedCount = wordAnalysis.filter((w) => w.status === "correct").length;
    const score = Math.round((matchedCount / targetWords.length) * 100);

    const resultAnalysis = {
      score,
      wordAnalysis,
      matchedCount,
    };
    setAnalysis(resultAnalysis);
    setAttempts((a) => a + 1);

    // Check if the whole sentence is successfully verified (unlocked)
    const allUnlocked = newVerified.size === targetWords.length;

    if (allUnlocked) {
      setFeedback("pass");
      setFeedbackMsg("🎉 Chúc mừng! Bạn đã phát âm chuẩn xác toàn bộ câu!");
      setPhase("result");
      // Speak the correct English TTS as confirmation
      speakText(currentSentence.text, "en-US", 0.9);
    } else {
      setFeedback("wrong");
      // Find remaining words that are not unlocked yet
      const missingWords = targetWords
        .map((w, idx) => ({ w, idx }))
        .filter((item) => !newVerified.has(item.idx))
        .map((item) => item.w);

      const hintText = missingWords.slice(0, 3).join(", ");
      setFeedbackMsg(
        `Phát âm chưa đạt chuẩn. Hãy tập trung luyện lại các từ: ${hintText}${
          missingWords.length > 3 ? "..." : ""
        }`
      );
      setPhase("result");
      // Speak Vietnamese error sound feedback
      speakText("Bạn phát âm sai rồi", "vi-VN", 1.0);
    }
  }

  function handleRetry() {
    stopAllMedia();
    setPhase("idle");
    setSpokenText("");
    setInterimText("");
    setAnalysis(null);
    setFeedback(null);
    setFeedbackMsg("");
    finalTranscriptRef.current = "";
    isStoppingRef.current = false;
    setAudioVolume(0);
    
    // Automatically trigger re-recording
    setTimeout(() => {
      handleStartRecording();
    }, 100);
  }

  function handleResetProgress() {
    setVerifiedIndices(new Set());
    handleRetry();
  }

  function handleListenSample(rate = 0.9) {
    speakText(currentSentence.text, "en-US", rate);
  }

  function handleNext() {
    stopAllMedia();
    setCurrentIndex((prev) => (prev < filteredSentences.length - 1 ? prev + 1 : 0));
  }

  function handlePrev() {
    stopAllMedia();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredSentences.length - 1));
  }

  // Visual waves multipliers
  const WAVE_MULT = [0.5, 1.2, 0.8, 1.6, 1.0, 0.6, 1.4, 0.9, 1.1, 0.7];

  return (
    <div className="pronunciation-page">
      <div className="pronunciation-container">
        {/* Banner Hero */}
        <section className="pronunciation-hero">
          <span className="page-badge">AI Speech & Pronunciation</span>
          <h2>Luyện Phát Âm & Giao Tiếp AI</h2>
          <p>
            Hệ thống nhận dạng giọng nói chuẩn xác. Khi bạn phát âm đúng, từ đó mới hiển thị chính thức ra
            màn hình. Hãy luyện tập cho tới khi mở khóa toàn bộ câu!
          </p>
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
                transition: "all 0.15s ease",
              }}
            >
              {lvl === "ALL" ? "Tất cả bài luyện" : lvl}
            </button>
          ))}
        </div>

        {/* Mic permission warning */}
        {micPermission === "denied" && (
          <div
            style={{
              background: "#fef2f2",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #fecdd3",
              fontSize: "0.88rem",
            }}
          >
            ⚠️ Microphone bị chặn. Vui lòng cấp quyền truy cập microphone trên trình duyệt và tải lại trang.
          </div>
        )}

        {/* Practice Card */}
        <section className="pronunciation-card">
          <div className="sentence-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="level-badge">{currentSentence.level}</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  background: "#f1f5f9",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  color: "#475569",
                  fontWeight: 600,
                }}
              >
                {currentSentence.topic}
              </span>
            </div>
            <span>
              Câu {safeIndex + 1} / {filteredSentences.length}
            </span>
          </div>

          {/* Target Sentence & Translation */}
          <div className="sentence-body" style={{ padding: "1.5rem 0" }}>
            {/* Guide Sentence (Static, dimmed/small) */}
            <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 600, marginBottom: "8px" }}>
              CÂU CẦN ĐỌC:
            </div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#64748b", margin: "0 0 1.5rem 0" }}>
              {currentSentence.text}
            </h4>

            {/* Unlocked Sentence Display: Only words pronounced correctly are fully shown */}
            <div style={{ fontSize: "0.9rem", color: "#0d9488", fontWeight: 800, marginBottom: "8px" }}>
              TIẾN ĐỘ PHÁT ÂM CHUẨN CỦA BẠN:
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "10px",
                margin: "0.5rem 0 1.5rem 0",
              }}
            >
              {targetWords.map((word, idx) => {
                const isUnlocked = verifiedIndices.has(idx);
                return (
                  <span
                    key={idx}
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: isUnlocked ? "#0f766e" : "#cbd5e1",
                      borderBottom: `3px solid ${isUnlocked ? "#0d9488" : "#cbd5e1"}`,
                      padding: "0 4px pb-2",
                      letterSpacing: "0.02em",
                      transition: "all 0.3s ease",
                    }}
                    title={isUnlocked ? "Đã phát âm đúng" : "Chưa mở khóa"}
                  >
                    {isUnlocked ? word : "_".repeat(Math.max(2, word.replace(/[^a-zA-Z]/g, "").length))}
                  </span>
                );
              })}
            </div>

            {/* IPA phonetics */}
            <div
              style={{
                fontSize: "0.95rem",
                color: "#0d9488",
                fontFamily: "monospace",
                fontWeight: 700,
                margin: "0.5rem 0",
                background: "#f0fdfa",
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: "8px",
                border: "1px solid #ccfbf1",
              }}
            >
              {currentSentence.ipa}
            </div>

            <p className="translation-text" style={{ fontSize: "1rem", marginTop: "8px", color: "#475569" }}>
              {currentSentence.translation}
            </p>
          </div>

          {/* Actions */}
          <div className="sentence-actions">
            <button
              className="pron-btn listen-btn"
              type="button"
              onClick={() => handleListenSample(0.9)}
              disabled={phase === "countdown" || phase === "listening"}
            >
              🔊 Nghe mẫu (1.0x)
            </button>
            <button
              className="pron-btn listen-btn"
              type="button"
              onClick={() => handleListenSample(0.6)}
              disabled={phase === "countdown" || phase === "listening"}
              style={{ background: "#f8fafc" }}
            >
              🐢 Nghe chậm (0.65x)
            </button>

            {(phase === "idle" || phase === "result") && (
              <button className="pron-btn record-btn" type="button" onClick={handleStartRecording}>
                🎙️ {attempts > 0 ? "Nói lại" : "Bắt đầu phát âm"}
              </button>
            )}

            {(phase === "countdown" || phase === "listening") && (
              <button className="pron-btn stop-btn" type="button" onClick={handleStopRecording}>
                ⏹️ Dừng & Chấm điểm
              </button>
            )}

            {phase === "processing" && (
              <button
                className="pron-btn"
                type="button"
                disabled
                style={{ background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }}
              >
                ⏳ Đang phân tích...
              </button>
            )}
          </div>

          {/* Countdown view */}
          {phase === "countdown" && (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                background: "linear-gradient(135deg, #e0e7ff, #f0fdfa)",
                borderRadius: "16px",
                border: "2px solid #a5b4fc",
                margin: "1rem 0",
              }}
            >
              <div style={{ fontSize: "4.5rem", fontWeight: 900, color: "#4f46e5", lineHeight: 1 }}>
                {countdown}
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#334155", marginTop: "10px" }}>
                Chuẩn bị… Hãy nhìn vào câu mẫu và đọc to khi microphone kích hoạt!
              </p>
            </div>
          )}

          {/* Real-time Listening view */}
          {phase === "listening" && (
            <div
              style={{
                background: "#fef2f2",
                padding: "1.2rem",
                borderRadius: "14px",
                border: "2px solid #fecdd3",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                margin: "1rem 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <span className="pulse-dot" />
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#991b1b" }}>
                  🔴 Đang ghi âm & Nhận diện giọng nói...
                </span>
                {/* Visualizer wave */}
                <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "24px" }}>
                  {WAVE_MULT.map((mult, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: "4px",
                        borderRadius: "4px",
                        background: audioVolume > 10 ? "#0d9488" : "#f87171",
                        height: `${Math.min(24, Math.max(4, (audioVolume + 12) * mult))}px`,
                        transition: "height 0.07s ease",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Real-time Spoken Text */}
              <div
                style={{
                  minHeight: "54px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "2px solid #0d9488",
                  padding: "12px 16px",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#0f766e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(13, 148, 136, 0.1)",
                }}
              >
                {spokenText || interimText ? (
                  <span style={{ wordBreak: "break-word" }}>
                    "{spokenText}
                    {interimText && <span style={{ color: "#94a3b8", fontWeight: 500 }}> {interimText}</span>}"
                  </span>
                ) : (
                  <span style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500, fontStyle: "italic" }}>
                    (Hãy đọc to câu tiếng Anh ở trên...)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Analysis Result Card */}
          {phase === "result" && feedback && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "1rem 0" }}>
              {/* Feedback box */}
              <div
                style={{
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: `2px solid ${feedback === "pass" ? "#10b981" : "#f43f5e"}`,
                  boxShadow:
                    feedback === "pass"
                      ? "0 4px 20px rgba(16,185,129,0.15)"
                      : "0 4px 20px rgba(244,63,94,0.12)",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    background:
                      feedback === "pass"
                        ? "linear-gradient(90deg, #059669, #10b981)"
                        : "linear-gradient(90deg, #e11d48, #f43f5e)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    {feedback === "pass" ? "✅ Phát âm chính xác!" : "❌ Chưa chuẩn — Hãy thử lại nhé!"}
                  </span>
                  <span style={{ fontSize: "1.4rem", fontWeight: 900 }}>{analysis?.score || 0}%</span>
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    background: feedback === "pass" ? "#f0fdf4" : "#fff1f2",
                    fontSize: "0.92rem",
                    color: "#334155",
                    lineHeight: 1.6,
                  }}
                >
                  {feedbackMsg}
                </div>
              </div>

              {/* What system heard */}
              {spokenText && (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginBottom: "4px" }}>
                    🎤 HỆ THỐNG GHI NHẬN ĐƯỢC:
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", fontStyle: "italic" }}>
                    "{spokenText}"
                  </div>
                </div>
              )}

              {/* Word Highlight Analysis */}
              {analysis && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "1.2rem",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "#475569",
                      marginBottom: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Phân tích chi tiết từng từ ở lượt nói này:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {analysis.wordAnalysis.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          background: item.status === "correct" ? "#dcfce7" : "#fee2e2",
                          color: item.status === "correct" ? "#15803d" : "#b91c1c",
                          border: `1px solid ${item.status === "correct" ? "#86efac" : "#fca5a5"}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        <span>
                          {item.word} {item.status === "correct" ? "✓" : "✗"}
                        </span>
                        {item.status === "missing" && item.closestSpoken && (
                          <span style={{ fontSize: "0.72rem", fontWeight: 500, color: "#b91c1c", opacity: 0.8 }}>
                            (nghe: "{item.closestSpoken}")
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons on result */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.5rem",
                }}
              >
                <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                  🔄 Số lần luyện câu này: <strong>{attempts}</strong>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {feedback !== "pass" && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      style={{
                        padding: "10px 22px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#4f46e5",
                        color: "#fff",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
                      }}
                    >
                      🎙️ Nói lại các từ chưa đúng
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetProgress}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      color: "#475569",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🔁 Luyện lại từ đầu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div
            className="card-footer"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.5rem",
            }}
          >
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
