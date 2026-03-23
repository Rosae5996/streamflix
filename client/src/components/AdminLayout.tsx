import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  ChevronLeft,
  Film,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  Settings,
  Tag,
  Tv,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
  { href: "/admin/plans", label: "Planes", icon: Zap },
  { href: "/admin/categories", label: "Categorías", icon: Tag },
  { href: "/admin/content", label: "Contenido", icon: Film },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/ads", label: "Anuncios", icon: Megaphone },
  { href: "/admin/analytics", label: "Estadísticas", icon: BarChart3 },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: settings } = trpc.site.getSettings.useQuery();
  const appName = settings?.app_name ?? "StreamFlix";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🚫</p>
          <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
          <p className="text-gray-400 mb-6">No tienes permisos de administrador.</p>
          <Link href="/" className="px-6 py-3 bg-[#E50914] text-white rounded font-semibold hover:bg-[#B20710] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string, exact = false) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-56 sm:w-64 bg-[#111] border-r border-[#222] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#222]">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black" style={{ color: "var(--sf-red)" }}>
              {appName}
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#222]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-[#E50914] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-[#E50914] font-medium">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-1.5 sm:px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg mb-0.5 text-xs sm:text-sm font-medium transition-all ${isActive(item.href, item.exact) ? "bg-[#E50914] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <item.icon size={16} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 sm:p-4 border-t border-[#222] space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Tv size={16} />
            <span className="hidden sm:inline">Ver Sitio</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#111] border-b border-[#222] px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 text-gray-400 hover:text-white rounded"
            >
              <Menu size={18} />
            </button>
            {title && (
              <h1 className="text-sm sm:text-base font-semibold text-white truncate">{title}</h1>
            )}
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
            Volver al sitio
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
