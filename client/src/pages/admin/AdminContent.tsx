import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Edit, Eye, Film, Plus, Search, Trash2, Tv } from "lucide-react";
import { useState } from "react";
import { Link, useSearch } from "wouter";
import { toast } from "sonner";

export default function AdminContent() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const typeParam = params.get("type") as "movie" | "series" | null;

  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | "movie" | "series">(typeParam ?? "");
  const [page, setPage] = useState(1);

  const { data, refetch } = trpc.content.list.useQuery({
    type: type || undefined,
    search: search || undefined,
    page,
    limit: 20,
  });

  const deleteContent = trpc.content.delete.useMutation({
    onSuccess: () => { toast.success("Contenido eliminado"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Gestión de Contenido">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "", label: "Todo" },
            { value: "movie", label: "Películas" },
            { value: "series", label: "Series" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setType(opt.value as any); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                type === opt.value
                  ? "bg-[#E50914] text-white"
                  : "bg-[#1a1a1a] text-gray-300 border border-[#333] hover:bg-[#222]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg w-48 focus:outline-none focus:border-[#E50914]"
            />
          </div>
          <Link
            href="/admin/content/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-sm font-semibold rounded-lg hover:bg-[#B20710] transition-colors"
          >
            <Plus size={16} />
            Agregar
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Título</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden sm:table-cell">Tipo</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden md:table-cell">Año</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden lg:table-cell">Vistas</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[#1f1f1f] hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.posterUrl ? (
                        <img src={item.posterUrl} alt="" className="w-8 h-12 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-12 rounded bg-[#2a2a2a] flex items-center justify-center shrink-0">
                          {item.type === "movie" ? <Film size={14} className="text-gray-500" /> : <Tv size={14} className="text-gray-500" />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[200px]">{item.title}</p>
                        <p className="text-gray-500 text-xs truncate">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.type === "movie" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                      {item.type === "movie" ? "Película" : "Serie"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-400 text-sm">{item.releaseYear ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "published"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "draft"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {item.status === "published" ? "Publicado" : item.status === "draft" ? "Borrador" : "Archivado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-400 text-sm">{(item.viewCount ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/content/${item.slug}`}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="Ver"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/admin/content/${item.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar este contenido?")) deleteContent.mutate({ id: item.id });
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No hay contenido. <Link href="/admin/content/new" className="text-[#E50914] hover:underline">Agrega el primero</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-lg disabled:opacity-40 text-sm">
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-400 text-sm flex items-center">
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-lg disabled:opacity-40 text-sm">
            Siguiente
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
