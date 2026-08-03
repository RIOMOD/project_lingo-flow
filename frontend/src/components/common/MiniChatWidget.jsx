import { useEffect, useRef, useState } from "react";
import { deleteAiConversation, getAiConversation, getAiConversations, sendAiChat } from "../../services/aiService";
import MessageActions from "./MessageActions";
import "../../styles/MiniChatWidget.css";
import FormattedMessage from "./FormattedMessage";

export default function MiniChatWidget({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  
  const bottomRef = useRef(null);

  // Load latest conversation history when opening or mounting
  useEffect(() => {
    async function loadLatestChat() {
      try {
        const list = await getAiConversations();
        if (list && list.length > 0) {
          const latest = list[0];
          setConversationId(latest.id);
          const full = await getAiConversation(latest.id);
          if (full && full.messages) {
            const formatted = full.messages.map((m) => ({
              sender: m.sender,
              text: m.message,
            }));
            setMessages(formatted);
          }
        }
      } catch (e) {
        // Silent catch for guest/network issues
      }
    }

    if (isOpen && messages.length === 0) {
      loadLatestChat();
    }
  }, [isOpen]);
  const inactivityTimerRef = useRef(null);

  // Dragging state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const handlePointerDown = (e) => {
    // Don't drag when clicking close button or inputs
    if (e.target.closest('.mini-chat-close') || e.target.closest('input') || e.target.closest('form')) {
      return;
    }

    if (e.target.closest('.mini-chat-header') || e.target.closest('.mini-chat-fab')) {
      isDragging.current = true;
      hasDragged.current = false;
      dragStart.current = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      };
      document.body.style.userSelect = 'none';
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging.current) {
      const dx = Math.abs(e.clientX - (dragStart.current.x + offset.x));
      const dy = Math.abs(e.clientY - (dragStart.current.y + offset.y));
      if (dx > 4 || dy > 4) {
        hasDragged.current = true;
      }
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = '';
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleFabClick = (e) => {
    // If the user just dragged the FAB button, don't open/close the chat window
    if (hasDragged.current) {
      e.stopPropagation();
      hasDragged.current = false;
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const textToSend = message.trim();
    if (!textToSend || loading) return;

    setMessages((prev) => [...prev, { sender: "USER", text: textToSend }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await sendAiChat({
        conversationId,
        topic: "General Chat",
        level: "B1",
        message: textToSend,
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Notify rest of the app (e.g. ChatbotPage) to refresh conversation history
      window.dispatchEvent(
        new CustomEvent("ai_chat_updated", {
          detail: { conversationId: response.conversationId },
        })
      );

      // Split AI response into separate paragraph bubbles for a natural chat experience
      const rawReply = response.reply || "";
      const paragraphs = rawReply
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (paragraphs.length > 0) {
        const newBubbles = paragraphs.map((p) => ({
          sender: "AI",
          text: p,
        }));
        setMessages((prev) => [...prev, ...newBubbles]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "AI", text: rawReply },
        ]);
      }
    } catch (err) {
      let errorText = "Xin lỗi, đã có lỗi kết nối. Vui lòng thử lại sau.";
      if (err?.message) {
        if (err.message.includes("401") || err.message.includes("Unauthorized") || err.message.includes("Authentication")) {
          errorText = "Bạn cần đăng nhập để sử dụng tính năng AI. Vui lòng đăng nhập lại.";
        } else if (err.message.includes("API key") || err.message.includes("401") || err.message.includes("403")) {
          errorText = "Lỗi xác thực API. Vui lòng kiểm tra cấu hình AI.";
        } else if (err.message.includes("backend") || err.message.includes("kết nối máy chủ")) {
          errorText = "Không thể kết nối máy chủ. Vui lòng đảm bảo backend đang chạy.";
        } else {
          errorText = err.message;
        }
      }
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: errorText, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="mini-chat-widget" 
      onPointerDown={handlePointerDown}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {isOpen && (
        <div className="mini-chat-window">
          <div className="mini-chat-header" style={{ cursor: 'grab' }}>
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
                  {msg.sender === "USER" ? (
                    msg.text
                  ) : (
                    <>
                      <FormattedMessage text={msg.text} />
                      {!msg.isError && <MessageActions messageId={msg.id} text={msg.text} />}
                    </>
                  )}
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
          onClick={handleFabClick}
          title="Chat với Trợ lý AI"
        >
          🤖
        </button>
      )}
    </div>
  );
}
