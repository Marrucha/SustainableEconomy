import React from 'react';

interface RoadModalProps {
  x: number;
  y: number;
  roadType: 'curb' | 'seamless' | 'dirt';
  onDemolish: () => void;
  onChangeType: (newType: 'curb' | 'seamless' | 'dirt') => void;
  onClose: () => void;
}

export const RoadModal: React.FC<RoadModalProps> = ({
  x,
  y,
  roadType,
  onDemolish,
  onChangeType,
  onClose,
}) => {
  const getRoadName = (type: 'curb' | 'seamless' | 'dirt') => {
    switch (type) {
      case 'curb':
        return 'Bruk Miejski (z krawężnikiem)';
      case 'seamless':
        return 'Bruk Granitowy (bez krawężnika)';
      case 'dirt':
        return 'Wiejska Droga Ziemna';
    }
  };

  const getRefund = (type: 'curb' | 'seamless' | 'dirt') => {
    return type === 'dirt' ? 8 : 25;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-600/40 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        {/* NAGŁÓWEK */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 px-5 py-4 border-b border-amber-600/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-mono text-amber-400 font-semibold">
              Infrastruktura Komunikacyjna • Rok 1880
            </span>
            <h3 className="text-lg font-serif font-bold text-amber-100 mt-0.5">
              {getRoadName(roadType)}
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Pozycja siatki: ({x}, {y})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ZAWARTOŚĆ */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-2">
              Zmień typ nawierzchni tego odcinka:
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onChangeType('curb')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  roadType === 'curb'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 font-bold'
                    : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/60 text-stone-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">🏛️ Bruk Miejski (z krawężnikiem)</div>
                  <div className="text-[11px] text-stone-400">Klasyczny bruk uliczny z granitowym obrzeżem</div>
                </div>
                {roadType === 'curb' && <span className="text-amber-400 text-xs font-mono">Aktywny</span>}
              </button>

              <button
                onClick={() => onChangeType('seamless')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  roadType === 'seamless'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 font-bold'
                    : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/60 text-stone-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">🧱 Bruk Granitowy (bez krawężnika)</div>
                  <div className="text-[11px] text-stone-400">Jednolity bruk bez obramowań, idealny do placów i farm</div>
                </div>
                {roadType === 'seamless' && <span className="text-amber-400 text-xs font-mono">Aktywny</span>}
              </button>

              <button
                onClick={() => onChangeType('dirt')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  roadType === 'dirt'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 font-bold'
                    : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/60 text-stone-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">🌾 Wiejska Droga Ziemna</div>
                  <div className="text-[11px] text-stone-400">Trakt gruntowy z koleinami i żwirem dla wozów konnych</div>
                </div>
                {roadType === 'dirt' && <span className="text-amber-400 text-xs font-mono">Aktywny</span>}
              </button>
            </div>
          </div>

          {/* AKCJA WYBURZENIA */}
          <div className="pt-3 border-t border-stone-800">
            <button
              onClick={onDemolish}
              className="w-full py-2.5 px-4 bg-red-950/60 hover:bg-red-900 border border-red-700/60 hover:border-red-500 rounded-xl text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <span>🔨 Wyburz ten odcinek drogi</span>
              <span className="text-emerald-400 font-mono">(Zwrot +£{getRefund(roadType)})</span>
            </button>
          </div>
        </div>

        {/* STOPKA */}
        <div className="bg-stone-950/60 px-5 py-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
