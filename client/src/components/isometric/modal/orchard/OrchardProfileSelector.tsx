import React, { useState } from 'react';
import type { FruitType } from './orchardTypes';
import { FRUITS_CONFIG } from './orchardTypes';
import { ORCHARD_FRUIT_VEGETATION } from './orchardProgressMath';

interface OrchardProfileSelectorProps {
  onSelectFruit: (fruitType: FruitType) => void;
}

export const OrchardProfileSelector: React.FC<OrchardProfileSelectorProps> = ({
  onSelectFruit,
}) => {
  const [selectedFruit, setSelectedFruit] = useState<FruitType>('jablko');

  const fruitsList: FruitType[] = ['jablko', 'gruszka', 'sliwka', 'wisnia'];
  const activeCfg = FRUITS_CONFIG[selectedFruit];
  const activeVeg = ORCHARD_FRUIT_VEGETATION[selectedFruit];

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* NAGŁÓWEK WYBORU PROFILU */}
      <div className="p-4 bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border border-amber-500/60 rounded-2xl space-y-2 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-3xl p-2 bg-stone-950/90 rounded-2xl border border-amber-500/40">🌳</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Jednorazowe Uruchomienie Sadu • Epoka 1880
              </span>
            </div>
            <h3 className="text-base font-bold text-amber-100 mt-0.5">
              Wybierz Dożywotni Profil Sadowniczy
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed mt-1">
              Wybierz poniżej gatunek drzew owocowych, który zostanie nasadzony na tej parceli.{' '}
              <strong className="text-amber-300 underline">
                Uwaga: wybór jest ostateczny i dożywotni!
              </strong>{' '}
              Po zatwierdzeniu pozostałe gatunki znikną, a drzewa będą owocować przez pokolenia.
            </p>
          </div>
        </div>
      </div>

      {/* SIATKA 4 GATUNKÓW DRZEW OWOCOWYCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fruitsList.map((fKey) => {
          const info = FRUITS_CONFIG[fKey];
          const veg = ORCHARD_FRUIT_VEGETATION[fKey];
          const isSelected = selectedFruit === fKey;

          return (
            <div
              key={fKey}
              onClick={() => setSelectedFruit(fKey)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-lg ring-1 ring-amber-500/50'
                  : 'bg-stone-900/70 border-stone-800 hover:bg-stone-800/60 hover:border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">
                      {info.icon}
                    </span>
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                        {info.name}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Zbiory: {veg.harvestMonthName} (start wegetacji: 1 Marca)
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                      Wybrano
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
                  {info.desc}
                </p>
              </div>

              {/* STATYSTYKI GATUNKU */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-stone-800/80 text-[10px] font-mono text-stone-400">
                <div className="bg-stone-950/60 p-1.5 rounded-lg border border-stone-800 text-center">
                  <span className="block text-stone-500">Wydajność:</span>
                  <span className="font-bold text-amber-300">~{info.baseYield} kg/r</span>
                </div>
                <div className="bg-stone-950/60 p-1.5 rounded-lg border border-stone-800 text-center">
                  <span className="block text-stone-500">Cena targu:</span>
                  <span className="font-bold text-emerald-300">£ {info.marketPricePerTon}/t</span>
                </div>
                <div className="bg-stone-950/60 p-1.5 rounded-lg border border-stone-800 text-center">
                  <span className="block text-stone-500">Tłocznia:</span>
                  <span className="font-bold text-blue-300">{info.ciderYieldLitersPer100Kg} l/100kg</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PODSUMOWANIE I PRZYCISK ZATWIERDZENIA */}
      <div className="p-4 bg-stone-950/90 rounded-2xl border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{activeCfg.icon}</span>
          <div>
            <div className="text-xs text-stone-400 font-mono">
              Wybrany profil: <strong className="text-amber-200">{activeCfg.name}</strong>
            </div>
            <div className="text-[11px] text-stone-400 font-mono">
              Cykl wegetacji: <span className="text-amber-300">1 Marca</span> → Zbiory:{' '}
              <span className="text-emerald-300 font-bold">{activeVeg.harvestMonthName}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onSelectFruit(selectedFruit)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2"
        >
          <span>🔒</span>
          <span>Nasadź Sad i Zatwierdź Profil Dożywotnio</span>
        </button>
      </div>
    </div>
  );
};
