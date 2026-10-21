import React from 'react';
import type { BuildingState } from '../types';

interface ResidentialSectionProps {
  buildingState: BuildingState;
  residentialTab: 'rent' | 'energy';
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const ResidentialSection: React.FC<ResidentialSectionProps> = ({
  buildingState,
  residentialTab,
  onUpdateState,
}) => {
  if (residentialTab === 'energy') {
    return (
      <div>
        <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          🔥 Źródło energii do ogrzewania lokatorów
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'piec_weglowy', label: 'Piece Węglowe (Kozy)', desc: 'Tani węgiel, wysoki smog i sadza' },
            { id: 'drewno', label: 'Kominki na Drewno', desc: 'Tradycyjne, wysoki koszt tarcicy' },
            { id: 'gaz_miejski', label: 'Miejska Sieć Gazowa', desc: 'Czystsze powietrze, opłata gazowa' },
            { id: 'cieplownia_miejska', label: 'Para z Elektrociepłowni', desc: 'Ciepło systemowe (Kogeneracja)' },
          ].map((heat) => (
            <button
              key={heat.id}
              onClick={() => onUpdateState({ heatingEnergySource: heat.id as any })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                (buildingState.heatingEnergySource || 'piec_weglowy') === heat.id
                  ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md'
                  : 'bg-stone-800/60 border-stone-700/60 hover:bg-stone-700/50 text-stone-300'
              }`}
            >
              <p className="font-bold text-xs">{heat.label}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{heat.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const rent = buildingState.rentPerApartment ?? 18;

  return (
    <div className="space-y-5">
      {/* CZYNSZ ZA WYNAJEM */}
      <div className="bg-stone-800/40 p-4 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-xs text-amber-300 uppercase">
              🪙 Czynsz za mieszkanie
            </p>
            <p className="text-[11px] text-stone-400">
              Wysoki czynsz zwiększa przychód, lecz obniża zadowolenie lokatorów
            </p>
          </div>
          <span className="font-mono text-base font-bold text-emerald-400">
            £ {rent} / msc
          </span>
        </div>
        <input
          type="range"
          min="8"
          max="45"
          step="1"
          value={rent}
          onChange={(e) => onUpdateState({ rentPerApartment: parseInt(e.target.value, 10) })}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-400 font-mono">
          <span>Przystępny (£8)</span>
          <span>Rynkowy (£18)</span>
          <span>Luksusowy (£45)</span>
        </div>
      </div>

      {/* STANDARD UTRZYMANIA */}
      <div>
        <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          🧹 Standard utrzymania budynku
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'podstawowy', label: 'Podstawowy', sub: 'Minimalne koszty' },
            { id: 'dobry', label: 'Zadbany', sub: '+10% zadowolenia' },
            { id: 'luksusowy', label: 'Wzorcowy', sub: 'Maks. prestiż' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onUpdateState({ maintenanceLevel: lvl.id as any })}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                (buildingState.maintenanceLevel || 'dobry') === lvl.id
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                  : 'bg-stone-800/60 border-stone-700/60 text-stone-400'
              }`}
            >
              <p className="font-bold text-xs">{lvl.label}</p>
              <p className="text-[10px] mt-0.5">{lvl.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
