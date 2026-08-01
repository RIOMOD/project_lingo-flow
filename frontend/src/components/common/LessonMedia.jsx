import { useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

/** Returns true if the URL is a placeholder / example domain that shouldn't be played */
function isPlaceholderUrl(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return host === "example.com" || host.endsWith(".example.com");
  } catch {
    return true; // Unparseable → treat as placeholder
  }
}

/**
 * Extract a valid YouTube video ID from any YouTube URL format.
 * Returns null if no valid 11-char video ID is found.
 */
function extractYoutubeId(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();

  // Raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (host.includes("youtube.com")) {
      // youtube.com/embed/VIDEO_ID
      const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];

      // youtube.com/watch?v=VIDEO_ID
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // youtube.com/shorts/VIDEO_ID
      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// YouTube API Singleton Loader
// ─────────────────────────────────────────────────────────────
let youtubeApiPromise = null;
function loadYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    });
  }
  return youtubeApiPromise;
}

// ─────────────────────────────────────────────────────────────
// YouTube Player Component
// ─────────────────────────────────────────────────────────────
function YoutubeMedia({ id, title, resumePosition = 0, onProgress }) {
  const iframeRef = useRef(null);
  const onProgressRef = useRef(onProgress);
  const maxWatchedRef = useRef(Number(resumePosition || 0));
  const initialStartRef = useRef(Math.floor(Number(resumePosition || 0)));
  const knownDurationRef = useRef(0);
  const [manualDone, setManualDone] = useState(false);

  // Keep callback ref fresh
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Reset progress tracker on ID change
  useEffect(() => {
    initialStartRef.current = Math.floor(Number(resumePosition || 0));
    maxWatchedRef.current = Number(resumePosition || 0);
    knownDurationRef.current = 0;
    setManualDone(false);
  }, [id, resumePosition]);

  // Embed URL with enablejsapi=1 for tracking
  const embedUrl = useMemo(() => {
    const start = initialStartRef.current > 0 ? `&start=${initialStartRef.current}` : "";
    return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0&autoplay=0${start}`;
  }, [id]);

  // 1. Hook via YT.Player API when available
  useEffect(() => {
    let disposed = false;
    let timer;

    loadYoutubeApi().then((YT) => {
      if (disposed || !iframeRef.current) return;
      try {
        new YT.Player(iframeRef.current, {
          events: {
            onReady: (evt) => {
              timer = window.setInterval(() => {
                if (disposed) return;
                try {
                  const p = evt.target;
                  if (!p || typeof p.getCurrentTime !== "function") return;
                  const dur = typeof p.getDuration === "function" ? p.getDuration() : 0;
                  if (typeof dur === "number" && dur > 0) knownDurationRef.current = Math.round(dur);
                  const pos = p.getCurrentTime?.() ?? 0;
                  const state = p.getPlayerState?.() ?? -1;
                  if (state === 1 || state === 0) { // PLAYING or ENDED
                    maxWatchedRef.current = Math.max(maxWatchedRef.current, pos);
                  }
                  const currDur = knownDurationRef.current;
                  let pct = currDur > 0 ? (maxWatchedRef.current / currDur) * 100 : 0;
                  if (state === 0) pct = 100;
                  onProgressRef.current?.({
                    position: Math.round(pos),
                    duration: currDur,
                    percent: Math.min(100, pct),
                  });
                } catch (_) {}
              }, 500);
            },
            onStateChange: (evt) => {
              try {
                const p = evt.target;
                const dur = p.getDuration ? p.getDuration() : 0;
                const pos = p.getCurrentTime ? p.getCurrentTime() : 0;
                if (dur > 0) {
                  maxWatchedRef.current = Math.max(maxWatchedRef.current, pos);
                  let pct = (maxWatchedRef.current / dur) * 100;
                  if (evt.data === 0) pct = 100;
                  onProgressRef.current?.({
                    position: Math.round(pos),
                    duration: Math.round(dur),
                    percent: Math.min(100, pct),
                  });
                }
              } catch (_) {}
            },
          },
        });
      } catch (_) {}
    });

    return () => {
      disposed = true;
      if (timer) window.clearInterval(timer);
    };
  }, [id]);

  // 2. Listen to postMessage as fallback
  useEffect(() => {
    function handleWindowMessage(event) {
      if (!event.origin.includes("youtube")) return;
      try {
        let data = event.data;
        if (typeof data === "string") data = JSON.parse(data);
        if (data?.event === "infoDelivery" && data.info) {
          const { currentTime, duration, playerState } = data.info;
          if (typeof duration === "number" && duration > 0) {
            knownDurationRef.current = Math.round(duration);
          }
          if (typeof currentTime === "number" && currentTime > 0) {
            const dur = knownDurationRef.current;
            if (playerState === 1 || playerState === 0) {
              maxWatchedRef.current = Math.max(maxWatchedRef.current, currentTime);
            }
            let percent = dur > 0 ? (maxWatchedRef.current / dur) * 100 : 0;
            if (playerState === 0) percent = 100;
            onProgressRef.current?.({
              position: Math.round(currentTime),
              duration: dur,
              percent: Math.min(100, percent),
            });
          }
        }
      } catch (_) {}
    }

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, [id]);

  // Handle manual "Mark video complete" button click
  function handleManualComplete() {
    setManualDone(true);
    const dur = knownDurationRef.current || 1200;
    onProgressRef.current?.({
      position: dur,
      duration: dur,
      percent: 100,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        className="lesson-youtube-wrapper"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#000000",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
      >
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || "YouTube Video"}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={handleManualComplete}
          style={{
            background: manualDone ? "#dcfce7" : "#f1f5f9",
            color: manualDone ? "#15803d" : "#475569",
            border: `1px solid ${manualDone ? "#86efac" : "#cbd5e1"}`,
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {manualDone ? "✓ Đã xác nhận học video" : "✓ Đánh dấu đã xem xong video"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Audio Player Component
// ─────────────────────────────────────────────────────────────
function AudioMedia({ url, title, resumePosition = 0, onProgress, onError }) {
  const maxWatchedRef = useRef(Number(resumePosition || 0));
  const audioRef = useRef(null);

  useEffect(() => {
    maxWatchedRef.current = Number(resumePosition || 0);
  }, [url, resumePosition]);

  function handleLoaded(e) {
    const el = e.currentTarget;
    if (resumePosition > 0 && resumePosition < el.duration) {
      el.currentTime = resumePosition;
    }
  }

  function handleTimeUpdate(e) {
    const el = e.currentTarget;
    maxWatchedRef.current = Math.max(maxWatchedRef.current, el.currentTime);
    onProgress?.({
      position: el.currentTime,
      duration: el.duration || 0,
      percent: el.duration > 0 ? (maxWatchedRef.current / el.duration) * 100 : 0,
    });
  }

  function preventSkip(e) {
    const el = e.currentTarget;
    if (el.currentTime > maxWatchedRef.current + 12) el.currentTime = maxWatchedRef.current;
  }

  return (
    <audio
      ref={audioRef}
      controls
      preload="metadata"
      style={{ width: "100%", borderRadius: "12px", marginBottom: "0.5rem" }}
      onLoadedMetadata={handleLoaded}
      onTimeUpdate={handleTimeUpdate}
      onSeeking={preventSkip}
      onError={onError}
    >
      <source src={url} />
      Trình duyệt không hỗ trợ audio.
    </audio>
  );
}

// ─────────────────────────────────────────────────────────────
// Unavailable Media Placeholder
// ─────────────────────────────────────────────────────────────
function MediaUnavailable({ type = "video" }) {
  return (
    <div
      className="lesson-media-unavailable"
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "2.5rem 1.5rem",
        background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        textAlign: "center",
        color: "#64748b",
        minHeight: "200px",
      }}
    >
      <span style={{ fontSize: "2.5rem" }}>{type === "audio" ? "🎧" : "🎬"}</span>
      <div>
        <strong style={{ display: "block", color: "#334155", fontSize: "1rem", marginBottom: "4px" }}>
          {type === "audio" ? "Âm thanh chưa sẵn sàng" : "Video chưa sẵn sàng"}
        </strong>
        <p style={{ margin: 0, fontSize: "0.88rem" }}>
          Bạn vẫn có thể học phần nội dung bài giảng bên dưới và quay lại sau.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main LessonMedia Component
// ─────────────────────────────────────────────────────────────
export default function LessonMedia({ lesson, resumePosition = 0, onProgress }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  const videoUrl = lesson?.videoUrl?.trim() || null;
  const audioUrl = lesson?.audioUrl?.trim() || null;

  const videoIsPlaceholder = isPlaceholderUrl(videoUrl);
  const audioIsPlaceholder = isPlaceholderUrl(audioUrl);

  const youtubeVideoId = useMemo(() => extractYoutubeId(videoUrl), [videoUrl]);

  const isDirectVideo = useMemo(
    () => videoUrl && /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(videoUrl),
    [videoUrl]
  );

  const isEmbedUrl = useMemo(
    () => videoUrl && !youtubeVideoId && !isDirectVideo && !videoIsPlaceholder,
    [videoUrl, youtubeVideoId, isDirectVideo, videoIsPlaceholder]
  );

  useEffect(() => {
    setVideoFailed(false);
    setAudioFailed(false);
  }, [videoUrl, audioUrl]);

  const showVideo = videoUrl && !videoIsPlaceholder && !videoFailed;
  const showAudio = audioUrl && !audioIsPlaceholder && !audioFailed;
  const showVideoUnavailable = videoUrl && (videoIsPlaceholder || videoFailed);
  const showAudioUnavailable = audioUrl && (audioIsPlaceholder || audioFailed);
  const hasMedia = videoUrl || audioUrl;

  if (!hasMedia) return null;

  return (
    <div className="lesson-media-stack" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* ── Video ── */}
      {showVideo && (
        youtubeVideoId ? (
          <YoutubeMedia
            id={youtubeVideoId}
            title={lesson?.title || "Video bài học"}
            resumePosition={resumePosition}
            onProgress={onProgress}
          />
        ) : isDirectVideo ? (
          <video
            controls
            preload="metadata"
            style={{ width: "100%", borderRadius: "16px", background: "#000000" }}
            onLoadedMetadata={(e) => {
              if (resumePosition > 0 && resumePosition < e.currentTarget.duration) {
                e.currentTarget.currentTime = resumePosition;
              }
            }}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              onProgress?.({ position: el.currentTime, duration: el.duration || 0, percent: el.duration > 0 ? (el.currentTime / el.duration) * 100 : 0 });
            }}
            onError={() => setVideoFailed(true)}
          >
            <source src={videoUrl} />
            Trình duyệt không hỗ trợ video.
          </video>
        ) : isEmbedUrl ? (
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "16px", overflow: "hidden" }}>
            <iframe
              src={videoUrl}
              title={lesson?.title || "Video bài học"}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onError={() => setVideoFailed(true)}
            />
          </div>
        ) : (
          <MediaUnavailable type="video" />
        )
      )}
      {showVideoUnavailable && <MediaUnavailable type="video" />}

      {/* ── Audio ── */}
      {showAudio && (
        <AudioMedia
          url={audioUrl}
          title={lesson?.title || "Audio bài học"}
          resumePosition={resumePosition}
          onProgress={onProgress}
          onError={() => setAudioFailed(true)}
        />
      )}
      {showAudioUnavailable && <MediaUnavailable type="audio" />}
    </div>
  );
}
