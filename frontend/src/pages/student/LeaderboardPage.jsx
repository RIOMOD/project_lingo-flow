import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/LeaderboardPage.css";

const leaderboardData = [
  { rank: 1, name: "Nguyễn Công Trứ", email: "student@example.com", xp: 1250, streak: 7, words: 120, badge: "🥇 Vàng" },
  { rank: 2, name: "Trần Thị Ánh", email: "anh.tran@example.com", xp: 1100, streak: 5, words: 95, badge: "🥈 Bạc" },
  { rank: 3, name: "Lê Minh Tuấn", email: "tuan.le@example.com", xp: 980, streak: 4, words: 82, badge: "🥉 Đồng" },
  { rank: 4, name: "Phạm Hải Đăng", email: "dang.pham@example.com", xp: 850, streak: 3, words: 70, badge: "🏆 Top 5" },
  { rank: 5, name: "Vũ Thị Hương", email: "huong.vu@example.com", xp: 720, streak: 2, words: 60, badge: "🏆 Top 5" },
];

const achievements = [
  { id: 1, title: "Siêu sao Từ vựng", desc: "Thuộc hơn 50 từ vựng", icon: "🎯", unlocked: true },
  { id: 2, title: "Chuỗi 7 Ngày 🔥", desc: "Học liên tục 7 ngày không ngắt quãng", icon: "🔥", unlocked: true },
  { id: 3, title: "Thực hành AI Master", desc: "Hoàn thành 10 phiên hội thoại AI", icon: "🤖", unlocked: true },
  { id: 4, title: "Thách thức Ngữ pháp", desc: "Đạt 100% trong bài thi Ngữ pháp", icon: "⚡", unlocked: false },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const accountName = user?.fullName || user?.name || "Nguyễn Công Trứ";
  const [tab, setTab] = useState("leaderboard"); // 'leaderboard' | 'achievements'

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        {/* Streak & Rank Banner Header */}
        <section className="leaderboard-hero">
          <div className="hero-stat-card streak-card">
            <span className="hero-stat-icon">🔥</span>
            <div>
              <h3>7 Ngày</h3>
              <p>Chuỗi học tập liên tục (Streak)</p>
            </div>
          </div>

          <div className="hero-stat-card xp-card">
            <span className="hero-stat-icon">⚡</span>
            <div>
              <h3>1,250 XP</h3>
              <p>Tổng điểm kinh nghiệm tích lũy</p>
            </div>
          </div>

          <div className="hero-stat-card rank-card">
            <span className="hero-stat-icon">👑</span>
            <div>
              <h3>Hạng #1</h3>
              <p>Thứ hạng tuần này</p>
            </div>
          </div>
        </section>

        {/* Tab Selector */}
        <div className="leaderboard-tabs">
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

        {tab === "leaderboard" ? (
          <section className="leaderboard-card">
            <div className="card-header">
              <h3>Bảng xếp hạng Tuần này</h3>
              <p>Thi đua tích lũy XP và từ vựng cùng các học viên toàn hệ thống</p>
            </div>

            <div className="leaderboard-table">
              {leaderboardData.map((item) => (
                <div className={`table-row ${item.name === accountName ? "is-user" : ""}`} key={item.rank}>
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
