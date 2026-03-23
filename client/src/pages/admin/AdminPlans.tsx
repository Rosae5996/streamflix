import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Trash2, X, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Plan = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  priceUsd: string;
  priceMxn?: string | null;
  currency: string;
  billingCycle: string;
  features: any;
  maxQuality: string;
  hasAds: boolean;
  isActive: boolean;
  sortOrder: number;
  paypalPlanId?: string | null;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  priceUsd: "0.00",
  priceMxn: "",
  currency: "USD",
  billingCycle: "monthly" as "monthly" | "yearly",
  features: [] as string[],
  maxQuality: "1080p" as "480p" | "720p" | "1080p" | "4K",
  hasAds: false,
  isActive: true,
  sortOrder: 0,
  paypalPlanId: "",
};

export default function AdminPlans() {
  const { data: plans, refetch } = trpc.plans.list.useQuery();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [featureInput, setFeatureInput] = useState("");

  const createPlan = trpc.plans.create.useMutation({
    onSuccess: () => { toast.success("Plan creado"); refetch(); setShowForm(false); setForm(emptyForm); },
    onError: (e) => toast.error(e.message),
  });

  const updatePlan = trpc.plans.update.useMutation({
    onSuccess: () => { toast.success("Plan actualizado"); refetch(); setEditingPlan(null); },
    onError: (e) => toast.error(e.message),
  });

  const deletePlan = trpc.plans.delete.useMutation({
    onSuccess: () => { toast.success("Plan eliminado"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      priceUsd: plan.priceUsd,
      priceMxn: plan.priceMxn ?? "",
      currency: plan.currency,
      billingCycle: plan.billingCycle as "monthly" | "yearly",
      features: Array.isArray(plan.features) ? plan.features : [],
      maxQuality: plan.maxQuality as "480p" | "720p" | "1080p" | "4K",
      hasAds: plan.hasAds,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
      paypalPlanId: plan.paypalPlanId ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingPlan) {
      updatePlan.mutate({ id: editingPlan.id, ...form });
    } else {
      createPlan.mutate(form);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPlan(null);
    setForm(emptyForm);
  };

  return (
    <AdminLayout title="Planes de Suscripción">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400 text-sm">{plans?.length ?? 0} planes configurados</p>
        <button
          onClick={() => { setEditingPlan(null); setForm(emptyForm); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-sm font-semibold rounded-lg hover:bg-[#B20710] transition-colors"
        >
          <Plus size={16} />
          Nuevo plan
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {plans?.map((plan) => (
          <div key={plan.id} className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.slug}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(plan as Plan)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar este plan?")) deletePlan.mutate({ id: plan.id });
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-black text-white">
                ${plan.priceUsd}
                <span className="text-sm font-normal text-gray-400"> USD</span>
              </p>
              {plan.priceMxn && (
                <p className="text-sm text-gray-400">${plan.priceMxn} MXN</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {plan.billingCycle === "monthly" ? "por mes" : "por año"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${plan.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                {plan.isActive ? "Activo" : "Inactivo"}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                {plan.maxQuality}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${plan.hasAds ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                {plan.hasAds ? "Con anuncios" : "Sin anuncios"}
              </span>
            </div>

            {Array.isArray(plan.features) && plan.features.length > 0 && (
              <ul className="space-y-1">
                {(plan.features as string[]).slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <Check size={12} className="text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {plan.paypalPlanId && (
              <p className="text-xs text-gray-500 mt-3 truncate">
                PayPal: {plan.paypalPlanId}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#222]">
              <h2 className="text-xl font-bold text-white">
                {editingPlan ? "Editar plan" : "Nuevo plan"}
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
                    placeholder="Plan Premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="sf-input w-full"
                    placeholder="premium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="sf-input w-full h-20 resize-none"
                  placeholder="Descripción del plan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio USD *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.priceUsd}
                    onChange={(e) => setForm({ ...form, priceUsd: e.target.value })}
                    className="sf-input w-full"
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio MXN</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.priceMxn}
                    onChange={(e) => setForm({ ...form, priceMxn: e.target.value })}
                    className="sf-input w-full"
                    placeholder="199.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ciclo de facturación</label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value as "monthly" | "yearly" })}
                    className="sf-input w-full"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Calidad máxima</label>
                  <select
                    value={form.maxQuality}
                    onChange={(e) => setForm({ ...form, maxQuality: e.target.value as any })}
                    className="sf-input w-full"
                  >
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ID Plan PayPal</label>
                <input
                  type="text"
                  value={form.paypalPlanId}
                  onChange={(e) => setForm({ ...form, paypalPlanId: e.target.value })}
                  className="sf-input w-full"
                  placeholder="P-XXXXXXXXXXXXXXXXXX"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Características</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFeature()}
                    className="sf-input flex-1"
                    placeholder="Ej: Acceso a todo el catálogo"
                  />
                  <button
                    onClick={addFeature}
                    className="px-3 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#111] rounded-lg px-3 py-2">
                      <Check size={14} className="text-green-400 shrink-0" />
                      <span className="text-sm text-gray-300 flex-1">{f}</span>
                      <button onClick={() => removeFeature(i)} className="text-gray-500 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setForm({ ...form, hasAds: !form.hasAds })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.hasAds ? "bg-[#E50914]" : "bg-[#333]"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.hasAds ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-gray-300">Mostrar anuncios</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-[#333]"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-gray-300">Plan activo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#222]">
              <button onClick={closeForm} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={createPlan.isPending || updatePlan.isPending}
                className="px-6 py-2 bg-[#E50914] text-white font-semibold rounded-lg hover:bg-[#B20710] transition-colors disabled:opacity-50"
              >
                {editingPlan ? "Guardar cambios" : "Crear plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
