import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Ban, Eye, Search, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const { data, refetch } = trpc.users.list.useQuery({ page, limit: 20, search: search || undefined });
  const updateUser = trpc.users.updateRole.useMutation({
    onSuccess: () => { toast.success("Usuario actualizado"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const banUser = trpc.users.ban.useMutation({
    onSuccess: () => { toast.success("Estado actualizado"); refetch(); setSelectedUser(null); },
    onError: (e) => toast.error(e.message),
  });

  const { data: watchHistory } = trpc.watch.getHistory.useQuery(
    { limit: 10 },
    { enabled: !!selectedUser }
  );

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Gestión de Usuarios">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{total} usuarios registrados</p>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o email..."
            className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg w-64 focus:outline-none focus:border-[#E50914]"
          />
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Usuario</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Rol</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden md:table-cell">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden lg:table-cell">Registro</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#1f1f1f] hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E50914]/20 flex items-center justify-center shrink-0">
                        <User size={14} className="text-[#E50914]" />
                      </div>
                      <span className="text-white text-sm font-medium">{user.name ?? "Sin nombre"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-gray-400 text-sm">{user.email ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === "admin"
                        ? "bg-[#E50914]/20 text-[#E50914]"
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {user.role === "admin" ? "Admin" : "Usuario"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (user as any).isBanned
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {(user as any).isBanned ? "Baneado" : "Activo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("es-MX")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="Ver historial"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => updateUser.mutate({
                          userId: user.id,
                          role: user.role === "admin" ? "user" : "admin",
                        })}
                        className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors"
                        title={user.role === "admin" ? "Quitar admin" : "Hacer admin"}
                      >
                        <Shield size={15} />
                      </button>
                      <button
                        onClick={() => banUser.mutate({ userId: user.id, isBanned: !(user as any).isBanned })}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded transition-colors"
                        title={(user as any).isBanned ? "Desbanear" : "Banear"}
                      >
                        <Ban size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-lg disabled:opacity-40 text-sm">
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-400 text-sm flex items-center">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-lg disabled:opacity-40 text-sm">
            Siguiente
          </button>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#222]">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedUser.name ?? "Sin nombre"}</h2>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#111] rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Rol</p>
                  <p className="text-white font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div className="bg-[#111] rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Estado</p>
                  <p className={`font-medium ${selectedUser.isBanned ? "text-red-400" : "text-green-400"}`}>
                    {selectedUser.isBanned ? "Baneado" : "Activo"}
                  </p>
                </div>
                <div className="bg-[#111] rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Registro</p>
                  <p className="text-white text-sm">{new Date(selectedUser.createdAt).toLocaleDateString("es-MX")}</p>
                </div>
                <div className="bg-[#111] rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Último acceso</p>
                  <p className="text-white text-sm">{new Date(selectedUser.lastSignedIn).toLocaleDateString("es-MX")}</p>
                </div>
              </div>

              <h3 className="font-semibold text-white mb-3">Historial de visualización</h3>
              <div className="space-y-2">
                {watchHistory?.slice(0, 10).map((h: any) => (
                  <div key={h.id} className="flex items-center gap-3 p-3 bg-[#111] rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{h.content?.title ?? "Contenido eliminado"}</p>
                      <p className="text-gray-500 text-xs">
                        {Math.floor((h.progressSeconds ?? 0) / 60)}m visto · {new Date(h.watchedAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div className="w-16 h-1 bg-[#333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E50914]"
                        style={{ width: `${Math.min(100, ((h.progressSeconds ?? 0) / (h.totalSeconds ?? 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!watchHistory?.length && (
                  <p className="text-gray-500 text-sm text-center py-4">Sin historial de visualización</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
