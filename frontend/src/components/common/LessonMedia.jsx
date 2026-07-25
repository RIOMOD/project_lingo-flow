import { useEffect, useMemo, useRef, useState } from "react";

function parseUrl(value) {
  if (!value) return null;
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
}

function youtubeId(value) {
  const url = parseUrl(value);
  if (!url) return "";
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtube.com" || host === "m.youtube.com") return url.searchParams.get("v") || "";
  if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
  if (host === "youtube-nocookie.com") return url.pathname.split("/").filter(Boolean).pop() || "";
  return "";
}

function isDirectVideo(value) {
  return /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(value || "");
}

function isDirectAudio(value) {
  return /\.(mp3|wav|m4a|aac|ogg)(?:[?#].*)?$/i.test(value || "");
}

let youtubeApiPromise;
function loadYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.onerror = () => reject(new Error("Không tải được trình phát YouTube."));
        document.head.appendChild(script);
      }
    });
  }
  return youtubeApiPromise;
}

function YoutubePlayer({ id, title, resumePosition, onProgress, onEnded, onError }) {
  const hostRef = useRef(null);

  useEffect(() => {
    let player;
    let timer;
    let disposed = false;
    let maxWatched = Number(resumePosition || 0);

    loadYoutubeApi()
      .then((YT) => {
        if (disposed || !hostRef.current) return;
        player = new YT.Player(hostRef.current, {
          videoId: id,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            start: Math.floor(Number(resumePosition || 0)),
          },
          events: {
            onReady: () => {
              timer = window.setInterval(() => {
                if (!player?.getDuration || !player?.getCurrentTime) return;
                const duration = Number(player.getDuration() || 0);
                const position = Number(player.getCurrentTime() || 0);
                const state = player.getPlayerState?.();
                if (state === YT.PlayerState.PLAYING) {
                  maxWatched = Math.max(maxWatched, position);
                }
                onProgress?.({
                  position,
                  duration,
                  percent: duration ? Math.min(100, (maxWatched / duration) * 100) : 0,
                });
              }, 5000);
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.ENDED) {
                const duration = Number(player.getDuration?.() || 0);
                onProgress?.({ position: duration, duration, percent: 100 });
                onEnded?.();
              }
            },
            onError,
          },
        });
      })
      .catch(onError);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      try {
        player?.destroy();
      } catch {
        // YouTube may already have removed the iframe during route changes.
      }
    };
  }, [id, onEnded, onError, onProgress, resumePosition]);

  return <div className="lesson-youtube" ref={hostRef} title={title} />;
}

export default function LessonMedia({ lesson, resumePosition = 0, onProgress, onEnded }) {
  const [error, setError] = useState("");
  const maxWatchedRef = useRef(Number(resumePosition || 0));
  const videoUrl = lesson?.videoUrl?.trim() || "";
  const audioUrl = lesson?.audioUrl?.trim() || "";
  const youtubeVideoId = useMemo(() => youtubeId(videoUrl), [videoUrl]);
  const directVideo = useMemo(() => isDirectVideo(videoUrl), [videoUrl]);
  const directAudio = useMemo(() => isDirectAudio(audioUrl), [audioUrl]);

  useEffect(() => {
    setError("");
    maxWatchedRef.current = Number(resumePosition || 0);
  }, [audioUrl, resumePosition, videoUrl]);

  function handleReady(event) {
    const media = event.currentTarget;
    const start = Number(resumePosition || 0);
    if (start > 0 && Number.isFinite(media.duration) && start < media.duration) {
      media.currentTime = start;
    }
  }

  function handleProgress(event) {
    const media = event.currentTarget;
    const duration = Number(media.duration || 0);
    const position = Number(media.currentTime || 0);
    maxWatchedRef.current = Math.max(maxWatchedRef.current, position);
    onProgress?.({
      position,
      duration,
      percent: duration ? Math.min(100, (maxWatchedRef.current / duration) * 100) : 0,
    });
  }

  if (!videoUrl && !audioUrl) {
    return (
      <div className="lesson-media-unavailable" role="status">
        <strong>Bài học chưa có video hoặc âm thanh.</strong>
        <p>Bạn vẫn có thể học phần transcript và nội dung bên dưới.</p>
      </div>
    );
  }

  if (videoUrl && !youtubeVideoId && !directVideo) {
    return (
      <div className="lesson-media-unavailable" role="alert">
        <strong>URL video không hợp lệ.</strong>
        <p>Hệ thống chỉ hỗ trợ video YouTube hoặc tệp MP4/WebM/OGG.</p>
      </div>
    );
  }

  return (
    <div className="lesson-media-stack">
      {videoUrl && youtubeVideoId && (
        <YoutubePlayer
          id={youtubeVideoId}
          title={lesson?.title || "Video bài học"}
          resumePosition={resumePosition}
          onProgress={onProgress}
          onEnded={onEnded}
          onError={() => setError("Không thể phát video YouTube. Vui lòng kiểm tra lại URL.")}
        />
      )}
      {videoUrl && directVideo && (
        <video
          controls
          preload="metadata"
          onLoadedMetadata={handleReady}
          onTimeUpdate={handleProgress}
          onEnded={(event) => {
            const duration = Number(event.currentTarget.duration || 0);
            onProgress?.({ position: duration, duration, percent: 100 });
            onEnded?.();
          }}
          onError={() => setError("Không thể phát video. Vui lòng kiểm tra lại URL MP4.")}
        >
          <source src={videoUrl} />
          Trình duyệt không hỗ trợ video.
        </video>
      )}
      {audioUrl && directAudio && (
        <audio controls preload="metadata" onLoadedMetadata={handleReady} onTimeUpdate={handleProgress}>
          <source src={audioUrl} />
          Trình duyệt không hỗ trợ âm thanh.
        </audio>
      )}
      {audioUrl && !directAudio && (
        <a className="lesson-resource-link" href={audioUrl} target="_blank" rel="noreferrer">
          Mở tài liệu đính kèm
        </a>
      )}
      {error && (
        <div className="lesson-media-unavailable" role="alert">
          <strong>{error}</strong>
          <p>Bạn có thể tiếp tục đọc transcript và quay lại video sau.</p>
        </div>
      )}
    </div>
  );
}
