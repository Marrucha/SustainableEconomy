import React from 'react';
import type { PlacedBuilding, BuildingState } from '../types';

interface FarmAlertToastProps {
  placedBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  onDismiss: (farmId: string) => void;
}

/**
 * Globalny pop-up powiadamiający gracza o niewystarczającej ilości obornika na farmie zbożowej.
 */
export const FarmAlertToast: React.FC<FarmAlertToastProps> = ({
  placedBuildings,
  buildingsState,
  onDismiss,
}) => {
  const alerts = placedBuildings
    .filter((b) => b.typeId === 'wheat_farm' && buildingsState[b.id]?.farmCapitalism?.manureShortageWarning)
    .map((b) => ({
      id: b.id,
      message: buildingsState[b.id]!.farmCapitalism!.manureShortageWarning!,
    }));

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-lg w-[92vw] pointer-events-auto">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-stone-950/95 border border-amber-500/70 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{alert.message}</span>
          </span>
          <button
            type="button"
            onClick={() => onDismiss(alert.id)}
            className="text-stone-400 hover:text-white font-bold px-2 py-0.5 rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
