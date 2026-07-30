import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teacherGrammarService } from "../../services/teacherGrammar.service";
import { IconChevronLeft, IconPlus, IconTrash, IconEdit, IconCheck } from "../../components/common/SidebarIcons";

export default function GrammarQuestionManagementPage() {
  const { id: topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    questionText: "",
    explanation: "",
    level: "BEGINNER",
    options: [
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false }
    ]
  };

  const [form, setForm] = useState(emptyForm);

  async function loadQuestions() {
    try {
      const data = await teacherGrammarService.getQuestionsByTopic(topicId);
      setQuestions(data?.items || data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi tải câu hỏi");
    }
  }

  useEffect(() => {
    loadQuestions();
  }, [topicId]);

  function setField(name, value) {
    setForm(current => ({ ...current, [name]: value }));
  }

  function setOptionField(index, name, value) {
    setForm(current => {
      const newOptions = [...current.options];
      newOptions[index][name] = value;
      return { ...current, options: newOptions };
    });
  }

  function setCorrectOption(index) {
    setForm(current => {
      const newOptions = current.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      }));
      return { ...current, options: newOptions };
    });
  }

  async function submitForm(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await teacherGrammarService.updateQuestion(editingId, form);
      } else {
        await teacherGrammarService.createQuestion(topicId, form);
      }
      setIsEditing(false);
      setEditingId(null);
      setForm(emptyForm);
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi lưu câu hỏi");
    }
  }

  function edit(q) {
    setEditingId(q.id);
    setIsEditing(true);
    setForm({
      questionText: q.questionText || "",
      explanation: q.explanation || "",
      level: q.level || "BEGINNER",
      options: q.options && q.options.length === 4 ? q.options : emptyForm.options
    });
  }

  async function remove(id) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      await teacherGrammarService.deleteQuestion(id);
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi xóa câu hỏi");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <button className="back-btn" onClick={() => navigate("/teacher/grammar")}>
          <IconChevronLeft /> Quản lý ngữ pháp
        </button>
        <h2 className="page-title">Quản lý câu hỏi (Topic ID: {topicId})</h2>
        <p className="page-description">Thêm, sửa, xóa câu hỏi trắc nghiệm cho chủ điểm.</p>
        <button className="page-action page-action-primary" style={{ marginTop: "16px" }} onClick={() => navigate(`/teacher/grammar/${topicId}/results`)}>
          Xem kết quả học sinh
        </button>
      </section>

      {error && <p className="auth-error">{error}</p>}

      {!isEditing ? (
        <div style={{ marginBottom: "20px" }}>
          <button className="page-action page-action-primary" onClick={() => { setIsEditing(true); setEditingId(null); setForm(emptyForm); }}>
            <IconPlus /> Thêm câu hỏi
          </button>
        </div>
      ) : (
        <form className="page-panel-card course-form" onSubmit={submitForm}>
          <textarea value={form.questionText} onChange={(e) => setField("questionText", e.target.value)} placeholder="Nội dung câu hỏi" required />
          <textarea value={form.explanation} onChange={(e) => setField("explanation", e.target.value)} placeholder="Giải thích đáp án" />
          <select value={form.level} onChange={(e) => setField("level", e.target.value)} required>
            <option value="BEGINNER">Dễ (Beginner)</option>
            <option value="INTERMEDIATE">Trung bình (Intermediate)</option>
            <option value="ADVANCED">Khó (Advanced)</option>
          </select>
          
          <div className="options-container" style={{ marginTop: "10px" }}>
            <h4>4 Lựa chọn (Chọn nút tròn cho đáp án đúng):</h4>
            {form.options.map((opt, idx) => (
              <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <input 
                  type="radio" 
                  name="correctOption" 
                  checked={opt.isCorrect} 
                  onChange={() => setCorrectOption(idx)} 
                  required 
                />
                <input 
                  type="text" 
                  style={{ flex: 1 }}
                  value={opt.optionText} 
                  onChange={(e) => setOptionField(idx, "optionText", e.target.value)} 
                  placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`} 
                  required 
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button className="page-action page-action-primary" type="submit">Lưu câu hỏi</button>
            <button className="page-action page-action-secondary" type="button" onClick={() => setIsEditing(false)}>Hủy</button>
          </div>
        </form>
      )}

      <section className="course-table page-panel-card" style={{ marginTop: "20px" }}>
        <h3>Danh sách câu hỏi ({questions.length})</h3>
        {questions.length === 0 && <p>Chưa có câu hỏi nào.</p>}
        {questions.map((q, i) => (
          <div className="course-table-row" key={q.id}>
            <div style={{ flex: 1 }}>
              <strong>Câu {i + 1}: {q.questionText}</strong> <span className="badge" style={{ fontSize: "0.8em", background: "#eee", padding: "2px 6px", borderRadius: "4px" }}>{q.level}</span>
              <ul style={{ marginLeft: "20px", marginTop: "5px", color: "#555" }}>
                {q.options?.map((opt, idx) => (
                  <li key={idx} style={{ fontWeight: opt.isCorrect ? "bold" : "normal", color: opt.isCorrect ? "green" : "inherit" }}>
                    {String.fromCharCode(65 + idx)}. {opt.optionText} {opt.isCorrect && <IconCheck className="w-4 h-4 inline" />}
                  </li>
                ))}
              </ul>
              {q.explanation && <p style={{ fontSize: "0.9em", color: "#777", marginTop: "5px" }}><em>Giải thích: {q.explanation}</em></p>}
            </div>
            <div className="course-row-actions" style={{ marginLeft: "20px" }}>
              <button className="page-action page-action-secondary" onClick={() => edit(q)}><IconEdit /></button>
              <button className="page-action page-action-secondary" onClick={() => remove(q.id)}><IconTrash /></button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
