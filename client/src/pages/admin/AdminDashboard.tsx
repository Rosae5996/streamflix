import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Film, Megaphone, Tag, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: usersData } = trpc.users.list.useQuery({ page: 1, limit: 1 });
  const { data: contentData } = trpc.content.list.useQuery({ page: 1, limit: 1 });
  const { data: plansData } = trpc.plans.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: settings } = trpc.site.getSettings.useQuery();

  const maintenanceMode = settings?.maintenance_mode === "true";

  const stats = [
    {
      label: "Usuarios totales",
      value: usersData?.total ?? 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/admin/users",
    },
    {
      label: "Contenido publicado",
      value: contentData?.total ?? 0,
      icon: Film,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      href: "/admin/content",
    },
    {
      label: "Planes activos",
      value: plansData?.filter((p) => p.isActive).length ?? 0,
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      href: "/admin/plans",
    },
    {
      label: "Categorías",
      value: categories?.length ?? 0,
      icon: Tag,
      color: "text-green-400",
      bg: "bg-green-400/10",
      href: "/admin/categories",
    },
  ];

  const quickActions = [
    { label: "Agregar película", href: "/admin/content/new?type=movie", icon: Film },
    { label: "Agregar serie", href: "/admin/content/new?type=series", icon: Film },
    { label: "Nuevo plan", href: "/admin/plans", icon: Zap },
    { label: "Gestionar anuncios", href: "/admin/ads", icon: Megaphone },
    { label: "Ver usuarios", href: "/admin/users", icon: Users },
    { label: "Configuración", href: "/admin/settings", icon: TrendingUp },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Maintenance warning */}
      {maintenanceMode && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-yellow-400 font-semibold">Modo mantenimiento activo</p>
            <p className="text-yellow-400/70 text-sm">El sitio no es visible para usuarios no autenticados.</p>
          </div>
          <Link
            href="/admin/settings"
            className="ml-auto px-4 py-2 bg-yellow-500 text-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Desactivar
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-colors"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 bg-[#1a1a1a] border border-[#222] rounded-xl hover:border-[#E50914]/40 hover:bg-[#1f1f1f] transition-all text-center"
            >
              <action.icon size={22} className="text-[#E50914]" />
              <span className="text-xs text-gray-300 font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Plans overview */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Planes de suscripción</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plansData?.map((plan) => (
            <div
              key={plan.id}
              className="bg-[#1a1a1a] border border-[#222] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    plan.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {plan.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${plan.priceUsd}
                <span className="text-sm text-gray-400 font-normal"> USD/{plan.billingCycle === "monthly" ? "mes" : "año"}</span>
              </p>
              {plan.priceMxn && (
                <p className="text-sm text-gray-400">${plan.priceMxn} MXN</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs ${plan.hasAds ? "text-yellow-400" : "text-green-400"}`}>
                  {plan.hasAds ? "Con anuncios" : "Sin anuncios"}
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-xs text-gray-400">{plan.maxQuality}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
