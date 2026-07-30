import { useEffect, useRef, useState } from "react";
import { deleteAiConversation, getAiConversation, getAiConversations, getAiUsage, sendAiChat } from "../../services/aiService";
import "../../styles/ChatbotPage.css";

const LEVELS = [
  { code: "A1", name: "A1 - Căn bản (Beginner)" },
  { code: "A2", name: "A2 - Sơ cấp (Elementary)" },
  { code: "B1", name: "B1 - Trung cấp (Intermediate)" },
  { code: "B2", name: "B2 - Trung cao cấp (Upper-Inter)" },
  { code: "C1", name: "C1 - Cao cấp (Advanced)" },
];

const TOPICS = [
  { id: "Daily life", name: "💬 Giao tiếp hàng ngày" },
  { id: "Travel", name: "✈️ Du lịch & Đặt phòng" },
  { id: "IELTS Speaking", name: "🎯 Luyện thi IELTS Speaking" },
  { id: "Business", name: "💼 Tiếng Anh Thương mại" },
  { id: "Grammar correction", name: "✍️ Sửa lỗi ngữ pháp & Câu" },
];

const SUGGESTIONS = [
  {
    icon: "🔊",
    title: "Nghe đọc & Phát âm từ",
    prompt: "Hướng dẫn phát âm chuẩn và cách dùng từ 'hello' trong tiếng Anh",
  },
  {
    icon: "✍️",
    title: "Sửa lỗi ngữ pháp",
    prompt: "Please correct my grammar: 'I have went to London last year.'",
  },
  {
    icon: "🗣️",
    title: "Luyện thi IELTS Speaking",
    prompt: "Can you simulate an IELTS Speaking Part 2 queue about my favorite trip?",
  },
  {
    icon: "📚",
    title: "Phân biệt Thì tiếng Anh",
    prompt: "What is the difference between Present Perfect and Past Simple with examples?",
  },
];

function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  function parseInline(line) {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const val = match[0];
      if (val.startsWith("**") && val.endsWith("**")) {
        parts.push(<strong key={match.index}>{val.slice(2, -2)}</strong>);
      } else if (val.startsWith("`") && val.endsWith("`")) {
        parts.push(<code key={match.index} className="chat-inline-code">{val.slice(1, -1)}</code>);
      } else if (val.startsWith("*") && val.endsWith("*")) {
        parts.push(<em key={match.index}>{val.slice(1, -1)}</em>);
      } else {
        parts.push(val);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    return parts.length > 0 ? parts : line;
  }

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="chat-message-list">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*\d.]+\s*/, ""));
    } else {
      flushList();
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote key={idx} className="chat-blockquote">
            {parseInline(trimmed.slice(2))}
          </blockquote>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(<h4 key={idx} className="chat-h4">{parseInline(trimmed.slice(4))}</h4>);
      } else if (trimmed.startsWith("## ")) {
        elements.push(<h3 key={idx} className="chat-h3">{parseInline(trimmed.slice(3))}</h3>);
      } else if (trimmed === "") {
        elements.push(<div key={idx} style={{ height: "4px" }} />);
      } else {
        elements.push(<p key={idx} className="chat-p">{parseInline(trimmed)}</p>);
      }
    }
  });
  flushList();

  return <div className="chat-formatted-body">{elements}</div>;
}

function prepareTextForVietnameseTTS(text) {
  if (!text) return "";

  const targetMatch = /(?:Từ đó đọc tiếng Anh là|Phát âm chuẩn|Nội dung cần đọc):\s*[*_]*([a-zA-Z\s]+)[*_]*/i.exec(text);
  if (targetMatch && targetMatch[1]) {
    const word = targetMatch[1].trim();
    return `Từ đó đọc tiếng Anh là ${word}`;
  }

  let cleaned = text
    .replace(/^.*Phát âm.*$/gm, "")
    .replace(/^👉.*$/gm, "")
    .replace(/^fallback \(dự phòng\).*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*>]/g, "")
    .replace(/\n+/g, ". ")
    .trim();

  return cleaned || "Từ đó đọc tiếng Anh là Hello";
}

function extractEnglishFocusForTTS(text) {
  if (!text) return "";

  const targetMatch = /(?:Từ đó đọc tiếng Anh là|Phát âm chuẩn|Nội dung cần đọc):\s*[*_]*([a-zA-Z\s]+)[*_]*/i.exec(text);
  const targetWord = targetMatch ? targetMatch[1].trim() : "";

  const quotes = [];
  const quoteRegex = /"([^"]+)"|'([^']+)'|> ([^\n]+)/g;
  let match;
  while ((match = quoteRegex.exec(text)) !== null) {
    const extracted = match[1] || match[2] || match[3];
    if (extracted && /[a-zA-Z]/.test(extracted) && !extracted.toLowerCase().includes("tôi muốn") && !extracted.toLowerCase().includes("luyện tập")) {
      quotes.push(extracted);
    }
  }

  if (targetWord && quotes.length > 0) {
    return `${targetWord}. ${quotes.join(". ")}`;
  }
  if (targetWord) {
    return targetWord;
  }
  if (quotes.length > 0) {
    return quotes.join(". ");
  }

  return text.replace(/[*_#`>]/g, "").trim();
}

export default function ChatbotPage() {
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [topic, setTopic] = useState("Daily life");
  const [level, setLevel] = useState("A2");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);

  async function refreshConversations() {
    try {
      const items = await getAiConversations();
      setConversations(items || []);
      return items || [];
    } catch {
      return [];
    }
  }

  useEffect(() => {
    Promise.all([refreshConversations(), getAiUsage().then(setUsage).catch(() => {})])
      .catch((err) => setError(err.message || "Không tải được lịch sử hội thoại."))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function selectConversation(id) {
    if (loading || id === conversationId) return;
    setHistoryLoading(true);
    setError("");
    try {
      const conversation = await getAiConversation(id);
      setConversationId(id);
      setMessages(conversation.messages || []);
      if (conversation.topic) setTopic(conversation.topic);
      if (conversation.level) setLevel(conversation.level);
    } catch (err) {
      setError(err.message || "Không tải được nội dung hội thoại.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function newConversation() {
    if (loading) return;
    setConversationId(null);
    setMessages([]);
    setMessage("");
    setError("");
  }

  async function removeConversation(e, id) {
    e.stopPropagation();
    if (loading) return;
    try {
      await deleteAiConversation(id);
      if (id === conversationId) newConversation();
      await refreshConversations();
    } catch (err) {
      setError(err.message || "Không xóa được hội thoại.");
    }
  }

  async function submitMessage(userMessageText, failedIndex = null) {
    const textToSend = userMessageText?.trim();
    if (!textToSend || loading) return;

    if (failedIndex === null) {
      setMessages((items) => [...items, { sender: "USER", message: textToSend, delivery: "sending" }]);
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } else {
      setMessages((items) =>
        items.map((item, index) => (index === failedIndex ? { ...item, delivery: "sending" } : item))
      );
    }

    setLoading(true);
    setError("");

    try {
      const response = await sendAiChat({
        conversationId,
        topic,
        level,
        message: textToSend,
      });

      setConversationId(response.conversationId);
      setMessages((items) => [
        ...items.map((item, index) =>
          (failedIndex === null ? index === items.length - 1 : index === failedIndex)
            ? { ...item, delivery: "sent" }
            : item
        ),
        {
          sender: "AI",
          message: response.reply,
          meta: `${response.provider ?? "Gemini AI"}${response.fallback ? " (dự phòng)" : ""} · ${response.totalTokens ?? 0} tokens`,
        },
      ]);

      await Promise.all([refreshConversations(), getAiUsage().then(setUsage).catch(() => {})]);
    } catch (err) {
      setError(err.message || "Không kết nối được với AI. Vui lòng thử lại.");
      setMessages((items) =>
        items.map((item, index) =>
          (failedIndex === null ? index === items.length - 1 : index === failedIndex)
            ? { ...item, delivery: "failed" }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e?.preventDefault();
    submitMessage(message);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleTextareaInput(e) {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  function handleCopy(text, index) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function stopAllSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeakingIndex(null);
  }

  function getVoiceForLang(targetLang) {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (targetLang === "vi") {
      return (
        voices.find((v) => v.lang.startsWith("vi") || v.lang.includes("vi-VN")) ||
        voices.find((v) => v.name.toLowerCase().includes("vietnam") || v.name.toLowerCase().includes("hoaimy") || v.name.toLowerCase().includes("namminh")) ||
        null
      );
    } else {
      return (
        voices.find((v) => v.lang.startsWith("en") || v.lang.includes("en-US")) ||
        voices.find((v) => v.name.toLowerCase().includes("english") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("david")) ||
        null
      );
    }
  }

  function handleSpeak(text, index, mode = "vi") {
    const key = `${index}-${mode}`;
    if (speakingIndex === key) {
      stopAllSpeech();
      return;
    }
    stopAllSpeech();

    let textToRead = "";
    if (mode === "vi") {
      textToRead = prepareTextForVietnameseTTS(text);
    } else {
      textToRead = extractEnglishFocusForTTS(text);
    }

    if (!textToRead) return;

    if (mode === "vi") {
      setSpeakingIndex(key);

      const voices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
      const viVoice = voices.find(
        (v) => (v.lang && (v.lang.toLowerCase().startsWith("vi") || v.lang.toLowerCase().includes("vi-vn"))) ||
               (v.name && (v.name.toLowerCase().includes("vietnam") || v.name.toLowerCase().includes("hoaimy") || v.name.toLowerCase().includes("namminh")))
      );

      if (viVoice && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.voice = viVoice;
        utterance.lang = "vi-VN";
        utterance.rate = speechRate;
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        window.speechSynthesis.speak(utterance);
        return;
      }

      fetch("https://api.soundoftext.com/sounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engine: "Google",
          data: { text: textToRead.slice(0, 150), voice: "vi-VN" },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.id) {
            const audio = new Audio(`https://files.soundoftext.com/${data.id}.mp3`);
            audio.playbackRate = speechRate;
            audioRef.current = audio;
            audio.onended = () => setSpeakingIndex(null);
            audio.onerror = () => setSpeakingIndex(null);
            audio.play().catch(() => setSpeakingIndex(null));
          } else {
            setSpeakingIndex(null);
          }
        })
        .catch(() => {
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = "vi-VN";
            utterance.rate = speechRate;
            utterance.onend = () => setSpeakingIndex(null);
            utterance.onerror = () => setSpeakingIndex(null);
            window.speechSynthesis.speak(utterance);
          } else {
            setSpeakingIndex(null);
          }
        });
    } else {
      if (!("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "en-US";
      utterance.rate = speechRate * 0.92;

      const enVoice = getVoiceForLang("en");
      if (enVoice) {
        utterance.voice = enVoice;
      }

      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);
      setSpeakingIndex(key);
      window.speechSynthesis.speak(utterance);
    }
  }

  const usedToday = usage?.usedToday ?? 0;
  const dailyLimit = usage?.dailyLimit ?? 50;
  const usagePercent = Math.min(100, Math.round((usedToday / dailyLimit) * 100));

  return (
    <div className="chatbot-page">
      {/* Header Banner */}
      <header className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar-glow">🤖</div>
          <div>
            <div className="chatbot-header-title-row">
              <h2 className="chatbot-header-title">Trợ lý AI Học Tiếng Anh</h2>
              <span className="chatbot-status-pill">Sẵn sàng 24/7</span>
            </div>
            <p className="chatbot-header-sub">
              Luyện hội thoại, phát âm chuẩn IPA, sửa lỗi ngữ pháp và từ vựng theo trình độ cá nhân.
            </p>
          </div>
        </div>

        <div className="chatbot-usage-badge">
          <div className="chatbot-usage-text">
            <span>Lượt AI hôm nay</span>
            <strong>{usedToday} / {dailyLimit}</strong>
          </div>
          <div className="chatbot-usage-track">
            <div
              className={`chatbot-usage-bar ${usagePercent > 80 ? "is-warning" : ""}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="chatbot-error-banner" role="alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="chatbot-workspace">
        {/* Left Sidebar: Controls & History */}
        <aside className="chatbot-sidebar">
          <button
            className="chatbot-new-btn"
            type="button"
            onClick={newConversation}
            disabled={loading}
          >
            <span>✨</span> Tạo hội thoại mới
          </button>

          <div className="chatbot-config-section">
            <div className="chatbot-section-label">Chủ đề luyện tập</div>
            <select
              className="chatbot-select"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            >
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="chatbot-config-section">
            <div className="chatbot-section-label">Trình độ CEFR</div>
            <select
              className="chatbot-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={loading}
            >
              {LEVELS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="chatbot-config-section">
            <div className="chatbot-section-label">⚡ Tốc độ đọc AI</div>
            <div className="chatbot-speed-selector">
              {[
                { rate: 0.75, label: "0.75x" },
                { rate: 1.0, label: "1.0x" },
                { rate: 1.25, label: "1.25x" },
                { rate: 1.5, label: "1.5x" },
              ].map((item) => (
                <button
                  key={item.rate}
                  type="button"
                  className={`chatbot-speed-btn ${speechRate === item.rate ? "active" : ""}`}
                  onClick={() => {
                    setSpeechRate(item.rate);
                    if (audioRef.current) audioRef.current.playbackRate = item.rate;
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="chatbot-history-container">
            <div className="chatbot-section-label">Lịch sử trò chuyện</div>
            <div className="chatbot-history-list">
              {historyLoading && (
                <div className="chatbot-history-loading">
                  <div className="chatbot-spinner" />
                  <span>Đang tải lịch sử...</span>
                </div>
              )}
              {!historyLoading && conversations.length === 0 && (
                <div className="chatbot-history-empty">
                  <span>💬</span>
                  <p>Chưa có hội thoại nào được lưu.</p>
                </div>
              )}
              {conversations.map((item) => (
                <div
                  className={`chatbot-history-item ${item.id === conversationId ? "active" : ""}`}
                  key={item.id}
                  onClick={() => selectConversation(item.id)}
                >
                  <div className="chatbot-history-content">
                    <span className="chatbot-history-icon">💬</span>
                    <span className="chatbot-history-title">
                      {item.title || `Hội thoại #${item.id}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="chatbot-delete-btn"
                    title="Xóa hội thoại này"
                    onClick={(e) => removeConversation(e, item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Chat Stream */}
        <main className="chatbot-main">
          <div className="chatbot-stream">
            {messages.length === 0 ? (
              <div className="chatbot-empty-state">
                <div className="chatbot-empty-hero-icon">💡</div>
                <h3 className="chatbot-empty-title">Bạn muốn luyện tiếng Anh nội dung gì hôm nay?</h3>
                <p className="chatbot-empty-sub">
                  Chọn câu hỏi gợi ý bên dưới hoặc nhập nội dung bạn muốn học vào ô phía dưới:
                </p>

                <div className="chatbot-suggestions-grid">
                  {SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="chatbot-suggestion-card"
                      onClick={() => submitMessage(item.prompt)}
                    >
                      <span className="chatbot-card-icon">{item.icon}</span>
                      <div className="chatbot-card-body">
                        <strong>{item.title}</strong>
                        <p>{item.prompt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((item, index) => (
                <div
                  className={`chat-bubble ${item.sender === "USER" ? "user" : "ai"}`}
                  key={index}
                >
                  <div className="chat-bubble-header">
                    <span className="chat-bubble-sender">
                      {item.sender === "USER" ? "👤 Bạn" : "🤖 Trợ lý AI"}
                    </span>
                    {item.sender === "AI" && (
                      <div className="chat-bubble-actions">
                        <button
                          type="button"
                          className="chat-action-btn"
                          title="Đọc toàn bộ nội dung bằng giọng Tiếng Việt"
                          onClick={() => handleSpeak(item.message, index, "vi")}
                        >
                          {speakingIndex === `${index}-vi` ? "⏹️ Dừng đọc" : "🔊 Đọc Tiếng Việt"}
                        </button>
                        <button
                          type="button"
                          className="chat-action-btn"
                          title="Phát âm từ/câu Tiếng Anh bản xứ"
                          onClick={() => handleSpeak(item.message, index, "en")}
                        >
                          {speakingIndex === `${index}-en` ? "⏹️ Dừng đọc" : "🗣️ Đọc Tiếng Anh"}
                        </button>
                        <button
                          type="button"
                          className="chat-action-btn"
                          title="Sao chép câu trả lời"
                          onClick={() => handleCopy(item.message, index)}
                        >
                          {copiedIndex === index ? "✓ Đã chép" : "📋 Chép"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="chat-bubble-content">
                    {item.sender === "USER" ? (
                      <div>{item.message}</div>
                    ) : (
                      <FormattedMessage text={item.message} />
                    )}
                  </div>

                  {item.meta && <div className="chat-bubble-meta">{item.meta}</div>}

                  {item.delivery === "failed" && (
                    <div className="chat-bubble-failed">
                      <span>⚠️ Gửi tin nhắn thất bại.</span>
                      <button
                        type="button"
                        className="chat-retry-btn"
                        onClick={() => submitMessage(item.message, index)}
                      >
                        Thử lại ngay
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="chat-bubble ai is-thinking">
                <div className="chat-bubble-header">
                  <span className="chat-bubble-sender">🤖 Trợ lý AI</span>
                </div>
                <div className="chat-thinking-dots">
                  <span>⚡ AI đang suy nghĩ và phân tích phản hồi</span>
                  <span className="dot-pulse">.</span>
                  <span className="dot-pulse">.</span>
                  <span className="dot-pulse">.</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Floating Bottom Input Bar */}
          <form className="chatbot-input-container" onSubmit={handleSubmit}>
            <div className="chatbot-input-box">
              <textarea
                ref={textareaRef}
                className="chatbot-textarea"
                rows={1}
                value={message}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ví dụ: tôi muốn nghe đọc chữ hello, hoặc sửa ngữ pháp..."
                disabled={loading || usedToday >= dailyLimit}
              />
              <button
                className="chatbot-send-btn"
                type="submit"
                disabled={loading || !message.trim() || usedToday >= dailyLimit}
              >
                {loading ? "..." : "✈️ Gửi AI"}
              </button>
            </div>
            {usedToday >= dailyLimit && (
              <p className="chatbot-quota-warning">
                🔒 Bạn đã đạt giới hạn {dailyLimit}/{dailyLimit} lượt AI hôm nay. Vui lòng quay lại vào ngày mai!
              </p>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
