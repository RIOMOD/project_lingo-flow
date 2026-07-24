import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../../components/common/UiState";
import "../../styles/VocabularyDashboard.css";
// import { getVocabularyDashboard, getVocabularyTopics } from "../../services/vocabularyLearningService"; // To be created

export default function VocabularyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Mock data since API is mocked
  const [dashboard, setDashboard] = useState({
    reviewDueCount: 15,
    totalMastered: 120,
    recommendedSession: {
      topicName: "Technology & Science"
    }
  });

  const [topics, setTopics] = useState([
    { name: "Daily Conversation", totalWords: 50, masteredWords: 50, status: "COMPLETED" },
    { name: "Technology & Science", totalWords: 40, masteredWords: 10, status: "IN_PROGRESS" },
    { name: "Travel & Culture", totalWords: 35, masteredWords: 0, status: "NOT_STARTED" },
    { name: "Business English", totalWords: 60, masteredWords: 0, status: "NOT_STARTED" }
  ]);

  // useEffect(() => {
  //   async function fetch() {
  //     setLoading(true);
  //     try {
  //        const dash = await getVocabularyDashboard();
  //        const tops = await getVocabularyTopics();
  //        setDashboard(dash);
  //        setTopics(tops);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetch();
  // }, []);

  if (loading) return <LoadingState title="Loading dashboard..." />;

  return (
    <div className="vocab-dashboard-page">
      <section className="vocab-hero">
        <div className="vocab-hero-content">
          <h1>Vocabulary Center</h1>
          <p>Học từ vựng qua ngữ cảnh, tăng khả năng phản xạ và ghi nhớ sâu.</p>
          {dashboard.reviewDueCount > 0 && (
            <button className="vocab-start-btn" style={{ width: 'auto', marginTop: '2rem', padding: '16px 32px', fontSize: '1.2rem' }} onClick={() => navigate('/student/vocabulary/session?type=review')}>
              🔥 Ôn tập {dashboard.reviewDueCount} từ đến hạn
            </button>
          )}
        </div>
        <div className="vocab-stats">
          <div className="vocab-stat-card">
            <h3>{dashboard.totalMastered}</h3>
            <p>Từ Đã Nhớ</p>
          </div>
          <div className="vocab-stat-card">
            <h3 style={{color: '#FF6B6B'}}>{dashboard.reviewDueCount}</h3>
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
                  {topic.status === 'COMPLETED' ? 'Ôn tập Chủ đề' : 'Học Tiếp'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
