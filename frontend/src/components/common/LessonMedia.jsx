import { useEffect, useMemo, useRef, useState } from "react";

function isPlaceholderUrl(value) {
  if (!value) return false;
  try { const host = new URL(value).hostname.toLowerCase(); return host === "example.com" || host.endsWith(".example.com"); } catch { return true; }
}

function youtubeId(value) {
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") || null;
    if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
  } catch { return null; }
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

function YoutubeMedia({ id, title, resumePosition, onProgress, onError }) {
  const hostRef = useRef(null);
  useEffect(() => {
    let player; let timer; let disposed = false; let maxWatched = Number(resumePosition || 0);
    loadYoutubeApi().then((YT) => {
      if (disposed || !hostRef.current) return;
      player = new YT.Player(hostRef.current, {
        videoId: id,
        playerVars: { rel: 0, modestbranding: 1, start: Math.floor(Number(resumePosition || 0)) },
        events: {
          onReady: () => { timer = window.setInterval(() => {
            if (!player?.getDuration) return;
            const duration = player.getDuration(); const position = player.getCurrentTime();
            if (player.getPlayerState() === YT.PlayerState.PLAYING) maxWatched = Math.max(maxWatched, position);
            if (position > maxWatched + 12) { player.seekTo(maxWatched, true); return; }
            onProgress?.({ position, duration, percent: duration ? (maxWatched / duration) * 100 : 0 });
          }, 5000); },
          onError,
        },
      });
    });
    return () => { disposed = true; window.clearInterval(timer); try { player?.destroy(); } catch { /* player already removed */ } };
  }, [id, onError, onProgress, resumePosition]);
  return <div className="lesson-youtube" ref={hostRef} title={title} />;
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
