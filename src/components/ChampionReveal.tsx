import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Trophy, RotateCcw } from 'lucide-react';
import type { Player, LeaderboardEntry } from '@/types/tournament';

interface ChampionRevealProps {
  champion: Player;
  leaderboard: LeaderboardEntry[];
  onNewTournament: () => void;
  lang?: 'ar' | 'en';
}

export default function ChampionReveal({
  champion,
  leaderboard,
  onNewTournament,
  lang = 'ar',
}: ChampionRevealProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const isAr = lang === 'ar';
  const championEntry = leaderboard.find((e) => e.playerId === champion.id);
  const totalMatches = (championEntry?.wins || 0) + (championEntry?.losses || 0);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    }
  }, [champion.id]);

  return (
    <div className="flex flex-col items-center px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div
        ref={cardRef}
        className="w-full max-w-[480px] rounded-2xl p-6 sm:p-10 text-center bg-[#0F141F] border border-[#D4AF37]/40 shadow-2xl"
      >
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-[#D4AF37]/15 text-[#D4AF37] mb-4">
          <Trophy size={32} />
        </div>

        <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
          {isAr ? 'بطل البطولة' : 'TOURNAMENT CHAMPION'}
        </p>

        <h2 className="text-2xl sm:text-4xl mt-2 font-black text-white">
          {champion.name}
        </h2>

        {champion.seed && (
          <p className="mt-1 text-xs font-mono text-gray-400">
            {isAr ? `المصنف #${champion.seed}` : `Seed #${champion.seed}`}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 mt-6 p-3 rounded-xl bg-black/40 border border-white/5">
          <div className="text-center">
            <span className="text-[11px] text-gray-400 block mb-0.5">
              {isAr ? 'الانتصارات' : 'Wins'}
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-white">
              {championEntry?.wins || 0}
            </span>
          </div>

          <div className="text-center border-x border-white/10">
            <span className="text-[11px] text-gray-400 block mb-0.5">
              {isAr ? 'المباريات' : 'Matches'}
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-white">
              {totalMatches}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-gray-400 block mb-0.5">
              {isAr ? 'النقاط' : 'Points'}
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#D4AF37]">
              {championEntry?.points || 0}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onNewTournament}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-[#D4AF37] text-black hover:bg-[#E5C07B] transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>{isAr ? 'بدء بطولة جديدة' : 'New Tournament'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
