import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getProgressDashboard, getLeaderboard } from "../../services/progressService";
import "../../styles/LeaderboardPage.css";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const accountName = user?.fullName || user?.name || "";
  const [tab, setTab] = useState("leaderboard"); // 'leaderboard' | 'achievements'
  const [period, setPeriod] = useState("weekly"); // 'weekly' | 'monthly' | 'alltime'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState({ streak: 0, xp: 0, rank: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const data = await getLeaderboard(period);
        setLeaderboardData(data || []);
        
        // Find current user's stats in the leaderboard data
        const currentUser = data?.find(item => item.email === user?.email);
        if (currentUser) {
          setUserStats({
            streak: currentUser.streak,
            xp: currentUser.xp,
            rank: currentUser.rank
          });
        } else {
          // If current user is not found, fallback to dashboard
          const dashboard = await getProgressDashboard();
          if (dashboard) {
            setUserStats({
              streak: dashboard.streakDays || dashboard.streak || 0,
              xp: dashboard.xpPoints || dashboard.totalXp || dashboard.xp || 0,
              rank: (data?.length || 0) + 1
            });
          }
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [period, user?.email]);

  const top3 = leaderboardData.slice(0, 3);

  // Dynamic achievements based on stats
  const achievements = [
    { id: 1, title: "Siêu sao Từ vựng", desc: "Thuộc hơn 50 từ vựng", icon: "🎯", unlocked: leaderboardData.find(item => item.email === user?.email)?.words >= 50 },
    { id: 2, title: "Chuỗi 7 Ngày 🔥", desc: "Học liên tục 7 ngày không ngắt quãng", icon: "🔥", unlocked: userStats.streak >= 7 },
    { id: 3, title: "Thực hành AI Master", desc: "Hoàn thành phiên hội thoại AI", icon: "🤖", unlocked: true },
    { id: 4, title: "Thách thức Ngữ pháp", desc: "Đạt 100% trong bài thi Ngữ pháp", icon: "⚡", unlocked: false },
  ];

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        
        {/* Header Stats */}
        <section className="leaderboard-hero">
          <div className="hero-stat-card streak-card">
            <span className="hero-stat-icon">🔥</span>
            <div>
              <h3>{userStats.streak} Ngày</h3>
              <p>Chuỗi học tập liên tục (Streak)</p>
            </div>
          </div>

          <div className="hero-stat-card xp-card">
            <span className="hero-stat-icon">⚡</span>
            <div>
              <h3>{userStats.xp.toLocaleString()} XP</h3>
              <p>Điểm kinh nghiệm tích lũy</p>
            </div>
          </div>

          <div className="hero-stat-card rank-card">
            <span className="hero-stat-icon">👑</span>
            <div>
              <h3>Hạng #{userStats.rank}</h3>
              <p>Thứ hạng tuần này</p>
            </div>
          </div>
        </section>

        {/* Tab Selector */}
        <div className="leaderboard-tabs" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`tab-btn ${tab === "leaderboard" ? "is-active" : ""}`}
              type="button"
              onClick={() => setTab("leaderboard")}
            >
              🏆 Bảng xếp hạng Học viên
            </button>
            <button
              className={`tab-btn ${tab === "achievements" ? "is-active" : ""}`}
              type="button"
              onClick={() => setTab("achievements")}
            >
              🏅 Huy hiệu & Thành tích
            </button>
          </div>

          {tab === "leaderboard" && (
            <div style={{ display: "flex", background: "#e2e8f0", padding: "0.25rem", borderRadius: "10px", gap: "0.25rem" }}>
              <button
                type="button"
                onClick={() => setPeriod("weekly")}
                style={{ padding: "0.4rem 0.85rem", borderRadius: "8px", border: "none", background: period === "weekly" ? "#0d9488" : "transparent", color: period === "weekly" ? "#ffffff" : "#475569", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}
              >
                Tuần này
              </button>
              <button
                type="button"
                onClick={() => setPeriod("monthly")}
                style={{ padding: "0.4rem 0.85rem", borderRadius: "8px", border: "none", background: period === "monthly" ? "#0d9488" : "transparent", color: period === "monthly" ? "#ffffff" : "#475569", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}
              >
                Tháng này
              </button>
              <button
                type="button"
                onClick={() => setPeriod("alltime")}
                style={{ padding: "0.4rem 0.85rem", borderRadius: "8px", border: "none", background: period === "alltime" ? "#0d9488" : "transparent", color: period === "alltime" ? "#ffffff" : "#475569", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}
              >
                Tất cả thời gian
              </button>
            </div>
          )}
        </div>

        {tab === "leaderboard" ? (
          <section className="leaderboard-card">
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", fontWeight: "600" }}>
                Đang tải bảng xếp hạng...
              </div>
            ) : leaderboardData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", fontWeight: "600" }}>
                Chưa có dữ liệu học tập nào được ghi nhận.
              </div>
            ) : (
              <>
                {/* Top 3 Podium Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: "1rem", marginBottom: "2rem", alignItems: "end" }}>
                  
                  {/* Rank 2 (Silver) */}
                  {top3[1] && (
                    <div style={{ background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)", borderRadius: "20px", padding: "1.25rem", textAlign: "center", border: "2px solid #cbd5e1", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#94a3b8", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 0.5rem auto", fontWeight: "bold" }}>🥈</div>
                      <strong style={{ display: "block", fontSize: "1.05rem", color: "#1e293b" }}>{top3[1].name}</strong>
                      <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "600" }}>{top3[1].badge}</span>
                      <div style={{ marginTop: "0.75rem", background: "#ffffff", padding: "0.4rem", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "800", color: "#475569" }}>
                        {top3[1].xp.toLocaleString()} XP
                      </div>
                    </div>
                  )}

                  {/* Rank 1 (Gold - Highest) */}
                  {top3[0] && (
                    <div style={{ background: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)", borderRadius: "24px", padding: "1.75rem 1.25rem", textAlign: "center", border: "3px solid #f59e0b", boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.25)" }}>
                      <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#f59e0b", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 0.5rem auto", fontWeight: "bold", boxShadow: "0 4px 10px rgba(245, 158, 11, 0.4)" }}>🥇</div>
                      <strong style={{ display: "block", fontSize: "1.2rem", color: "#78350f" }}>{top3[0].name}</strong>
                      <span style={{ fontSize: "0.82rem", color: "#b45309", fontWeight: "700" }}>{top3[0].badge}</span>
                      <div style={{ marginTop: "0.85rem", background: "#ffffff", padding: "0.5rem", borderRadius: "12px", fontSize: "1.05rem", fontWeight: "900", color: "#d97706" }}>
                        {top3[0].xp.toLocaleString()} XP
                      </div>
                    </div>
                  )}

                  {/* Rank 3 (Bronze) */}
                  {top3[2] && (
                    <div style={{ background: "linear-gradient(180deg, #ffedd5 0%, #fed7aa 100%)", borderRadius: "20px", padding: "1.25rem", textAlign: "center", border: "2px solid #fdba74", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ea580c", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 0.5rem auto", fontWeight: "bold" }}>🥉</div>
                      <strong style={{ display: "block", fontSize: "1.05rem", color: "#7c2d12" }}>{top3[2].name}</strong>
                      <span style={{ fontSize: "0.78rem", color: "#c2410c", fontWeight: "600" }}>{top3[2].badge}</span>
                      <div style={{ marginTop: "0.75rem", background: "#ffffff", padding: "0.4rem", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "800", color: "#c2410c" }}>
                        {top3[2].xp.toLocaleString()} XP
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-header">
                  <h3>Bảng xếp hạng {period === "weekly" ? "Tuần này" : period === "monthly" ? "Tháng này" : "Tất cả thời gian"}</h3>
                  <p>Thi đua tích lũy XP và từ vựng cùng các học viên toàn hệ thống</p>
                </div>

                <div className="leaderboard-table">
                  {leaderboardData.map((item) => (
                    <div className={`table-row ${item.email === user?.email ? "is-user" : ""}`} key={item.rank}>
                      <div className={`rank-tag rank-${item.rank}`}>#{item.rank}</div>
                      <div className="user-info">
                        <span className="user-avatar">{item.name.slice(-2).toUpperCase()}</span>
                        <div>
                          <strong>{item.name}</strong>
                          <small>{item.badge}</small>
                        </div>
                      </div>
                      <div className="row-stat">
                        <span>🔥 {item.streak} Ngày</span>
                      </div>
                      <div className="row-stat">
                        <span>📚 {item.words} Từ thuộc</span>
                      </div>
                      <div className="row-xp">
                        <strong>{item.xp.toLocaleString()} XP</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        ) : (
          <section className="achievements-grid">
            {achievements.map((item) => (
              <div className={`achievement-card ${item.unlocked ? "unlocked" : "locked"}`} key={item.id}>
                <div className="achievement-icon">{item.icon}</div>
                <div className="achievement-info">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
                <span className="status-badge">{item.unlocked ? "Đã mở khóa ✓" : "Chưa mở khóa 🔒"}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
