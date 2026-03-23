import { useState } from "react";
import { X, Instagram, Music } from "lucide-react";

interface FollowSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export default function FollowSocialModal({
  isOpen,
  onClose,
  instagramUrl,
  tiktokUrl,
}: FollowSocialModalProps) {
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const handleFollow = (platform: string, url: string) => {
    if (url) {
      window.open(url, "_blank");
      setFollowed((prev) => new Set(prev).add(platform));
    }
  };

  const canContinue = followed.size > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 max-w-md w-full animate-in fade-in scale-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Síguenos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#222] rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-400 mb-8">
          Para acceder al contenido gratis, sigue nuestras redes sociales y disfruta de todas nuestras películas y series.
        </p>

        {/* Social buttons */}
        <div className="space-y-3 mb-8">
          {instagramUrl && (
            <button
              onClick={() => handleFollow("instagram", instagramUrl)}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                followed.has("instagram")
                  ? "bg-green-600/20 border border-green-600 text-green-400"
                  : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border border-transparent"
              }`}
            >
              <Instagram size={20} />
              {followed.has("instagram") ? "✓ Seguido" : "Seguir en Instagram"}
            </button>
          )}

          {tiktokUrl && (
            <button
              onClick={() => handleFollow("tiktok", tiktokUrl)}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                followed.has("tiktok")
                  ? "bg-green-600/20 border border-green-600 text-green-400"
                  : "bg-black hover:bg-gray-900 text-white border border-gray-700"
              }`}
            >
              <Music size={20} />
              {followed.has("tiktok") ? "✓ Seguido" : "Seguir en TikTok"}
            </button>
          )}
        </div>

        {/* Continue button */}
        <button
          onClick={onClose}
          disabled={!canContinue}
          className="w-full px-4 py-3 bg-[#E50914] hover:bg-[#B20710] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Continuar viendo
        </button>

        {!canContinue && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Sigue al menos una red social para continuar
          </p>
        )}
      </div>
    </div>
  );
}
