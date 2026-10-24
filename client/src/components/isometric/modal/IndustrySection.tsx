import React from 'react';
import type { PlacedBuilding, BuildingState } from '../types';
import { BusinessEnergySection } from './BusinessEnergySection';

interface IndustrySectionProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  businessTab: 'production' | 'energy';
  hasGreenRelief: boolean;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const IndustrySection: React.FC<IndustrySectionProps> = ({
  building,
  buildingState,
  businessTab,
  hasGreenRelief,
  onUpdateState,
}) => {
  const isMill = building.typeId === 'mill';
  const isCoalPlant = building.typeId === 'coal_plant';
  const isSawmill = building.typeId === 'sawmill';
  const isSpinningMill = building.typeId === 'spinning_mill';
  const isSewingFactory = building.typeId === 'sewing_factory';
  const isBrewery = building.typeId === 'brewery';

  if (businessTab === 'energy') {
    return (
      <BusinessEnergySection
        businessTitle={building.name}
        energySource={buildingState.businessEnergySource || (isMill || isSawmill || isSpinningMill || isBrewery ? 'wegiel' : 'elektrownia')}
        energyScale={buildingState.businessEnergyScale || 'standard'}
        hasGreenRelief={hasGreenRelief}
        onUpdateState={onUpdateState}
      />
    );
  }

  // Zakładka 'production'
  if (isMill) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            ⚙️ Profil produkcji młyna
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'maka_pszenna', label: 'Mąka Pszenna', sub: 'Do piekarni i cukierni' },
              { id: 'maka_zytnia', label: 'Mąka Żytnia', sub: 'Chleb ciemny i zakwasy' },
              { id: 'kasza', label: 'Kasza i Otręby', sub: 'Trwały prowiant' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onUpdateState({ productionTarget: p.id as any })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  (buildingState.productionTarget || 'maka_pszenna') === p.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                }`}
              >
                <p className="font-bold text-xs">{p.label}</p>
                <p className="text-[10px] text-stone-400 mt-1">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isSawmill) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            🪚 Profil przetarcia tarcicy w tartaku
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tarcica_budowlana', label: 'Tarcica Budowlana', sub: 'Krokwie, belki i kantówki' },
              { id: 'deski_stolarskie', label: 'Deski Stolarskie', sub: 'Drewno meblowe i podłogi' },
              { id: 'podklady_kolejowe', label: 'Podkłady Kolejowe', sub: 'Impregnowana dłużyca pod tory' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onUpdateState({ productionTarget: p.id as any })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  (buildingState.productionTarget || 'tarcica_budowlana') === p.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                }`}
              >
                <p className="font-bold text-xs">{p.label}</p>
                <p className="text-[10px] text-stone-400 mt-1">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Zużycie drewna (z wyrębu leśnego):</span>
            <span className="font-mono font-bold text-amber-300">-120 kg okrąglaków / cykl</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Produkcja gotowej tarcicy:</span>
            <span className="font-mono font-bold text-emerald-400">+85 m² desek / cykl</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-800/60 pt-2">
            Żeliwny trak parowy z 1880 r. rozcina kłody dębowe i sosnowe sprowadzane traktem wiejskim z Wyrębu Drewna na gotowe materiały budowlane dla miejskich kamienic.
          </p>
        </div>
      </div>
    );
  }

  if (isSpinningMill) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            🧵 Profil produkcji przędzalni parowej
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'przedza_lniana', label: 'Przędza Lniana', sub: 'Z włókna z Plantacji Lnu' },
              { id: 'przedza_welniana', label: 'Przędza Wełniana', sub: 'Z runa z Pastwiska Owiec' },
              { id: 'nici_szwalnicze', label: 'Szpule Nici Szwalniczych', sub: 'Do maszyn szwalniczych' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onUpdateState({ productionTarget: p.id as any })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  (buildingState.productionTarget || 'przedza_lniana') === p.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                }`}
              >
                <p className="font-bold text-xs">{p.label}</p>
                <p className="text-[10px] text-stone-400 mt-1">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Zużycie surowca naturalnego:</span>
            <span className="font-mono font-bold text-amber-300">-100 kg włókna lub wełny / cykl</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Produkcja gotowej przędzy:</span>
            <span className="font-mono font-bold text-emerald-400">+90 szpul przędzy / cykl</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-800/60 pt-2">
            Wiktoriańska mechaniczna przędzalnia parowa (self-acting mule) z 1880 r. przetwarza czesane włókna lniane i wełniane na przędzę dla miejskich manufaktur tkackich i szwalni.
          </p>
        </div>
      </div>
    );
  }

  if (isSewingFactory) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            ✂️ Profil szwalni i manufaktury odzieżowej
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'odziez_robotnicza', label: 'Odzież Robocza', sub: 'Trwałe koszule i spodnie' },
              { id: 'ubrania_mieszczanskie', label: 'Garnitury Mieszczańskie', sub: 'Eleganckie stroje i suknie' },
              { id: 'mundury_plaszcze', label: 'Mundury i Płaszcze', sub: 'Ciepłe sukno i tweed' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onUpdateState({ productionTarget: p.id as any })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  (buildingState.productionTarget || 'odziez_robotnicza') === p.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                }`}
              >
                <p className="font-bold text-xs">{p.label}</p>
                <p className="text-[10px] text-stone-400 mt-1">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Zużycie tkanin i nici:</span>
            <span className="font-mono font-bold text-amber-300">-60 szpul przędzy / cykl</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Produkcja gotowej odzieży:</span>
            <span className="font-mono font-bold text-emerald-400">+45 kompletów ubrań / cykl</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-800/60 pt-2">
            Manufaktura krawiecka z zębatym świetlikiem dachowym szyje odzież dla mieszkańców robotniczych i mieszczańskich kamienic, zaspokajając popyt miejski.
          </p>
        </div>
      </div>
    );
  }

  if (isBrewery) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            🍺 Profil warzenia wiktoriańskiego browaru
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pale_ale', label: 'English Pale Ale', sub: 'Chmiel Golding i słód jasny' },
              { id: 'porter_stout', label: 'London Porter & Stout', sub: 'Palony słód i chmiel Fuggle' },
              { id: 'green_hop', label: 'Green Hop Ale', sub: 'Świeże zielone szyszki' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onUpdateState({ productionTarget: p.id as any })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  (buildingState.productionTarget || 'pale_ale') === p.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                }`}
              >
                <p className="font-bold text-xs">{p.label}</p>
                <p className="text-[10px] text-stone-400 mt-1">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Zużycie chmielu i słodu:</span>
            <span className="font-mono font-bold text-amber-300">-30 kg szyszek + 150 kg słodu / cykl</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Produkcja piwa beczkowego:</span>
            <span className="font-mono font-bold text-emerald-400">+60 beczek Ale / cykl</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-800/60 pt-2">
            Miedziane kadzie warzelne z 1880 r. zacierają słód jęczmienny z szyszkami chmielu z Farmy Chmielu, dostarczając tradycyjne angielskie piwo do tawern i kamienic.
          </p>
        </div>
      </div>
    );
  }

  if (isCoalPlant) {
    return (
      <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase font-mono text-amber-400 font-semibold">Generacja Mocy:</span>
          <span className="font-mono text-base font-bold text-emerald-400">+350 kWh / cykl</span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          Elektrociepłownia zasila miejską sieć energetyczną dla fabryk i dostarcza parę technologiczną do kamienic wzdłuż nabrzeża.
        </p>
      </div>
    );
  }

  // Domyślny widok dla pozostałych zakładów (Piekarnia, Kuźnia, etc.)
  return (
    <div className="p-4 bg-stone-800/40 rounded-xl border border-stone-800 flex items-center justify-between">
      <div>
        <span className="text-xs font-bold text-amber-200">Przedsiębiorstwo Komercyjne / Przemysłowe</span>
        <p className="text-[11px] text-stone-400">Zakład wymaga stałego zasilania napędu do maszyn i urządzeń.</p>
      </div>
      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
        Biznes Aktywny
      </span>
    </div>
  );
};
