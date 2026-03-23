import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase maneja automáticamente el callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          navigate("/login");
          return;
        }

        if (data.session) {
          // Usuario autenticado, redirigir al home
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Callback error:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Completando autenticación...</p>
      </div>
    </div>
  );
}
