import { useEffect, useRef, useState } from "react";
import { deleteAiConversation, getAiConversation, getAiConversations, getAiUsage, sendAiChat } from "../../services/aiService";

const levels = ["A1", "A2", "B1", "B2", "C1"];
const topics = ["Daily life", "Travel", "IELTS Speaking", "Business", "Grammar correction"];

export default function ChatbotPage() {
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [topic, setTopic] = useState(topics[0]);
  const [level, setLevel] = useState("A2");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  async function refreshConversations() {
    const items = await getAiConversations();
    setConversations(items || []);
    return items || [];
  }

  useEffect(() => {
    Promise.all([refreshConversations(), getAiUsage().then(setUsage)])
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
    } catch (err) {
      setError(err.message || "Không tải được hội thoại.");
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

  async function removeConversation(id) {
    if (loading) return;
    try {
      await deleteAiConversation(id);
      if (id === conversationId) newConversation();
      await refreshConversations();
    } catch (err) {
      setError(err.message || "Không xóa được hội thoại.");
    }
  }

  async function submitMessage(userMessage, failedIndex = null) {
    if (!userMessage.trim() || loading) return;
    const pending = userMessage.trim();
    if (failedIndex === null) {
      setMessages((items) => [...items, { sender: "USER", message: pending, delivery: "sending" }]);
      setMessage("");
    } else {
      setMessages((items) => items.map((item, index) => index === failedIndex ? { ...item, delivery: "sending" } : item));
    }
    setLoading(true);
    setError("");
    try {
      const response = await sendAiChat({ conversationId, topic, level, message: pending });
      setConversationId(response.conversationId);
      setMessages((items) => [
        ...items.map((item, index) => (failedIndex === null ? index === items.length - 1 : index === failedIndex) ? { ...item, delivery: "sent" } : item),
        { sender: "AI", message: response.reply, meta: `${response.provider}${response.fallback ? " fallback" : ""} · ${response.totalTokens} tokens` },
      ]);
      await Promise.all([refreshConversations(), getAiUsage().then(setUsage)]);
    } catch (err) {
      setError(err.message || "Không gửi được tin nhắn AI. Vui lòng thử lại.");
      setMessages((items) => items.map((item, index) => (failedIndex === null ? index === items.length - 1 : index === failedIndex) ? { ...item, delivery: "failed" } : item));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage(message);
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">AI Chatbot</span>
        <h2 className="page-title">Trợ lý học tiếng Anh</h2>
        <p className="page-description">Chọn chủ đề, trình độ và tiếp tục hội thoại đã lưu. API key chỉ được giữ ở backend.</p>
      </section>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <section className="course-detail-body">
        <article className="page-panel-card">
          <div className="panel-heading"><h3>Hội thoại</h3><button className="page-action" type="button" onClick={newConversation} disabled={loading}>Mới</button></div>
          {historyLoading && <p className="auth-state">Đang tải...</p>}
          {!historyLoading && conversations.length === 0 && <p className="auth-state">Chưa có hội thoại.</p>}
          <div className="course-table">
            {conversations.map((item) => (
              <div className={`course-table-row ${item.id === conversationId ? "is-active" : ""}`} key={item.id}>
                <button type="button" className="link-button" onClick={() => selectConversation(item.id)}>{item.title || `Hội thoại #${item.id}`}</button>
                <button type="button" className="link-button danger" aria-label={`Xóa ${item.title || "hội thoại"}`} onClick={() => removeConversation(item.id)}>Xóa</button>
              </div>
            ))}
          </div>
          <label className="auth-field">Chủ đề<select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="auth-field">Trình độ<select value={level} onChange={(event) => setLevel(event.target.value)}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
          <p>Hôm nay: {usage ? `${usage.usedToday}/${usage.dailyLimit} lượt` : "Đang tải..."}</p>
        </article>
        <article className="page-panel-card">
          <h3>Hỏi đáp</h3>
          <div className="course-table chatbot-messages" aria-live="polite">
            {messages.map((item, index) => (
              <div className="course-table-row" key={item.id || `${item.sender}-${index}`}>
                <div><strong>{item.sender === "USER" ? "Bạn" : "AI"}</strong><p style={{ whiteSpace: "pre-wrap" }}>{item.message}</p>{item.meta && <small>{item.meta}</small>}
                  {item.delivery === "failed" && <div className="message-failed"><span>Gửi thất bại</span><button type="button" className="link-button" disabled={loading} onClick={() => submitMessage(item.message, index)}>Thử lại</button></div>}
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="auth-state">Gửi câu hỏi đầu tiên để bắt đầu hội thoại.</p>}
            {loading && <p className="auth-state">AI đang trả lời...</p>}
            <div ref={bottomRef} />
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">Tin nhắn<textarea rows="4" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ví dụ: Please correct this sentence..." /></label>
            <button className="page-action page-action-primary" disabled={loading || !message.trim()} type="submit">{loading ? "Đang hỏi AI..." : "Gửi cho AI"}</button>
          </form>
        </article>
      </section>
    </div>
  );
}
