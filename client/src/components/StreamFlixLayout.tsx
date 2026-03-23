import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  ChevronDown,
  Film,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Tv,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

interface StreamFlixLayoutProps {
  children: React.ReactNode;
  transparent?: boolean;
}

export default function StreamFlixLayout({ children, transparent = false }: StreamFlixLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: settings } = trpc.site.getSettings.useQuery();
  const appName = settings?.app_name ?? "StreamFlix";
  const appLogo = settings?.app_logo ?? "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/browse?type=movie", label: "Películas", icon: Film },
    { href: "/browse?type=series", label: "Series", icon: Tv },
    { href: "/watchlist", label: "Mi Lista", icon: null },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href.split("?")[0]);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !transparent
            ? "bg-[#141414] shadow-lg"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {appLogo ? (
                <img src={appLogo} alt={appName} className="h-8 object-contain" />
              ) : (
                <span
                  className="text-2xl font-black tracking-tight"
                  style={{ color: "var(--sf-red)" }}
                >
                  {appName}
                </span>
              )}
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Títulos, personas, géneros"
                    className="bg-black/80 border border-white/40 text-white text-sm px-3 py-1.5 rounded w-48 sm:w-64 outline-none focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="ml-1 p-1.5 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications placeholder */}
                <button className="hidden sm:flex p-2 text-gray-300 hover:text-white transition-colors">
                  <Bell size={20} />
                </button>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-gray-300 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl py-1 z-50">
                      <div className="px-4 py-3 border-b border-[#333]">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Mi Perfil
                      </Link>
                      <Link
                        href="/subscription"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Suscripción
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E50914] hover:bg-white/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings size={16} />
                          Panel Admin
                        </Link>
                      )}
                      <div className="border-t border-[#333] mt-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors w-full"
                        >
                          <LogOut size={16} />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <a
                href={getLoginUrl()}
                className="px-4 py-2 bg-[#E50914] hover:bg-[#B20710] text-white text-sm font-semibold rounded transition-colors"
              >
                Iniciar Sesión
              </a>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#141414] border-t border-[#333] py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive(link.href) ? "text-white" : "text-gray-300"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon && <link.icon size={18} />}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] border-t border-[#222] mt-16 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#E50914] font-bold text-xl mb-6">{appName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-gray-400">
            <div className="space-y-2">
              <p className="text-white font-medium mb-3">Navegación</p>
              <Link href="/" className="block hover:text-white transition-colors">Inicio</Link>
              <Link href="/browse?type=movie" className="block hover:text-white transition-colors">Películas</Link>
              <Link href="/browse?type=series" className="block hover:text-white transition-colors">Series</Link>
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium mb-3">Cuenta</p>
              <Link href="/profile" className="block hover:text-white transition-colors">Mi Perfil</Link>
              <Link href="/watchlist" className="block hover:text-white transition-colors">Mi Lista</Link>
              <Link href="/subscription" className="block hover:text-white transition-colors">Planes</Link>
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium mb-3">Soporte</p>
              <a href="#" className="block hover:text-white transition-colors">Centro de Ayuda</a>
              <a href="#" className="block hover:text-white transition-colors">Términos de Uso</a>
              <a href="#" className="block hover:text-white transition-colors">Privacidad</a>
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium mb-3">Idioma</p>
              <p>Español</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#222] text-xs text-gray-500">
            <p>© {new Date().getFullYear()} {appName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
