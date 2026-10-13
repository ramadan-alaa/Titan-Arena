import { useState } from 'react';
import { Trophy, Check, Shield } from 'lucide-react';
import type { Match } from '@/types/tournament';

interface MatchCardProps {
  match: Match;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  roundComplete?: boolean;
  lang?: 'ar' | 'en';
}

export default function MatchCard({
  match,
  onSelectWinner,
  lang = 'ar',
}: MatchCardProps) {
  const [hoveredSlot, setHoveredSlot] = useState<'A' | 'B' | null>(null);

  const isAr = lang === 'ar';
  const isFinal = match.nextMatchId === null;
  const isByeMatch = match.slotA.isBye || match.slotB.isBye;
  const isDecided = match.winnerId !== null;

  const playerA = match.slotA.player;
  const playerB = match.slotB.player;
  const isPlayable = !!playerA && !!playerB && !isByeMatch;

  const handleSlotClick = (slot: 'A' | 'B') => {
    if (!isPlayable) return;
    const player = slot === 'A' ? playerA : playerB;
    if (player) {
      onSelectWinner(match.id, player.id);
    }
  };

  return (
    <div
      className={`w-full max-w-[280px] rounded-xl p-3 flex-shrink-0 transition-all select-none border ${
        isFinal
          ? 'bg-[#151922] border-[#D4AF37]/50 shadow-lg shadow-black/40'
          : isDecided
          ? 'bg-[#0E121A] border-white/15 shadow-sm'
          : 'bg-[#0E121A] border-white/10'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header if final or bye */}
      {isFinal && (
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs text-[#D4AF37] font-semibold">
          <span className="flex items-center gap-1.5">
            <Trophy size={13} />
            {isAr ? 'النهائي الكبير' : 'Final Match'}
          </span>
          <span className="text-[10px] font-mono text-gray-400">Match 1</span>
        </div>
      )}

      {isByeMatch && (
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[11px] text-[#2A9D8F]">
          <span className="flex items-center gap-1 font-medium">
            <Shield size={11} />
            {isAr ? 'تأهل تلقائي (BYE)' : 'Automatic Bye'}
          </span>
        </div>
      )}

      {/* Slot A */}
      {match.slotA.isBye ? (
        <div className="px-3 py-2 rounded-lg text-xs bg-white/[0.02] border border-dashed border-white/10 text-gray-500 flex items-center justify-between">
          <span className="italic">{isAr ? 'تأهل مسبق (BYE)' : 'BYE Slot'}</span>
          <span className="text-[10px] font-mono text-gray-600">BYE</span>
        </div>
      ) : (
        <div
          onClick={() => handleSlotClick('A')}
          onMouseEnter={() => setHoveredSlot('A')}
          onMouseLeave={() => setHoveredSlot(null)}
          className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-all min-h-[42px] border ${
            match.slotA.isWinner
              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
              : isDecided && !match.slotA.isWinner
              ? 'bg-transparent border-transparent text-gray-500 opacity-60'
              : hoveredSlot === 'A' && isPlayable
              ? 'bg-white/10 border-white/30 text-white cursor-pointer'
              : 'bg-white/[0.04] border-white/5 text-gray-300'
          } ${isPlayable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
        >
          {playerA ? (
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {playerA.seed && (
                  <span className="text-[10px] font-mono font-bold text-[#D4AF37]">
                    #{playerA.seed}
                  </span>
                )}
                <span
                  className={`text-xs sm:text-sm font-medium truncate ${
                    isDecided && !match.slotA.isWinner && !match.slotB.isBye
                      ? 'line-through text-gray-500'
                      : ''
                  }`}
                >
                  {playerA.name}
                </span>
              </div>

              {match.slotA.isWinner && (
                <span className="text-[10px] font-bold text-[#D4AF37] flex items-center gap-0.5 shrink-0 bg-[#D4AF37]/20 px-1.5 py-0.5 rounded">
                  <Check size={11} />
                  {isAr ? 'فائز' : 'WIN'}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-500 italic">
              {isAr ? 'بانتظار الفائز' : 'TBD'}
            </span>
          )}
        </div>
      )}

      {/* Clean Separator */}
      <div className="flex items-center justify-center my-1">
        <div className="h-px bg-white/5 flex-1" />
        <span className="text-[10px] font-mono text-gray-500 px-2 uppercase">vs</span>
        <div className="h-px bg-white/5 flex-1" />
      </div>

      {/* Slot B */}
      {match.slotB.isBye ? (
        <div className="px-3 py-2 rounded-lg text-xs bg-white/[0.02] border border-dashed border-white/10 text-gray-500 flex items-center justify-between">
          <span className="italic">{isAr ? 'تأهل مسبق (BYE)' : 'BYE Slot'}</span>
          <span className="text-[10px] font-mono text-gray-600">BYE</span>
        </div>
      ) : (
        <div
          onClick={() => handleSlotClick('B')}
          onMouseEnter={() => setHoveredSlot('B')}
          onMouseLeave={() => setHoveredSlot(null)}
          className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-all min-h-[42px] border ${
            match.slotB.isWinner
              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
              : isDecided && !match.slotB.isWinner
              ? 'bg-transparent border-transparent text-gray-500 opacity-60'
              : hoveredSlot === 'B' && isPlayable
              ? 'bg-white/10 border-white/30 text-white cursor-pointer'
              : 'bg-white/[0.04] border-white/5 text-gray-300'
          } ${isPlayable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
        >
          {playerB ? (
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {playerB.seed && (
                  <span className="text-[10px] font-mono font-bold text-[#D4AF37]">
                    #{playerB.seed}
                  </span>
                )}
                <span
                  className={`text-xs sm:text-sm font-medium truncate ${
                    isDecided && !match.slotB.isWinner && !match.slotA.isBye
                      ? 'line-through text-gray-500'
                      : ''
                  }`}
                >
                  {playerB.name}
                </span>
              </div>

              {match.slotB.isWinner && (
                <span className="text-[10px] font-bold text-[#D4AF37] flex items-center gap-0.5 shrink-0 bg-[#D4AF37]/20 px-1.5 py-0.5 rounded">
                  <Check size={11} />
                  {isAr ? 'فائز' : 'WIN'}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-500 italic">
              {isAr ? 'بانتظار الفائز' : 'TBD'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
