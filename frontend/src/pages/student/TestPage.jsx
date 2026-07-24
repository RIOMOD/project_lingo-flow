import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AssessmentQuestion from "../../components/student/AssessmentQuestion";
import { getAttempt, getAttempts, getTests, saveAnswer, startTest, submitAttempt } from "../../services/assessmentService";

function answered(answer) { return Boolean(answer && (answer.selectedOptionId || answer.selectedOptionIds && answer.selectedOptionIds !== "[]" || answer.answerText?.trim() || answer.answerJson)); }
function clock(seconds) { const safe = Math.max(0, seconds); return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`; }

export default function TestPage() {
  const [items, setItems] = useState([]); const [history, setHistory] = useState([]); const [attempt, setAttempt] = useState(null);
  const [current, setCurrent] = useState(0); const [flags, setFlags] = useState(new Set()); const [remaining, setRemaining] = useState(null);
  const [savingId, setSavingId] = useState(null); const [error, setError] = useState(""); const autoSubmitted = useRef(false);
  async function load() { const [testData, attemptData] = await Promise.all([getTests({ size: 20 }), getAttempts({ size: 10 })]); setItems(testData?.items ?? []); setHistory(attemptData?.items ?? []); }
  useEffect(() => { load().catch((err) => setError(err.message || "Không tải được bài kiểm tra")); }, []);
  useEffect(() => { const warn = (event) => { if (attempt?.status === "IN_PROGRESS") { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [attempt?.status]);
  useEffect(() => {
    if (!attempt?.dueAt || attempt.status !== "IN_PROGRESS") return undefined;
    const update = () => setRemaining(Math.max(0, Math.floor((new Date(attempt.dueAt).getTime() - Date.now()) / 1000))); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, [attempt?.dueAt, attempt?.status]);
  useEffect(() => { if (remaining === 0 && attempt?.status === "IN_PROGRESS" && !autoSubmitted.current) { autoSubmitted.current = true; submitAttempt(attempt.id).then(setAttempt).then(load).catch((err) => setError(err.message)); } }, [remaining, attempt]);
  const answers = useMemo(() => new Map((attempt?.answers ?? []).map((answer) => [answer.questionId, answer])), [attempt]);
  const questions = attempt?.questions ?? []; const question = questions[current]; const answeredCount = questions.filter((item) => answered(answers.get(item.id))).length;

  async function begin(id) { try { autoSubmitted.current = false; setCurrent(0); setFlags(new Set()); setAttempt(await startTest(id)); } catch (err) { setError(err.message || "Không bắt đầu được bài kiểm tra"); } }
  async function openResult(id) { try { setCurrent(0); setAttempt(await getAttempt(id)); } catch (err) { setError(err.message || "Không tải được kết quả"); } }
  async function answer(payload) { try { setSavingId(question.id); setAttempt(await saveAnswer(attempt.id, question.id, payload)); } catch (err) { setError(err.message || "Không lưu được đáp án"); } finally { setSavingId(null); } }
  async function submit() { const missing = questions.length - answeredCount; if (!window.confirm(missing ? `Còn ${missing} câu chưa làm. Bạn vẫn muốn nộp bài?` : "Xác nhận nộp bài kiểm tra?")) return; try { setAttempt(await submitAttempt(attempt.id)); await load(); } catch (err) { setError(err.message || "Không nộp được bài"); } }
  function toggleFlag() { setFlags((old) => { const next = new Set(old); next.has(question.id) ? next.delete(question.id) : next.add(question.id); return next; }); }

  if (!attempt) return <div className="assessment-page"><section className="assessment-hero"><span className="page-badge">Đánh giá</span><h2>Bài kiểm tra</h2><p>Không gian làm bài tập trung, tự động lưu từng câu và nhắc bạn trước khi hết giờ.</p></section>{error && <p className="auth-error">{error}</p>}<section className="assessment-library">{items.map((item) => <article key={item.id}><span>TEST</span><h3>{item.title}</h3><p>{item.description}</p><small>{item.durationMinutes} phút · Điểm đạt {item.passScore}</small><button type="button" onClick={() => begin(item.id)}>Bắt đầu kiểm tra</button></article>)}</section>{history.length > 0 && <section className="assessment-history"><h3>Kết quả gần đây</h3>{history.map((item) => <button type="button" onClick={() => openResult(item.id)} key={item.id}><span>{item.title}</span><strong>{item.score ?? "Đang làm"}</strong></button>)}</section>}</div>;

  const submitted = attempt.status !== "IN_PROGRESS"; const percent = Number(attempt.scorePercent || 0); const passed = Boolean(attempt.passed);
  return <div className="assessment-page focused-assessment"><header className="assessment-run-header"><div><span className="page-badge">Bài kiểm tra</span><h2>{attempt.title}</h2><p>{submitted ? "Xem lại từng câu và nội dung cần ôn." : `${answeredCount}/${questions.length} câu đã trả lời`}</p></div>{!submitted && <div className={`assessment-timer ${remaining !== null && remaining <= 300 ? "is-warning" : ""}`}><span>Thời gian còn lại</span><strong>{remaining === null ? "--:--" : clock(remaining)}</strong></div>}</header>{error && <p className="auth-error">{error}</p>}
    {submitted && <section className={`assessment-result-banner ${passed ? "is-pass" : "is-fail"}`}><span aria-hidden="true">{passed ? "✓" : "↻"}</span><div><h3>{passed ? "Bạn đã đạt yêu cầu" : "Bạn chưa đạt yêu cầu"}</h3><p>Điểm {attempt.score}/{attempt.totalPoints} ({percent.toFixed(0)}%) · Đúng {attempt.correctAnswers} · Sai {attempt.incorrectAnswers} · Thời gian {clock(attempt.elapsedSeconds || 0)}</p></div><button type="button" onClick={() => begin(attempt.targetId)}>Làm lại</button></section>}
    <div className="assessment-workspace"><main><div className="assessment-counter"><span>Câu {current + 1} / {questions.length}</span>{!submitted && <button type="button" className={flags.has(question?.id) ? "is-flagged" : ""} onClick={toggleFlag}>⚑ {flags.has(question?.id) ? "Đã đánh dấu" : "Xem lại sau"}</button>}</div>{question && <AssessmentQuestion question={question} answer={answers.get(question.id)} disabled={submitted} onAnswer={answer} saving={savingId === question.id} />}<div className="assessment-nav"><button type="button" disabled={current === 0} onClick={() => setCurrent((v) => v - 1)}>Câu trước</button>{current < questions.length - 1 ? <button type="button" onClick={() => setCurrent((v) => v + 1)}>Câu tiếp theo</button> : !submitted && <button className="primary" type="button" onClick={submit}>Nộp bài</button>}</div>{submitted && <div className="assessment-result-actions"><Link to="/student/exercises">Ôn bài liên quan</Link><Link to="/student/courses">Tiếp tục học</Link></div>}</main><aside className="assessment-question-map"><h3>Danh sách câu</h3><div>{questions.map((item, index) => <button type="button" className={`${index === current ? "is-current" : ""} ${answered(answers.get(item.id)) ? "is-answered" : ""} ${flags.has(item.id) ? "is-flagged" : ""}`} onClick={() => setCurrent(index)} key={item.id}>{index + 1}</button>)}</div>{!submitted && <button className="assessment-submit" type="button" onClick={submit}>Nộp bài</button>}</aside></div>
  </div>;
}
