import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Trophy, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/tournament';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  lang?: 'ar' | 'en';
}

export default function Leaderboard({ entries, lang = 'ar' }: LeaderboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isAr = lang === 'ar';

  useEffect(() => {
    if (panelRef.current) {
      if (isOpen) {
        gsap.to(panelRef.current, {
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(panelRef.current, {
          x: isAr ? '-100%' : '100%',
          duration: 0.25,
          ease: 'power2.in',
        });
      }
    }
  }, [isOpen, isAr]);

  useEffect(() => {
    if (listRef.current && isOpen) {
      const items = listRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.03 }
      );
    }
  }, [isOpen, entries, isAr]);

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy size={14} className="text-[#D4AF37]" />;
    if (index === 1) return <Medal size={14} className="text-gray-300" />;
    if (index === 2) return <Medal size={14} className="text-amber-600" />;
    return <span className="font-mono text-xs text-gray-500 font-semibold">#{index + 1}</span>;
  };

  return (
    <>
      {/* Side Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 z-50 cursor-pointer transition-all py-3 px-2 flex items-center gap-1 bg-[#D4AF37] text-black font-semibold text-xs shadow-lg ${
          isAr ? 'left-0 rounded-r-xl' : 'right-0 rounded-l-xl'
        }`}
        style={{ transform: 'translateY(-50%)' }}
      >
        {isAr ? (
          isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
        ) : (
          isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
        )}
        <Trophy size={13} />
        <span className="hidden xs:inline">{isAr ? 'الترتيب' : 'Ranks'}</span>
      </button>

      {/* Slideout Drawer */}
      <div
        ref={panelRef}
        className={`fixed top-0 h-full z-40 overflow-y-auto w-[310px] max-w-[85vw] bg-[#0A0D15]/95 backdrop-blur-xl border-white/10 ${
          isAr
            ? 'left-0 border-r -translate-x-full'
            : 'right-0 border-l translate-x-full'
        }`}
        dir={isAr ? 'rtl' : 'ltr'}
        style={{ paddingTop: '70px', paddingBottom: '30px' }}
      >
        <div className="px-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'جدول الترتيب' : 'Leaderboard'}
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {isAr
              ? 'تحديث مباشر لنتائج المباريات'
              : 'Live standings by wins and matches'}
          </p>
        </div>

        <div ref={listRef} className="p-3 space-y-1">
          {entries.map((entry, index) => (
            <div
              key={entry.playerId}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                index === 0
                  ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                  : 'bg-white/[0.02] border border-transparent'
              }`}
            >
              <div className="w-5 flex items-center justify-center">
                {getRankBadge(index)}
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-200 truncate block">
                  {entry.playerName}
                </span>
                {entry.byes > 0 && (
                  <span className="text-[10px] text-[#2A9D8F] block">
                    {isAr ? `${entry.byes} تأهل مسبق` : `${entry.byes} Bye`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[#D4AF37] font-semibold">
                  {entry.wins}W
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                  {entry.points}p
                </span>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <p className="p-4 text-xs text-gray-500 text-center">
              {isAr ? 'لم تلعب مباريات بعد' : 'No matches played yet'}
            </p>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
