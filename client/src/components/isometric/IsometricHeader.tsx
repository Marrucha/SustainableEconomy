import React from 'react';

interface IsometricHeaderProps {
  gold: number;
}

export const IsometricHeader: React.FC<IsometricHeaderProps> = ({ gold }) => {
  return (
    <div className="absolute top-4 left-4 pointer-events-none bg-stone-900/95 border border-amber-600/50 rounded-2xl p-4 backdrop-blur-md shadow-2xl min-w-[280px] text-stone-200 z-30">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Skarbiec • Rok 1880
        </span>
        <span className="text-sm font-bold text-emerald-400 font-mono">
          £ {gold.toLocaleString('en-US')}
        </span>
      </div>
      <h2 className="text-lg font-bold font-serif text-amber-100 mt-2">
        Wiktoriański Plac Budowy
      </h2>
      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
        Wybierz kategorię i budynek z dolnego paska, aby wybudować.
      </p>

      <div className="mt-2 pt-2 border-t border-stone-800 text-[11px] text-stone-400 space-y-0.5">
        <p>🖱️ <span className="text-stone-200 font-semibold">Kliknięcie w element:</span> Zarządzanie, zmiana typu lub wyburzenie</p>
        <p>🔄 <span className="text-stone-200 font-semibold">Klawisz [R]:</span> Obrót budynku / kierunek drogi</p>
        <p>❌ <span className="text-stone-200 font-semibold">Klawisz [Esc]:</span> Anuluj stawianie lub zamknij okno</p>
        <p>🖱️ <span className="text-stone-200 font-semibold">Przeciągnij myszą:</span> Przesuwanie kamery</p>
      </div>
    </div>
  );
};
