import React, { useState } from 'react';
import type {
  LivestockCapitalismState,
  LivestockStorageBinsData,
} from './livestockTypes';
import { LIVESTOCK_PRODUCTS } from './livestockTypes';

interface LivestockStorageBinsProps {
  state: LivestockCapitalismState;
  onUpdateState: (patch: Partial<LivestockCapitalismState>) => void;
}

const MAX_BIN_CAPACITY = 1000;

export const LivestockStorageBins: React.FC<LivestockStorageBinsProps> = ({
  state,
  onUpdateState,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const storage = state.storage;
  const isSheep = state.activeSpecies === 'sheep';

  // Magazyn pokazuje komory wyłącznie dla 1 aktywnego gatunku zwierząt
  const productKeys: (keyof LivestockStorageBinsData)[] = isSheep
    ? ['woolKg', 'muttonKg', 'leatherPcs']
    : ['milkLiters', 'manureKg', 'beefKg', 'leatherPcs'];

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const supplies = state.supplies || { strawBeddingKg: 400, feedGrainKg: 350 };

  const handleBuyStraw = () => {
    const cost = 6;
    const amount = 100;
    onUpdateState({
      supplies: {
        ...supplies,
        strawBeddingKg: supplies.strawBeddingKg + amount,
      },
      lastCycleCost: (state.lastCycleCost || 0) + cost,
    });
    notify(`🌾 Zakupiono 100 kg słomy na ściółkę z fermy zbożowej (Koszt: £${cost})!`);
  };

  const handleBuyFeed = () => {
    const cost = 10;
    const amount = 100;
    onUpdateState({
      supplies: {
        ...supplies,
        feedGrainKg: supplies.feedGrainKg + amount,
      },
      lastCycleCost: (state.lastCycleCost || 0) + cost,
    });
    notify(`🌽 Zakupiono 100 kg paszy zbożowej z fermy zbożowej (Koszt: £${cost})!`);
  };

  const handleSellProduct = (key: keyof LivestockStorageBinsData) => {
    const prod = LIVESTOCK_PRODUCTS[key];
    const curVal = storage[key];

    if (curVal < prod.batchSize) {
      notify(`⚠️ Zbyt mało towaru do transportu wozem! Minimalna partia: ${prod.batchSize} ${prod.unit}.`);
      return;
    }

    const nextVal = curVal - prod.batchSize;
    const rev = prod.pricePerBatch;

    onUpdateState({
      storage: {
        ...storage,
        [key]: nextVal,
      },
      lastCycleRevenue: (state.lastCycleRevenue || 0) + rev,
    });

    notify(`💰 Handlarz sprzedał ${prod.batchSize} ${prod.unit} towaru (${prod.name}) za £${rev}!`);
  };

  return (
    <div className="space-y-5">
      {/* NAGŁÓWEK MAGAZYNU */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-2xl p-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span>🏛️</span> Magazyn Produktów – Komory Zasypowe ({isSheep ? 'Ferma Owiec 🐑' : 'Ferma Bydła Mlecznego 🐄'})
            </h3>
            <p className="text-xs text-amber-100/70 mt-1 leading-[2.5]">
              {isSheep
                ? 'Handlarz ekspediuje wełnę (2x w roku), baraninę oraz skóry owcze wozami konnymi na rynek miejski.'
                : 'Handlarz ekspediuje mleko codzienne, obornik z obory, wołowinę oraz skóry bydlęce na rynek miejski.'}
            </p>
          </div>
          <div className="bg-stone-950/80 border border-amber-800/50 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-amber-300/80 block uppercase tracking-wider font-mono">
              Sprzedaż prowadzi:
            </span>
            <span className="text-xs font-bold text-amber-100 flex items-center justify-center gap-1.5 mt-0.5">
              <span>💰</span> Kupiec / Handlarz Fermy
            </span>
          </div>
        </div>

        {feedback && (
          <div className="mt-3 bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs px-3.5 py-2 rounded-xl font-medium animate-fadeIn">
            {feedback}
          </div>
        )}
      </div>

      {/* SIATKA 6 KOMÓR MAGAZYNOWYCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productKeys.map((key, index) => {
          const prod = LIVESTOCK_PRODUCTS[key];
          const stock = storage[key];
          const fillPercent = Math.min(100, Math.round((stock / MAX_BIN_CAPACITY) * 100));
          const canSell = stock >= prod.batchSize;

          return (
            <div
              key={key}
              className="bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800 shadow-sm">
                    {prod.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-100">{prod.name}</h4>
                    <span className="text-[10px] text-stone-400 block font-mono">
                      Przegródka Magazynowa #{index + 1}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-[2.5] my-2">
                  {prod.desc}
                </p>

                {/* WSKAŹNIK WYPEŁNIENIA KOMORY */}
                <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-3">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                    <span className="text-stone-400 text-[11px]">Zapas w zasieku:</span>
                    <span className="font-bold text-amber-300">
                      {stock} {prod.unit} <span className="text-stone-500 font-normal">/ {MAX_BIN_CAPACITY} {prod.unit}</span>
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1.5 font-mono">
                    <span>Partia: {prod.batchSize} {prod.unit} (£{prod.pricePerBatch})</span>
                    <span>Wypełnienie: {fillPercent}%</span>
                  </div>
                </div>
              </div>

              {/* PRZYCISK SPRZEDAŻY PRZEZ HANDLARZA */}
              <div className="pt-2 border-t border-stone-800/60">
                <button
                  onClick={() => handleSellProduct(key)}
                  disabled={!canSell}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 leading-[2.5] ${
                    canSell
                      ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 cursor-pointer shadow-sm'
                      : 'bg-stone-900/40 text-stone-600 border border-stone-900 cursor-not-allowed'
                  }`}
                >
                  <span>💰 Sprzedaj {prod.batchSize} {prod.unit} za £{prod.pricePerBatch}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ZAOPATRZENIE FERMY: STÓG SŁOMY (ŚCIÓŁKA) ORAZ PASZA ZBOŻOWA */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="border-b border-stone-800/80 pb-2">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <span>🌾</span> Zaopatrzenie Hodowli (Niezbędna Ściółka i Pasza z Fermy Zbożowej)
          </h4>
          <p className="text-[11px] text-stone-400 leading-[2.5]">
            Do hodowli bydła i owiec niezbędna jest ściółka ze słomy (higiena i produkcja obornika) oraz pożywna pasza zbożowa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* STÓG SŁOMY - ŚCIÓŁKA */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-800/50 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🌾</span>
                <div>
                  <h5 className="text-xs font-bold text-amber-200">Stóg Słomy (Ściółka Oborowa)</h5>
                  <span className="text-[10px] text-stone-400 font-mono">Dostarczana z fermy zbożowej</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
                Niezbędna ściółka oborowa. W połączeniu z odchodami bydła mlecznego tworzy bogaty nawóz naturalny.
              </p>

              <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-2">
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-stone-400 text-[11px]">Zapas ściółki:</span>
                  <span className="font-bold text-amber-300">{supplies.strawBeddingKg} kg <span className="text-stone-500 font-normal">/ 1000 kg</span></span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((supplies.strawBeddingKg / 1000) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleBuyStraw}
              className="w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/50 transition-all cursor-pointer flex items-center justify-center gap-1.5 leading-[2.5]"
            >
              <span>🛒 Kup ściółkę ze słomy (100 kg za £6)</span>
            </button>
          </div>

          {/* ZASIEK PASZY ZBOŻOWEJ */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-800/50 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-2xl p-1.5 bg-stone-950 rounded-xl border border-stone-800">🌽</span>
                <div>
                  <h5 className="text-xs font-bold text-amber-200">Zasiek Paszy Zbożowej</h5>
                  <span className="text-[10px] text-stone-400 font-mono">Ziarno paszowe (owies, jęczmień)</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-300 leading-[2.5] my-2">
                Wysokoenergetyczna pasza polowa z fermy zbożowej, niezbędna do żywienia krów mlecznych i rosnących cieląt.
              </p>

              <div className="bg-stone-950/90 border border-stone-800/80 rounded-xl p-2.5 my-2">
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-stone-400 text-[11px]">Zapas paszy:</span>
                  <span className="font-bold text-amber-300">{supplies.feedGrainKg} kg <span className="text-stone-500 font-normal">/ 1000 kg</span></span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((supplies.feedGrainKg / 1000) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleBuyFeed}
              className="w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/50 transition-all cursor-pointer flex items-center justify-center gap-1.5 leading-[2.5]"
            >
              <span>🛒 Kup paszę zbożową (100 kg za £10)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
