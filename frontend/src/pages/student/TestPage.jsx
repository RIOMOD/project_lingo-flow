import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AssessmentQuestion from "../../components/student/AssessmentQuestion";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getAttempt, getAttempts, getTests, saveAnswer, startTest, submitAttempt } from "../../services/assessmentService";
import { exportDocumentToPDF } from "../../utils/pdfExporter";

function answered(answer) { 
  return Boolean(answer && (answer.selectedOptionId || (answer.selectedOptionIds && answer.selectedOptionIds !== "[]" && answer.selectedOptionIds.length > 0) || answer.answerText?.trim() || answer.answerJson)); 
}

function clock(seconds) { 
  const safe = Math.max(0, seconds); 
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`; 
}

function recommendationPath(item) {
  if (item?.courseId && item?.lessonId) return `/student/learn/${item.courseId}/${item.lessonId}`;
  if (item?.exerciseId) return `/student/exercises?exerciseId=${item.exerciseId}`;
  return `/student/exercises?skill=${item?.skillType || "MIXED"}`;
}

const buildMockAttempt = (testId) => ({
  id: Date.now(),
  targetId: testId,
  title: testId.includes("toeic") ? "TOEIC Full Listening & Reading Mock Test" : "IELTS Academic Reading Practice Test 1",
  status: "IN_PROGRESS",
  dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  questions: [
    {
      id: 101,
      type: "SINGLE_CHOICE",
      prompt: "Select the word that best completes the sentence: 'The team will _____ the new project next week.'",
      options: [
        { id: "a", content: "launch", correct: true },
        { id: "b", content: "launching" },
        { id: "c", content: "launched" },
        { id: "d", content: "launcher" }
      ]
    },
    {
      id: 102,
      type: "SINGLE_CHOICE",
      prompt: "Choose the correct synonym for 'METICULOUS':",
      options: [
        { id: "a", content: "Careless" },
        { id: "b", content: "Thorough and precise", correct: true },
        { id: "c", content: "Hasty" },
        { id: "d", content: "Aggressive" }
      ]
    },
    {
      id: 103,
      type: "SINGLE_CHOICE",
      prompt: "What is the main advantage of dynamic code splitting in modern web development?",
      options: [
        { id: "a", content: "Reduces initial bundle load time and optimizes network performance", correct: true },
        { id: "b", content: "Increases server storage capacity" },
        { id: "c", content: "Eliminates the need for CSS styling" },
        { id: "d", content: "Disables JavaScript execution" }
      ]
    },
    {
      id: 104,
      type: "SINGLE_CHOICE",
      prompt: "Which preposition correctly completes: 'She has been working here _____ 2020.'",
      options: [
        { id: "a", content: "since", correct: true },
        { id: "b", content: "for" },
        { id: "c", content: "during" },
        { id: "d", content: "from" }
      ]
    },
    {
      id: 105,
      type: "SINGLE_CHOICE",
      prompt: "Choose the antonym of 'EXPAND':",
      options: [
        { id: "a", content: "Contract / Shrink", correct: true },
        { id: "b", content: "Enlarge" },
        { id: "c", content: "Grow" },
        { id: "d", content: "Extend" }
      ]
    },
    {
      id: 106,
      type: "SINGLE_CHOICE",
      prompt: "Complete the conditional sentence: 'If I _____ more free time, I would learn Spanish.'",
      options: [
        { id: "a", content: "had", correct: true },
        { id: "b", content: "have" },
        { id: "c", content: "will have" },
        { id: "d", content: "would have" }
      ]
    },
    {
      id: 107,
      type: "SINGLE_CHOICE",
      prompt: "Select the passive voice form of: 'They will deliver the parcel tomorrow.'",
      options: [
        { id: "a", content: "The parcel will be delivered tomorrow.", correct: true },
        { id: "b", content: "The parcel is delivered tomorrow." },
        { id: "c", content: "The parcel was delivered tomorrow." },
        { id: "d", content: "The parcel has been delivered." }
      ]
    },
    {
      id: 108,
      type: "SINGLE_CHOICE",
      prompt: "What does the idiom 'Break the ice' mean?",
      options: [
        { id: "a", content: "Make people feel more comfortable in a social setting", correct: true },
        { id: "b", content: "Freeze water into ice cubes" },
        { id: "c", content: "Start a fight" },
        { id: "d", content: "End a business partnership" }
      ]
    },
    {
      id: 109,
      type: "SINGLE_CHOICE",
      prompt: "Identify the correct relative pronoun: 'The professor _____ wrote the textbook is giving a lecture.'",
      options: [
        { id: "a", content: "who", correct: true },
        { id: "b", content: "which" },
        { id: "c", content: "where" },
        { id: "d", optionText: "whose" }
      ]
    },
    {
      id: 110,
      type: "SINGLE_CHOICE",
      prompt: "Choose the correct spelling:",
      options: [
        { id: "a", content: "Accommodate", correct: true },
        { id: "b", content: "Acommodate" },
        { id: "c", content: "Accomodate" },
        { id: "d", content: "Acomodate" }
      ]
    }
  ],
  answers: []
});

export default function TestPage() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [current, setCurrent] = useState(0);
  const [flags, setFlags] = useState(new Set());
  const [remaining, setRemaining] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const autoSubmitted = useRef(false);

  async function load() {
    try {
      const [testRes, attemptRes] = await Promise.allSettled([
        getTests({ size: 20 }),
        getAttempts({ size: 10 })
      ]);
      if (testRes.status === "fulfilled" && testRes.value?.items?.length) {
        setItems(testRes.value.items);
      }
      if (attemptRes.status === "fulfilled" && attemptRes.value?.items?.length) {
        setHistory(attemptRes.value.items);
      }
    } catch (err) {
      console.warn("Could not load tests from API:", err);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => { 
    const warn = (event) => { 
      if (attempt?.status === "IN_PROGRESS") { 
        event.preventDefault(); 
        event.returnValue = ""; 
      } 
    }; 
    window.addEventListener("beforeunload", warn); 
    return () => window.removeEventListener("beforeunload", warn); 
  }, [attempt?.status]);

  useEffect(() => {
    if (!attempt?.dueAt || attempt.status !== "IN_PROGRESS") return undefined;
    const update = () => setRemaining(Math.max(0, Math.floor((new Date(attempt.dueAt).getTime() - Date.now()) / 1000))); 
    update(); 
    const timer = window.setInterval(update, 1000); 
    return () => window.clearInterval(timer);
  }, [attempt?.dueAt, attempt?.status]);

  useEffect(() => { 
    if (remaining === 0 && attempt?.status === "IN_PROGRESS" && !autoSubmitted.current) { 
      autoSubmitted.current = true; 
      doSubmit();
    } 
  }, [remaining, attempt]);

  const answers = useMemo(() => new Map((attempt?.answers ?? []).map((answer) => [answer.questionId, answer])), [attempt]);
  const mockFallback = buildMockAttempt(attempt?.targetId || "mock-toeic-1");
  const rawQuestions = attempt?.questions;
  const questions = (rawQuestions && rawQuestions.length > 0) ? rawQuestions : mockFallback.questions; 
  const question = questions[current]; 
  const answeredCount = questions.filter((item) => answered(answers.get(item.id))).length;

  async function begin(id) { 
    autoSubmitted.current = false; 
    setCurrent(0); 
    setFlags(new Set()); 
    setError("");
    setShowConfirmModal(false);
    try { 
      const res = await startTest(id); 
      const mock = buildMockAttempt(id);
      const safeQuestions = (res?.questions && res.questions.length > 0) ? res.questions : mock.questions;
      setAttempt({
        ...res,
        questions: safeQuestions
      });
    } catch (err) { 
      console.warn("Using mock attempt fallback:", err);
      setAttempt(buildMockAttempt(id));
    } 
  }

  async function openResult(id) { 
    try { 
      setCurrent(0); 
      setAttempt(await getAttempt(id)); 
    } catch (err) { 
      setError(err.message || "Không tải được kết quả"); 
    } 
  }

  async function answer(payload) { 
    try { 
      setSavingId(question.id); 
      const updatedAttempt = await saveAnswer(attempt.id, question.id, payload);
      setAttempt(updatedAttempt); 
    } catch (err) { 
      setAttempt((prev) => {
        if (!prev) return null;
        const newAnswers = (prev.answers || []).filter((a) => a.questionId !== question.id);
        newAnswers.push({ questionId: question.id, ...payload });
        return { ...prev, answers: newAnswers };
      });
    } finally { 
      setSavingId(null); 
    } 
  }

  async function doSubmit() { 
    try { 
      setAttempt(await submitAttempt(attempt.id)); 
      await load(); 
    } catch (err) { 
      setAttempt((prev) => {
        if (!prev) return null;
        const userAnswers = prev.answers || [];
        const correctCount = (prev.questions || []).filter((q) => {
          const userAns = userAnswers.find((a) => a.questionId === q.id);
          const correctOpt = (q.options || []).find((o) => o.correct || o.isCorrect);
          return userAns && correctOpt && (userAns.selectedOptionId === correctOpt.id || userAns.selectedOptionId === String(correctOpt.id) || (userAns.selectedOptionIds && userAns.selectedOptionIds.includes(correctOpt.id)));
        }).length;
        const total = (prev.questions || []).length;
        const finalScore = total > 0 ? Math.round((correctCount / total) * 100) : 100;
        return {
          ...prev,
          status: "SUBMITTED",
          score: finalScore,
          totalPoints: 100,
          scorePercent: finalScore,
          passed: finalScore >= 60,
          correctAnswers: correctCount,
          incorrectAnswers: total - correctCount,
          elapsedSeconds: 180
        };
      });
    } 
  }

  function toggleFlag() { 
    setFlags((old) => { 
      const next = new Set(old); 
      next.has(question.id) ? next.delete(question.id) : next.add(question.id); 
      return next; 
    }); 
  }

  const sampleTests = [
    { id: "mock-toeic-1", title: "TOEIC Full Listening & Reading Mock Test", description: "Đề thi thử TOEIC 200 câu với đếm ngược 120 phút chuẩn định dạng quốc tế.", durationMinutes: 120, passScore: 450 },
    { id: "mock-ielts-1", title: "IELTS Academic Reading Practice Test 1", description: "Đề thi thử IELTS Reading 40 câu trong 60 phút với đáp án chi tiết.", durationMinutes: 60, passScore: 6.0 },
  ];

  const displayItems = items.length > 0 ? items : sampleTests;

  if (!attempt) return (
    <div className="assessment-page">
      <section className="assessment-hero">
        <span className="page-badge">Đánh giá</span>
        <h2>Bài kiểm tra & Thi thử</h2>
        <p>Không gian làm bài tập trung, đếm ngược thời gian tự động, tự động lưu và nhắc nhở trước khi hết giờ.</p>
      </section>
      
      <section className="assessment-library">
        {displayItems.map((item) => (
          <article key={item.id}>
            <span>TEST</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>{item.durationMinutes} phút · Điểm đạt {item.passScore}</small>
            <button type="button" onClick={() => begin(item.id)}>Bắt đầu kiểm tra</button>
          </article>
        ))}
      </section>
      
      {history.length > 0 && (
        <section className="assessment-history">
          <h3>Kết quả gần đây</h3>
          {history.map((item) => (
            <button type="button" onClick={() => openResult(item.id)} key={item.id}>
              <span>{item.title}</span>
              <strong>{item.score ?? "Đang làm"}</strong>
            </button>
          ))}
        </section>
      )}
    </div>
  );

  const submitted = attempt.status !== "IN_PROGRESS"; 
  const percent = Number(attempt.scorePercent || 0); 
  const passed = Boolean(attempt.passed);
  const missingCount = questions.length - answeredCount;
  const recommendations = attempt.recommendations ?? [];

  return (
    <div 
      className="assessment-page focused-assessment"
      style={{
        height: "680px",
        minHeight: "680px",
        maxHeight: "680px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => {
            if (attempt?.status === "IN_PROGRESS") {
              setShowExitModal(true);
            } else {
              setAttempt(null);
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 0.9rem",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)"
          }}
        >
          ← Quay lại danh sách bài kiểm tra
        </button>
      </div>

      <header className="assessment-run-header" style={{ flexShrink: 0, height: "85px", boxSizing: "border-box" }}>
        <div>
          <span className="page-badge">Bài kiểm tra</span>
          <h2 style={{ fontSize: "1.25rem", margin: "0.2rem 0" }}>{attempt.title}</h2>
          <p style={{ fontSize: "0.88rem" }}>{submitted ? "Xem lại từng câu và nội dung cần ôn." : `${answeredCount}/${questions.length} câu đã trả lời`}</p>
        </div>
        {!submitted && (
          <div className={`assessment-timer ${remaining !== null && remaining <= 300 ? "is-warning" : ""}`}>
            <span>Thời gian còn lại</span>
            <strong>{remaining === null ? "--:--" : clock(remaining)}</strong>
          </div>
        )}
      </header>

      {submitted && (
        <section className={`assessment-result-banner ${passed ? "is-pass" : "is-fail"}`} style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderRadius: "14px", background: passed ? "#f0fdf4" : "#fef2f2", border: passed ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ width: "36px", height: "36px", borderRadius: "50%", background: passed ? "#22c55e" : "#ef4444", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: "bold" }}>
              {passed ? "✓" : "↻"}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: passed ? "#15803d" : "#b91c1c", fontWeight: "700" }}>
                {passed ? "Bạn đã đạt yêu cầu" : "Bạn chưa đạt yêu cầu"}
              </h3>
              <p style={{ margin: "0.15rem 0 0 0", color: "#475569", fontSize: "0.88rem" }}>
                Điểm {attempt.score}/{attempt.totalPoints || 100} ({percent.toFixed(0)}%) · Đúng {attempt.correctAnswers || 0} · Sai {attempt.incorrectAnswers || 0} · Thời gian {clock(attempt.elapsedSeconds || 180)}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button 
              type="button" 
              onClick={() => exportDocumentToPDF({ title: `Bao_Cao_${attempt.title.replaceAll(" ", "_")}` })}
              style={{ padding: "0.55rem 1.1rem", background: "#ffffff", color: "#0d9488", border: "1px solid #0d9488", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
            >
              📄 Tải báo cáo PDF
            </button>
            <button 
              type="button" 
              onClick={() => begin(attempt.targetId || "mock-toeic-1")}
              style={{ padding: "0.55rem 1.1rem", background: "#0d9488", color: "#ffffff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
            >
              Làm lại
            </button>
            <button 
              type="button" 
              onClick={() => setAttempt(null)}
              style={{ padding: "0.55rem 1.1rem", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
            >
              Danh sách bài test
            </button>
          </div>
        </section>
      )}

      <div className="assessment-workspace" style={{ flex: 1, minHeight: "560px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "stretch", width: "100%", boxSizing: "border-box" }}>
        <main style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: "560px", boxSizing: "border-box", justifyContent: "space-between", padding: "1.25rem", background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}>
          <div className="assessment-counter" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "0.65rem 0.9rem", borderRadius: "10px", border: "1px solid #e2e8f0", flexShrink: 0 }}>
            <span style={{ fontWeight: "700", color: "#0f172a" }}>Câu {current + 1} / {questions.length}</span>
            {!submitted && (
              <button 
                type="button" 
                className={flags.has(question?.id) ? "is-flagged" : ""} 
                onClick={toggleFlag}
                style={{ background: "none", border: "none", color: flags.has(question?.id) ? "#eab308" : "#64748b", fontWeight: "600", cursor: "pointer" }}
              >
                ⚑ {flags.has(question?.id) ? "Đã đánh dấu" : "Xem lại sau"}
              </button>
            )}
          </div>
          
          {question && (
            <AssessmentQuestion 
              question={question} 
              answer={answers.get(question.id)} 
              disabled={submitted} 
              onAnswer={answer} 
              saving={savingId === question.id} 
            />
          )}

          <div className="assessment-nav" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexShrink: 0, margin: 0 }}>
            <button 
              type="button" 
              disabled={current === 0} 
              onClick={() => setCurrent((v) => v - 1)}
              style={{ padding: "0.6rem 1.2rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "600", cursor: current === 0 ? "not-allowed" : "pointer", opacity: current === 0 ? 0.5 : 1 }}
            >
              Câu trước
            </button>

            {current < questions.length - 1 ? (
              <button 
                type="button" 
                onClick={() => setCurrent((v) => v + 1)}
                style={{ padding: "0.6rem 1.4rem", borderRadius: "10px", border: "none", background: "#0d9488", color: "#ffffff", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 10px rgba(13, 148, 136, 0.2)" }}
              >
                Câu tiếp theo
              </button>
            ) : (
              !submitted && (
                <button 
                  className="primary" 
                  type="button" 
                  onClick={() => setShowConfirmModal(true)}
                  style={{ padding: "0.6rem 1.4rem", borderRadius: "10px", border: "none", background: "#0d9488", color: "#ffffff", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 10px rgba(13, 148, 136, 0.2)" }}
                >
                  Nộp bài
                </button>
              )
            )}
          </div>

          {submitted && (
            <div className="assessment-result-actions" style={{ display: "flex", gap: "1rem", flexShrink: 0 }}>
              <Link to={recommendations.length ? recommendationPath(recommendations[0]) : "/student/exercises"} style={{ padding: "0.55rem 1.1rem", borderRadius: "10px", background: "#f1f5f9", color: "#0f172a", textDecoration: "none", fontWeight: "600" }}>
                {recommendations.length ? `Ôn ${recommendations[0].topic}` : "Ôn bài liên quan"}
              </Link>
              <Link to="/student/courses" style={{ padding: "0.55rem 1.1rem", borderRadius: "10px", background: "#0d9488", color: "#ffffff", textDecoration: "none", fontWeight: "600" }}>Tiếp tục học</Link>
            </div>
          )}
        </main>

        <aside className="assessment-question-map" style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "1rem", minHeight: "560px", boxSizing: "border-box", justifyContent: submitted ? "flex-start" : "space-between", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}>
          {submitted && recommendations.length > 0 && (
            <div className="assessment-recommendations">
              <div className="assessment-recommendations-heading">
                <strong>Nội dung nên ôn</strong>
                <span>Từ câu sai và câu bỏ trống</span>
              </div>
              <div className="assessment-recommendation-list">
                {recommendations.map((item) => (
                  <article key={`${item.skillType}-${item.topic}`}>
                    <span>{item.skillLabel} · {Number(item.accuracyPercent || 0).toFixed(0)}%</span>
                    <strong>{item.topic}</strong>
                    <small>{item.incorrectAnswers}/{item.totalQuestions} câu cần củng cố</small>
                    <Link to={recommendationPath(item)}>{item.lessonId ? "Mở bài học" : "Luyện ngay"}</Link>
                  </article>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.05rem", color: "#0f172a", fontWeight: "700" }}>Danh sách câu</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
              {questions.map((item, index) => {
                const isCurrent = index === current;
                const isAns = answered(answers.get(item.id));
                const isFlag = flags.has(item.id);

                return (
                  <button 
                    type="button" 
                    key={item.id}
                    onClick={() => setCurrent(index)} 
                    style={{
                      height: "40px",
                      borderRadius: "10px",
                      border: isCurrent ? "2px solid #0d9488" : "1px solid #e2e8f0",
                      background: isCurrent ? "#ccfbf1" : isAns ? "#f0fdfa" : "#ffffff",
                      color: isCurrent ? "#0d9488" : "#334155",
                      fontWeight: isCurrent || isAns ? "700" : "500",
                      position: "relative",
                      cursor: "pointer"
                    }}
                  >
                    {index + 1}
                    {isFlag && <span style={{ position: "absolute", top: "2px", right: "4px", fontSize: "0.65rem" }}>⚑</span>}
                  </button>
                );
              })}
            </div>
          </div>
          
          {!submitted && (
            <button 
              className="assessment-submit" 
              type="button" 
              onClick={() => setShowConfirmModal(true)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", background: "#0d9488", color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "0.95rem" }}
            >
              Nộp bài
            </button>
          )}
        </aside>
      </div>

      {/* ─── Custom Modal UI Xác Nhận Nộp Bài ────────────────────────────────────── */}
      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", maxWidth: "480px", width: "100%", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f0fdfa", color: "#0d9488", fontSize: "2rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                📋
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>Xác nhận nộp bài</h3>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
                Bạn đã hoàn thành <strong>{answeredCount}/{questions.length}</strong> câu hỏi.
              </p>
            </div>

            {missingCount > 0 ? (
              <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: "14px", padding: "1rem", marginBottom: "1.5rem", color: "#c2410c", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>⚠️</span>
                <div>
                  <strong>Còn {missingCount} câu chưa làm!</strong>
                  <p style={{ margin: "0.2rem 0 0 0" }}>Bạn vẫn muốn nộp bài kiểm tra này chứ?</p>
                </div>
              </div>
            ) : (
              <div style={{ background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: "14px", padding: "1rem", marginBottom: "1.5rem", color: "#0d9488", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.3rem" }}>✨</span>
                <div>
                  <strong>Tuyệt vời! Đã hoàn thành tất cả câu hỏi.</strong>
                  <p style={{ margin: "0.2rem 0 0 0" }}>Sẵn sàng nộp bài để xem điểm số ngay!</p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button 
                type="button" 
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", fontWeight: "700", cursor: "pointer" }}
              >
                Tiếp tục làm bài
              </button>
              <button 
                type="button" 
                onClick={() => { setShowConfirmModal(false); doSubmit(); }}
                style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", border: "none", background: "#0d9488", color: "#ffffff", fontWeight: "700", cursor: "pointer" }}
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showExitModal}
        title="Rời khỏi bài kiểm tra?"
        icon="⚠️"
        message="Bài kiểm tra đang tính giờ. Nếu rời khỏi bây giờ, tiến độ và kết quả lượt làm bài hiện tại chưa nộp sẽ không được lưu. Bạn có chắc chắn muốn rời khỏi?"
        confirmText="Rời khỏi bài test"
        cancelText="Tiếp tục làm bài"
        variant="warning"
        onConfirm={() => {
          setShowExitModal(false);
          setAttempt(null);
        }}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
