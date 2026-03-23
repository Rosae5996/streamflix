import StreamFlixLayout from "@/components/StreamFlixLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  BookmarkCheck,
  BookmarkPlus,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Play,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function ContentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedSeason, setSelectedSeason] = useState(0);

  const { data: item, isLoading } = trpc.content.getBySlug.useQuery({ slug: slug ?? "" });
  const { data: seasons } = trpc.seasons.byContent.useQuery(
    { contentId: item?.id ?? 0 },
    { enabled: !!item?.id && item?.type === "series" }
  );
  const { data: episodes } = trpc.episodes.bySeason.useQuery(
    { seasonId: seasons?.[selectedSeason]?.id ?? 0 },
    { enabled: !!seasons?.[selectedSeason]?.id }
  );
  const { data: inWatchlist } = trpc.watch.isInWatchlist.useQuery(
    { contentId: item?.id ?? 0 },
    { enabled: !!item?.id && isAuthenticated }
  );

  const utils = trpc.useUtils();
  const addToWatchlist = trpc.watch.addToWatchlist.useMutation({
    onSuccess: () => {
      utils.watch.isInWatchlist.invalidate({ contentId: item?.id });
      toast.success("Añadido a tu lista");
    },
  });
  const removeFromWatchlist = trpc.watch.removeFromWatchlist.useMutation({
    onSuccess: () => {
      utils.watch.isInWatchlist.invalidate({ contentId: item?.id });
      toast.success("Eliminado de tu lista");
    },
  });

  const incrementView = trpc.content.incrementView.useMutation();

  const handlePlay = () => {
    if (!item) return;
    incrementView.mutate({ id: item.id });
    navigate(`/watch/${item.id}`);
  };

  if (isLoading) {
    return (
      <StreamFlixLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      </StreamFlixLayout>
    );
  }

  if (!item) {
    return (
      <StreamFlixLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">🎬</p>
            <h2 className="text-2xl font-bold text-white mb-2">Contenido no encontrado</h2>
            <Link href="/" className="text-[#E50914] hover:underline">Volver al inicio</Link>
          </div>
        </div>
      </StreamFlixLayout>
    );
  }

  const tags = Array.isArray(item.tags) ? item.tags : [];
  const cast = Array.isArray(item.cast) ? item.cast : [];

  return (
    <StreamFlixLayout>
      {/* Backdrop hero */}
      <div className="relative h-[50vh] sm:h-[60vh]">
        {item.backdropUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.backdropUrl})` }}
          >
            <div className="absolute inset-0 sf-gradient-overlay" />
            <div className="absolute inset-0 sf-gradient-left" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#141414]" />
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 border-2 border-white/40"
          >
            <Play size={32} fill="white" className="text-white ml-1" />
          </button>
        </div>
      </div>

      {/* Content info */}
      <div className="px-4 sm:px-8 lg:px-16 -mt-20 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          {item.posterUrl && (
            <div className="shrink-0 w-36 sm:w-48 mx-auto md:mx-0">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full rounded-xl shadow-2xl"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="sf-badge sf-badge-red">
                {item.type === "movie" ? "Película" : "Serie"}
              </span>
              {item.isFree && <span className="sf-badge sf-badge-green">GRATIS</span>}
              {item.rating && <span className="sf-badge sf-badge-gray">{item.rating}</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{item.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              {item.releaseYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {item.releaseYear}
                </span>
              )}
              {item.duration && item.type === "movie" && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {Math.floor(item.duration / 60)}h {item.duration % 60}m
                </span>
              )}
              {item.imdbRating && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Star size={14} fill="currentColor" />
                  {item.imdbRating} IMDb
                </span>
              )}
              {item.language && (
                <span className="uppercase">{item.language}</span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-2xl">
                {item.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Play size={20} fill="black" />
                Reproducir
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Inicia sesión para usar tu lista");
                    return;
                  }
                  if (inWatchlist) {
                    removeFromWatchlist.mutate({ contentId: item.id });
                  } else {
                    addToWatchlist.mutate({ contentId: item.id });
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] border border-[#444] text-white font-semibold rounded-lg hover:bg-[#222] transition-colors"
              >
                {inWatchlist ? (
                  <>
                    <BookmarkCheck size={20} />
                    En mi lista
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={20} />
                    Mi lista
                  </>
                )}
              </button>

              {item.trailerUrl && (
                <a
                  href={item.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] border border-[#444] text-white font-semibold rounded-lg hover:bg-[#222] transition-colors"
                >
                  <Play size={20} />
                  Trailer
                </a>
              )}
            </div>

            {/* Director & Cast */}
            <div className="space-y-2 text-sm">
              {item.director && (
                <p>
                  <span className="text-gray-500">Director: </span>
                  <span className="text-gray-200">{item.director}</span>
                </p>
              )}
              {cast.length > 0 && (
                <p>
                  <span className="text-gray-500">Reparto: </span>
                  <span className="text-gray-200">{cast.join(", ")}</span>
                </p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#1a1a1a] border border-[#333] text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episodes (for series) */}
        {item.type === "series" && seasons && seasons.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Episodios</h2>
              {/* Season selector */}
              <div className="flex gap-2">
                {seasons.map((season, idx) => (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeason(idx)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSeason === idx
                        ? "bg-[#E50914] text-white"
                        : "bg-[#1a1a1a] text-gray-300 border border-[#333] hover:bg-[#222]"
                    }`}
                  >
                    T{season.number}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {episodes?.map((ep) => (
                <div
                  key={ep.id}
                  className="flex gap-4 p-4 bg-[#1a1a1a] rounded-xl hover:bg-[#222] transition-colors cursor-pointer group"
                  onClick={() => navigate(`/watch/${item.id}?episode=${ep.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 sm:w-40 shrink-0 aspect-video rounded-lg overflow-hidden bg-[#2a2a2a]">
                    {ep.thumbnailUrl ? (
                      <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={24} className="text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play size={24} fill="white" className="text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Episodio {ep.number}</p>
                        <h3 className="font-semibold text-white">{ep.title}</h3>
                      </div>
                      {ep.duration && (
                        <span className="text-xs text-gray-400 shrink-0">
                          {Math.floor(ep.duration / 60)}:{String(ep.duration % 60).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    {ep.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ep.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StreamFlixLayout>
  );
}
