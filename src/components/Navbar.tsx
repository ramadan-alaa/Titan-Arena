import { RotateCcw, Globe, Trophy, Users } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  phase: 'setup' | 'active' | 'complete';
  playerCount: number;
}

export default function Navbar({
  onReset,
  lang,
  onToggleLang,
  phase,
  playerCount,
}: NavbarProps) {
  const isAr = lang === 'ar';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between bg-[#080B11]/90 backdrop-blur-md border-b border-white/10">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#D4AF37] text-black font-bold">
          <Trophy size={16} />
        </div>
        <div>
          <span className="font-bold text-sm sm:text-base tracking-wide text-white">
            TITAN <span className="text-[#D4AF37]">ARENA</span>
          </span>
        </div>
      </div>

      {/* Middle status tag */}
      {phase !== 'setup' && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
          <Users size={12} className="text-[#D4AF37]" />
          <span>
            {isAr ? `${playerCount} متنافسين` : `${playerCount} Competitors`}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
        >
          <Globe size={13} />
          <span>{isAr ? 'English' : 'عربي'}</span>
        </button>

        {phase !== 'setup' && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-300 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span className="hidden xs:inline">
              {isAr ? 'إعادة ضبط' : 'Reset'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
