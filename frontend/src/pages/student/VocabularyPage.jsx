import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVocabularies } from "../../services/learningService";
import { getMyCourses } from "../../services/userService";
import "../../styles/VocabularyDashboard.css";

const placeholderImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80";

function isReviewDue(item) {
  return Boolean(item.reviewDue || item.status === "WEAK");
}

function topicAction(topic) {
  if (topic.reviewDueCount > 0) return "Ôn từ đến hạn";
  if (topic.learnedWords === 0) return "Bắt đầu học";
  if (topic.learnedWords >= topic.totalWords) return "Ôn tập chủ đề";
  return "Học tiếp";
}

export default function VocabularyPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [words, setWords] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoadingCourses(true);
    getMyCourses({ size: 100 })
      .then((data) => {
        if (!mounted) return;
        const ownedCourses = (data?.items ?? []).filter((course) => course.ownershipStatus === "ACTIVE");
        setCourses(ownedCourses);
        setSelectedCourseId(ownedCourses[0]?.courseId ? String(ownedCourses[0].courseId) : "");
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được khóa học của bạn.");
      })
      .finally(() => {
        if (mounted) setLoadingCourses(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setWords([]);
      return;
    }

    let mounted = true;
    setLoadingWords(true);
    setError("");
    getVocabularies({ courseId: selectedCourseId, size: 200 })
      .then((data) => {
        if (mounted) setWords(data?.items ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được chủ đề từ vựng.");
      })
      .finally(() => {
        if (mounted) setLoadingWords(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.courseId) === String(selectedCourseId)),
    [courses, selectedCourseId]
  );

  const topics = useMemo(() => {
    const grouped = new Map();
    words.forEach((word) => {
      const topicName = word.topic?.trim();
      if (!topicName) return;
      const current = grouped.get(topicName) ?? {
        name: topicName,
        courseId: word.courseId,
        courseTitle: selectedCourse?.title || "Khóa học",
        imageUrl: word.imageUrl || placeholderImage,
        totalWords: 0,
        learnedWords: 0,
        reviewDueCount: 0,
      };
      current.totalWords += 1;
      if (word.reviewCount > 0 || word.status === "FAMILIAR" || word.status === "MASTERED") {
        current.learnedWords += 1;
      }
      if (isReviewDue(word)) {
        current.reviewDueCount += 1;
      }
      if (!current.imageUrl || current.imageUrl === placeholderImage) {
        current.imageUrl = word.imageUrl || placeholderImage;
      }
      grouped.set(topicName, current);
    });
    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [words, selectedCourse]);

  const totals = useMemo(() => ({
    totalWords: words.length,
    learnedWords: words.filter((word) => word.reviewCount > 0 || word.status === "FAMILIAR" || word.status === "MASTERED").length,
    reviewDueCount: words.filter(isReviewDue).length,
  }), [words]);

  function startTopic(topic, reviewOnly = false) {
    const params = new URLSearchParams({
      courseId: String(topic.courseId),
      topic: topic.name,
    });
    if (reviewOnly) params.set("type", "review");
    navigate(`/student/vocabulary/session?${params.toString()}`);
  }

  return (
    <div className="vocab-dashboard-page">
      <section className="vocab-hero">
        <div className="vocab-hero-content">
          <span className="page-badge">Student vocabulary</span>
          <h1>Từ vựng theo khóa học</h1>
          <p>Chọn khóa học đã sở hữu, học theo chủ đề thật do Teacher tạo, làm quiz và ôn lại các từ cần củng cố.</p>
          <label className="vocab-course-picker">
            Khóa học của tôi
            <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} disabled={loadingCourses}>
              <option value="">-- Chọn khóa học --</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>{course.title}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="vocab-stats">
          <div className="vocab-stat-card">
            <h3>{totals.totalWords}</h3>
            <p>Tổng từ</p>
          </div>
          <div className="vocab-stat-card">
            <h3>{totals.learnedWords}</h3>
            <p>Đã học</p>
          </div>
          <div className="vocab-stat-card">
            <h3>{totals.reviewDueCount}</h3>
            <p>Cần ôn</p>
          </div>
        </div>
      </section>

      {error && <p className="auth-error" role="alert">{error}</p>}

      <section className="vocab-topics-section">
        <h2>Chủ đề trong {selectedCourse?.title || "khóa học đã chọn"}</h2>

        {(loadingCourses || loadingWords) && (
          <div className="vocab-topic-grid">
            {[1, 2, 3].map((item) => <div className="vocab-topic-card vocab-skeleton" key={item} />)}
          </div>
        )}

        {!loadingCourses && !selectedCourseId && (
          <article className="vocab-empty-state">
            <h3>Bạn chưa có khóa học để luyện từ vựng</h3>
            <p>Hãy đăng ký khóa miễn phí hoặc mua khóa trả phí để mở kho từ vựng của khóa đó.</p>
          </article>
        )}

        {!loadingWords && selectedCourseId && topics.length === 0 && (
          <article className="vocab-empty-state">
            <h3>Khóa học này chưa có chủ đề từ vựng</h3>
            <p>Khi Teacher tạo từ vựng theo chủ đề, các chủ đề sẽ xuất hiện tại đây.</p>
          </article>
        )}

        {!loadingWords && topics.length > 0 && (
          <div className="vocab-topic-grid">
            {topics.map((topic) => {
              const percent = topic.totalWords > 0 ? Math.round((topic.learnedWords / topic.totalWords) * 100) : 0;
              return (
                <article className="vocab-topic-card" key={topic.name}>
                  <img className="vocab-topic-image" src={topic.imageUrl || placeholderImage} alt={topic.name} onError={(event) => { event.currentTarget.src = placeholderImage; }} />
                  <div className="vocab-topic-body">
                    <p className="vocab-topic-course">{topic.courseTitle}</p>
                    <h3 className="vocab-topic-title">{topic.name}</h3>
                    <div className="vocab-topic-progress">
                      <div className="vocab-progress-bar"><div className="vocab-progress-fill" style={{ width: `${percent}%` }} /></div>
                      <span className="vocab-topic-meta">{percent}%</span>
                    </div>
                    <div className="vocab-topic-stats">
                      <span>{topic.totalWords} từ</span>
                      <span>{topic.learnedWords} đã học</span>
                      <span>{topic.reviewDueCount} cần ôn</span>
                    </div>
                    <button type="button" className="vocab-start-btn" onClick={() => startTopic(topic, topic.reviewDueCount > 0)}>
                      {topicAction(topic)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
