import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Mail, Loader2, Apple } from "lucide-react";
import { signInWithGoogle, signInWithApple, signUpWithEmail } from "@/lib/supabase";

export default function Signup() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleAppleSignup = async () => {
    setLoading(true);
    const { error } = await signInWithApple();
    if (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Cuenta creada! Revisa tu email para confirmar");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#0a0a0a] flex items-center justify-center px-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E50914] rounded-full blur-3xl opacity-5" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E50914] rounded-full blur-3xl opacity-5" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-[#E50914]">Stream</span>Flix
          </h1>
          <p className="text-gray-400">Únete a nuestra comunidad</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-8">Crea tu cuenta</h2>

          {!showEmailForm ? (
            <>
              {/* Google */}
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Google
              </button>

              {/* Apple */}
              <button
                onClick={handleAppleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 mb-6"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Apple size={20} />
                )}
                Apple
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-[#333]" />
                <span className="text-gray-500 text-sm">O</span>
                <div className="flex-1 h-px bg-[#333]" />
              </div>

              {/* Email option */}
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#222] hover:bg-[#2a2a2a] text-white font-semibold rounded-lg transition-colors border border-[#333]"
              >
                <Mail size={20} />
                Registrarse con Email
              </button>

              {/* Login link */}
              <p className="text-center text-gray-400 text-sm mt-6">
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#E50914] hover:text-[#B20710] font-semibold transition-colors"
                >
                  Inicia sesión
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Email Form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-lg text-white placeholder-gray-600 focus:border-[#E50914] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-lg text-white placeholder-gray-600 focus:border-[#E50914] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-lg text-white placeholder-gray-600 focus:border-[#E50914] focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={20} className="animate-spin" />}
                  Crear cuenta
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full px-4 py-3 bg-[#222] hover:bg-[#2a2a2a] text-white font-semibold rounded-lg transition-colors border border-[#333]"
                >
                  Volver
                </button>
              </form>

              <p className="text-center text-gray-400 text-sm mt-6">
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#E50914] hover:text-[#B20710] font-semibold transition-colors"
                >
                  Inicia sesión
                </button>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}
