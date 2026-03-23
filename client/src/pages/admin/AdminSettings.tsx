import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { data: settings, refetch } = trpc.site.getSettings.useQuery();
  const updateSettings = trpc.site.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configuración guardada");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const uploadFile = trpc.upload.uploadFile.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({ ...f, app_logo: data.url }));
      toast.success("Logo subido correctamente");
    },
    onError: () => toast.error("Error al subir el logo"),
  });

  const [form, setForm] = useState({
    app_name: "",
    app_logo: "",
    primary_color: "#E50914",
    hero_title: "",
    hero_subtitle: "",
    maintenance_mode: "false",
    maintenance_message: "",
    footer_text: "",
    ui_layout: "default",
    subscription_mode: "paypal",
    instagram_url: "",
    tiktok_url: "",
    require_follow_to_watch: "false",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        app_name: settings.app_name ?? "StreamFlix",
        app_logo: settings.app_logo ?? "",
        primary_color: settings.primary_color ?? "#E50914",
        hero_title: settings.hero_title ?? "",
        hero_subtitle: settings.hero_subtitle ?? "",
        maintenance_mode: settings.maintenance_mode ?? "false",
        maintenance_message: settings.maintenance_message ?? "",
        footer_text: settings.footer_text ?? "",
        ui_layout: settings.ui_layout ?? "default",
        subscription_mode: settings.subscription_mode ?? "paypal",
        instagram_url: settings.instagram_url ?? "",
        tiktok_url: settings.tiktok_url ?? "",
        require_follow_to_watch: settings.require_follow_to_watch ?? "false",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      const key = `logos/${Date.now()}-${file.name}`;
      uploadFile.mutate({ key, base64Data: base64, contentType: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <AdminLayout title="Configuración del Sitio">
      <div className="max-w-3xl space-y-6">
        {/* General */}
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de la aplicación
              </label>
              <input
                type="text"
                value={form.app_name}
                onChange={(e) => setForm({ ...form, app_name: e.target.value })}
                className="sf-input w-full"
                placeholder="StreamFlix"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo (URL o subir archivo)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={form.app_logo}
                  onChange={(e) => setForm({ ...form, app_logo: e.target.value })}
                  className="sf-input flex-1"
                  placeholder="https://..."
                />
                <label className="flex items-center gap-2 px-4 py-2 bg-[#222] border border-[#333] text-gray-300 rounded-lg cursor-pointer hover:bg-[#2a2a2a] transition-colors text-sm">
                  <Upload size={16} />
                  Subir
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
              {form.app_logo && (
                <div className="mt-3 p-3 bg-[#111] rounded-lg inline-block">
                  <img src={form.app_logo} alt="Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color primario (acento)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="sf-input w-36"
                  placeholder="#E50914"
                />
                <div
                  className="w-10 h-10 rounded-lg border border-[#333]"
                  style={{ backgroundColor: form.primary_color }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Layout de la interfaz
              </label>
              <select
                value={form.ui_layout}
                onChange={(e) => setForm({ ...form, ui_layout: e.target.value })}
                className="sf-input w-full"
              >
                <option value="default">Por defecto (Netflix-style)</option>
                <option value="grid">Grid compacto</option>
                <option value="list">Lista</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hero section */}
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Sección Hero</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título principal
              </label>
              <input
                type="text"
                value={form.hero_title}
                onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                className="sf-input w-full"
                placeholder="Películas y series sin límites"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                value={form.hero_subtitle}
                onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                className="sf-input w-full"
                placeholder="Disfruta de contenido ilimitado en cualquier dispositivo"
              />
            </div>
          </div>
        </div>

        {/* Maintenance mode */}
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Modo Mantenimiento</h2>
              <p className="text-sm text-gray-400 mt-1">
                Cuando está activo, los usuarios no autenticados ven una página de mantenimiento
              </p>
            </div>
            <button
              onClick={() =>
                setForm({
                  ...form,
                  maintenance_mode: form.maintenance_mode === "true" ? "false" : "true",
                })
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.maintenance_mode === "true" ? "bg-[#E50914]" : "bg-[#333]"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  form.maintenance_mode === "true" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {form.maintenance_mode === "true" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mensaje de mantenimiento
              </label>
              <textarea
                value={form.maintenance_message}
                onChange={(e) => setForm({ ...form, maintenance_message: e.target.value })}
                className="sf-input w-full h-24 resize-none"
                placeholder="Estamos realizando mejoras. Vuelve pronto."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Footer</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Texto del footer
            </label>
            <input
              type="text"
              value={form.footer_text}
              onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
              className="sf-input w-full"
              placeholder="© 2024 StreamFlix. Todos los derechos reservados."
            />
          </div>
        </div>

        {/* Subscription Mode */}
        <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Modelo de Suscripción</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modo de suscripción
              </label>
              <select
                value={form.subscription_mode}
                onChange={(e) => setForm({ ...form, subscription_mode: e.target.value })}
                className="sf-input w-full"
              >
                <option value="paypal">PayPal (Suscripciones pagadas)</option>
                <option value="free_social">Gratis (Seguir redes sociales)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Selecciona "Gratis" para permitir que los usuarios vean contenido sin pagar, solo siguiendo Instagram/TikTok
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Settings */}
        {form.subscription_mode === "free_social" && (
          <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-6 border-[#E50914]/30">
            <h2 className="text-lg font-semibold text-white mb-5">Redes Sociales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de Instagram
                </label>
                <input
                  type="url"
                  value={form.instagram_url}
                  onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                  className="sf-input w-full"
                  placeholder="https://instagram.com/tuusuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL de TikTok
                </label>
                <input
                  type="url"
                  value={form.tiktok_url}
                  onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
                  className="sf-input w-full"
                  placeholder="https://tiktok.com/@tuusuario"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Requerir seguir para ver contenido
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Si está activado, los usuarios deben seguir las redes antes de reproducir
                  </p>
                </div>
                <button
                  onClick={() =>
                    setForm({
                      ...form,
                      require_follow_to_watch: form.require_follow_to_watch === "true" ? "false" : "true",
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    form.require_follow_to_watch === "true" ? "bg-[#E50914]" : "bg-[#333]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      form.require_follow_to_watch === "true" ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {updateSettings.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
