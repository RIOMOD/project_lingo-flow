import { useEffect, useMemo, useRef, useState } from "react";

function isPlaceholderUrl(value) {
  if (!value) return false;
  try { const host = new URL(value).hostname.toLowerCase(); return host === "example.com" || host.endsWith(".example.com"); } catch { return true; }
}

function youtubeId(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.includes("/embed/")) {
        const parts = url.pathname.split("/embed/");
        return parts[1]?.split("?")[0]?.split("/")[0] || null;
      }
      return url.searchParams.get("v") || null;
    }
    if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
    return null;
  }
  return null;
}

let youtubeApiPromise;
function loadYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeApiPromise) youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

function YoutubeMedia({ id, title, resumePosition = 0, onProgress, onError }) {
  const iframeRef = useRef(null);
  const onProgressRef = useRef(onProgress);
  const maxWatchedRef = useRef(Number(resumePosition || 0));
  const initialStartRef = useRef(Math.floor(Number(resumePosition || 0)));
  const knownDurationRef = useRef(0);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    initialStartRef.current = Math.floor(Number(resumePosition || 0));
    maxWatchedRef.current = Number(resumePosition || 0);
    knownDurationRef.current = 0;
  }, [id]);

  useEffect(() => {
    let player;
    let timer;
    let disposed = false;

    function handleWindowMessage(event) {
      if (disposed) return;
      try {
        let data = event.data;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        if (data && data.event === "infoDelivery" && data.info) {
          const { currentTime, duration, playerState } = data.info;
          if (typeof duration === "number" && duration > 0) {
            knownDurationRef.current = Math.round(duration);
          }
          if (typeof currentTime === "number" && currentTime > 0) {
            const currDuration = knownDurationRef.current || (typeof duration === "number" && duration > 0 ? Math.round(duration) : 0);
            if (playerState === 1 || playerState === 0) {
              maxWatchedRef.current = Math.max(maxWatchedRef.current, currentTime);
            }
            let percent = currDuration > 0 ? (maxWatchedRef.current / currDuration) * 100 : 0;
            if (playerState === 0) percent = 100;
            onProgressRef.current?.({
              position: Math.round(currentTime),
              duration: currDuration,
              percent: Math.min(100, percent)
            });
          }
        }
      } catch (e) {}
    }

    window.addEventListener("message", handleWindowMessage);

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
                  const d = p.getDuration ? p.getDuration() : 0;
                  if (typeof d === "number" && d > 0) {
                    knownDurationRef.current = Math.round(d);
                  }
                  const position = p.getCurrentTime ? p.getCurrentTime() : 0;
                  const state = p.getPlayerState ? p.getPlayerState() : -1;
                  const currDuration = knownDurationRef.current;
                  if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.ENDED) {
                    maxWatchedRef.current = Math.max(maxWatchedRef.current, position);
                  }
                  let percent = currDuration > 0 ? (maxWatchedRef.current / currDuration) * 100 : 0;
                  if (state === YT.PlayerState.ENDED) percent = 100;
                  onProgressRef.current?.({
                    position: Math.round(position),
                    duration: currDuration,
                    percent: Math.min(100, percent)
                  });
                } catch (e) {}
              }, 400);
            },
            onError: (err) => {
              console.warn("YouTube player error:", err);
            }
          }
        });
      } catch (e) {}
    });

    return () => {
      disposed = true;
      window.removeEventListener("message", handleWindowMessage);
      if (timer) window.clearInterval(timer);
    };
  }, [id]);

  const embedUrl = useMemo(() => {
    const start = initialStartRef.current > 0 ? `&start=${initialStartRef.current}` : "";
    return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0${start}`;
  }, [id]);

  return (
    <div className="lesson-youtube-wrapper" style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        style={{ width: "100%", height: "100%", border: "0", borderRadius: "16px" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

export default function LessonMedia({ lesson, resumePosition = 0, onProgress }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const maxWatchedRef = useRef(Number(resumePosition || 0));
  const videoUrl = lesson?.videoUrl?.trim(); const audioUrl = lesson?.audioUrl?.trim();
  const videoIsPlaceholder = isPlaceholderUrl(videoUrl); const audioIsPlaceholder = isPlaceholderUrl(audioUrl);
  const youtubeVideoId = youtubeId(videoUrl);
  const isDirectVideo = useMemo(() => videoUrl && /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(videoUrl), [videoUrl]);

  useEffect(() => { setVideoFailed(false); setAudioFailed(false); maxWatchedRef.current = Number(resumePosition || 0); }, [videoUrl, audioUrl, resumePosition]);

  function mediaReady(event) { if (resumePosition > 0 && resumePosition < event.currentTarget.duration) event.currentTarget.currentTime = resumePosition; }
  function mediaProgress(event) {
    const media = event.currentTarget; maxWatchedRef.current = Math.max(maxWatchedRef.current, media.currentTime);
    onProgress?.({ position: media.currentTime, duration: media.duration || 0, percent: media.duration ? (maxWatchedRef.current / media.duration) * 100 : 0 });
  }
  function preventSkip(event) { if (event.currentTarget.currentTime > maxWatchedRef.current + 12) event.currentTarget.currentTime = maxWatchedRef.current; }

  const showUnavailable = (videoUrl && (videoIsPlaceholder || videoFailed)) || (audioUrl && (audioIsPlaceholder || audioFailed));
  return <div className="lesson-media-stack">
    {videoUrl && !videoIsPlaceholder && !videoFailed && (youtubeVideoId
      ? <YoutubeMedia id={youtubeVideoId} title={lesson?.title || "Video bài học"} resumePosition={resumePosition} onProgress={onProgress} onError={() => setVideoFailed(true)} />
      : isDirectVideo ? <video controls preload="metadata" onLoadedMetadata={mediaReady} onTimeUpdate={mediaProgress} onSeeking={preventSkip} onError={() => setVideoFailed(true)}><source src={videoUrl} />Trình duyệt không hỗ trợ video.</video>
        : <iframe src={videoUrl} title={lesson?.title || "Video bài học"} onError={() => setVideoFailed(true)} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />)}
    {audioUrl && !audioIsPlaceholder && !audioFailed && <audio controls preload="metadata" onLoadedMetadata={mediaReady} onTimeUpdate={mediaProgress} onSeeking={preventSkip} onError={() => setAudioFailed(true)}><source src={audioUrl} />Trình duyệt không hỗ trợ audio.</audio>}
    {showUnavailable && <div className="lesson-media-unavailable" role="status"><strong>Media chưa thể phát</strong><p>Bạn vẫn có thể học phần nội dung chữ và quay lại media sau.</p></div>}
  </div>;
}
