import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Round } from '@/types/tournament';
import MatchCard from './MatchCard';

interface BracketViewProps {
  bracket: Round[];
  currentRound: number;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  lang?: 'ar' | 'en';
}

export default function BracketView({
  bracket,
  currentRound,
  onSelectWinner,
  lang = 'ar',
}: BracketViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const roundRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeMobileRound, setActiveMobileRound] = useState<number>(currentRound);

  const isAr = lang === 'ar';

  useEffect(() => {
    setActiveMobileRound(currentRound);
  }, [currentRound]);

  useEffect(() => {
    const rounds = roundRefs.current.filter(Boolean);
    if (rounds.length > 0) {
      gsap.fromTo(
        rounds,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    }
  }, [bracket.length]);

  const scrollToRound = (roundIdx: number) => {
    setActiveMobileRound(roundIdx);
    const roundEl = roundRefs.current[roundIdx];
    if (roundEl && scrollContainerRef.current) {
      roundEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const getLocalizedRoundName = (roundName: string) => {
    if (!isAr) return roundName;
    const lower = roundName.toLowerCase();
    if (lower.includes('final') && !lower.includes('semi') && !lower.includes('quarter')) {
      return 'المباراة النهائية';
    }
    if (lower.includes('semi')) {
      return 'نصف النهائي';
    }
    if (lower.includes('quarter')) {
      return 'ربع النهائي';
    }
    if (lower.includes('16')) {
      return 'دور الـ 16';
    }
    if (lower.includes('32')) {
      return 'دور الـ 32';
    }
    return roundName.replace('Round', 'الجولة');
  };

  const calculateMatchSpacing = (roundIndex: number) => {
    const baseGap = 16;
    const multiplier = Math.pow(2, roundIndex);
    return Math.min(baseGap * multiplier, 240);
  };

  return (
    <div className="w-full">
      {/* Mobile Round Switcher Bar (visible only on small screens) */}
      <div className="md:hidden flex items-center justify-start gap-1.5 overflow-x-auto pb-3 mb-3 px-2 custom-scrollbar">
        {bracket.map((round, idx) => {
          const isSelected = activeMobileRound === idx;
          const isCurrent = currentRound === idx;
          return (
            <button
              key={round.roundNumber}
              onClick={() => scrollToRound(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-semibold'
                  : isCurrent
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              {getLocalizedRoundName(round.roundName)}
              <span className="text-[10px] ml-1 opacity-70">
                ({round.matches.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Bracket Scrollable Canvas */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto overflow-y-hidden pb-6 custom-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          ref={containerRef}
          className="flex items-start gap-8 sm:gap-12 min-w-max px-2 sm:px-6 py-2 mx-auto justify-start md:justify-center"
        >
          {bracket.map((round, roundIndex) => {
            const gap = calculateMatchSpacing(roundIndex);
            const isCurrent = roundIndex === currentRound;
            const isComplete = roundIndex < currentRound;

            return (
              <div
                key={round.roundNumber}
                ref={(el) => {
                  roundRefs.current[roundIndex] = el;
                }}
                className="flex-shrink-0 flex flex-col"
                style={{ width: '270px' }}
              >
                {/* Round Header */}
                <div className="mb-4 text-center pb-2 border-b border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1 px-1">
                    <span
                      className={`font-semibold ${
                        isCurrent
                          ? 'text-[#D4AF37]'
                          : isComplete
                          ? 'text-[#2A9D8F]'
                          : 'text-gray-400'
                      }`}
                    >
                      {getLocalizedRoundName(round.roundName)}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {round.matches.length}{' '}
                      {isAr ? (round.matches.length === 1 ? 'مباراة' : 'مباريات') : 'matches'}
                    </span>
                  </div>

                  <div
                    className={`h-0.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-[#D4AF37]'
                        : isComplete
                        ? 'bg-[#2A9D8F]'
                        : 'bg-white/10'
                    }`}
                  />
                </div>

                {/* Round Matches */}
                <div
                  className="flex flex-col justify-around flex-1"
                  style={{ gap: `${gap}px` }}
                >
                  {round.matches.map((match) => (
                    <div key={match.id} className="relative flex justify-center">
                      <MatchCard
                        match={match}
                        onSelectWinner={onSelectWinner}
                        roundComplete={isComplete}
                        lang={lang}
                      />

                      {/* Clean connector line to next round (hidden on small devices) */}
                      {roundIndex < bracket.length - 1 && match.nextMatchId && (
                        <div
                          className="hidden md:flex absolute top-1/2 -right-12 w-12 items-center pointer-events-none"
                          style={{ transform: 'translateY(-50%)' }}
                        >
                          <div
                            className={`w-full h-px transition-colors ${
                              match.winnerId
                                ? 'bg-[#D4AF37]/60'
                                : 'bg-white/10'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
