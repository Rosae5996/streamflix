import StreamFlixLayout from "@/components/StreamFlixLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: mySubscription } = trpc.subscription.getMySubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: plans } = trpc.plans.list.useQuery();

  const updateProfile = trpc.users.updateMyProfile.useMutation({
    onSuccess: () => toast.success("Perfil actualizado"),
    onError: (e: any) => toast.error(e.message),
  });

  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? "", email: user.email ?? "" });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <StreamFlixLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      </StreamFlixLayout>
    );
  }

  if (!isAuthenticated) return null;

  const currentPlan = plans?.find((p) => p.id === mySubscription?.sub?.planId);

  return (
    <StreamFlixLayout>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Mi perfil</h1>

          {/* Avatar & basic info */}
          <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#E50914]/20 flex items-center justify-center">
                <User size={36} className="text-[#E50914]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user?.name ?? "Usuario"}</h2>
                <p className="text-gray-400">{user?.email}</p>
                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                  user?.role === "admin" ? "bg-[#E50914]/20 text-[#E50914]" : "bg-gray-500/20 text-gray-400"
                }`}>
                  {user?.role === "admin" ? "Administrador" : "Usuario"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="sf-input w-full"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="sf-input w-full"
                  placeholder="tu@email.com"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => updateProfile.mutate(form)}
                  disabled={updateProfile.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#E50914] hover:bg-[#B20710] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>

          {/* Subscription info */}
          <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-white mb-4">Suscripción</h3>
            {currentPlan ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{currentPlan.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    ${currentPlan.priceUsd} USD / {currentPlan.billingCycle === "monthly" ? "mes" : "año"}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                    mySubscription?.sub?.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {mySubscription?.sub?.status === "active" ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/subscription")}
                  className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-sm rounded-lg transition-colors"
                >
                  Cambiar plan
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Sin suscripción activa</p>
                <button
                  onClick={() => navigate("/subscription")}
                  className="px-4 py-2 bg-[#E50914] hover:bg-[#B20710] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Ver planes
                </button>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/watchlist")}
              className="p-4 bg-[#1a1a1a] border border-[#222] rounded-xl text-left hover:border-[#333] transition-colors"
            >
              <p className="text-white font-medium">Mi lista</p>
              <p className="text-gray-400 text-sm mt-1">Ver mi watchlist</p>
            </button>
            <button
              onClick={() => navigate("/history")}
              className="p-4 bg-[#1a1a1a] border border-[#222] rounded-xl text-left hover:border-[#333] transition-colors"
            >
              <p className="text-white font-medium">Historial</p>
              <p className="text-gray-400 text-sm mt-1">Ver lo que vi</p>
            </button>
          </div>
        </div>
      </div>
    </StreamFlixLayout>
  );
}
