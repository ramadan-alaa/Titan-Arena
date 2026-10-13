import { useState, useRef, useEffect } from 'react';
import { X, Users, Shuffle, Trash2, Plus, ListPlus, Check, AlertCircle, Play } from 'lucide-react';
import type { Player } from '@/types/tournament';
import { getNextPowerOfTwo } from '@/hooks/useTournament';

interface PlayerInputProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onAddMultiplePlayers: (names: string[]) => void;
  onRemovePlayer: (id: string) => void;
  onRenamePlayer: (id: string, name: string) => void;
  onClearPlayers: () => void;
  onShufflePlayers: () => void;
  onSetPlayers: (players: Player[]) => void;
  onGenerate: () => void;
  lang?: 'ar' | 'en';
}

export default function PlayerInput({
  players,
  onAddPlayer,
  onAddMultiplePlayers,
  onRemovePlayer,
  onRenamePlayer,
  onClearPlayers,
  onShufflePlayers,
  onSetPlayers,
  onGenerate,
  lang = 'ar',
}: PlayerInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAr = lang === 'ar';

  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddPlayer(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleBulkSubmit = () => {
    if (!bulkText.trim()) return;
    const names = bulkText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (names.length > 0) {
      onAddMultiplePlayers(names);
      setBulkText('');
      setShowBulkModal(false);
    }
  };

  const handleGenerate = () => {
    if (players.length < 2) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    onGenerate();
  };

  const handleQuickAdd = (count: number) => {
    const newPlayers: Player[] = [];
    const prefix = isAr ? 'لاعب' : 'Player';
    for (let i = 1; i <= count; i++) {
      newPlayers.push({
        // eslint-disable-next-line react-hooks/purity
        id: `player-${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name: `${prefix} ${i}`,
        seed: i,
      });
    }
    onSetPlayers(newPlayers);
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onRenamePlayer(id, editName.trim());
    }
    setEditingId(null);
  };

  // Bracket stats
  const numPlayers = players.length;
  const bracketSize = numPlayers >= 2 ? getNextPowerOfTwo(numPlayers) : 0;
  const numByes = bracketSize - numPlayers;
  const numRounds = bracketSize > 0 ? Math.log2(bracketSize) : 0;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[700px] mx-auto px-3 sm:px-4 py-4 sm:py-8"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10"
        style={{
          background: 'rgba(13, 17, 26, 0.92)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Clean Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isAr ? 'قرعة البطولة' : 'Tournament Bracket'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            {isAr
              ? 'أضف المشاركين بأي عدد وسيتم ضبط الجدول والتأهل التلقائي تلقائياً وبدقة'
              : 'Add competitors of any number. Auto-calculates byes and fair pairings.'}
          </p>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب اسم المتسابق واضغط Enter...'
                    : 'Enter competitor name...'
                }
                className="w-full h-11 sm:h-12 rounded-xl px-4 text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#D4AF37] focus:bg-white/[0.07]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="flex-1 sm:flex-none h-11 sm:h-12 px-5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all bg-[#D4AF37] text-black font-semibold hover:bg-[#E5C07B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus size={16} />
                <span>{isAr ? 'إضافة' : 'Add'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl text-sm flex items-center justify-center gap-1.5 border border-white/15 text-gray-300 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer bg-white/5"
                title={isAr ? 'لصق قائمة أسماء' : 'Paste list of names'}
              >
                <ListPlus size={16} />
                <span className="hidden xs:inline text-xs sm:text-sm">
                  {isAr ? 'إضافة قائمة' : 'Bulk'}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Bulk Add Textarea */}
        {showBulkModal && (
          <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300">
                {isAr
                  ? 'الصق الأسماء (اسم في كل سطر أو مفصولة بفواصل)'
                  : 'Paste names (one per line or comma separated)'}
              </span>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={15} />
              </button>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={isAr ? 'محمد\nأحمد\nعلي\nسارة\nعمر' : 'Alex\nJordan\nTaylor\nChris'}
              rows={4}
              className="w-full rounded-lg p-3 text-xs sm:text-sm bg-white/5 border border-white/10 text-white outline-none resize-none focus:border-[#D4AF37]"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={!bulkText.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#2A9D8F] text-white hover:bg-[#34b5a6] transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isAr ? 'تأكيد الإضافة' : 'Import'}
              </button>
            </div>
          </div>
        )}

        {/* Competitors List */}
        {players.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2.5 px-0.5">
              <span className="flex items-center gap-1.5 font-medium text-gray-300">
                <Users size={14} className="text-[#D4AF37]" />
                {isAr ? `المشاركون (${players.length})` : `Competitors (${players.length})`}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onShufflePlayers}
                  className="flex items-center gap-1 text-xs text-gray-300 hover:text-[#D4AF37] cursor-pointer transition-colors"
                  title={isAr ? 'إعادة ترتيب عشوائي' : 'Randomize order'}
                >
                  <Shuffle size={12} />
                  <span>{isAr ? 'خلط القرعة' : 'Shuffle'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClearPlayers}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                >
                  <Trash2 size={12} />
                  <span>{isAr ? 'مسح' : 'Clear'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-1 pb-1 custom-scrollbar">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-200 hover:border-white/20 transition-colors"
                >
                  <span className="font-mono text-[10px] text-[#D4AF37] font-semibold">
                    #{idx + 1}
                  </span>

                  {editingId === player.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(player.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-20 bg-black text-white px-1 py-0.5 rounded text-xs outline-none border border-[#D4AF37]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(player.id)}
                        className="text-[#2A9D8F] hover:text-white"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEditing(player)}
                      className="cursor-pointer hover:text-white truncate max-w-[140px]"
                      title={isAr ? 'انقر لتعديل الاسم' : 'Click to rename'}
                    >
                      {player.name}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemovePlayer(player.id)}
                    className="text-gray-500 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Bracket Distribution Summary */}
        {numPlayers >= 2 && (
          <div className="mt-6 p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <span>
                  {isAr
                    ? `جدول البطولة: ${bracketSize} مقاعد (${numRounds} ${numRounds === 1 ? 'دور' : 'أدوار'})`
                    : `Bracket Size: ${bracketSize} Slots (${numRounds} Rounds)`}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400">
                {numByes > 0
                  ? isAr
                    ? `يتأهل ${numByes} من المصنفين تلقائياً للدور التالي (BYE) لضبط العدد الفردي.`
                    : `${numByes} players advance automatically to Round 2 as Byes.`
                  : isAr
                  ? 'جميع المشاركين يلعبون في الدور الأول بشكل متوازن.'
                  : 'Perfect bracket size; all competitors play Round 1.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-gray-300">
                {isAr ? `${numPlayers} لاعبين` : `${numPlayers} Players`}
              </span>
              {numByes > 0 && (
                <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#2A9D8F]/15 border border-[#2A9D8F]/30 text-[#2A9D8F]">
                  {isAr ? `${numByes} تأهل مباشر` : `${numByes} Byes`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Validation error */}
        {showValidation && players.length < 2 && (
          <div className="mt-4 p-3 rounded-xl flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertCircle size={15} />
            <span>
              {isAr
                ? 'يلزم إضافة لاعبين (2) على الأقل لإنشاء جدول البطولة.'
                : 'At least 2 players are required to generate bracket.'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center">
          <button
            onClick={handleGenerate}
            disabled={players.length < 2}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-[#D4AF37] text-black hover:bg-[#E5C07B] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play size={15} fill="currentColor" />
            <span>{isAr ? 'إنشاء الجدول وبدء المباريات' : 'Generate Bracket'}</span>
          </button>

          {players.length > 0 && (
            <button
              onClick={onClearPlayers}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors cursor-pointer bg-transparent"
            >
              {isAr ? 'مسح الكل' : 'Clear All'}
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-8 pt-5 border-t border-white/10">
          <p className="text-[11px] font-medium text-gray-400 mb-2.5 text-center">
            {isAr ? 'أمثلة سريعة (أعداد فردية وزوجية):' : 'Quick Presets:'}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {([3, 4, 5, 6, 7, 8, 10, 12, 16] as const).map((count) => {
              const isSelected = players.length === count;
              const isOdd = count % 2 !== 0;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleQuickAdd(count)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-semibold'
                      : isOdd
                      ? 'bg-white/[0.04] text-gray-300 border-white/15 hover:border-gray-400'
                      : 'bg-white/[0.02] text-gray-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {isAr ? `${count} لاعبين` : `${count}P`}
                  {isOdd && (
                    <span className="text-[10px] opacity-70 ml-1">
                      ({isAr ? 'فردي' : 'odd'})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
