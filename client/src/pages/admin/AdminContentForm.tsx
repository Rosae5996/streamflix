import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronRight, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { toast } from "sonner";

const emptyForm = {
  title: "",
  slug: "",
  type: "movie" as "movie" | "series",
  description: "",
  shortDescription: "",
  posterUrl: "",
  backdropUrl: "",
  trailerUrl: "",
  releaseYear: new Date().getFullYear(),
  duration: 0,
  rating: "",
  imdbRating: "",
  categoryId: undefined as number | undefined,
  tags: [] as string[],
  cast: [] as string[],
  director: "",
  language: "es",
  country: "",
  status: "draft" as "published" | "draft" | "archived",
  isFeatured: false,
  isFree: false,
  minPlanId: undefined as number | undefined,
};

export default function AdminContentForm() {
  const { id } = useParams<{ id: string }>();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const typeParam = params.get("type") as "movie" | "series" | null;
  const [, navigate] = useLocation();
  const isEditing = !!id;

  const [form, setForm] = useState({ ...emptyForm, type: typeParam ?? "movie" as "movie" | "series" });
  const [tagInput, setTagInput] = useState("");
  const [castInput, setCastInput] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "media" | "videos" | "seasons">("info");

  const { data: existingContent } = trpc.content.getById.useQuery(
    { id: parseInt(id ?? "0") },
    { enabled: isEditing }
  );
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: plans } = trpc.plans.list.useQuery();
  const { data: seasons, refetch: refetchSeasons } = trpc.seasons.byContent.useQuery(
    { contentId: parseInt(id ?? "0") },
    { enabled: isEditing && form.type === "series" }
  );
  const { data: videos, refetch: refetchVideos } = trpc.videos.byContent.useQuery(
    { contentId: parseInt(id ?? "0") },
    { enabled: isEditing }
  );

  const createContent = trpc.content.create.useMutation({
    onSuccess: () => { toast.success("Contenido creado"); navigate("/admin/content"); },
    onError: (e) => toast.error(e.message),
  });
  const updateContent = trpc.content.update.useMutation({
    onSuccess: () => { toast.success("Contenido actualizado"); },
    onError: (e) => toast.error(e.message),
  });
  const createSeason = trpc.seasons.create.useMutation({
    onSuccess: () => { toast.success("Temporada creada"); refetchSeasons(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteSeason = trpc.seasons.delete.useMutation({
    onSuccess: () => { refetchSeasons(); toast.success("Temporada eliminada"); },
  });
  const createVideo = trpc.videos.create.useMutation({
    onSuccess: () => { toast.success("Video agregado"); refetchVideos(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteVideo = trpc.videos.delete.useMutation({
    onSuccess: () => { refetchVideos(); toast.success("Video eliminado"); },
  });

  useEffect(() => {
    if (existingContent) {
      setForm({
        title: existingContent.title,
        slug: existingContent.slug,
        type: existingContent.type,
        description: existingContent.description ?? "",
        shortDescription: existingContent.shortDescription ?? "",
        posterUrl: existingContent.posterUrl ?? "",
        backdropUrl: existingContent.backdropUrl ?? "",
        trailerUrl: existingContent.trailerUrl ?? "",
        releaseYear: existingContent.releaseYear ?? new Date().getFullYear(),
        duration: existingContent.duration ?? 0,
        rating: existingContent.rating ?? "",
        imdbRating: existingContent.imdbRating ?? "",
        categoryId: existingContent.categoryId ?? undefined,
        tags: Array.isArray(existingContent.tags) ? existingContent.tags : [],
        cast: Array.isArray(existingContent.cast) ? existingContent.cast : [],
        director: existingContent.director ?? "",
        language: existingContent.language ?? "es",
        country: existingContent.country ?? "",
        status: existingContent.status,
        isFeatured: existingContent.isFeatured,
        isFree: existingContent.isFree,
        minPlanId: existingContent.minPlanId ?? undefined,
      });
    }
  }, [existingContent]);

  const handleSubmit = () => {
    if (!form.title || !form.slug) {
      toast.error("El título y el slug son requeridos");
      return;
    }
    if (isEditing) {
      updateContent.mutate({ id: parseInt(id!), ...form });
    } else {
      createContent.mutate(form);
    }
  };

  // Video form state
  const [videoForm, setVideoForm] = useState({ quality: "1080p" as any, url: "" });

  const tabs = [
    { id: "info", label: "Información" },
    { id: "media", label: "Medios" },
    { id: "videos", label: "Videos" },
    ...(form.type === "series" && isEditing ? [{ id: "seasons", label: "Temporadas" }] : []),
  ];

  return (
    <AdminLayout title={isEditing ? "Editar contenido" : "Agregar contenido"}>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#1a1a1a] border border-[#222] rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#E50914] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {/* Info tab */}
        {activeTab === "info" && (
          <div className="space-y-5">
            <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                      setForm({ ...form, title, slug });
                    }}
                    className="sf-input w-full"
                    placeholder="Título de la película o serie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="sf-input w-full"
                    placeholder="titulo-de-la-pelicula"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "movie" | "series" })}
                    className="sf-input w-full"
                    disabled={isEditing}
                  >
                    <option value="movie">Película</option>
                    <option value="series">Serie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="sf-input w-full"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción corta</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="sf-input w-full"
                  placeholder="Resumen breve para el hero banner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción completa</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="sf-input w-full h-28 resize-none"
                  placeholder="Sinopsis completa..."
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Año</label>
                  <input
                    type="number"
                    value={form.releaseYear}
                    onChange={(e) => setForm({ ...form, releaseYear: parseInt(e.target.value) })}
                    className="sf-input w-full"
                  />
                </div>
                {form.type === "movie" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duración (min)</label>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                      className="sf-input w-full"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Clasificación</label>
                  <input
                    type="text"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="sf-input w-full"
                    placeholder="PG-13"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IMDb Rating</label>
                  <input
                    type="text"
                    value={form.imdbRating}
                    onChange={(e) => setForm({ ...form, imdbRating: e.target.value })}
                    className="sf-input w-full"
                    placeholder="8.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                  <select
                    value={form.categoryId ?? ""}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="sf-input w-full"
                  >
                    <option value="">Sin categoría</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plan mínimo requerido</label>
                  <select
                    value={form.minPlanId ?? ""}
                    onChange={(e) => setForm({ ...form, minPlanId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="sf-input w-full"
                  >
                    <option value="">Sin restricción</option>
                    {plans?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Director</label>
                  <input
                    type="text"
                    value={form.director}
                    onChange={(e) => setForm({ ...form, director: e.target.value })}
                    className="sf-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Idioma</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="sf-input w-full"
                    placeholder="es"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Etiquetas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
                        setTagInput("");
                      }
                    }}
                    className="sf-input flex-1"
                    placeholder="Acción, Drama..."
                  />
                  <button
                    onClick={() => {
                      if (tagInput.trim()) {
                        setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
                        setTagInput("");
                      }
                    }}
                    className="px-3 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-[#222] text-gray-300 text-xs rounded-full">
                      {tag}
                      <button onClick={() => setForm({ ...form, tags: form.tags.filter((_, j) => j !== i) })}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cast */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reparto</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={castInput}
                    onChange={(e) => setCastInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && castInput.trim()) {
                        setForm({ ...form, cast: [...form.cast, castInput.trim()] });
                        setCastInput("");
                      }
                    }}
                    className="sf-input flex-1"
                    placeholder="Nombre del actor"
                  />
                  <button
                    onClick={() => {
                      if (castInput.trim()) {
                        setForm({ ...form, cast: [...form.cast, castInput.trim()] });
                        setCastInput("");
                      }
                    }}
                    className="px-3 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.cast.map((actor, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 bg-[#222] text-gray-300 text-xs rounded-full">
                      {actor}
                      <button onClick={() => setForm({ ...form, cast: form.cast.filter((_, j) => j !== i) })}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isFeatured ? "bg-[#E50914]" : "bg-[#333]"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isFeatured ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-gray-300">Destacado (hero banner)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setForm({ ...form, isFree: !form.isFree })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isFree ? "bg-green-500" : "bg-[#333]"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isFree ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-gray-300">Contenido gratuito</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate("/admin/content")}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createContent.isPending || updateContent.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-[#E50914] text-white font-semibold rounded-lg hover:bg-[#B20710] transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {isEditing ? "Guardar cambios" : "Crear contenido"}
              </button>
            </div>
          </div>
        )}

        {/* Media tab */}
        {activeTab === "media" && (
          <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 space-y-4">
            {[
              { key: "posterUrl", label: "Póster (vertical)", placeholder: "https://..." },
              { key: "backdropUrl", label: "Backdrop (horizontal, para hero)", placeholder: "https://..." },
              { key: "trailerUrl", label: "URL del Trailer (video)", placeholder: "https://..." },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                <input
                  type="text"
                  value={(form as any)[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="sf-input w-full"
                  placeholder={field.placeholder}
                />
                {(form as any)[field.key] && field.key !== "trailerUrl" && (
                  <div className="mt-2">
                    <img
                      src={(form as any)[field.key]}
                      alt=""
                      className={`rounded-lg object-cover ${field.key === "posterUrl" ? "h-32" : "h-24 w-full"}`}
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={updateContent.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-[#E50914] text-white font-semibold rounded-lg hover:bg-[#B20710] transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Videos tab */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            {!isEditing && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm">
                Guarda el contenido primero para agregar videos.
              </div>
            )}
            {isEditing && (
              <>
                <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-4">Agregar fuente de video</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Calidad</label>
                      <select
                        value={videoForm.quality}
                        onChange={(e) => setVideoForm({ ...videoForm, quality: e.target.value })}
                        className="sf-input w-full"
                      >
                        {["360p", "480p", "720p", "1080p", "4K"].map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">URL del video</label>
                      <input
                        type="text"
                        value={videoForm.url}
                        onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                        className="sf-input w-full"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!videoForm.url) { toast.error("La URL es requerida"); return; }
                      createVideo.mutate({
                        contentId: parseInt(id!),
                        quality: videoForm.quality,
                        url: videoForm.url,
                      });
                      setVideoForm({ quality: "1080p", url: "" });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-sm font-semibold rounded-lg hover:bg-[#B20710] transition-colors"
                  >
                    <Plus size={16} />
                    Agregar video
                  </button>
                </div>

                <div className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#222]">
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Calidad</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">URL</th>
                        <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos?.map((v) => (
                        <tr key={v.id} className="border-b border-[#1f1f1f]">
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">{v.quality}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-400 text-sm truncate max-w-xs block">{v.url}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteVideo.mutate({ id: v.id })}
                              className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!videos?.length && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                            Sin videos. Agrega la primera fuente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Seasons tab */}
        {activeTab === "seasons" && isEditing && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Agregar temporada</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Número de temporada"
                  className="sf-input w-40"
                  id="season-number"
                />
                <input
                  type="text"
                  placeholder="Título (opcional)"
                  className="sf-input flex-1"
                  id="season-title"
                />
                <button
                  onClick={() => {
                    const num = parseInt((document.getElementById("season-number") as HTMLInputElement).value);
                    const title = (document.getElementById("season-title") as HTMLInputElement).value;
                    if (!num) { toast.error("El número de temporada es requerido"); return; }
                    createSeason.mutate({ contentId: parseInt(id!), number: num, title: title || undefined });
                    (document.getElementById("season-number") as HTMLInputElement).value = "";
                    (document.getElementById("season-title") as HTMLInputElement).value = "";
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-sm font-semibold rounded-lg hover:bg-[#B20710] transition-colors"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
            </div>

            {seasons?.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                contentId={parseInt(id!)}
                onDelete={() => deleteSeason.mutate({ id: season.id })}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SeasonCard({ season, contentId, onDelete }: { season: any; contentId: number; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { data: episodes, refetch } = trpc.episodes.bySeason.useQuery({ seasonId: season.id });
  const createEpisode = trpc.episodes.create.useMutation({
    onSuccess: () => { toast.success("Episodio creado"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteEpisode = trpc.episodes.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [epForm, setEpForm] = useState({ number: 1, title: "", description: "", duration: 0, isFree: false });

  return (
    <div className="bg-[#1a1a1a] border border-[#222] rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
          <div>
            <p className="font-semibold text-white">Temporada {season.number}</p>
            {season.title && <p className="text-sm text-gray-400">{season.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{episodes?.length ?? 0} episodios</span>
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm("¿Eliminar temporada?")) onDelete(); }}
            className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#222] p-5 space-y-4">
          {/* Episode form */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              type="number"
              value={epForm.number}
              onChange={(e) => setEpForm({ ...epForm, number: parseInt(e.target.value) })}
              placeholder="Nº"
              className="sf-input"
            />
            <input
              type="text"
              value={epForm.title}
              onChange={(e) => setEpForm({ ...epForm, title: e.target.value })}
              placeholder="Título del episodio"
              className="sf-input col-span-2"
            />
            <input
              type="number"
              value={epForm.duration}
              onChange={(e) => setEpForm({ ...epForm, duration: parseInt(e.target.value) })}
              placeholder="Duración (s)"
              className="sf-input"
            />
          </div>
          <button
            onClick={() => {
              if (!epForm.title) { toast.error("El título es requerido"); return; }
              createEpisode.mutate({ seasonId: season.id, contentId, ...epForm });
              setEpForm({ number: epForm.number + 1, title: "", description: "", duration: 0, isFree: false });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#333] text-white text-sm rounded-lg hover:bg-[#444] transition-colors"
          >
            <Plus size={15} />
            Agregar episodio
          </button>

          {/* Episodes list */}
          <div className="space-y-2">
            {episodes?.map((ep) => (
              <div key={ep.id} className="flex items-center gap-3 p-3 bg-[#111] rounded-lg">
                <span className="text-gray-400 text-sm w-6">{ep.number}</span>
                <span className="text-white text-sm flex-1">{ep.title}</span>
                {ep.duration && <span className="text-gray-500 text-xs">{Math.floor(ep.duration / 60)}m</span>}
                <button
                  onClick={() => deleteEpisode.mutate({ id: ep.id })}
                  className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
