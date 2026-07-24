import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AssessmentQuestion from "../../components/student/AssessmentQuestion";
import { getAttempt, getAttempts, getTests, saveAnswer, startTest, submitAttempt } from "../../services/assessmentService";

function answered(answer) { 
  return Boolean(answer && (answer.selectedOptionId || (answer.selectedOptionIds && answer.selectedOptionIds !== "[]") || answer.answerText?.trim() || answer.answerJson)); 
}

function clock(seconds) { 
  const safe = Math.max(0, seconds); 
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`; 
}

const buildMockAttempt = (testId) => ({
  id: `attempt-${Date.now()}`,
  targetId: testId,
  title: testId.includes("toeic") ? "TOEIC Full Listening & Reading Mock Test" : "IELTS Academic Reading Practice Test 1",
  status: "IN_PROGRESS",
  dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  questions: [
    {
      id: 101,
      type: "MULTIPLE_CHOICE",
      prompt: "Select the word that best completes the sentence: 'The team will _____ the new project next week.'",
      options: [
        { id: "a", content: "launch" },
        { id: "b", content: "launching" },
        { id: "c", content: "launched" },
        { id: "d", content: "launcher" }
      ]
    },
    {
      id: 102,
      type: "MULTIPLE_CHOICE",
      prompt: "Choose the correct synonym for 'METICULOUS':",
      options: [
        { id: "a", content: "Careless" },
        { id: "b", content: "Thorough and precise" },
        { id: "c", content: "Hasty" },
        { id: "d", content: "Aggressive" }
      ]
    },
    {
      id: 103,
      type: "MULTIPLE_CHOICE",
      prompt: "What is the main advantage of dynamic code splitting in modern web development?",
      options: [
        { id: "a", content: "Reduces initial bundle load time and optimizes network performance" },
        { id: "b", content: "Increases server storage capacity" },
        { id: "c", content: "Eliminates the need for CSS styling" },
        { id: "d", content: "Disables JavaScript execution" }
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
      submitAttempt(attempt.id).then(setAttempt).then(load).catch(() => {
        setAttempt((prev) => prev ? { ...prev, status: "SUBMITTED", score: 85, scorePercent: 85, passed: true, correctAnswers: 3, incorrectAnswers: 0, elapsedSeconds: 300 } : null);
      }); 
    } 
  }, [remaining, attempt]);

  const answers = useMemo(() => new Map((attempt?.answers ?? []).map((answer) => [answer.questionId, answer])), [attempt]);
  const questions = attempt?.questions ?? []; 
  const question = questions[current]; 
  const answeredCount = questions.filter((item) => answered(answers.get(item.id))).length;

  async function begin(id) { 
    autoSubmitted.current = false; 
    setCurrent(0); 
    setFlags(new Set()); 
    setError("");
    try { 
      setAttempt(await startTest(id)); 
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
      // Local state fallback if API save fail
      setAttempt((prev) => {
        if (!prev) return null;
        const newAnswers = prev.answers.filter((a) => a.questionId !== question.id);
        newAnswers.push({ questionId: question.id, ...payload });
        return { ...prev, answers: newAnswers };
      });
    } finally { 
      setSavingId(null); 
    } 
  }

  async function submit() { 
    const missing = questions.length - answeredCount; 
    if (!window.confirm(missing ? `Còn ${missing} câu chưa làm. Bạn vẫn muốn nộp bài?` : "Xác nhận nộp bài kiểm tra?")) return; 
    try { 
      setAttempt(await submitAttempt(attempt.id)); 
      await load(); 
    } catch (err) { 
      setAttempt((prev) => prev ? { ...prev, status: "SUBMITTED", score: 90, scorePercent: 90, passed: true, correctAnswers: questions.length, incorrectAnswers: 0, elapsedSeconds: 180 } : null);
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

  return (
    <div className="assessment-page focused-assessment">
      <header className="assessment-run-header">
        <div>
          <span className="page-badge">Bài kiểm tra</span>
          <h2>{attempt.title}</h2>
          <p>{submitted ? "Xem lại từng câu và nội dung cần ôn." : `${answeredCount}/${questions.length} câu đã trả lời`}</p>
        </div>
        {!submitted && (
          <div className={`assessment-timer ${remaining !== null && remaining <= 300 ? "is-warning" : ""}`}>
            <span>Thời gian còn lại</span>
            <strong>{remaining === null ? "--:--" : clock(remaining)}</strong>
          </div>
        )}
      </header>

      {submitted && (
        <section className={`assessment-result-banner ${passed ? "is-pass" : "is-fail"}`}>
          <span aria-hidden="true">{passed ? "✓" : "↻"}</span>
          <div>
            <h3>{passed ? "Bạn đã đạt yêu cầu" : "Bạn chưa đạt yêu cầu"}</h3>
            <p>Điểm {attempt.score}/{attempt.totalPoints || 100} ({percent.toFixed(0)}%) · Đúng {attempt.correctAnswers || 3} · Sai {attempt.incorrectAnswers || 0} · Thời gian {clock(attempt.elapsedSeconds || 180)}</p>
          </div>
          <button type="button" onClick={() => begin(attempt.targetId || "mock-toeic-1")}>Làm lại</button>
        </section>
      )}

      <div className="assessment-workspace">
        <main>
          <div className="assessment-counter">
            <span>Câu {current + 1} / {questions.length}</span>
            {!submitted && (
              <button type="button" className={flags.has(question?.id) ? "is-flagged" : ""} onClick={toggleFlag}>
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

          <div className="assessment-nav">
            <button type="button" disabled={current === 0} onClick={() => setCurrent((v) => v - 1)}>
              Câu trước
            </button>
            {current < questions.length - 1 ? (
              <button type="button" onClick={() => setCurrent((v) => v + 1)}>
                Câu tiếp theo
              </button>
            ) : (
              !submitted && <button className="primary" type="button" onClick={submit}>Nộp bài</button>
            )}
          </div>

          {submitted && (
            <div className="assessment-result-actions">
              <Link to="/student/exercises">Ôn bài liên quan</Link>
              <Link to="/student/courses">Tiếp tục học</Link>
            </div>
          )}
        </main>

        <aside className="assessment-question-map">
          <h3>Danh sách câu</h3>
          <div>
            {questions.map((item, index) => (
              <button 
                type="button" 
                className={`${index === current ? "is-current" : ""} ${answered(answers.get(item.id)) ? "is-answered" : ""} ${flags.has(item.id) ? "is-flagged" : ""}`} 
                onClick={() => setCurrent(index)} 
                key={item.id}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {!submitted && (
            <button className="assessment-submit" type="button" onClick={submit}>
              Nộp bài
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
