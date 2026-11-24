import React from 'react';
import type { ProductionChecklistResult } from './productionChecklist';
import type { BusinessTabType } from './BuildingModalTabs';

interface BusinessSummaryTabProps {
  checklist: ProductionChecklistResult;
  onNavigateTab: (tab: BusinessTabType) => void;
}

export const BusinessSummaryTab: React.FC<BusinessSummaryTabProps> = ({
  checklist,
  onNavigateTab,
}) => {
  const failedCount = checklist.items.filter((i) => !i.passed).length;

  return (
    <div className="space-y-3 animate-fade-in">
      <div
        className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${
          checklist.allPassed
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
              checklist.allPassed
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-rose-500/20 border-rose-400 text-rose-300'
            }`}
          >
            {checklist.allPassed ? '✓' : '✕'}
          </span>
          <div>
            <h3 className="text-sm font-bold">
              {checklist.allPassed
                ? 'Produkcja gotowa do pracy (wszystkie warunki spełnione)'
                : `Produkcja wstrzymana lub ograniczona (niespełnione warunki: ${failedCount})`}
            </h3>
            <p className="text-[11px] opacity-80">
              Produkcja działa pełną mocą tylko wtedy, gdy wszystkie 4 punkty poniższej checklisty są zielone.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('production')}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
        >
          🏭 Przejdź do Produkcji
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {checklist.items.map((item) => {
          const isWarning = item.passed && Boolean(item.warning);
          return (
          <div
            key={item.id}
            className={`p-3 rounded-2xl border space-y-1.5 ${
              isWarning
                ? 'bg-amber-950/35 border-amber-500/55'
                : item.passed
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-rose-950/25 border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isWarning
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : item.passed
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-400 text-rose-300'
                }`}
              >
                {isWarning ? '⚠️ OSTRZEŻENIE' : item.passed ? '✓ OK' : item.id === 'storage' ? '✕ PEŁNY' : '✕ BRAK'}
              </span>
            </div>
            <p className={`text-[11px] font-mono ${isWarning ? 'text-amber-200' : 'text-stone-300'}`}>{item.detail}</p>
            {!item.passed && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onNavigateTab(
                      item.id === 'materials' || item.id === 'storage' ? 'trade' : 'production'
                    )
                  }
                  className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  {item.id === 'storage'
                    ? '→ Sprzedaj wyroby w Zakup/Sprzedaż'
                    : '→ Uzupełnij w odpowiedniej zakładce'}
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Stan surowców i produktów w 2 kolumnach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            📦 Stan surowców w magazynach
          </h4>
          {checklist.rawMaterials.length === 0 ? (
            <p className="text-[11px] text-stone-500 italic">Brak wymaganych surowców wsadowych.</p>
          ) : (
            <div className="space-y-2">
              {checklist.rawMaterials.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">
                      {item.icon} {item.label}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        item.isZero
                          ? 'text-rose-400'
                          : item.isFull
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}
                    >
                      {item.valueLabel}
                    </span>
                  </div>
                  {typeof item.pct === 'number' && (
                    <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className={`h-full transition-all ${
                          item.isZero ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            🏛️ Stan produktów w magazynach
          </h4>
          {checklist.products.length === 0 ? (
            <p className="text-[11px] text-stone-500 italic">Brak zdefiniowanych produktów magazynowych.</p>
          ) : (
            <div className="space-y-2">
              {checklist.products.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold">
                      {item.icon} {item.label}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        item.isFull
                          ? 'text-rose-400'
                          : item.isZero
                          ? 'text-stone-400'
                          : 'text-emerald-300'
                      }`}
                    >
                      {item.valueLabel}
                    </span>
                  </div>
                  {typeof item.pct === 'number' && (
                    <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className={`h-full transition-all ${
                          item.isFull ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProductionChecklistModalProps {
  title: string;
  checklist: ProductionChecklistResult;
  onClose: () => void;
  onGoToSummary: () => void;
}

export const ProductionChecklistModal: React.FC<ProductionChecklistModalProps> = ({
  title,
  checklist,
  onClose,
  onGoToSummary,
}) => {
  const failedItems = checklist.items.filter((i) => !i.passed);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-stone-900 border border-rose-500/60 rounded-2xl p-4 shadow-2xl space-y-3 text-stone-200">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500 text-rose-300 flex items-center justify-center text-xs font-bold">
              ✕
            </span>
            <h3 className="text-sm font-bold text-rose-200">
              Niespełnione warunki produkcji • {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {failedItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-rose-950/35 border border-rose-500/40 space-y-1"
            >
              <div className="text-xs font-bold text-rose-200">
                {item.icon} {item.label}
              </div>
              <div className="text-[11px] font-mono text-stone-300">{item.detail}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onGoToSummary}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
          >
            📋 Otwórz Podsumowanie
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
