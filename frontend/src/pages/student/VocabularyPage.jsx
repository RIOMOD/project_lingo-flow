import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../../components/common/UiState";
import { getProgressDashboard } from "../../services/progressService";
import "../../styles/VocabularyDashboard.css";

const DEFAULT_TOPICS = [
  { name: "Daily Conversation", totalWords: 50, masteredWords: 0, status: "NOT_STARTED" },
  { name: "Technology & Science", totalWords: 40, masteredWords: 0, status: "NOT_STARTED" },
  { name: "Travel & Culture", totalWords: 35, masteredWords: 0, status: "NOT_STARTED" },
  { name: "Business English", totalWords: 60, masteredWords: 0, status: "NOT_STARTED" }
];

export default function VocabularyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [dashboard, setDashboard] = useState({
    reviewDueCount: 0,
    totalMastered: 0,
    learnedWords: 0
  });

  const [topics, setTopics] = useState(DEFAULT_TOPICS);

  useEffect(() => {
    let isMounted = true;
    async function loadProgress() {
      try {
        const data = await getProgressDashboard();
        if (isMounted && data) {
          setDashboard({
            reviewDueCount: data.dueReviewWords || 0,
            totalMastered: data.rememberedWords || 0,
            learnedWords: data.learnedWords || 0
          });
          
          // If student has mastered words, reflect in topic list
          if (data.learnedWords > 0) {
            setTopics(prev => prev.map(t => {
              const mastered = Math.min(t.totalWords, Math.floor((data.learnedWords / 4)));
              return {
                ...t,
                masteredWords: mastered,
                status: mastered >= t.totalWords ? "COMPLETED" : mastered > 0 ? "IN_PROGRESS" : "NOT_STARTED"
              };
            }));
          }
        }
      } catch (err) {
        console.warn("Could not load vocabulary progress metrics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProgress();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <LoadingState title="Đang tải dữ liệu từ vựng..." />;

  return (
    <div className="vocab-dashboard-page">
      <section className="vocab-hero">
        <div className="vocab-hero-content">
          <h1>Vocabulary Center</h1>
          <p>Học từ vựng qua ngữ cảnh, tăng khả năng phản xạ và ghi nhớ sâu.</p>
          {dashboard.reviewDueCount > 0 ? (
            <button className="vocab-start-btn" style={{ width: 'auto', marginTop: '1.5rem', padding: '12px 24px' }} onClick={() => navigate('/student/vocabulary/session?type=review')}>
              🔥 Ôn tập {dashboard.reviewDueCount} từ đến hạn
            </button>
          ) : (
            <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.95rem' }}>
              💡 Bạn chưa có từ vựng nào cần ôn tập. Hãy chọn một chủ đề bên dưới để bắt đầu học!
            </div>
          )}
        </div>
        <div className="vocab-stats">
          <div className="vocab-stat-card">
            <h3>{dashboard.totalMastered}</h3>
            <p>Từ Đã Nhớ</p>
          </div>
          <div className="vocab-stat-card">
            <h3 style={{ color: dashboard.reviewDueCount > 0 ? '#ef4444' : '#64748b' }}>{dashboard.reviewDueCount}</h3>
            <p>Cần Ôn Tập</p>
          </div>
        </div>
      </section>

      <section className="vocab-topics-section">
        <h2>Chủ đề học</h2>
        <div className="vocab-topic-grid">
          {topics.map((topic, i) => {
            const percent = topic.totalWords > 0 ? (topic.masteredWords / topic.totalWords) * 100 : 0;
            return (
              <article className="vocab-topic-card" key={i}>
                <h3 className="vocab-topic-title">{topic.name}</h3>
                <div className="vocab-topic-progress">
                  <div className="vocab-progress-bar">
                    <div className="vocab-progress-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="vocab-topic-meta">{Math.round(percent)}%</span>
                </div>
                <div className="vocab-topic-meta" style={{ marginBottom: '1rem' }}>
                  {topic.masteredWords} / {topic.totalWords} từ đã thuộc
                </div>
                <button 
                  className="vocab-start-btn"
                  onClick={() => navigate(`/student/vocabulary/session?topic=${encodeURIComponent(topic.name)}`)}
                >
                  {topic.status === 'COMPLETED' ? 'Ôn tập Chủ đề' : topic.masteredWords > 0 ? 'Học Tiếp' : 'Bắt Đầu Học'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
