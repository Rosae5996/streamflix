import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  parentId: undefined as number | undefined,
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategories() {
  const { data: categories, refetch } = trpc.categories.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => { toast.success("Categoría creada"); refetch(); closeForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateCategory = trpc.categories.update.useMutation({
    onSuccess: () => { toast.success("Categoría actualizada"); refetch(); closeForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => { toast.success("Categoría eliminada"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      parentId: cat.parentId ?? undefined,
      imageUrl: cat.imageUrl ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateCategory.mutate({ id: editingId, ...form });
    } else {
      createCategory.mutate(form);
    }
  };

  const parentCategories = categories?.filter((c) => !c.parentId) ?? [];
  const subcategories = categories?.filter((c) => c.parentId) ?? [];

  return (
    <AdminLayout title="Categorías">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400 text-sm">
          {parentCategories.length} categorías, {subcategories.length} subcategorías
        </p>
        <button
          onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-sm font-semibold rounded-lg hover:bg-[#B20710] transition-colors"
        >
          <Plus size={16} />
          Nueva categoría
        </button>
      </div>

      {/* Categories table */}
      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#222]">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Nombre</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden sm:table-cell">Slug</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3 hidden md:table-cell">Padre</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Estado</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => {
              const parent = categories.find((c) => c.id === cat.parentId);
              return (
                <tr key={cat.id} className="border-b border-[#1f1f1f] hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.parentId && <span className="text-gray-600 text-xs">└</span>}
                      {cat.imageUrl && (
                        <img src={cat.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                      )}
                      <span className="text-white text-sm font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-gray-400 text-sm font-mono">{cat.slug}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-400 text-sm">{parent?.name ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${cat.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {cat.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar esta categoría?")) deleteCategory.mutate({ id: cat.id });
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!categories?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No hay categorías. Crea la primera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#222]">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Editar categoría" : "Nueva categoría"}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="sf-input w-full"
                    placeholder="Acción"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="sf-input w-full"
                    placeholder="accion"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="sf-input w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoría padre (subcategoría)</label>
                <select
                  value={form.parentId ?? ""}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="sf-input w-full"
                >
                  <option value="">Ninguna (categoría principal)</option>
                  {parentCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL de imagen</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="sf-input w-full"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Orden</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="sf-input w-full"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-[#333]"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-sm text-gray-300">Activa</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#222]">
              <button onClick={closeForm} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createCategory.isPending || updateCategory.isPending}
                className="px-6 py-2 bg-[#E50914] text-white font-semibold rounded-lg hover:bg-[#B20710] transition-colors disabled:opacity-50"
              >
                {editingId ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
