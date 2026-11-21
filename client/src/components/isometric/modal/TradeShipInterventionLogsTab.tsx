import React from 'react';
import type { BuildingState, ShipInterventionLogEntry } from '../types';

export function resolveTradeShipStateId(
  buildingsState: Record<string, BuildingState>
): string {
  return (
    Object.keys(buildingsState).find((id) => id.startsWith('trade_ship')) || 'trade_ship_init'
  );
}

export function appendShipInterventionLogToRecord(
  record: Record<string, BuildingState>,
  entry: Omit<ShipInterventionLogEntry, 'id'>
): void {
  const shipId = resolveTradeShipStateId(record);
  const shipState = record[shipId] || {};
  const prevLogs = shipState.shipInterventionLogs || [];
  const nextEntry: ShipInterventionLogEntry = {
    ...entry,
    id: `ship_int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
  record[shipId] = {
    ...shipState,
    shipInterventionLogs: [nextEntry, ...prevLogs].slice(0, 100),
  };
}

interface TradeShipInterventionLogsTabProps {
  logs: ShipInterventionLogEntry[];
}

export const TradeShipInterventionLogsTab: React.FC<TradeShipInterventionLogsTabProps> = ({
  logs,
}) => {
  return (
    <div className="bg-stone-900/90 rounded-2xl p-4 border border-amber-500/30 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
          🛟 Logi Zakupów Interwencyjnych (+10% do ceny statku)
        </h4>
        <span className="text-[11px] font-mono text-stone-400">
          Wpisy: <strong className="text-amber-300">{logs.length}</strong>
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-stone-400 italic">
          Brak zrealizowanych zakupów interwencyjnych. Pojawią się tutaj w miesiącach, gdy kontrakt dostawy nie zostanie zrealizowany w pełni, a kupujący ma włączony zakup interwencyjny.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-800 max-h-[55vh] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/90 text-stone-400 uppercase text-[10px] sticky top-0">
              <tr>
                <th className="py-1.5 px-3">Okres</th>
                <th className="py-1.5 px-3">Kupujący</th>
                <th className="py-1.5 px-3">Towar</th>
                <th className="py-1.5 px-3 text-right">Brakująca ilość</th>
                <th className="py-1.5 px-3 text-right">Koszt (+10%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 bg-stone-950/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-800/40">
                  <td className="py-1.5 px-3 font-mono text-stone-300">
                    {String(log.month).padStart(2, '0')}/{log.year}
                  </td>
                  <td className="py-1.5 px-3 font-bold text-sky-300">{log.buyerLabel}</td>
                  <td className="py-1.5 px-3 font-semibold text-white">{log.productLabel}</td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold text-yellow-300">
                    {log.shortfallKg.toLocaleString('pl-PL')} kg
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono font-bold text-amber-300">
                    £{log.costGbp.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
