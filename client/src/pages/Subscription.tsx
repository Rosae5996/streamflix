import StreamFlixLayout from "@/components/StreamFlixLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Check, Crown, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Subscription() {
  const { isAuthenticated, user } = useAuth();
  const { data: plans } = trpc.plans.list.useQuery();
  const { data: mySubscription, refetch } = trpc.subscription.getMySubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const cancelSubscription = trpc.subscription.cancelSubscription.useMutation({
    onSuccess: () => { toast.success("Suscripción cancelada"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);

  const activePlans = plans?.filter((p) => p.isActive) ?? [];
  const currentPlanId = mySubscription?.sub?.planId;
  const isActive = mySubscription?.sub?.status === "active";

  const handleSubscribe = async (plan: any) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!plan.paypalPlanId) {
      toast.info("Este plan no tiene PayPal configurado aún. Contacta al administrador para configurar el ID de plan PayPal.");
      return;
    }
    setProcessingPlanId(plan.id);
    // Redirect to PayPal subscription page
    const paypalUrl = `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${plan.paypalPlanId}&return_url=${encodeURIComponent(window.location.origin + '/subscription?success=1')}&cancel_url=${encodeURIComponent(window.location.origin + '/subscription?cancelled=1')}`;
    window.location.href = paypalUrl;
    setProcessingPlanId(null);
  };

  return (
    <StreamFlixLayout>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E50914]/10 border border-[#E50914]/20 rounded-full text-[#E50914] text-sm font-medium mb-4">
              <Crown size={16} />
              Planes de suscripción
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Elige tu plan
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Accede a todo el catálogo de películas y series. Sin compromisos, cancela cuando quieras.
            </p>
          </div>

          {/* Current subscription */}
          {isAuthenticated && mySubscription && (
            <div className="mb-8 p-5 bg-[#1a1a1a] border border-[#E50914]/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">Tu suscripción actual</p>
                <p className="text-xl font-bold text-white mt-1">
                  {plans?.find((p) => p.id === currentPlanId)?.name ?? "Plan activo"}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                  isActive ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {mySubscription.sub?.status === "active" ? "Activa" :
                   mySubscription.sub?.status === "cancelled" ? "Cancelada" :
                   mySubscription.sub?.status === "expired" ? "Expirada" : "Pendiente"}
                </span>
              </div>
              {isActive && mySubscription?.sub && (
                <button
                  onClick={() => {
                    if (confirm("¿Cancelar tu suscripción?")) cancelSubscription.mutate({ subscriptionId: mySubscription.sub!.id });
                  }}
                  className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-sm rounded-lg transition-colors"
                >
                  Cancelar suscripción
                </button>
              )}
            </div>
          )}

          {/* Plans grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlans.map((plan, idx) => {
              const isCurrentPlan = currentPlanId === plan.id && isActive;
              const isPopular = idx === Math.floor(activePlans.length / 2);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-[#1a1a1a] border rounded-2xl p-6 flex flex-col transition-all ${
                    isPopular
                      ? "border-[#E50914] shadow-[0_0_30px_rgba(229,9,20,0.15)]"
                      : isCurrentPlan
                      ? "border-green-500"
                      : "border-[#222] hover:border-[#333]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#E50914] text-white text-xs font-bold px-4 py-1 rounded-full">
                        MÁS POPULAR
                      </span>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                        TU PLAN
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={18} className="text-[#E50914]" />
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    {plan.description && (
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">${plan.priceUsd}</span>
                      <span className="text-gray-400 text-sm">USD</span>
                    </div>
                    {plan.priceMxn && (
                      <p className="text-gray-500 text-sm mt-1">${plan.priceMxn} MXN</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      por {plan.billingCycle === "monthly" ? "mes" : "año"}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={16} className="text-green-400 shrink-0" />
                      Calidad hasta {plan.maxQuality}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={16} className={plan.hasAds ? "text-yellow-400 shrink-0" : "text-green-400 shrink-0"} />
                      {plan.hasAds ? "Con anuncios" : "Sin anuncios"}
                    </li>
                    {Array.isArray(plan.features) && (plan.features as string[]).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check size={16} className="text-green-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan || processingPlanId === plan.id}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      isCurrentPlan
                        ? "bg-green-500/20 text-green-400 cursor-default"
                        : isPopular
                        ? "bg-[#E50914] hover:bg-[#B20710] text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    } disabled:opacity-60`}
                  >
                    {isCurrentPlan
                      ? "Plan actual"
                      : processingPlanId === plan.id
                      ? "Procesando..."
                      : !isAuthenticated
                      ? "Iniciar sesión"
                      : "Suscribirse"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* PayPal note */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Pagos seguros procesados por{" "}
              <span className="text-[#003087] font-bold bg-[#009cde] px-2 py-0.5 rounded text-xs">Pay</span>
              <span className="text-[#009cde] font-bold bg-[#003087] px-2 py-0.5 rounded text-xs">Pal</span>
            </p>
            <p className="text-gray-600 text-xs mt-2">Cancela en cualquier momento. Sin cargos ocultos.</p>
          </div>
        </div>
      </div>
    </StreamFlixLayout>
  );
}
