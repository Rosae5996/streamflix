import { trpc } from "@/lib/trpc";
import { BookmarkPlus, BookmarkCheck, Info, Play, Star } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface ContentCardProps {
  item: {
    id: number;
    title: string;
    slug: string;
    type: "movie" | "series";
    posterUrl?: string | null;
    backdropUrl?: string | null;
    trailerUrl?: string | null;
    releaseYear?: number | null;
    imdbRating?: string | null;
    duration?: number | null;
    rating?: string | null;
    isFree?: boolean;
  };
  size?: "sm" | "md" | "lg";
}

export default function ContentCard({ item, size = "md" }: ContentCardProps) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: watchlistStatus } = trpc.watch.isInWatchlist.useQuery(
    { contentId: item.id },
    { enabled: isAuthenticated }
  );

  const addToWatchlist = trpc.watch.addToWatchlist.useMutation({
    onSuccess: () => {
      setInWatchlist(true);
      toast.success("Añadido a tu lista");
    },
  });

  const removeFromWatchlist = trpc.watch.removeFromWatchlist.useMutation({
    onSuccess: () => {
      setInWatchlist(false);
      toast.success("Eliminado de tu lista");
    },
  });

  const isInList = watchlistStatus ?? inWatchlist;

  const handleMouseEnter = () => {
    setHovered(true);
    if (item.trailerUrl) {
      hoverTimer.current = setTimeout(() => {
        setShowTrailer(true);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 800);
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setShowTrailer(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Inicia sesión para usar tu lista");
      return;
    }
    if (isInList) {
      removeFromWatchlist.mutate({ contentId: item.id });
    } else {
      addToWatchlist.mutate({ contentId: item.id });
    }
  };

  const widthClass = size === "sm" ? "w-32" : size === "lg" ? "w-56" : "w-44";
  const heightClass = size === "sm" ? "h-48" : size === "lg" ? "h-80" : "h-64";

  return (
    <div
      className={`relative ${widthClass} shrink-0 content-card group`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Poster */}
      <div className={`relative ${heightClass} rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#333] hover:border-[#E50914] transition-all hover-glow`}>
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
            <span className="text-gray-500 text-xs text-center px-2">{item.title}</span>
          </div>
        )}

        {/* Trailer overlay */}
        {showTrailer && item.trailerUrl && (
          <video
            ref={videoRef}
            src={item.trailerUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        )}

        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-3 animate-fade-in-up">
            <div className="flex gap-1.5 w-full">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/watch/${item.id}`);
                }}
                className="flex items-center justify-center w-10 h-10 bg-[#E50914] hover:bg-[#B20710] rounded-full transition-all hover:scale-110 shadow-lg"
                title="Reproducir"
              >
                <Play size={18} fill="white" className="text-white ml-0.5" />
              </button>
              <button
                onClick={handleWatchlistToggle}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 shadow-lg ${
                  isInList
                    ? "bg-[#E50914] border border-[#E50914]"
                    : "bg-white/10 border border-white/40 hover:border-white"
                }`}
                title={isInList ? "Quitar de mi lista" : "Añadir a mi lista"}
              >
                {isInList ? (
                  <BookmarkCheck size={18} className="text-[#E50914]" />
                ) : (
                  <BookmarkPlus size={18} className="text-white" />
                )}
              </button>
              <Link
                href={`/content/${item.slug}`}
                className="flex items-center justify-center w-10 h-10 bg-white/10 border border-white/40 rounded-full hover:border-white transition-all hover:scale-110 ml-auto shadow-lg"
                title="Más información"
                onClick={(e) => e.stopPropagation()}
              >
                <Info size={18} className="text-white" />
              </Link>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {item.isFree && (
            <span className="sf-badge sf-badge-green text-[10px]">GRATIS</span>
          )}
        </div>
      </div>

      {/* Info below card */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          {item.releaseYear && (
            <span className="text-xs text-gray-400">{item.releaseYear}</span>
          )}
          {item.imdbRating && (
            <span className="flex items-center gap-0.5 text-xs text-yellow-400">
              <Star size={10} fill="currentColor" />
              {item.imdbRating}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {item.type === "movie" ? "Película" : "Serie"}
          </span>
        </div>
      </div>
    </div>
  );
}
