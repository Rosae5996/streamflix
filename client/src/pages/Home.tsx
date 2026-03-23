import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import StreamFlixLayout from "@/components/StreamFlixLayout";
import ContentCard from "@/components/ContentCard";
import { ChevronRight, Play, Info } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: settings } = trpc.site.getSettings.useQuery();
  const { data: featuredData } = trpc.content.list.useQuery({
    featured: true,
    status: "published",
    limit: 1,
  });
  const { data: moviesData } = trpc.content.list.useQuery({
    type: "movie",
    status: "published",
    limit: 12,
  });
  const { data: seriesData } = trpc.content.list.useQuery({
    type: "series",
    status: "published",
    limit: 12,
  });
  const { data: categories } = trpc.categories.list.useQuery({ activeOnly: true });

  const maintenanceMode = settings?.maintenance_mode === "true";
  const maintenanceMsg = settings?.maintenance_message ?? "En mantenimiento";

  if (maintenanceMode && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔧</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {settings?.app_name ?? "StreamFlix"}
          </h1>
          <p className="text-gray-300 text-lg">{maintenanceMsg}</p>
        </div>
      </div>
    );
  }

  const featured = featuredData?.items[0];
  const movies = moviesData?.items ?? [];
  const series = seriesData?.items ?? [];

  return (
    <StreamFlixLayout transparent>
      {/* Hero Banner */}
      <section className="relative min-h-screen sm:min-h-[80vh] md:min-h-[90vh] lg:min-h-screen flex items-end pb-8 sm:pb-12 md:pb-16 pt-20 sm:pt-24 md:pt-32">
        {/* Background */}
        {featured?.backdropUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${featured.backdropUrl})` }}
          >
            <div className="absolute inset-0 sf-gradient-overlay" />
            <div className="absolute inset-0 sf-gradient-left" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0000] via-[#141414] to-[#0d0d0d]">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E50914] rounded-full blur-3xl opacity-20" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#E50914] rounded-full blur-3xl opacity-10" />
            </div>
          </div>
        )}

        {/* Hero content */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-16 max-w-2xl w-full">
          {featured ? (
            <>
              <div className="mb-3">
                <span className="sf-badge sf-badge-red">
                  {featured.type === "movie" ? "Película" : "Serie"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight">
                {featured.title}
              </h1>
              {featured.shortDescription && (
                <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 line-clamp-2 sm:line-clamp-3 max-w-lg">
                  {featured.shortDescription}
                </p>
              )}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => navigate(`/watch/${featured.id}`)}
                  className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  <Play size={18} fill="black" />
                  Reproducir
                </button>
                <Link
                  href={`/content/${featured.slug}`}
                  className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded backdrop-blur-sm transition-colors text-sm sm:text-base"
                >
                  <Info size={18} />
                  Más info
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight">
                {settings?.hero_title ?? "Películas y series sin límites"}
              </h1>
              <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                {settings?.hero_subtitle ?? "Disfruta de contenido ilimitado en cualquier dispositivo"}
              </p>
              {!isAuthenticated && (
                <a
                  href={getLoginUrl()}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#E50914] hover:bg-[#B20710] text-white font-bold text-sm sm:text-base md:text-lg rounded transition-colors w-full sm:w-auto"
                >
                  <Play size={20} fill="white" />
                  Comenzar ahora
                </a>
              )}
            </>
          )}
        </div>
      </section>

      {/* Content rows */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-16 pb-8 sm:pb-12 md:pb-16 space-y-8 sm:space-y-10 md:space-y-12 -mt-8 relative z-10">
        {/* Movies row */}
        {movies.length > 0 && (
          <ContentRow
            title="Películas populares"
            items={movies}
            viewAllHref="/browse?type=movie"
          />
        )}

        {/* Series row */}
        {series.length > 0 && (
          <ContentRow
            title="Series destacadas"
            items={series}
            viewAllHref="/browse?type=series"
          />
        )}

        {/* Category rows */}
        {categories?.slice(0, 3).map((cat) => (
          <CategoryRow key={cat.id} category={cat} />
        ))}

        {/* CTA for non-authenticated */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-[#1a0000] to-[#1a1a1a] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center border border-[#E50914]/20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              ¿Listo para ver?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
              Crea tu cuenta y disfruta de todo el contenido. Cancela cuando quieras.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href={getLoginUrl()}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#E50914] hover:bg-[#B20710] text-white font-bold text-sm sm:text-base md:text-lg rounded transition-colors"
              >
                Crear cuenta gratis
              </a>
              <Link
                href="/subscription"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base md:text-lg rounded transition-colors"
              >
                Ver planes
              </Link>
            </div>
          </div>
        )}
      </div>
    </StreamFlixLayout>
  );
}

function ContentRow({
  title,
  items,
  viewAllHref,
}: {
  title: string;
  items: any[];
  viewAllHref?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Ver todo <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="scroll-row">
        {items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ category }: { category: any }) {
  const { data } = trpc.content.list.useQuery({
    categoryId: category.id,
    status: "published",
    limit: 10,
  });

  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <ContentRow
      title={category.name}
      items={items}
      viewAllHref={`/browse?category=${category.id}`}
    />
  );
}
