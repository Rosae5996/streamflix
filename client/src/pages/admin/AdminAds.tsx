import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const emptyAdForm = {
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  clickUrl: "",
  duration: 15,
  skipAfter: 5,
  isActive: true,
};

const emptyAssignForm = {
  contentId: 0,
  adId: 0,
  timestamp: 0,
  appliesTo: [] as string[],
};

export default function AdminAds() {
  const { data: ads, refetch: refetchAds } = trpc.ads.list.useQuery();
  const { data: content } = trpc.content.list.useQuery({ page: 1, limit: 100 });
  const { data: plans } = trpc.plans.list.useQuery();

  const [showAdForm, setShowAdForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [adForm, setAdForm] = useState<typeof emptyAdForm>(emptyAdForm);
  const [assignForm, setAssignForm] = useState(emptyAssignForm);

  const createAd = trpc.ads.create.useMutation({
    onSuccess: () => { toast.success("Anuncio creado"); refetchAds(); closeAdForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateAd = trpc.ads.update.useMutation({
    onSuccess: () => { toast.success("Anuncio actualizado"); refetchAds(); closeAdForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAd = trpc.ads.delete.useMutation({
    onSuccess: () => { toast.success("Anuncio eliminado"); refetchAds(); },
    onError: (e) => toast.error(e.message),
  });
  const assignAd = trpc.ads.assignToContent.useMutation({
    onSuccess: () => { toast.success("Anuncio asignado al contenido"); setShowAssignForm(false); setAssignForm(emptyAssignForm); },
    onError: (e) => toast.error(e.message),
  });

  const openEditAd = (ad: any) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title ?? "",
      description: ad.description ?? "",
      imageUrl: ad.imageUrl ?? "",
      videoUrl: ad.videoUrl ?? "",
      clickUrl: ad.clickUrl ?? "",
      duration: ad.duration ?? 15,
      skipAfter: ad.skipAfter ?? 5,
      isActive: ad.isActive,
    });
    setShowAdForm(true);
  };

  const closeAdForm = () => {
    setShowAdForm(false);
    setEditingAd(null);
    setAdForm(emptyAdForm);
  };

  const handleAdSubmit = () => {
    if (!adForm.title) { toast.error("El título es requerido"); return; }
    if (editingAd) {
      updateAd.mutate({ id: editingAd.id, ...adForm });
    } else {
      createAd.mutate(adForm);
    }
  };

  const togglePlanInAssign = (slug: string) => {
    setAssignForm((f) => ({
      ...f,
      appliesTo: f.appliesTo.includes(slug)
        ? f.appliesTo.filter((s) => s !== slug)
        : [...f.appliesTo, slug],
    }));
  };

  return (
    <AdminLayout title="Gestión de Anuncios">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{ads?.length ?? 0} anuncios configurados</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAssignForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#222] border border-[#333] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus size={16} />
            Asignar a contenido
          </button>
          <button
            onClick={() => { setEditingAd(null); setAdForm(emptyAdForm); setShowAdForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-sm font-semibold rounded-lg hover:bg-[#B20710] transition-colors"
          >
            <Plus size={16} />
            Nuevo anuncio
          </button>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-sm text-blue-300">
        <strong>¿Cómo funciona?</strong> Crea anuncios y luego asígnalos a películas o series con un timestamp específico (en segundos). Los anuncios se mostrarán en ese momento del video. Puedes controlar qué planes de suscripción ven cada anuncio.
      </div>

      {/* Ads grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads?.map((ad) => (
          <div key={ad.id} className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{ad.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block bg-blue-500/20 text-blue-400">
                  {ad.videoUrl ? "Video" : "Imagen"}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditAd(ad)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded">
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => { if (confirm("¿Eliminar anuncio?")) deleteAd.mutate({ id: ad.id }); }}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {ad.imageUrl && (
              <img src={ad.imageUrl} alt="" className="w-full h-24 object-cover rounded-lg mb-3" />
            )}

            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              <span>Duración: {ad.duration}s</span>
              <span>·</span>
              <span>Saltable en: {ad.skipAfter}s</span>
              <span>·</span>
              <span className={ad.isActive ? "text-green-400" : "text-red-400"}>
                {ad.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        ))}
        {!ads?.length && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No hay anuncios. Crea el primero.
          </div>
        )}
      </div>

      {/* Ad form modal */}
      {showAdForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#222]">
              <h2 className="text-xl font-bold text-white">{editingAd ? "Editar anuncio" : "Nuevo anuncio"}</h2>

              <button onClick={closeAdForm} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                <input type="text" value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} className="sf-input w-full" placeholder="Anuncio de bienvenida" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <input type="text" value={adForm.description} onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} className="sf-input w-full" placeholder="Descripción opcional" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL de imagen (para anuncios de imagen)</label>
                <input type="text" value={adForm.imageUrl} onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })} className="sf-input w-full" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL de video (para anuncios de video)</label>
                <input type="text" value={adForm.videoUrl} onChange={(e) => setAdForm({ ...adForm, videoUrl: e.target.value })} className="sf-input w-full" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL de destino (click)</label>
                <input type="text" value={adForm.clickUrl} onChange={(e) => setAdForm({ ...adForm, clickUrl: e.target.value })} className="sf-input w-full" placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duración (segundos)</label>
                  <input type="number" value={adForm.duration} onChange={(e) => setAdForm({ ...adForm, duration: parseInt(e.target.value) })} className="sf-input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Saltable después de (s)</label>
                  <input type="number" value={adForm.skipAfter} onChange={(e) => setAdForm({ ...adForm, skipAfter: parseInt(e.target.value) })} className="sf-input w-full" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button onClick={() => setAdForm({ ...adForm, isActive: !adForm.isActive })} className={`relative w-10 h-5 rounded-full transition-colors ${adForm.isActive ? "bg-green-500" : "bg-[#333]"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${adForm.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm text-gray-300">Anuncio activo</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#222]">
              <button onClick={closeAdForm} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleAdSubmit} disabled={createAd.isPending || updateAd.isPending} className="px-6 py-2 bg-[#E50914] text-white font-semibold rounded-lg hover:bg-[#B20710] disabled:opacity-50">
                {editingAd ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign form modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#222]">
              <h2 className="text-xl font-bold text-white">Asignar anuncio a contenido</h2>
              <button onClick={() => setShowAssignForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Anuncio *</label>
                <select value={assignForm.adId} onChange={(e) => setAssignForm({ ...assignForm, adId: parseInt(e.target.value) })} className="sf-input w-full">
                  <option value={0}>Seleccionar anuncio...</option>
                  {ads?.filter((a) => a.isActive).map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contenido *</label>
                <select value={assignForm.contentId} onChange={(e) => setAssignForm({ ...assignForm, contentId: parseInt(e.target.value) })} className="sf-input w-full">
                  <option value={0}>Seleccionar película/serie...</option>
                  {content?.items?.map((c) => (
                    <option key={c.id} value={c.id}>{c.title} ({c.type === "movie" ? "Película" : "Serie"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timestamp (segundos desde el inicio del video)
                </label>
                <input
                  type="number"
                  value={assignForm.timestamp}
                  onChange={(e) => setAssignForm({ ...assignForm, timestamp: parseInt(e.target.value) })}
                  className="sf-input w-full"
                  placeholder="Ej: 300 = 5 minutos"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {assignForm.timestamp > 0 && `El anuncio aparecerá a los ${Math.floor(assignForm.timestamp / 60)}m ${assignForm.timestamp % 60}s`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mostrar a planes (selecciona los planes que verán este anuncio)
                </label>
                <div className="space-y-2">
                  {plans?.map((plan) => (
                    <label key={plan.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/3">
                      <div
                        onClick={() => togglePlanInAssign(plan.slug)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          assignForm.appliesTo.includes(plan.slug)
                            ? "bg-[#E50914] border-[#E50914]"
                            : "border-[#444]"
                        }`}
                      >
                        {assignForm.appliesTo.includes(plan.slug) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-300">{plan.name}</span>
                      {plan.hasAds && <span className="text-xs text-yellow-400 ml-auto">Con anuncios</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#222]">
              <button onClick={() => setShowAssignForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
              <button
                onClick={() => {
                  if (!assignForm.adId || !assignForm.contentId) { toast.error("Selecciona anuncio y contenido"); return; }
                  if (!assignForm.appliesTo.length) { toast.error("Selecciona al menos un plan"); return; }
                  assignAd.mutate(assignForm);
                }}
                disabled={assignAd.isPending}
                className="px-6 py-2 bg-[#E50914] text-white font-semibold rounded-lg hover:bg-[#B20710] disabled:opacity-50"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
