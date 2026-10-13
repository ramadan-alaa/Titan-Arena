import { useState, useEffect, useRef } from 'react';
import { useTournament } from '@/hooks/useTournament';
import ClockCanvas from '@/components/ClockCanvas';
import Navbar from '@/components/Navbar';
import PlayerInput from '@/components/PlayerInput';
import BracketView from '@/components/BracketView';
import ChampionReveal from '@/components/ChampionReveal';
import Leaderboard from '@/components/Leaderboard';
import { RotateCcw, Trophy } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const {
    state,
    addPlayer,
    addMultiplePlayers,
    removePlayer,
    renamePlayer,
    clearPlayers,
    shufflePlayers,
    setPlayers,
    generateBracket,
    selectWinner,
    resetTournament,
    getSortedLeaderboard,
  } = useTournament();

  const bracketRef = useRef<HTMLDivElement>(null);
  const championRef = useRef<HTMLDivElement>(null);

  const isAr = lang === 'ar';

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Scroll to bracket after generation
  useEffect(() => {
    if (state.phase === 'active' && bracketRef.current) {
      setTimeout(() => {
        bracketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [state.phase]);

  // Scroll to champion when tournament completes
  useEffect(() => {
    if (state.phase === 'complete' && championRef.current) {
      setTimeout(() => {
        championRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [state.phase]);

  const leaderboard = getSortedLeaderboard();

  return (
    <div
      className="min-h-screen text-[#F3F4F6] selection:bg-[#D4AF37]/30 selection:text-white"
      style={{ background: '#080B11' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Background canvas */}
      <ClockCanvas />

      {/* Navigation */}
      <Navbar
        onReset={resetTournament}
        lang={lang}
        onToggleLang={toggleLang}
        phase={state.phase}
        playerCount={state.players.length}
      />

      {/* Setup View */}
      {state.phase === 'setup' && (
        <main
          className="relative flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 pt-16 sm:pt-20 pb-8"
          style={{ zIndex: 10 }}
        >
          <PlayerInput
            players={state.players}
            onAddPlayer={addPlayer}
            onAddMultiplePlayers={addMultiplePlayers}
            onRemovePlayer={removePlayer}
            onRenamePlayer={renamePlayer}
            onClearPlayers={clearPlayers}
            onShufflePlayers={shufflePlayers}
            onSetPlayers={setPlayers}
            onGenerate={generateBracket}
            lang={lang}
          />
        </main>
      )}

      {/* Tournament Live & Complete View */}
      {(state.phase === 'active' || state.phase === 'complete') && (
        <main ref={bracketRef} className="relative pt-14 sm:pt-16" style={{ zIndex: 10 }}>
          {/* Action & Info Header Bar */}
          <div className="px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0B0E17]/90 backdrop-blur-md border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-[#D4AF37]" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isAr ? 'مخطط مباريات البطولة' : 'Tournament Bracket'}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                {isAr
                  ? `مجموع المتنافسين: ${state.players.length} • انقر على أي لاعب لتسجيل فوزه`
                  : `Competitors: ${state.players.length} • Click any player to crown winner`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={resetTournament}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-white/15 text-gray-300 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer bg-white/5"
              >
                <RotateCcw size={13} />
                <span>
                  {isAr ? 'تعديل المشتركين' : 'Edit Competitors'}
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Bracket Area */}
          <div className="py-4 sm:py-8 px-2 sm:px-6 min-h-[60vh]">
            <BracketView
              bracket={state.bracket}
              currentRound={state.currentRound}
              onSelectWinner={selectWinner}
              lang={lang}
            />
          </div>

          {/* Champion Reveal Card */}
          {state.phase === 'complete' && state.champion && (
            <div
              ref={championRef}
              className="py-12 px-4 bg-[#080B11]/95 border-t border-white/10"
            >
              <ChampionReveal
                champion={state.champion}
                leaderboard={leaderboard}
                onNewTournament={resetTournament}
                lang={lang}
              />
            </div>
          )}

          {/* Footer */}
          <footer className="py-6 text-center text-xs text-gray-500 border-t border-white/5">
            Titan Arena • {isAr ? 'نظام خروج المغلوب' : 'Knockout Bracket Engine'}
          </footer>
        </main>
      )}

      {/* Sliding Standings Drawer */}
      {(state.phase === 'active' || state.phase === 'complete') && (
        <Leaderboard entries={leaderboard} lang={lang} />
      )}
    </div>
  );
}
