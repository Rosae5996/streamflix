import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import FollowSocialModal from "@/components/FollowSocialModal";
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearch } from "wouter";

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const episodeIdParam = params.get("episode");
  const { user, isAuthenticated } = useAuth();

  const contentId = parseInt(id ?? "0");
  const episodeId = episodeIdParam ? parseInt(episodeIdParam) : undefined;

  const { data: contentItem } = trpc.content.getById.useQuery({ id: contentId });
  const { data: videos } = trpc.videos.byContent.useQuery(
    { contentId },
    { enabled: !episodeId }
  );
  const { data: episodeVideos } = trpc.videos.byEpisode.useQuery(
    { episodeId: episodeId ?? 0 },
    { enabled: !!episodeId }
  );
  const { data: subtitlesList } = trpc.subtitles.byContent.useQuery(
    { contentId },
    { enabled: !episodeId }
  );
  const { data: episodeSubtitles } = trpc.subtitles.byEpisode.useQuery(
    { episodeId: episodeId ?? 0 },
    { enabled: !!episodeId }
  );
  const { data: contentAds } = trpc.ads.byContent.useQuery(
    { contentId },
    { enabled: !episodeId }
  );
  const { data: episodeAds } = trpc.ads.byEpisode.useQuery(
    { episodeId: episodeId ?? 0 },
    { enabled: !!episodeId }
  );
  const { data: subscription } = trpc.subscription.getMySubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const updateProgress = trpc.watch.updateProgress.useMutation();

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"quality" | "subtitle" | "audio">("quality");

  // Ad state
  const [currentAd, setCurrentAd] = useState<any | null>(null);
  const [adTimeLeft, setAdTimeLeft] = useState(0);
  const [adSkippable, setAdSkippable] = useState(false);
  const adVideoRef = useRef<HTMLVideoElement | null>(null);
  const adTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownAds = useRef<Set<number>>(new Set());

  // Social media modal state
  const [showSocialModal, setShowSocialModal] = useState(false);
  const { data: siteSettings } = trpc.site.getSettings.useQuery();
  const subscriptionMode = siteSettings?.subscription_mode ?? "paypal";
  const instagramUrl = siteSettings?.instagram_url;
  const tiktokUrl = siteSettings?.tiktok_url;
  const requireFollowToWatch = (siteSettings?.require_follow_to_watch === "true") && subscriptionMode === "free_social" && !subscription;

  const allVideos = episodeId ? (episodeVideos ?? []) : (videos ?? []);
  const allSubtitles = episodeId ? (episodeSubtitles ?? []) : (subtitlesList ?? []);
  const allAds = episodeId ? (episodeAds ?? []) : (contentAds ?? []);

  const userPlanSlug = subscription?.plan?.slug ?? "free";

  // Filter ads for user's plan
  const applicableAds = allAds.filter((a: any) => {
    const appliesTo = Array.isArray(a.contentAd?.appliesTo)
      ? a.contentAd.appliesTo
      : [];
    return appliesTo.includes(userPlanSlug);
  });

  // Quality options
  const qualityOrder = ["4K", "1080p", "720p", "480p", "360p"];
  const availableQualities = qualityOrder.filter((q) =>
    allVideos.some((v: any) => v.quality === q)
  );

  // Get current video URL
  const currentVideoUrl =
    allVideos.find((v: any) => v.quality === selectedQuality)?.url ??
    allVideos[0]?.url ??
    "";

  useEffect(() => {
    if (availableQualities.length > 0 && !selectedQuality) {
      // Auto-select best quality allowed by plan
      const maxQuality = subscription?.plan?.maxQuality ?? "480p";
      const maxIdx = qualityOrder.indexOf(maxQuality);
      const allowed = qualityOrder.slice(maxIdx);
      const best = availableQualities.find((q) => allowed.includes(q)) ?? availableQualities[availableQualities.length - 1];
      setSelectedQuality(best);
    }
  }, [availableQualities.length, subscription]);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  // Progress tracking
  useEffect(() => {
    if (playing && isAuthenticated) {
      progressTimer.current = setInterval(() => {
        if (videoRef.current) {
          updateProgress.mutate({
            contentId,
            episodeId,
            progressSeconds: Math.floor(videoRef.current.currentTime),
            totalSeconds: Math.floor(videoRef.current.duration || 0),
          });
        }
      }, 15000);
    }
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [playing, isAuthenticated]);

  // Check for ads at current time
  useEffect(() => {
    if (!playing || currentAd) return;
    const currentSec = Math.floor(currentTime);
    const ad = applicableAds.find((a: any) => {
      const ts = a.contentAd?.timestamp;
      return ts !== undefined && Math.abs(ts - currentSec) <= 1 && !shownAds.current.has(a.contentAd.id);
    });
    if (ad) {
      shownAds.current.add(ad.contentAd.id);
      setCurrentAd(ad.ad);
      setAdTimeLeft(ad.ad.duration ?? 15);
      setAdSkippable(false);
      if (videoRef.current) videoRef.current.pause();
      setPlaying(false);

      // Skip button timer
      const skipDelay = ad.ad.skipAfter ?? 5;
      setTimeout(() => setAdSkippable(true), skipDelay * 1000);

      // Ad countdown
      adTimer.current = setInterval(() => {
        setAdTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(adTimer.current!);
            setCurrentAd(null);
            if (videoRef.current) {
              videoRef.current.play();
              setPlaying(true);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
  }, [currentTime, playing, applicableAds]);

  const skipAd = () => {
    if (!adSkippable) return;
    if (adTimer.current) clearInterval(adTimer.current);
    setCurrentAd(null);
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!fullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <Link
          href={contentItem ? `/content/${contentItem.slug}` : "/"}
          className="flex items-center gap-1.5 sm:gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-xs sm:text-sm font-medium hidden sm:block truncate">
            {contentItem?.title ?? "Volver"}
          </span>
        </Link>
      </div>

      {/* Video container */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-black flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 0px)" }}
        onMouseMove={showControlsTemporarily}
        onClick={() => { togglePlay(); showControlsTemporarily(); }}
      >
        {currentVideoUrl ? (
          <video
            ref={videoRef}
            src={currentVideoUrl}
            className="w-full h-full max-h-screen object-contain"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          >
            {/* Subtitles */}
            {allSubtitles
              .filter((s: any) => s.languageCode === selectedSubtitle)
              .map((s: any) => (
                <track
                  key={s.id}
                  kind="subtitles"
                  src={s.url}
                  srcLang={s.languageCode}
                  label={s.language}
                  default
                />
              ))}
          </video>
        ) : (
          <div className="text-center text-gray-400">
            <Play size={48} className="mx-auto mb-4 opacity-30" />
            <p>No hay video disponible para este contenido</p>
            <p className="text-sm mt-2 text-gray-500">
              El administrador debe agregar archivos de video
            </p>
          </div>
        )}

        {/* Ad overlay */}
        {currentAd && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-40">
            {currentAd.videoUrl ? (
              <video
                src={currentAd.videoUrl}
                className="w-full h-full object-contain"
                autoPlay
                muted={false}
                onClick={(e) => e.stopPropagation()}
              />
            ) : currentAd.imageUrl ? (
              <a
                href={currentAd.clickUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={currentAd.imageUrl} alt="Anuncio" className="max-w-full max-h-full object-contain" />
              </a>
            ) : null}

            {/* Ad info */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
              <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded">
                Anuncio · {adTimeLeft}s
              </div>
              {adSkippable && (
                <button
                  onClick={(e) => { e.stopPropagation(); skipAd(); }}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded backdrop-blur-sm transition-colors"
                >
                  Saltar <SkipForward size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        {currentVideoUrl && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 accent-[#E50914] cursor-pointer"
                style={{ accentColor: "#E50914" }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                >
                  {playing ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-white hover:text-gray-300">
                    {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 hidden sm:block"
                    style={{ accentColor: "#E50914" }}
                  />
                </div>

                {/* Title */}
                <span className="text-white text-sm font-medium hidden sm:block truncate max-w-xs">
                  {contentItem?.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Settings */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-9 h-9 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                  >
                    <Settings size={20} />
                  </button>

                  {showSettings && (
                    <div
                      className="absolute bottom-full right-0 mb-2 w-64 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Tabs */}
                      <div className="flex border-b border-[#333]">
                        {(["quality", "subtitle", "audio"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setSettingsTab(tab)}
                            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                              settingsTab === tab
                                ? "text-white border-b-2 border-[#E50914]"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            {tab === "quality" ? "Calidad" : tab === "subtitle" ? "Subtítulos" : "Audio"}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 max-h-48 overflow-y-auto">
                        {settingsTab === "quality" && (
                          <>
                            {availableQualities.length === 0 ? (
                              <p className="text-gray-500 text-xs px-2 py-3">Sin opciones</p>
                            ) : (
                              availableQualities.map((q) => (
                                <button
                                  key={q}
                                  onClick={() => { setSelectedQuality(q); setShowSettings(false); }}
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    selectedQuality === q
                                      ? "bg-[#E50914] text-white"
                                      : "text-gray-300 hover:bg-white/5"
                                  }`}
                                >
                                  {q}
                                </button>
                              ))
                            )}
                          </>
                        )}

                        {settingsTab === "subtitle" && (
                          <>
                            <button
                              onClick={() => { setSelectedSubtitle(""); setShowSettings(false); }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                !selectedSubtitle ? "bg-[#E50914] text-white" : "text-gray-300 hover:bg-white/5"
                              }`}
                            >
                              Sin subtítulos
                            </button>
                            {allSubtitles.map((s: any) => (
                              <button
                                key={s.id}
                                onClick={() => { setSelectedSubtitle(s.languageCode); setShowSettings(false); }}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  selectedSubtitle === s.languageCode
                                    ? "bg-[#E50914] text-white"
                                    : "text-gray-300 hover:bg-white/5"
                                }`}
                              >
                                {s.language}
                              </button>
                            ))}
                          </>
                        )}

                        {settingsTab === "audio" && (
                          <p className="text-gray-500 text-xs px-2 py-3">
                            El selector de audio depende de las pistas del archivo de video
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                >
                  {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Follow Social Modal */}
      <FollowSocialModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        instagramUrl={instagramUrl ?? undefined}
        tiktokUrl={tiktokUrl ?? undefined}
      />
    </div>
  );
}
