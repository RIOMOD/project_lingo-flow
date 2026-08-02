import { useCallback, useEffect, useRef, useState } from "react";
import { sendAiChat } from "../../services/aiService";
import { useAiLimo } from "../../context/AiLimoContext";
import "../../styles/AiLimo.css";

const IDLE_TIMEOUT_MS = 30_000;
const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 560;

function clampPosition(position, open) {
  const width = open ? PANEL_WIDTH : 68;
  const height = open ? PANEL_HEIGHT : 68;
  return {
    x: Math.max(8, Math.min(position.x, window.innerWidth - width - 8)),
    y: Math.max(8, Math.min(position.y, window.innerHeight - height - 8)),
  };
}

function initialPosition() {
  try {
    const stored = JSON.parse(localStorage.getItem("ai-limo-position") || "null");
    if (stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)) {
      return clampPosition(stored, true);
    }
  } catch {
    // Ignore an invalid saved position.
  }
  return clampPosition({ x: window.innerWidth - PANEL_WIDTH - 24, y: window.innerHeight - PANEL_HEIGHT - 24 }, true);
}

function cleanFallbackMarkdown(text) {
  return (text || "")
    .replace(/\*\*/g, "")
    .replace(/^>\s?/gm, "")
    .replace(/(^|\s)\*([^*]+)\*/g, "$1$2")
    .trim();
}

export default function AiLimo() {
  const { pageContext } = useAiLimo();
  const [open, setOpen] = useState(true);
  const [position, setPosition] = useState(initialPosition);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "AI", text: "Chào bạn, mình là Limo. Bạn có thể hỏi mình bất cứ điều gì — nếu đang làm bài, mình sẽ gợi ý mà không làm thay nhé!" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activityTick, setActivityTick] = useState(0);
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [listeningMode, setListeningMode] = useState(null);

  const dragRef = useRef(null);
  const positionRef = useRef(position);
  const suppressCollapsedClickRef = useRef(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const wakeEnabledRef = useRef(false);
  const openRef = useRef(true);
  const startWakeRef = useRef(null);

  const speechSupported = typeof window !== "undefined"
    && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const markActive = useCallback(() => setActivityTick((value) => value + 1), []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onend = null;
      try { recognition.stop(); } catch { /* already stopped */ }
    }
    setListeningMode(null);
  }, []);

  const startRecognition = useCallback((mode) => {
    if (!speechSupported) {
      setError("Trình duyệt này chưa hỗ trợ nhận giọng nói. Bạn vẫn có thể nhập câu hỏi.");
      return;
    }
    stopRecognition();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.continuous = mode === "wake";
    recognitionRef.current = recognition;
    setListeningMode(mode);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      if (!transcript) return;
      if (mode === "wake") {
        const normalized = transcript.toLowerCase().replace(/[.,!?]/g, "");
        if (normalized.includes("hello limo") || normalized.includes("hê lô limo")) {
          setOpen(true);
          markActive();
          stopRecognition();
        }
      } else {
        setInput((value) => `${value}${value ? " " : ""}${transcript}`);
        markActive();
      }
    };
    recognition.onerror = (event) => {
      if (!['no-speech', 'aborted'].includes(event.error)) {
        setError(event.error === "not-allowed" ? "Bạn cần cấp quyền micro để dùng giọng nói." : "Không nhận được giọng nói, vui lòng thử lại.");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListeningMode(null);
      if (mode === "wake" && wakeEnabledRef.current && !openRef.current) {
        window.setTimeout(() => startWakeRef.current?.(), 350);
      }
    };
    try {
      recognition.start();
    } catch {
      setListeningMode(null);
    }
  }, [markActive, speechSupported, stopRecognition]);

  startWakeRef.current = () => startRecognition("wake");

  useEffect(() => { wakeEnabledRef.current = wakeEnabled; }, [wakeEnabled]);
  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    if (!open || loading) return undefined;
    const timer = window.setTimeout(() => setOpen(false), IDLE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [open, loading, activityTick]);

  useEffect(() => {
    if (!open && wakeEnabled) startRecognition("wake");
    else if (listeningMode === "wake") stopRecognition();
    return undefined;
  }, [open, wakeEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const onResize = () => setPosition((value) => clampPosition(value, open));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  function toggleOpen() {
    const next = !open;
    setPosition((value) => clampPosition(value, next));
    setOpen(next);
    markActive();
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || event.target.closest("button")) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextPosition = clampPosition({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    }, open);
    positionRef.current = nextPosition;
    setPosition(nextPosition);
    markActive();
  }

  function handlePointerUp(event) {
    if (!dragRef.current) return;
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* no capture */ }
    localStorage.setItem("ai-limo-position", JSON.stringify(positionRef.current));
  }

  function handleCollapsedPointerDown(event) {
    if (event.button !== 0) return;
    suppressCollapsedClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: positionRef.current.x,
      originY: positionRef.current.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCollapsedPointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
      drag.moved = true;
      suppressCollapsedClickRef.current = true;
    }
    if (!drag.moved) return;
    const nextPosition = clampPosition({
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    }, false);
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  }

  function handleCollapsedPointerUp(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* no capture */ }
    localStorage.setItem("ai-limo-position", JSON.stringify(positionRef.current));
  }

  function handleCollapsedClick() {
    if (suppressCollapsedClickRef.current) {
      suppressCollapsedClickRef.current = false;
      return;
    }
    toggleOpen();
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    markActive();
    setInput("");
    setError("");
    setMessages((items) => [...items, { sender: "USER", text }]);
    setLoading(true);
    try {
      const response = await sendAiChat({
        conversationId,
        topic: "Free chat",
        level: "A2",
        message: text,
        context: pageContext || undefined,
      });
      setConversationId(response.conversationId);
      setMessages((items) => [...items, {
        sender: "AI",
        text: response.reply,
        guidanceMode: response.guidanceMode,
        fallback: Boolean(response.fallback),
      }]);
    } catch (err) {
      setError(err.message || "Limo chưa thể trả lời. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      markActive();
    }
  }

  function toggleWake() {
    if (!speechSupported) {
      setError("Trình duyệt này chưa hỗ trợ câu lệnh giọng nói.");
      return;
    }
    const next = !wakeEnabled;
    setWakeEnabled(next);
    setError("");
    if (!next) stopRecognition();
    else {
      // A user gesture is required by browsers before microphone access can be granted.
      startRecognition("wake");
      window.setTimeout(() => {
        if (openRef.current && recognitionRef.current) stopRecognition();
      }, 300);
    }
    markActive();
  }

  if (!open) {
    return (
      <div className="ai-limo-collapsed" style={{ left: position.x, top: position.y }}>
        <button
          type="button"
          className="ai-limo-orb"
          onClick={handleCollapsedClick}
          onPointerDown={handleCollapsedPointerDown}
          onPointerMove={handleCollapsedPointerMove}
          onPointerUp={handleCollapsedPointerUp}
          onPointerCancel={handleCollapsedPointerUp}
          aria-label="Mở hoặc kéo AI Limo"
          title="Bấm để mở, giữ và kéo để di chuyển"
        >
          <span>Li</span>
          <i />
        </button>
        {wakeEnabled && <span className="ai-limo-wake-dot" title='Đang chờ "Hello Limo"'>🎙</span>}
      </div>
    );
  }

  return (
    <section
      className="ai-limo-panel"
      style={{ left: position.x, top: position.y }}
      onMouseDown={markActive}
      onKeyDown={markActive}
      aria-label="AI Limo"
    >
      <header
        className="ai-limo-header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="ai-limo-brand"><span className="ai-limo-avatar">Li</span><div><strong>AI Limo</strong><small>Hỏi gì cũng được</small></div></div>
        <div className="ai-limo-header-actions">
          <button type="button" className={wakeEnabled ? "is-active" : ""} onClick={toggleWake} title={wakeEnabled ? 'Tắt gọi "Hello Limo"' : 'Bật gọi "Hello Limo"'} aria-label="Bật hoặc tắt gọi Limo bằng giọng nói">🎙</button>
          <button type="button" onClick={toggleOpen} title="Thu gọn" aria-label="Thu gọn AI Limo">—</button>
        </div>
      </header>

      <div className="ai-limo-context-bar">
        <span className={pageContext ? "is-contextual" : ""} />
        {pageContext ? "Đang hiểu nội dung trên trang" : "Chat tự do"}
      </div>

      <div className="ai-limo-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div key={`${message.sender}-${index}`} className={`ai-limo-message is-${message.sender.toLowerCase()}`}>
            <div>{cleanFallbackMarkdown(message.text)}</div>
            {message.guidanceMode === "HINT_ONLY" && <small>Chế độ gợi ý</small>}
            {message.fallback && <small className="is-fallback">Chế độ dự phòng · câu trả lời bị giới hạn</small>}
          </div>
        ))}
        {loading && <div className="ai-limo-message is-ai is-typing"><i /><i /><i /></div>}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="ai-limo-error" role="alert">{error}</div>}

      <form className="ai-limo-compose" onSubmit={sendMessage}>
        <button
          type="button"
          className={listeningMode === "dictate" ? "is-listening" : ""}
          onClick={() => listeningMode === "dictate" ? stopRecognition() : startRecognition("dictate")}
          title="Nhập câu hỏi bằng giọng nói"
          aria-label="Nhập câu hỏi bằng giọng nói"
        >
          {listeningMode === "dictate" ? "■" : "🎤"}
        </button>
        <textarea
          rows="1"
          value={input}
          onChange={(event) => { setInput(event.target.value); markActive(); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Hỏi Limo bất cứ điều gì..."
          aria-label="Câu hỏi cho AI Limo"
        />
        <button type="submit" disabled={!input.trim() || loading} className="ai-limo-send" aria-label="Gửi câu hỏi">➤</button>
      </form>
      <div className="ai-limo-footer">
        Tự thu gọn sau 30 giây · {wakeEnabled ? "Nói “Hello Limo” để mở" : "Bật 🎙 để gọi “Hello Limo”"}
      </div>
    </section>
  );
}
