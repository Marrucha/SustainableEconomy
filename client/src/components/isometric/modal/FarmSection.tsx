import React from 'react';
import type { BuildingState } from '../types';
import { BusinessEnergySection } from './BusinessEnergySection';

interface FarmSectionProps {
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const FarmSection: React.FC<FarmSectionProps> = ({
  buildingState,
  businessTab,
  hasGreenRelief,
  onUpdateState,
}) => {
  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle="Farma Zbożowa"
        energySource={buildingState.businessEnergySource || 'drewno'}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  const workersCount = buildingState.workersCount ?? 12;
  const workerWage = buildingState.workerWage ?? 2.5;
  const managersCount = buildingState.managersCount ?? 1;
  const managerWage = buildingState.managerWage ?? 7.5;
  const dailyPayroll = workersCount * workerWage + managersCount * managerWage;
  const monthlyPayroll = Math.round(dailyPayroll * 30);

  return (
    <div className="space-y-5">
      {/* WYBÓR ZASIEWU */}
      <div>
        <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          🌾 Rodzaj uprawianego zboża
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'pszenica', label: 'Pszenica Zwyczajna', desc: 'Wysoka wydajność, do białej mąki' },
            { id: 'zyto', label: 'Żyto Ostre', desc: 'Odporne na przymrozki, chleb razowy' },
            { id: 'owies', label: 'Owies Pędny', desc: 'Pasza dla koni pociągowych i płatki' },
            { id: 'jeczmien', label: 'Jęczmień Browarny', desc: 'Surowiec do słodu piwnego' },
          ].map((crop) => (
            <button
              key={crop.id}
              onClick={() => onUpdateState({ cropType: crop.id as any })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                (buildingState.cropType || 'pszenica') === crop.id
                  ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md'
                  : 'bg-stone-800/60 border-stone-700/60 hover:bg-stone-700/50 text-stone-300'
              }`}
            >
              <p className="font-bold text-xs">{crop.label}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{crop.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ZATRUDNIENIE I ZAŁOGA GOSPODARSTWA */}
      <div className="bg-stone-800/40 p-4 rounded-2xl border border-stone-800 space-y-4">
        {/* 1. ROBOTNICY POLNI (KLASA R) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-xs text-amber-300 uppercase">
                👥 Robotnicy Polni (Klasa Robotnicza R)
              </p>
              <p className="text-[11px] text-stone-400">Siła robocza do orki, pielenia, siewu i żniw</p>
            </div>
            <span className="font-mono text-base font-bold text-emerald-400">
              {workersCount} ludzi
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="24"
            step="1"
            value={workersCount}
            onChange={(e) => onUpdateState({ workersCount: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-400">Stawka dzienna robotnika:</span>
            <span className="font-mono text-xs font-bold text-amber-300">
              £ {workerWage.toFixed(1)} / dzień
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.5"
            value={workerWage}
            onChange={(e) => onUpdateState({ workerWage: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* 2. ZARZĄDCY I AGRONOMOWIE (KLASA M) */}
        <div className="pt-3 border-t border-stone-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-xs text-sky-300 uppercase">
                  🧐 Zarządcy Majątku i Agronomowie (Klasa M)
                </p>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                  Nadzór i Agrotechnika
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Nadzorują tempo prac polowych, dyscyplinę załogi i płodozmian
              </p>
            </div>
            <span className="font-mono text-base font-bold text-sky-400">
              {managersCount} zarządca
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={managersCount}
            onChange={(e) => onUpdateState({ managersCount: parseInt(e.target.value, 10) })}
            className="w-full accent-sky-500 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-400">Płaca dzienna zarządcy:</span>
            <span className="font-mono text-xs font-bold text-sky-300">
              £ {managerWage.toFixed(1)} / dzień
            </span>
          </div>
          <input
            type="range"
            min="4.0"
            max="16.0"
            step="0.5"
            value={managerWage}
            onChange={(e) => onUpdateState({ managerWage: parseFloat(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer"
          />

          {/* WSKAŹNIK EFEKTYWNOŚCI NADZORU */}
          <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-700/60 text-[11px] space-y-1.5">
            {managersCount === 0 && (
              <div className="text-amber-400 flex items-center gap-1.5">
                <span>⚠️</span>
                <span><strong>Brak zarządcy:</strong> Niska dyscyplina załogi, straty ziarna -20%, spadek tempa żniw.</span>
              </div>
            )}
            {managersCount === 1 && (
              <div className="text-emerald-400 flex items-center gap-1.5">
                <span>✓</span>
                <span><strong>Nadzór optymalny:</strong> 1 zarządca na {workersCount} robotników. +15% wydajności załogi, -10% strat.</span>
              </div>
            )}
            {managersCount >= 2 && (
              <div className="text-sky-300 flex items-center gap-1.5">
                <span>🌟</span>
                <span><strong>Wzorcowa agrotechnika:</strong> Podwójny nadzór agronomiczny. +25% plonów, selekcja najlepszych nasion siewnych.</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-stone-400 text-[10px] font-mono">
              <span>Fundusz płac: £ {dailyPayroll.toFixed(1)} / dzień</span>
              <span className="text-amber-300 font-bold">£ {monthlyPayroll} / msc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
