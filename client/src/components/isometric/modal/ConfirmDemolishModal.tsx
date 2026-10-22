import React from 'react';
import type { PlacedBuilding } from '../types';

interface ConfirmDemolishModalProps {
  building: PlacedBuilding;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDemolishModal: React.FC<ConfirmDemolishModalProps> = ({
  building,
  onConfirm,
  onCancel,
}) => {
  const refund = Math.floor(building.cost * 0.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-stone-900 border-2 border-rose-700/80 rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-stone-200 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-600/50 flex items-center justify-center text-xl shrink-0">
            🔨
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-300">Potwierdzenie wyburzenia</h3>
            <p className="text-xs text-stone-400">Tej operacji nie można cofnąć</p>
          </div>
        </div>

        <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800 text-xs flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-stone-400">Budynek:</span>
            <span className="font-semibold text-stone-200">{building.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Rozmiar:</span>
            <span className="font-mono text-stone-300">{building.sizeX}x{building.sizeY}</span>
          </div>
          <div className="flex justify-between border-t border-stone-800 pt-1.5 mt-0.5">
            <span className="text-amber-400">Zwrot materiałów (50%):</span>
            <span className="font-mono font-bold text-emerald-400">+£ {refund.toLocaleString('en-US')}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold shadow-lg shadow-rose-950/50 cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>Wyburz</span>
            <span>🔨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
