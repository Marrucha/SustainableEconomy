import React from 'react';
import type { 
  BuildingType, 
  GameState 
} from '../../types/game';
import { 
  Coins, 
  Users, 
  Leaf, 
  Wind, 
  Play, 
  Pause, 
  FastForward, 
  Factory, 
  Wheat, 
  Zap, 
  Sun, 
  Home, 
  Trees, 
  Trash2, 
  Flame
} from 'lucide-react';

interface HUDProps {
  state: GameState;
  onSetBuildMode: (mode: BuildingType | 'forest' | 'road' | 'demolish' | null) => void;
  onSetSpeed: (speed: 0 | 1 | 2 | 3) => void;
  onEnergySourceToggle: (tileId: string) => void;
  onDemolishSelected: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  state,
  onSetBuildMode,
  onSetSpeed,
  onEnergySourceToggle,
  onDemolishSelected,
}) => {
  const { funds, monthlyNetIncome, year, era, population, socialScore, planetHealth, globalSmogLevel, speed, buildMode, selectedTile } = state;

  const buildItems: { id: BuildingType | 'forest' | 'road'; name: string; cost: number; icon: React.ReactNode; desc: string }[] = [
    { id: 'wheat_farm', name: 'Farma Pszenicy', cost: 5000, icon: <Wheat className="w-5 h-5 text-amber-400" />, desc: 'Produkuje: Pszenica (L0)' },
    { id: 'flour_mill', name: 'Młyn Parowy', cost: 12000, icon: <Factory className="w-5 h-5 text-red-400" />, desc: '2 Pszenica + 1 kWh = 1 Mąka' },
    { id: 'bakery', name: 'Piekarnia', cost: 8000, icon: <Factory className="w-5 h-5 text-orange-400" />, desc: '2 Mąka + Drożdże = 1 Chleb' },
    { id: 'coal_power', name: 'Elektrownia Węglowa', cost: 35000, icon: <Zap className="w-5 h-5 text-amber-500" />, desc: '+500 kWh (Duży Smog)' },
    { id: 'solar_farm', name: 'Farma Solarna', cost: 25000, icon: <Sun className="w-5 h-5 text-sky-400" />, desc: '+350 kWh (0 Emisji)' },
    { id: 'residential', name: 'Kamienice Robotnicze', cost: 6000, icon: <Home className="w-5 h-5 text-yellow-600" />, desc: '+150 Mieszkańców [R/M]' },
    { id: 'forest', name: 'Zasadź Las (Eko)', cost: 1500, icon: <Trees className="w-5 h-5 text-emerald-400" />, desc: 'Pochłania Smog i CO2' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-sans text-slate-100 select-none">
      
      {/* TOP BAR: TRIPLE BOTTOM LINE & ERA */}
      <header className="pointer-events-auto flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl px-6 py-3 shadow-2xl">
        {/* Title & Era */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide uppercase text-slate-200">
              Sustainable Economy <span className="text-xs px-2 py-0.5 ml-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">Alpha v0.1</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Rok <span className="text-white font-bold">{year}</span> • Epoka {era}: Narodziny Przemysłu (Wielka Brytania)
            </p>
          </div>
        </div>

        {/* TRIPLE BOTTOM LINE METRICS */}
        <div className="flex items-center gap-8">
          {/* 1. PROFIT */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Kapitał</p>
              <p className="text-sm font-bold text-amber-300">
                ${funds.toLocaleString()} <span className="text-[11px] font-medium text-emerald-400">+{monthlyNetIncome}/mc</span>
              </p>
            </div>
          </div>

          {/* 2. PEOPLE */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Ludzie & Jakość Życia</p>
              <p className="text-sm font-bold text-blue-300">
                {socialScore}% <span className="text-[11px] font-normal text-slate-400">({population.R} R / {population.M} M / {population.E} E)</span>
              </p>
            </div>
          </div>

          {/* 3. PLANET */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Czystość Biosfery</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-300">{planetHealth}%</span>
                <span className="text-[11px] flex items-center gap-1 text-slate-400">
                  <Wind className="w-3.5 h-3.5 text-slate-400" /> Smog: {globalSmogLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/50">
          <button
            onClick={() => onSetSpeed(0)}
            className={`p-1.5 rounded-lg transition ${speed === 0 ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Pauza"
          >
            <Pause className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSetSpeed(1)}
            className={`p-1.5 rounded-lg transition ${speed === 1 ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Normalna prędkość (1x)"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSetSpeed(2)}
            className={`p-1.5 rounded-lg transition ${speed === 2 ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-white'}`}
            title="Szybka prędkość (2x)"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* RIGHT SIDEBAR: SELECTED TILE / BUILDING INSPECTOR */}
      {selectedTile && (
        <aside className="pointer-events-auto absolute right-4 top-24 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/70 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Koordynaty kafelka</p>
              <h3 className="text-base font-bold text-white">Sektor [{selectedTile.x}, {selectedTile.z}]</h3>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
              selectedTile.type === 'water' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
              selectedTile.type === 'forest' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              'bg-slate-800 text-slate-300'
            }`}>
              {selectedTile.type}
            </span>
          </div>

          {/* Local Pollution Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Lokalne Zanieczyszczenie:</span>
              <span className={`font-semibold ${selectedTile.pollution > 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {Math.round(selectedTile.pollution * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all ${selectedTile.pollution > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${selectedTile.pollution * 100}%` }}
              />
            </div>
          </div>

          {/* If Building Exists */}
          {selectedTile.building ? (
            <div className="space-y-4">
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
                <p className="text-xs text-slate-400">Obiekt Przemysłowy</p>
                <h4 className="text-sm font-bold text-emerald-400">{selectedTile.building.name}</h4>
                <p className="text-xs text-slate-300 mt-1">Receptura: <span className="font-semibold">{selectedTile.building.monthlyOutput}</span></p>
              </div>

              {/* Triada Produkcyjna */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Obsada pracownicza:</span>
                  <span className="font-medium text-blue-300">
                    {selectedTile.building.workers.R} [R] / {selectedTile.building.workers.M} [M] / {selectedTile.building.workers.E} [E]
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Pobór energii:</span>
                  <span className="font-medium text-amber-300">{selectedTile.building.energyKwh} kWh / mc</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Przychód netto:</span>
                  <span className="font-bold text-emerald-400">+${selectedTile.building.monthlyRevenue} / mc</span>
                </div>
              </div>

              {/* Energy Sourcing Toggle */}
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
                <p className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Źródło Zasilania Fabryki:
                </p>
                <button
                  onClick={() => onEnergySourceToggle(selectedTile.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    selectedTile.building.energySource === 'grid'
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {selectedTile.building.energySource === 'grid' ? (
                    <>
                      <Zap className="w-3.5 h-3.5" /> Sieć Miejska (Czysty prąd)
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5" /> Kocioł Węglowy (Spalanie lokalne)
                    </>
                  )}
                </button>
              </div>

              {/* Demolish Button */}
              <button
                onClick={onDemolishSelected}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" /> Wyburz Obiekt ($1,000 odzysku)
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              <p>Pusta działka gotowa pod inwestycję.</p>
              <p className="mt-2 text-slate-500">Wybierz budynek z dolnego paska, aby rozpocząć budowę.</p>
            </div>
          )}
        </aside>
      )}

      {/* BOTTOM ACTION DOCK: CONSTRUCTION PALETTE */}
      <footer className="pointer-events-auto mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-2 shadow-2xl flex items-center gap-2">
        {buildItems.map((item) => {
          const isActive = buildMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetBuildMode(isActive ? null : item.id)}
              className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl transition group ${
                isActive 
                  ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/30 font-bold' 
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
              title={item.desc}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.name}</span>
              <span className={`text-[10px] ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                ${item.cost.toLocaleString()}
              </span>
            </button>
          );
        })}

        <div className="w-[1px] h-8 bg-slate-700 mx-1" />

        {/* Demolish Tool */}
        <button
          onClick={() => onSetBuildMode(buildMode === 'demolish' ? null : 'demolish')}
          className={`flex flex-col items-center justify-center px-3.5 py-2.5 rounded-xl transition ${
            buildMode === 'demolish'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold'
              : 'hover:bg-rose-500/10 text-rose-400'
          }`}
          title="Tryb Wyburzania"
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-xs">Buldożer</span>
        </button>
      </footer>
    </div>
  );
};
