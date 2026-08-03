import { useEffect, useRef, useState } from "react";
import { sendAiChat } from "../../services/aiService";
import "../../styles/MiniChatWidget.css";
import FormattedMessage from "./FormattedMessage";

export default function MiniChatWidget({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  
  const bottomRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const resetTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Only set timer if the widget is open
    if (isOpen) {
      inactivityTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 30000); // 30 seconds
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // User opens the chat manually
      resetTimer();
    }
  };

  const handleInteraction = () => {
    resetTimer();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleInteraction();
    
    const textToSend = message.trim();
    if (!textToSend || loading) return;

    setMessages((prev) => [...prev, { sender: "USER", text: textToSend }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await sendAiChat({
        conversationId,
        topic: "General Chat",
        level: "B1", // Default level
        message: textToSend,
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: response.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Xin lỗi, đã có lỗi kết nối. Vui lòng thử lại sau.", isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mini-chat-widget" onClick={handleInteraction} onKeyDown={handleInteraction}>
      {isOpen && (
        <div className="mini-chat-window">
          <div className="mini-chat-header">
            <div className="mini-chat-title">
              <span className="mini-chat-avatar">🤖</span> AI Trợ Lý
            </div>
            <button className="mini-chat-close" onClick={() => setIsOpen(false)} title="Thu nhỏ">
              ✕
            </button>
          </div>
          
          <div className="mini-chat-body">
            {messages.length === 0 ? (
              <div className="mini-chat-empty">
                <p>Xin chào! Mình có thể giúp gì cho bạn?</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`mini-chat-bubble ${msg.sender === "USER" ? "user" : "ai"} ${msg.isError ? "error" : ""}`}>
                  {msg.sender === "USER" ? msg.text : <FormattedMessage text={msg.text} />}
                </div>
              ))
            )}
            {loading && (
              <div className="mini-chat-bubble ai thinking">
                AI đang suy nghĩ...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="mini-chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nhập câu hỏi..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          className="mini-chat-fab"
          onClick={handleOpenToggle}
          title="Chat với Trợ lý AI"
        >
          🤖
        </button>
      )}
    </div>
  );
}
