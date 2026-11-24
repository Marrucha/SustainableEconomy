import React from 'react';

interface HorseMaintenanceWarningModalProps {
  activeHorsesCount: number;
  neededFeedKg: number;
  neededStrawKg: number;
  currentFeedOrderKg: number;
  currentStrawOrderKg: number;
  onAdjustQuantityAndClose: () => void;
  onChangeSupplier: () => void;
  onCloseAnyway: () => void;
}

export const HorseMaintenanceWarningModal: React.FC<HorseMaintenanceWarningModalProps> = ({
  activeHorsesCount,
  neededFeedKg,
  neededStrawKg,
  currentFeedOrderKg,
  currentStrawOrderKg,
  onAdjustQuantityAndClose,
  onChangeSupplier,
  onCloseAnyway,
}) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-stone-900 border-2 border-amber-500/70 rounded-2xl p-5 shadow-2xl space-y-4 text-stone-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-sm font-bold text-amber-300">
              Zwiększono liczbę koni energetycznych ({activeHorsesCount} szt.)
            </h3>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Aktualne zapotrzebowanie miesięczne wynosi{' '}
              <strong className="text-amber-200">{neededFeedKg} kg paszy</strong> oraz{' '}
              <strong className="text-yellow-200">{neededStrawKg} kg ściółki</strong>, natomiast
              obecne zamówienie obejmuje{' '}
              <strong className="text-rose-300">{currentFeedOrderKg} kg paszy</strong> i{' '}
              <strong className="text-rose-300">{currentStrawOrderKg} kg ściółki</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onAdjustQuantityAndClose}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold cursor-pointer transition-colors"
          >
            ✓ Dostosuj ilość ({neededFeedKg} kg paszy + {neededStrawKg} kg ściółki/msc) i zamknij
          </button>
          <button
            type="button"
            onClick={onChangeSupplier}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/60 text-amber-200 text-xs font-bold cursor-pointer transition-colors"
          >
            🔄 Zmień dostawcę w zakładce Energia
          </button>
          <button
            type="button"
            onClick={onCloseAnyway}
            className="w-full py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Zamknij mimo to
          </button>
        </div>
      </div>
    </div>
  );
};
