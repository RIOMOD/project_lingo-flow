import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getReviewVocabularies, getVocabularies, updateVocabularyProgress } from "../../services/learningService";
import "../../styles/VocabularySession.css";

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function uniqueOptions(options) {
  return Array.from(new Set(options.filter(Boolean))).slice(0, 4);
}

function blankExample(sentence, word) {
  if (!sentence || !word) return "";
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sentence.replace(new RegExp(escaped, "i"), "______");
}

function createOptions(vocabulary, pool, field) {
  const correct = vocabulary[field];
  const wrong = shuffle(pool.filter((item) => item.id !== vocabulary.id).map((item) => item[field])).filter(Boolean);
  return shuffle(uniqueOptions([correct, ...wrong]));
}

function createQuestion(vocabulary, pool, preferredType) {
  const availableTypes = [
    "WORD_TO_MEANING",
    "MEANING_TO_WORD",
    vocabulary.imageUrl ? "IMAGE_TO_WORD" : null,
    vocabulary.exampleSentence ? "FILL_EXAMPLE" : null,
    vocabulary.audioUrl ? "AUDIO_TO_WORD" : null,
  ].filter(Boolean);
  const type = availableTypes.includes(preferredType) ? preferredType : shuffle(availableTypes)[0];

  if (type === "MEANING_TO_WORD") {
    return {
      id: `${vocabulary.id}-meaning-word`,
      type,
      vocabulary,
      prompt: `Từ nào có nghĩa là "${vocabulary.meaning}"?`,
      answer: vocabulary.word,
      options: createOptions(vocabulary, pool, "word"),
    };
  }

  if (type === "IMAGE_TO_WORD") {
    return {
      id: `${vocabulary.id}-image-word`,
      type,
      vocabulary,
      prompt: "Nhìn hình minh họa và chọn từ phù hợp.",
      answer: vocabulary.word,
      options: createOptions(vocabulary, pool, "word"),
    };
  }

  if (type === "FILL_EXAMPLE") {
    return {
      id: `${vocabulary.id}-fill-example`,
      type,
      vocabulary,
      prompt: "Điền từ còn thiếu trong câu ví dụ.",
      examplePrompt: blankExample(vocabulary.exampleSentence, vocabulary.word),
      answer: vocabulary.word,
      options: createOptions(vocabulary, pool, "word"),
    };
  }

  if (type === "AUDIO_TO_WORD") {
    return {
      id: `${vocabulary.id}-audio-word`,
      type,
      vocabulary,
      prompt: "Nghe âm thanh và chọn từ bạn nghe được.",
      answer: vocabulary.word,
      options: createOptions(vocabulary, pool, "word"),
    };
  }

  return {
    id: `${vocabulary.id}-word-meaning`,
    type: "WORD_TO_MEANING",
    vocabulary,
    prompt: `Chọn nghĩa đúng của từ "${vocabulary.word}".`,
    answer: vocabulary.meaning,
    options: createOptions(vocabulary, pool, "meaning"),
  };
}

function buildQuestions(words, reviewOnly = false) {
  const candidates = reviewOnly
    ? words.filter((word) => word.reviewDue || word.status === "WEAK" || (word.incorrectCount ?? 0) > 0)
    : words;
  const source = candidates.length > 0 ? candidates : words;
  return shuffle(source)
    .map((word) => createQuestion(word, words))
    .filter((question) => question.options.length === 4 && question.options.includes(question.answer));
}

export default function VocabularySessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const topic = searchParams.get("topic") || "";
  const reviewOnly = searchParams.get("type") === "review";

  const [words, setWords] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answered, setAnswered] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + (answered ? 1 : 0)) / questions.length) * 100) : 0;

  useEffect(() => {
    if (!courseId || !topic) {
      setError("Thiếu khóa học hoặc chủ đề từ vựng.");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");
    const request = reviewOnly ? getReviewVocabularies({ size: 200 }) : getVocabularies({ courseId, topic, size: 200 });
    request
      .then((data) => {
        if (!mounted) return;
        const loadedWords = (data?.items ?? []).filter((word) => String(word.courseId) === String(courseId) && word.topic === topic);
        const generated = buildQuestions(loadedWords, reviewOnly);
        setWords(loadedWords);
        setQuestions(generated);
        setCurrentIndex(0);
        setResults([]);
        setCompleted(false);
        setSelectedOption("");
        setAnswered(false);
        setStartedAt(Date.now());
        setImageError(false);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được phiên học từ vựng.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseId, topic, reviewOnly]);

  const score = useMemo(() => {
    const correct = results.filter((item) => item.correct).length;
    const wrong = results.length - correct;
    return {
      correct,
      wrong,
      accuracy: results.length > 0 ? Math.round((correct / results.length) * 100) : 0,
      wrongItems: results.filter((item) => !item.correct),
    };
  }, [results]);

  async function chooseOption(option) {
    if (answered || saving || !currentQuestion) return;
    const correct = option === currentQuestion.answer;
    const responseTimeMillis = Date.now() - startedAt;
    setSelectedOption(option);
    setAnswered(true);
    setSaving(true);
    setResults((current) => [
      ...current,
      {
        questionId: currentQuestion.id,
        vocabulary: currentQuestion.vocabulary,
        selected: option,
        answer: currentQuestion.answer,
        correct,
      },
    ]);

    try {
      await updateVocabularyProgress(currentQuestion.vocabulary.id, {
        answeredCorrect: correct,
        responseTimeMillis,
      });
    } catch (err) {
      setError(err.message || "Không lưu được tiến độ từ vựng.");
    } finally {
      setSaving(false);
    }
  }

  function nextQuestion() {
    setSelectedOption("");
    setAnswered(false);
    setStartedAt(Date.now());
    setImageError(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1);
    } else {
      setCompleted(true);
    }
  }

  function reviewWrongWords() {
    const wrongWords = score.wrongItems.map((item) => item.vocabulary);
    if (wrongWords.length === 0) return;
    setQuestions(shuffle(wrongWords).map((word) => createQuestion(word, words)).filter((question) => question.options.length === 4));
    setCurrentIndex(0);
    setSelectedOption("");
    setAnswered(false);
    setResults([]);
    setCompleted(false);
    setStartedAt(Date.now());
    setImageError(false);
  }

  function playAudio() {
    if (!currentQuestion?.vocabulary.audioUrl) return;
    new Audio(currentQuestion.vocabulary.audioUrl).play().catch(() => setError("Không phát được âm thanh của từ này."));
  }

  if (loading) {
    return <div className="vocab-session-page"><p className="auth-state">Đang tải phiên quiz...</p></div>;
  }

  if (error && questions.length === 0) {
    return (
      <div className="vocab-session-page">
        <article className="vocab-result-card">
          <h2>Không thể mở quiz</h2>
          <p>{error}</p>
          <button type="button" className="vocab-next-btn" onClick={() => navigate("/student/vocabulary")}>Quay về danh sách chủ đề</button>
        </article>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="vocab-session-page">
        <article className="vocab-result-card">
          <h2>Chưa đủ dữ liệu để tạo quiz</h2>
          <p>Chủ đề cần ít nhất 4 từ có dữ liệu phù hợp để tạo lựa chọn không trùng nhau.</p>
          <button type="button" className="vocab-next-btn" onClick={() => navigate("/student/vocabulary")}>Quay về danh sách chủ đề</button>
        </article>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="vocab-session-page">
        <article className="vocab-result-card">
          <p className="vocab-session-kicker">{topic}</p>
          <h2>Kết quả học từ vựng</h2>
          <div className="vocab-result-stats">
            <span><strong>{score.correct}</strong>Câu đúng</span>
            <span><strong>{score.wrong}</strong>Câu sai</span>
            <span><strong>{score.accuracy}%</strong>Chính xác</span>
          </div>
          {score.wrongItems.length > 0 && (
            <div className="vocab-wrong-list">
              <h3>Từ trả lời sai</h3>
              {score.wrongItems.map((item) => (
                <p key={item.questionId}><strong>{item.vocabulary.word}</strong> · {item.vocabulary.meaning}</p>
              ))}
            </div>
          )}
          <div className="vocab-result-actions">
            {score.wrongItems.length > 0 && <button type="button" className="vocab-next-btn" onClick={reviewWrongWords}>Ôn lại từ sai</button>}
            <button type="button" className="vocab-ghost-btn" onClick={() => navigate("/student/vocabulary")}>Quay về danh sách chủ đề</button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="vocab-session-page">
      <header className="vocab-session-header">
        <button type="button" className="vocab-session-close" onClick={() => navigate("/student/vocabulary")}>x</button>
        <div className="vocab-session-title">
          <strong>{topic}</strong>
          <span>Câu {currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="vocab-session-progress" aria-label={`Tiến độ ${progressPercent}%`}>
          <div className="vocab-session-progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      {error && <p className="auth-error" role="alert">{error}</p>}

      <main className="vocab-session-main">
        <article className="vocab-activity-container">
          <p className="vocab-activity-type">
            {reviewOnly ? "Ôn tập từ đến hạn" : "Quiz từ vựng"} · {currentQuestion.vocabulary.level}
          </p>
          <h2 className="vocab-question">{currentQuestion.prompt}</h2>

          {currentQuestion.type === "FILL_EXAMPLE" && (
            <p className="vocab-example-prompt">{currentQuestion.examplePrompt || currentQuestion.vocabulary.exampleSentence}</p>
          )}

          {currentQuestion.vocabulary.imageUrl && (
            <div className="vocab-image-frame">
              {!imageError ? (
                <img src={currentQuestion.vocabulary.imageUrl} alt={currentQuestion.vocabulary.word} onError={() => setImageError(true)} />
              ) : (
                <span>Chưa có hình minh họa</span>
              )}
            </div>
          )}

          {currentQuestion.vocabulary.audioUrl && (
            <button type="button" className="vocab-audio-btn" onClick={playAudio}>Nghe phát âm</button>
          )}

          <div className="vocab-options">
            {currentQuestion.options.map((option) => {
              let className = "vocab-option-btn";
              if (answered && option === currentQuestion.answer) className += " correct";
              if (answered && option === selectedOption && option !== currentQuestion.answer) className += " incorrect";
              return (
                <button key={option} type="button" className={className} disabled={answered || saving} onClick={() => chooseOption(option)}>
                  {option}
                </button>
              );
            })}
          </div>

          {answered && (
            <section className={`vocab-feedback ${selectedOption === currentQuestion.answer ? "success" : "error"}`}>
              <strong>{selectedOption === currentQuestion.answer ? "Chính xác" : "Chưa đúng"}</strong>
              <p><strong>{currentQuestion.vocabulary.word}</strong> {currentQuestion.vocabulary.ipa ? `· ${currentQuestion.vocabulary.ipa}` : ""}</p>
              <p>{currentQuestion.vocabulary.meaning}</p>
              {currentQuestion.vocabulary.exampleSentence && <p>{currentQuestion.vocabulary.exampleSentence}</p>}
              {currentQuestion.vocabulary.exampleMeaning && <p>{currentQuestion.vocabulary.exampleMeaning}</p>}
            </section>
          )}

          {answered && (
            <div className="vocab-footer">
              <button type="button" className="vocab-next-btn" disabled={saving} onClick={nextQuestion}>
                {currentIndex === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
              </button>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
