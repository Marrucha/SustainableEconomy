import React from 'react';

interface WorldMapViewProps {
  onOpenLondon: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({ onOpenLondon }) => {
  return (
    <div className="w-full h-full bg-[#0d1b2a] flex items-center justify-center relative overflow-hidden select-none pt-28 pb-4 px-4">
      <div className="w-full max-w-[96vw] h-full max-h-[82vh] flex flex-col lg:flex-row gap-3 items-stretch justify-center">
        {/* LEWA STRONA: WIELKA BRYTANIA (DOPASOWANA SZEROKOŚĆ BEZ ZBĘDNYCH MARGINESÓW) */}
        <div className="relative shrink-0 flex items-center justify-center bg-stone-950/60 border-2 border-amber-600/60 rounded-2xl p-1.5 shadow-2xl overflow-hidden">
          <div className="relative h-full max-h-[79vh] aspect-[885.546/1368.581] rounded-xl overflow-hidden border border-amber-500/40 bg-[#C6ECFF] shadow-lg">
            <img
              src="/assets/uk_map.svg"
              alt="Mapa Wielkiej Brytanii i Irlandii Północnej"
              className="w-full h-full object-contain block pointer-events-none"
              draggable={false}
            />

            {/* GLASGOW (55.8642°N, -4.2518°E -> x=51.12%, y=42.80%) */}
            <div
              style={{ left: '51.12%', top: '42.80%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <span className="block w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-stone-950 shadow-md" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-stone-950/90 text-amber-200 border border-amber-500/70 font-serif font-bold text-[11px] tracking-wider shadow whitespace-nowrap">
                ⚓ GLASGOW
              </span>
            </div>

            {/* LONDYN (51.5074°N, -0.1278°E -> x=82.37%, y=79.11%) */}
            <button
              type="button"
              onClick={onOpenLondon}
              style={{ left: '82.37%', top: '79.11%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
              title="Kliknij, aby otworzyć widok miasta Londyn"
            >
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-amber-100 shadow-md" />
              </span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-stone-950/95 group-hover:bg-amber-500 text-amber-200 group-hover:text-stone-950 border border-amber-500/80 font-serif font-bold text-[11px] tracking-wider shadow-lg transition-colors whitespace-nowrap">
                🏙️ LONDYN
              </span>
            </button>
          </div>

          <div className="absolute bottom-3 left-3 bg-stone-950/90 border border-amber-600/50 rounded-xl px-3 py-1.5 pointer-events-none">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400">
              Metropolia • 1880
            </div>
            <div className="text-xs font-serif font-bold text-amber-100">
              Zjednoczone Królestwo Wielkiej Brytanii i Irlandii
            </div>
          </div>
        </div>

        {/* PRAWA STRONA: KONTUROWA MAPA ŚWIATA 1880 Z KOLOROWYMI KOLONIAMI */}
        <div className="relative flex-1 min-w-0 bg-stone-950/75 border-2 border-sky-600/50 rounded-2xl p-2 shadow-2xl flex flex-col justify-center gap-1.5 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-sky-300 uppercase tracking-wider shrink-0 px-1">
            <span className="font-bold">🌍 Mapa Świata (1880)</span>
          </div>

          <div className="relative w-full aspect-[7752/3840] max-h-[75vh] mx-auto rounded-xl overflow-hidden border border-stone-700 bg-[#C6ECFF] shadow-inner">
            <img
              src="/assets/world_1880.png"
              alt="Historyczna Konturowa Mapa Świata 1880"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />

            {/* Wielka Brytania */}
            <div
              style={{ left: '46.8%', top: '20.5%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <span className="block w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow" />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-stone-950/90 text-amber-200 text-[10px] font-serif font-bold border border-amber-500/60 whitespace-nowrap">
                Wlk. Brytania
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
