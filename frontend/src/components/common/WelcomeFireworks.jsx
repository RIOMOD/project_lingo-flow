import { useEffect, useRef, useState } from "react";

export default function WelcomeFireworks({ duration = 3000, onComplete }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let isActive = true;

    // Resize canvas to full window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle system
    const particles = [];
    const colors = ["#FF5722", "#FFC107", "#4CAF50", "#00BCD4", "#E91E63", "#9C27B0", "#FFEB3B", "#00E676", "#3D5AFE", "#FF1744"];

    function createFirework(x, y) {
      const particleCount = 80;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 8 + 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          gravity: 0.15,
        });
      }
    }

    // Launch initial fireworks bursts from center and sides
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    createFirework(centerX, centerY - 80);
    setTimeout(() => isActive && createFirework(centerX - 200, centerY - 150), 300);
    setTimeout(() => isActive && createFirework(centerX + 200, centerY - 150), 600);
    setTimeout(() => isActive && createFirework(centerX, centerY - 250), 900);
    setTimeout(() => isActive && createFirework(centerX - 300, centerY - 50), 1200);
    setTimeout(() => isActive && createFirework(centerX + 300, centerY - 50), 1500);

    let startTime = Date.now();

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      if (Date.now() - startTime < duration || particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setVisible(false);
        if (onComplete) onComplete();
      }
    }

    render();

    const timer = setTimeout(() => {
      isActive = false;
      setVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => {
      isActive = false;
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeWelcomeOverlay 3s forwards",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(15, 23, 42, 0.92)",
          backdropFilter: "blur(12px)",
          border: "2px solid rgba(255, 215, 0, 0.6)",
          borderRadius: "24px",
          padding: "2.5rem 3.5rem",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(255, 215, 0, 0.35), 0 0 30px rgba(79, 70, 229, 0.5)",
          color: "#FFFFFF",
          animation: "popWelcomeBanner 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          maxWidth: "90vw",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🎉 🎆 🚀</div>
        <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #FFD700, #FFA500, #FF69B4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 0.75rem 0",
            letterSpacing: "0.5px",
          }}
        >
          ĐĂNG KÝ THÀNH CÔNG!
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#E2E8F0",
            margin: 0,
            fontWeight: "500",
          }}
        >
          Chào mừng bạn đến với <strong>LingoFlow</strong>! Chúc bạn học tập hiệu quả.
        </p>
      </div>

      <style>{`
        @keyframes popWelcomeBanner {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeWelcomeOverlay {
          0% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}
