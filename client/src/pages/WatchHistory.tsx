import StreamFlixLayout from "@/components/StreamFlixLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Clock, Play } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function WatchHistory() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: history, isLoading } = trpc.watch.getHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <StreamFlixLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      </StreamFlixLayout>
    );
  }

  return (
    <StreamFlixLayout>
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="text-[#E50914]" size={28} />
          <h1 className="text-3xl font-bold text-white">Historial de visualización</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#1a1a1a] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item: any) => {
              const progress = item.totalSeconds > 0
                ? Math.round((item.progressSeconds / item.totalSeconds) * 100)
                : 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-[#1a1a1a] border border-[#222] rounded-xl p-4 hover:border-[#333] transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-[#111] relative">
                    {item.content?.posterUrl ? (
                      <img
                        src={item.content.posterUrl}
                        alt={item.content?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={20} className="text-gray-600" />
                      </div>
                    )}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-[#E50914]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{item.content?.title ?? "Contenido"}</h3>
                    {item.episode && (
                      <p className="text-gray-400 text-sm mt-0.5">
                        T{item.episode?.seasonNumber} E{item.episode?.episodeNumber}: {item.episode?.title}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {progress > 0 && (
                        <span className="text-xs text-gray-500">{progress}% visto</span>
                      )}
                      {item.completed && (
                        <span className="text-xs text-green-400">Completado</span>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(item.watchedAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Play button */}
                  <button
                    onClick={() => navigate(`/watch/${item.contentId}`)}
                    className="shrink-0 w-10 h-10 rounded-full bg-white/5 hover:bg-[#E50914] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Play size={16} className="text-white" fill="white" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
              <Clock size={36} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Sin historial</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Aquí aparecerá el contenido que hayas visto. ¡Empieza a explorar el catálogo!
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="flex items-center gap-2 px-6 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-semibold rounded-lg transition-colors"
            >
              <Play size={18} />
              Explorar catálogo
            </button>
          </div>
        )}
      </div>
    </StreamFlixLayout>
  );
}
