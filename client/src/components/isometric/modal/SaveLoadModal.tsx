import React, { useState } from 'react';
import {
  clearAllPersistedGameState,
  createSaveSlot,
  deleteSaveSlot,
  loadSaveSlots,
  restoreSaveSlot,
  type SaveSlotEntry,
} from '../gamePersistence';

interface SaveLoadModalProps {
  gameDateLabel: string;
  gold: number;
  onClose: () => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  gameDateLabel,
  gold,
  onClose,
}) => {
  const [slots, setSlots] = useState<SaveSlotEntry[]>(() => loadSaveSlots());
  const [saveName, setSaveName] = useState<string>(`Zapis — ${gameDateLabel}`);
  const [confirmNewGame, setConfirmNewGame] = useState<boolean>(false);

  const handleSave = () => {
    const updated = createSaveSlot(saveName, gameDateLabel, gold);
    setSlots(updated);
    setSaveName(`Zapis — ${gameDateLabel}`);
  };

  const handleLoad = (slot: SaveSlotEntry) => {
    restoreSaveSlot(slot);
    window.location.reload();
  };

  const handleDelete = (id: string) => {
    setSlots(deleteSaveSlot(id));
  };

  const handleNewGame = () => {
    clearAllPersistedGameState();
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-stone-900 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl text-stone-200 space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💾</span>
            <div>
              <h3 className="text-base font-bold text-emerald-300">
                Zapis, Wczytanie i Nowa Gra
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">
                Aktualna data: {gameDateLabel} • Kapitał: £{gold.toLocaleString('en-US')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-bold text-stone-200 cursor-pointer"
          >
            ✕ Zamknij
          </button>
        </div>

        {/* Zapisz grę */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Utwórz nowy zapis stanu gry
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Nazwa zapisu..."
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold cursor-pointer transition-colors shrink-0"
            >
              💾 Zapisz grę
            </button>
          </div>
        </div>

        {/* Lista zapisów do wczytania */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              📂 Zapisane momenty ({slots.length})
            </h4>
          </div>
          {slots.length === 0 ? (
            <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 text-center text-xs text-stone-400 italic">
              Brak zapisanych stanów gry. Użyj przycisku „Zapisz grę” powyżej, aby zapisać bieżący moment.
            </div>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-stone-950/80 border border-stone-800 hover:border-stone-700 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-100 truncate">
                      {slot.name}
                    </div>
                    <div className="text-[10px] font-mono text-stone-400">
                      📅 {slot.gameDateLabel} • 💰 £{slot.gold.toLocaleString('en-US')} •{' '}
                      {new Date(slot.savedAtIso).toLocaleString('pl-PL')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLoad(slot)}
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer transition-colors"
                    >
                      📂 Wczytaj
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slot.id)}
                      title="Usuń ten zapis"
                      className="px-2 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-800 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nowa gra */}
        <div className="border-t border-stone-800 pt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-stone-400">
            Nowa gra czyści bieżącą mapę (zachowuje zapisane stany).
          </span>
          {!confirmNewGame ? (
            <button
              type="button"
              onClick={() => setConfirmNewGame(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold cursor-pointer"
            >
              🆕 Nowa gra
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNewGame}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                ✓ Potwierdź nową grę
              </button>
              <button
                type="button"
                onClick={() => setConfirmNewGame(false)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Anuluj
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
