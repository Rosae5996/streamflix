import StreamFlixLayout from "@/components/StreamFlixLayout";
import ContentCard from "@/components/ContentCard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Bookmark, Play } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Watchlist() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: watchlist, isLoading } = trpc.watch.getWatchlist.useQuery(
    undefined,
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
          <Bookmark className="text-[#E50914]" size={28} />
          <h1 className="text-3xl font-bold text-white">Mi lista</h1>
          {watchlist && watchlist.length > 0 && (
            <span className="text-gray-400 text-lg">({watchlist.length})</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#1a1a1a] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((item: any) => (
              <ContentCard key={item.id} item={item.content} size="sm" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
              <Bookmark size={36} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Tu lista está vacía</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Agrega películas y series a tu lista para verlas más tarde. Haz clic en el ícono de marcador en cualquier contenido.
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
