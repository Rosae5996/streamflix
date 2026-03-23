import StreamFlixLayout from "@/components/StreamFlixLayout";
import ContentCard from "@/components/ContentCard";
import { trpc } from "@/lib/trpc";
import { Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearch } from "wouter";

export default function Browse() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const typeParam = params.get("type") as "movie" | "series" | null;
  const categoryParam = params.get("category");
  const searchParam = params.get("search");

  const [type, setType] = useState<"" | "movie" | "series">(typeParam ?? "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    categoryParam ? parseInt(categoryParam) : undefined
  );
  const [search, setSearch] = useState(searchParam ?? "");
  const [searchInput, setSearchInput] = useState(searchParam ?? "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setType(typeParam ?? "");
    setCategoryId(categoryParam ? parseInt(categoryParam) : undefined);
    setSearch(searchParam ?? "");
    setSearchInput(searchParam ?? "");
    setPage(1);
  }, [typeParam, categoryParam, searchParam]);

  const { data: categories } = trpc.categories.list.useQuery({ activeOnly: true });
  const { data, isLoading } = trpc.content.list.useQuery({
    type: type || undefined,
    categoryId,
    search: search || undefined,
    status: "published",
    page,
    limit: 24,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 24);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const pageTitle =
    type === "movie"
      ? "Películas"
      : type === "series"
      ? "Series"
      : search
      ? `Resultados para "${search}"`
      : "Explorar catálogo";

  return (
    <StreamFlixLayout>
      <div className="min-h-screen px-4 sm:px-8 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">{pageTitle}</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg w-48 sm:w-64 focus:outline-none focus:border-[#E50914]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#E50914] text-white text-sm font-medium rounded-lg hover:bg-[#B20710] transition-colors"
              >
                Buscar
              </button>
            </form>

            {/* Type filter */}
            <div className="flex gap-2">
              {[
                { value: "", label: "Todo" },
                { value: "movie", label: "Películas" },
                { value: "series", label: "Series" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setType(opt.value as any); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === opt.value
                      ? "bg-[#E50914] text-white"
                      : "bg-[#1a1a1a] text-gray-300 hover:bg-[#222] border border-[#333]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <select
              value={categoryId ?? ""}
              onChange={(e) => {
                setCategoryId(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg focus:outline-none focus:border-[#E50914]"
            >
              <option value="">Todas las categorías</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-gray-400 mb-6">
            {total} {total === 1 ? "resultado" : "resultados"}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg skeleton" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Sin resultados</h3>
            <p className="text-gray-400">
              No encontramos contenido con esos filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-center">
                <ContentCard item={item} size="md" />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-lg disabled:opacity-40 hover:bg-[#222] transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-gray-400 text-sm flex items-center">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-lg disabled:opacity-40 hover:bg-[#222] transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </StreamFlixLayout>
  );
}
