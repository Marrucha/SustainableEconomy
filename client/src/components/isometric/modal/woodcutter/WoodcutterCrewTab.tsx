import React from 'react';
import type { WoodcutterCrewStaff } from './woodcutterTypes';

interface WoodcutterCrewTabProps {
  crew: WoodcutterCrewStaff;
  onUpdateCrew: (newCrew: WoodcutterCrewStaff) => void;
}

export const WoodcutterCrewTab: React.FC<WoodcutterCrewTabProps> = ({
  crew,
  onUpdateCrew,
}) => {
  return (
    <div className="space-y-4 select-none">
      <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-amber-200 uppercase font-mono">
            Obsada Obozu Drwali i Zrywki Konnej (1880 r.)
          </h3>
          <p className="text-[11px] text-stone-400">
            Przypisanie wykwalifikowanej załogi do 4 etapów cyklu zrębu drewna
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. LEŚNIK (KROK 1: INWENTARYZACJA) */}
        <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🌲</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-200">Królewski Leśnik</h4>
                <span className="text-[10px] font-mono text-stone-400 block">Krok 1: Inwentaryzacja (Listopad)</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateCrew({ ...crew, foresterHired: !crew.foresterHired })}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                crew.foresterHired ? 'bg-emerald-600 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {crew.foresterHired ? 'Zatrudniony' : 'Zatrudnij'}
            </button>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Odpowiada za pomiar miąższości drzewostanu, wyznaczanie zrębów i cechowanie pni.
          </p>
        </div>

        {/* 2. DRWALE (KROK 2: WYRĘB) */}
        <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🪓</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-200">Drwale Ścinkowi</h4>
                <span className="text-[10px] font-mono text-stone-400 block">Krok 2: Wyręb (Grudzień – Styczeń)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateCrew({ ...crew, lumberjackCount: Math.max(1, crew.lumberjackCount - 1) })}
                className="w-6 h-6 bg-stone-800 hover:bg-stone-700 text-white rounded font-bold cursor-pointer"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs text-amber-300 px-1">{crew.lumberjackCount}</span>
              <button
                onClick={() => onUpdateCrew({ ...crew, lumberjackCount: Math.min(6, crew.lumberjackCount + 1) })}
                className="w-6 h-6 bg-stone-800 hover:bg-stone-700 text-white rounded font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Zimowa ścinka dorodnych pni piłami dwuręcznymi i siekierami w okresie bezsokowym.
          </p>
        </div>

        {/* 3. WOŹNICA I KONIE (KROK 3: ZWÓZKA) */}
        <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🐎</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-200">Woźnica i Konie Zrywkowe</h4>
                <span className="text-[10px] font-mono text-stone-400 block">Krok 3: Zwózka (Luty)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateCrew({ ...crew, horsesCount: Math.max(0, crew.horsesCount - 1) })}
                className="w-6 h-6 bg-stone-800 hover:bg-stone-700 text-white rounded font-bold cursor-pointer"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs text-amber-300 px-1">{crew.horsesCount} k.</span>
              <button
                onClick={() => onUpdateCrew({ ...crew, horsesCount: Math.min(8, crew.horsesCount + 1) })}
                className="w-6 h-6 bg-stone-800 hover:bg-stone-700 text-white rounded font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Zrywka dłużycy ciężkimi wozami kłonicowymi ze zrębu na składnicę przy drodze.
          </p>
        </div>

        {/* 4. OCHRONIARZ (KROK 4: SUSZENIE) */}
        <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🛡️</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-200">Ochroniarz i Dozorca Składu</h4>
                <span className="text-[10px] font-mono text-stone-400 block">Krok 4: Suszenie (Marzec – Październik)</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateCrew({ ...crew, guardHired: !crew.guardHired })}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                crew.guardHired ? 'bg-emerald-600 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {crew.guardHired ? 'Zatrudniony' : 'Zatrudnij'}
            </button>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Dozór nad przewiewnymi sztaplami drewna w trakcie 8-miesięcznego sezonowania.
          </p>
        </div>
      </div>
    </div>
  );
};
