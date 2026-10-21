import React, { useState } from 'react';
import type { PlacedBuilding, BuildingState, BusinessEnergySource, BusinessEnergyScale } from './types';

const ENERGY_SOURCES_INFO: Record<
  BusinessEnergySource,
  {
    category: 'grid' | 'fuel';
    name: string;
    fuelName: string;
    icon: string;
    badge: string;
    baseCost: number; // £/msc
    baseEfficiency: number; // %
    emissionLabel: string;
    emissionBadgeColor: string;
    hasChimneyTax: boolean;
    logistics: string;
    description: string;
  }
> = {
  elektrownia: {
    category: 'grid',
    name: 'Zakup z Elektrowni Miejskiej',
    fuelName: 'Energia z sieci miejskiej (Grid)',
    icon: '⚡',
    badge: 'Centralna Sieć',
    baseCost: 16.0,
    baseEfficiency: 22,
    emissionLabel: 'Czysta na działce (0 dymu)',
    emissionBadgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    hasChimneyTax: false,
    logistics: 'Ciągły przesył miejską siecią kablowo-parową',
    description: 'Bezpośredni zakup energii z miejskiej elektrociepłowni. Brak lokalnego komina i zero opłat za dym.',
  },
  drewno: {
    category: 'fuel',
    name: 'Własna Produkcja: Drewno',
    fuelName: 'Drewno opałowe i polana tarcicy',
    icon: '🪵',
    badge: 'Biomasa Odnawialna',
    baseCost: 7.5,
    baseEfficiency: 8,
    emissionLabel: 'Niska (Dym drzewny)',
    emissionBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    hasChimneyTax: false,
    logistics: 'Dostawa 1.8t drewna wozem konnym / msc',
    description: 'Lokalne palenisko na drewno. Tani surowiec odnawialny, umiarkowany dym drzewny bez czarnej sadzy węglowej.',
  },
  wegiel: {
    category: 'fuel',
    name: 'Własna Produkcja: Węgiel',
    fuelName: 'Węgiel kamienny ze składu opałowego',
    icon: '🪨',
    badge: 'Standard 1880 r.',
    baseCost: 11.5,
    baseEfficiency: 26,
    emissionLabel: 'Wysoka (Sadza & Smog)',
    emissionBadgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    hasChimneyTax: true,
    logistics: 'Dostawa 2.4t węgla wozem skrzyniowym / msc',
    description: 'Wysokokaloryczny kocioł parowy. Potężne ciśnienie maszyn, lecz wymaga komina dymowego (+£5/msc opłaty od sadzy).',
  },
  gaz: {
    category: 'fuel',
    name: 'Własna Produkcja: Gaz',
    fuelName: 'Gaz przemysłowy / koksowniczy',
    icon: '🔥',
    badge: 'Nowoczesny Palnik',
    baseCost: 19.0,
    baseEfficiency: 32,
    emissionLabel: 'Minimalna (Bezsadzowa)',
    emissionBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    hasChimneyTax: false,
    logistics: 'Stałe zasilanie miejskim rurociągiem gazowym',
    description: 'Przemysłowe palniki retortowe na gaz. Czysty błękitny płomień bez popiołu, stabilna temperatura i wysoka kultura pracy.',
  },
  wodor: {
    category: 'fuel',
    name: 'Własna Produkcja: Wodór (H₂)',
    fuelName: 'Skompresowany czysty wodór',
    icon: '💧',
    badge: 'Zielona Przyszłość',
    baseCost: 35.0,
    baseEfficiency: 45,
    emissionLabel: 'Zeroemisyjna (Para H₂O)',
    emissionBadgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    hasChimneyTax: false,
    logistics: 'Dostawa butli ciśnieniowych z wodorem',
    description: 'Nowatorski generator wodorowy przyszłości. Zero zanieczyszczeń, najwyższa sprawność napędu, kwalifikacja do Ulgi Eko.',
  },
};

const SCALE_CONFIG: Record<
  BusinessEnergyScale,
  { label: string; multiplier: number; effMultiplier: number; sub: string }
> = {
  eco: {
    label: 'Ekonomiczny (65%)',
    multiplier: 0.65,
    effMultiplier: 0.70,
    sub: 'Oszczędność paliwa i niższy rachunek',
  },
  standard: {
    label: 'Standardowy (100%)',
    multiplier: 1.0,
    effMultiplier: 1.0,
    sub: 'Nominalna moc i optymalna wydajność',
  },
  turbo: {
    label: 'Maksymalny / Turbo (135%)',
    multiplier: 1.35,
    effMultiplier: 1.35,
    sub: 'Forsowanie linii dla maksymalnego zysku',
  },
};

interface BusinessEnergySectionProps {
  businessTitle: string;
  energySource: BusinessEnergySource;
  energyScale: BusinessEnergyScale;
  hasGreenRelief: boolean;
  onUpdateState: (newState: Partial<BuildingState>) => void;
}

const BusinessEnergySection: React.FC<BusinessEnergySectionProps> = ({
  businessTitle,
  energySource,
  energyScale,
  hasGreenRelief,
  onUpdateState,
}) => {
  const currentSource = ENERGY_SOURCES_INFO[energySource] || ENERGY_SOURCES_INFO.drewno;
  const currentScale = SCALE_CONFIG[energyScale] || SCALE_CONFIG.standard;

  const finalCost = (currentSource.baseCost * currentScale.multiplier).toFixed(2);
  const finalEfficiency = Math.round(currentSource.baseEfficiency * currentScale.effMultiplier);

  return (
    <div className="bg-stone-850/80 p-4 rounded-2xl border border-stone-700/60 space-y-4">
      {/* NAGŁÓWEK SEKCJI */}
      <div className="flex items-start justify-between border-b border-stone-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              ⚡ Zaopatrzenie w Energię do Produkcji
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-stone-800 text-stone-300 border border-stone-700">
              {businessTitle}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Każdy biznes może zamówić energię z miejskiej elektrowni lub zakupić surowiec (drewno, węgiel, gaz, wodór) do własnej produkcji.
          </p>
        </div>
      </div>

      {/* 1. ZAKUP Z ELEKTROWNI MIEJSKIEJ (SIECI) */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold block mb-1.5">
          1. Zasilanie z Sieci Komunalnej:
        </span>
        <button
          type="button"
          onClick={() => onUpdateState({ businessEnergySource: 'elektrownia' })}
          className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            energySource === 'elektrownia'
              ? 'bg-sky-950/40 border-sky-400 shadow-md ring-1 ring-sky-400/50'
              : 'bg-stone-800/60 border-stone-700/60 hover:bg-stone-800 text-stone-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-lg bg-sky-900/40 border border-sky-500/30">⚡</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-sky-100">Zakup z Elektrowni Miejskiej</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Centralna Sieć
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Bezpośredni przesył kablowo-parowy z miejskiej elektrociepłowni • Zero kominów na parceli
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <span className="font-mono text-xs font-bold text-sky-300 block">
              £ {ENERGY_SOURCES_INFO.elektrownia.baseCost.toFixed(2)} / msc
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono">
              +{ENERGY_SOURCES_INFO.elektrownia.baseEfficiency}% tempo
            </span>
          </div>
        </button>
      </div>

      {/* 2. WŁASNA PRODUKCJA (PALIWO) */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold block mb-1.5">
          2. Własna Produkcja z Zakupionego Paliwa:
        </span>
        <div className="grid grid-cols-2 gap-2">
          {(['drewno', 'wegiel', 'gaz', 'wodor'] as BusinessEnergySource[]).map((srcKey) => {
            const opt = ENERGY_SOURCES_INFO[srcKey];
            const isSelected = energySource === srcKey;
            return (
              <button
                key={srcKey}
                type="button"
                onClick={() => onUpdateState({ businessEnergySource: srcKey })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-stone-800/60 border-stone-700/60 hover:bg-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{opt.icon}</span>
                  <span className="font-mono text-[11px] font-bold text-amber-300">
                    £ {opt.baseCost.toFixed(2)} / msc
                  </span>
                </div>
                <p className="font-bold text-xs mt-1 text-stone-200">{opt.name.replace('Własna Produkcja: ', '')}</p>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-stone-400 truncate max-w-[110px]">{opt.fuelName.split(' ')[0]}</span>
                  <span className="font-mono font-semibold text-emerald-400">+{opt.baseEfficiency}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SKALA ZAMÓWIENIA MOCY */}
      <div className="pt-2 border-t border-stone-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Skala Zamówienia i Intensywność Napędu:
          </span>
          <span className="text-[11px] font-mono text-amber-300 font-bold">
            {currentScale.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['eco', 'standard', 'turbo'] as BusinessEnergyScale[]).map((scaleKey) => {
            const sc = SCALE_CONFIG[scaleKey];
            const isSelected = (energyScale || 'standard') === scaleKey;
            return (
              <button
                key={scaleKey}
                type="button"
                onClick={() => onUpdateState({ businessEnergyScale: scaleKey })}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600/30 border-amber-400 text-amber-100 font-bold'
                    : 'bg-stone-800/50 border-stone-700/50 text-stone-400 hover:text-stone-200'
                }`}
              >
                <p className="text-xs font-semibold">{sc.label.split(' ')[0]}</p>
                <p className="text-[9px] text-stone-400 mt-0.5 font-mono">{sc.label.split(' ')[1]}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PODSUMOWANIE KONTRAKTU I EFEKTÓW */}
      <div className="p-3.5 bg-stone-900/90 rounded-xl border border-stone-700/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentSource.icon}</span>
            <div>
              <span className="font-bold text-xs text-stone-100 block">{currentSource.name}</span>
              <span className="text-[10px] text-stone-400">{currentSource.fuelName}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">Koszt kontraktu</span>
            <span className="font-mono text-base font-bold text-emerald-400">£ {finalCost} / msc</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-[11px]">
          <div className="bg-stone-800/40 p-2 rounded-lg border border-stone-800">
            <span className="text-stone-400 block text-[10px]">Wydajność produkcji:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">+{finalEfficiency}% tempa pracy</span>
          </div>
          <div className="bg-stone-800/40 p-2 rounded-lg border border-stone-800">
            <span className="text-stone-400 block text-[10px]">Emisje i czystość:</span>
            <span className={`inline-block font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border mt-0.5 ${currentSource.emissionBadgeColor}`}>
              {currentSource.emissionLabel}
            </span>
          </div>
        </div>

        {/* STATUS OPŁATY KOMINOWEJ Z RATUSZA */}
        <div className="text-[10px] rounded-lg p-2 bg-stone-950/60 border border-stone-800/80">
          {currentSource.hasChimneyTax ? (
            hasGreenRelief ? (
              <div className="text-emerald-400 flex items-center gap-1.5">
                <span>🌿</span>
                <span><strong>Zwolnienie z opłaty kominowej:</strong> Aktywny miejski Certyfikat Ekologiczny z Ratusza (£0 zamiast £5/msc).</span>
              </div>
            ) : (
              <div className="text-amber-300 flex items-center gap-1.5">
                <span>⚠️</span>
                <span><strong>Opłata kominowa z 1880 r.:</strong> Piec generuje sadzę (+£ 5.00/msc podatku miejskiego). Złóż wniosek w Ratuszu o ulgę eko.</span>
              </div>
            )
          ) : (
            <div className="text-sky-300 flex items-center gap-1.5">
              <span>✓</span>
              <span><strong>Czysta technologia:</strong> Brak lokalnej emisji czarnej sadzy. Zwolnienie z wiktoriańskiej opłaty kominowej.</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800/60 font-mono">
          <span>🚚 Logistyka: {currentSource.logistics}</span>
        </div>
      </div>
    </div>
  );
};

interface BuildingModalProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  onUpdateState: (newState: Partial<BuildingState>) => void;
  onClose: () => void;
  onDemolish: () => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  building,
  buildingState,
  onUpdateState,
  onClose,
  onDemolish,
}) => {
  const isFarm = building.typeId === 'wheat_farm';
  const isResidential = building.typeId.startsWith('tenement');
  const isMill = building.typeId === 'mill';
  const isCoalPlant = building.typeId === 'coal_plant';
  const isTownHall = building.typeId === 'town_hall';
  const isPark = building.typeId === 'oak';
  const isBusiness = isFarm || isMill || (!isResidential && !isTownHall && !isPark && !isCoalPlant);

  const [townHallTab, setTownHallTab] = useState<'decrees' | 'taxes' | 'reliefs'>('decrees');
  const [businessTab, setBusinessTab] = useState<'production' | 'energy'>('production');
  const [residentialTab, setResidentialTab] = useState<'rent' | 'energy'>('rent');

  const activeReliefs = buildingState.appliedTaxReliefs || {};
  const activeReliefsCount = Object.values(activeReliefs).filter(Boolean).length;

  const toggleRelief = (reliefId: string) => {
    onUpdateState({
      appliedTaxReliefs: {
        ...activeReliefs,
        [reliefId]: !activeReliefs[reliefId],
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className={`relative w-full ${isTownHall ? 'max-w-4xl' : (isBusiness ? 'max-w-2xl' : 'max-w-xl')} bg-stone-900/95 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-stone-200 font-sans max-h-[88vh] flex flex-col transition-all duration-200`}>
        {/* NAGŁÓWEK */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Epoka 1 • Rok 1880
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Działka: {building.sizeX}x{building.sizeY} kratek
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-amber-100 mt-1">
              {building.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ZAKŁADKI DLA BIZNESU (ZARZĄDZANIE / ZAKUP ENERGII) - WYRAŹNIE ODDZIELONE OD TREŚCI */}
        {isBusiness && (
          <div className="mt-3 mb-1 flex-shrink-0">
            <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner flex gap-2">
              <button
                onClick={() => setBusinessTab('production')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  businessTab === 'production'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">{isFarm ? '🌾' : '⚙️'}</span>
                <span className="tracking-wide">{isFarm ? 'Uprawa i Załoga' : 'Profil Produkcji'}</span>
              </button>

              <button
                onClick={() => setBusinessTab('energy')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  businessTab === 'energy'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">⚡</span>
                <span className="tracking-wide">Zakup Energii do Produkcji</span>
              </button>
            </div>
            {/* LINIA ODDZIELAJĄCA ZAKŁADKI OD TREŚCI */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-3 mb-1" />
          </div>
        )}

        {/* ZAKŁADKI DLA KAMIENIC (NAJEM / OGRZEWANIE I ENERGIA) - WYRAŹNIE ODDZIELONE OD TREŚCI */}
        {isResidential && (
          <div className="mt-3 mb-1 flex-shrink-0">
            <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner flex gap-2">
              <button
                onClick={() => setResidentialTab('rent')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  residentialTab === 'rent'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">🪙</span>
                <span className="tracking-wide">Czynsz i Standard</span>
              </button>

              <button
                onClick={() => setResidentialTab('energy')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                  residentialTab === 'energy'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span className="text-lg">🔥</span>
                <span className="tracking-wide">Ogrzewanie i Energia</span>
              </button>
            </div>
            {/* LINIA ODDZIELAJĄCA ZAKŁADKI OD TREŚCI */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-3 mb-1" />
          </div>
        )}

        {/* ZAWARTOŚĆ SPECYFICZNA DLA TYPU BUDYNKU */}
        <div className="py-4 space-y-5 text-sm overflow-y-auto flex-1 pr-1">
          {/* ========================================= */}
          {/* 1. FARMA ZBOŻOWA                          */}
          {/* ========================================= */}
          {isFarm && (
            <div className="space-y-5">
              {businessTab === 'production' ? (
                <>
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
                          {buildingState.workersCount ?? 12} ludzi
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="24"
                        step="1"
                        value={buildingState.workersCount ?? 12}
                        onChange={(e) => onUpdateState({ workersCount: parseInt(e.target.value, 10) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-400">Stawka dzienna robotnika:</span>
                        <span className="font-mono text-xs font-bold text-amber-300">
                          £ {(buildingState.workerWage ?? 2.5).toFixed(1)} / dzień
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="6.0"
                        step="0.5"
                        value={buildingState.workerWage ?? 2.5}
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
                          {buildingState.managersCount ?? 1} zarządca
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={buildingState.managersCount ?? 1}
                        onChange={(e) => onUpdateState({ managersCount: parseInt(e.target.value, 10) })}
                        className="w-full accent-sky-500 cursor-pointer"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-stone-400">Płaca dzienna zarządcy:</span>
                        <span className="font-mono text-xs font-bold text-sky-300">
                          £ {(buildingState.managerWage ?? 7.5).toFixed(1)} / dzień
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="16.0"
                        step="0.5"
                        value={buildingState.managerWage ?? 7.5}
                        onChange={(e) => onUpdateState({ managerWage: parseFloat(e.target.value) })}
                        className="w-full accent-sky-500 cursor-pointer"
                      />

                      {/* WSKAŹNIK EFEKTYWNOŚCI NADZORU */}
                      <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-700/60 text-[11px] space-y-1.5">
                        {((buildingState.managersCount ?? 1) === 0) && (
                          <div className="text-amber-400 flex items-center gap-1.5">
                            <span>⚠️</span>
                            <span><strong>Brak zarządcy:</strong> Niska dyscyplina załogi, straty ziarna -20%, spadek tempa żniw.</span>
                          </div>
                        )}
                        {((buildingState.managersCount ?? 1) === 1) && (
                          <div className="text-emerald-400 flex items-center gap-1.5">
                            <span>✓</span>
                            <span><strong>Nadzór optymalny:</strong> 1 zarządca na {buildingState.workersCount ?? 12} robotników. +15% wydajności załogi, -10% strat.</span>
                          </div>
                        )}
                        {((buildingState.managersCount ?? 1) >= 2) && (
                          <div className="text-sky-300 flex items-center gap-1.5">
                            <span>🌟</span>
                            <span><strong>Wzorcowa agrotechnika:</strong> Podwójny nadzór agronomiczny. +25% plonów, selekcja najlepszych nasion siewnych.</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-stone-400 text-[10px] font-mono">
                          <span>
                            Fundusz płac: £ {((buildingState.workersCount ?? 12) * (buildingState.workerWage ?? 2.5) + (buildingState.managersCount ?? 1) * (buildingState.managerWage ?? 7.5)).toFixed(1)} / dzień
                          </span>
                          <span className="text-amber-300 font-bold">
                            £ {Math.round(((buildingState.workersCount ?? 12) * (buildingState.workerWage ?? 2.5) + (buildingState.managersCount ?? 1) * (buildingState.managerWage ?? 7.5)) * 30)} / msc
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ZAKŁADKA 2: ZAKUP ENERGII DO PRODUKCJI */
                <BusinessEnergySection
                  businessTitle="Farma Zbożowa"
                  energySource={buildingState.businessEnergySource || 'drewno'}
                  energyScale={buildingState.businessEnergyScale || 'standard'}
                  hasGreenRelief={Boolean(activeReliefs['green_ecology'])}
                  onUpdateState={onUpdateState}
                />
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* 2. KAMIENICE MIESZKANIOWE                 */}
          {/* ========================================= */}
          {isResidential && (
            <div className="space-y-5">
              {residentialTab === 'rent' ? (
                <>
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
                        £ {buildingState.rentPerApartment ?? 18} / msc
                      </span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="45"
                      step="1"
                      value={buildingState.rentPerApartment ?? 18}
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
                </>
              ) : (
                /* ZAKŁADKA 2: OGRZEWANIE I ENERGIA */
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
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* 3. MŁYN PAROWY I ELEKTROCIEPŁOWNIA        */}
          {/* ========================================= */}
          {isMill && (
            <div className="space-y-4">
              {businessTab === 'production' ? (
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
              ) : (
                /* ZAKŁADKA 2: ZAKUP ENERGII DO NAPĘDU MŁYNA */
                <BusinessEnergySection
                  businessTitle="Młyn Parowy"
                  energySource={buildingState.businessEnergySource || 'wegiel'}
                  energyScale={buildingState.businessEnergyScale || 'standard'}
                  hasGreenRelief={Boolean(activeReliefs['green_ecology'])}
                  onUpdateState={onUpdateState}
                />
              )}
            </div>
          )}

          {isCoalPlant && (
            <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-mono text-amber-400 font-semibold">Generacja Mocy:</span>
                <span className="font-mono text-base font-bold text-emerald-400">+350 kWh / cykl</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Elektrociepłownia zasila miejską sieć energetyczną dla fabryk i dostarcza parę technologiczną do kamienic wzdłuż nabrzeża.
              </p>
            </div>
          )}

          {isTownHall && (
            <div className="space-y-4">
              {/* 3 CZYTELNE PODSTRONY RATUSZA (POWIĘKSZONA CZCIONKA I WYRAŹNE ODDZIELENIE) */}
              <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner flex gap-2">
                <button
                  onClick={() => setTownHallTab('decrees')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    townHallTab === 'decrees'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <span className="text-base">📜</span>
                  <span>1. Uchwały</span>
                </button>

                <button
                  onClick={() => setTownHallTab('taxes')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    townHallTab === 'taxes'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <span className="text-base">💰</span>
                  <span>2. Podatki</span>
                </button>

                <button
                  onClick={() => setTownHallTab('reliefs')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    townHallTab === 'reliefs'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <span className="text-base">✍️</span>
                  <span>3. Moje wnioski</span>
                  {activeReliefsCount > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-mono font-bold">
                      {activeReliefsCount}
                    </span>
                  )}
                </button>
              </div>
              {/* LINIA ODDZIELAJĄCA ZAKŁADKI OD TREŚCI */}
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-2 mb-2" />

              {/* PODSTRONA 1: UCHWAŁY RADY MIEJSKIEJ */}
              {townHallTab === 'decrees' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
                    <span className="text-lg">🏛️</span>
                    <div>
                      <span className="font-serif font-bold text-amber-200 text-xs uppercase tracking-wider">
                        Rejestr Aktów Prawnych i Uchwał Magistratu
                      </span>
                      <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                        Akty prawa miejscowego stanowione przez Radę Miasta. Regulują zasady użytkowania gruntów, normy sanitarne oraz przyszłe reformy gospodarcze.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* UCHWAŁA 1 */}
                    <div className="p-3 bg-stone-800/40 border border-stone-700/60 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-100">
                          📜 Uchwała Katastralna z 1878 r. (Podatek Gruntowy)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          OBOWIĄZUJĄCA
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        Wszelkie parcele i działki miejskie podlegają ewidencji katastralnej. Opłata gruntowa jest stała i naliczana od zajmowanej powierzchni (kratek). Dochody z katastru finansują brukowanie traktów, budowę nabrzeży i latarnie gazowe.
                      </p>
                    </div>

                    {/* UCHWAŁA 2 */}
                    <div className="p-3 bg-stone-800/40 border border-stone-700/60 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-100">
                          🌫️ Wiktoriańska Uchwała o Sadzy Kominowej (1880)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          OBOWIĄZUJĄCA
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        Wprowadza stałą opłatę £ 5.00 za każdy dymiący komin kotłowni i fabryk w rejonie zabudowy mieszkaniowej. Uchwała przeciwdziała londyńskiemu smogowi węglowemu (tzw. pea-souper).
                      </p>
                    </div>

                    {/* UCHWAŁA 3 */}
                    <div className="p-3 bg-stone-800/40 border border-stone-700/60 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-100">
                          🌾 Uchwała o Bezpieczeństwie Aprowizacyjnym Miasta
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          OBOWIĄZUJĄCA
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        Zapewnia stabilne zaopatrzenie w mąkę i pieczywo poprzez ulgowe opodatkowanie rolnictwa (6.0%) oraz gwarantuje prawo do pełnego zwolnienia ze sprzedaży hurtowej ziarna.
                      </p>
                    </div>

                    {/* UCHWAŁA 4 (PRZYSZŁOŚĆ CO2) */}
                    <div className="p-3 bg-stone-800/20 border border-stone-800 rounded-xl space-y-1 opacity-80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-400">
                          🌱 Projekt: Podatek od Emisji CO2 i Czystego Powietrza
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-700 text-stone-400 border border-stone-600 font-bold">
                          PÓŹNIEJSZY OKRES
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        W 1880 r. zjawisko gazów cieplarnianych nie jest jeszcze przedmiotem ustawodawstwa. W późniejszych epokach Rada Miasta wdroży opłatę za tonę emitowanego CO2 oraz normy pyłowe PM2.5.
                      </p>
                    </div>

                    {/* UCHWAŁA 5 (PRZYSZŁOŚĆ VAT) */}
                    <div className="p-3 bg-stone-800/20 border border-stone-800 rounded-xl space-y-1 opacity-80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-400">
                          🪙 Projekt: Reforma Podatku od Wartości Dodanej (VAT)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-700 text-stone-400 border border-stone-600 font-bold">
                          PÓŹNIEJSZY OKRES
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Nowoczesna harmonizacja podatku od sprzedaży. W XX wieku archaiczny wiktoriański podatek obrotowy zostanie zastąpiony powszechnym podatkiem VAT.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PODSTRONA 2: POZIOM BAZOWY PODATKÓW DLA TEGO MIASTA */}
              {townHallTab === 'taxes' && (
                <div className="space-y-4 animate-fade-in">
                  {/* BANNER INFORMACYJNY */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                    <span className="text-xl">⚖️</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-amber-200 text-xs uppercase tracking-wider">
                          Taryfikator Skarbowy • Poziom Bazowy Miasta
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Nienaruszalny (Rada Miasta)
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                        Poniższe taryfy podatkowe stanowią nienaruszalny poziom bazowy uchwalony przez Radę Miasta dla całego obszaru metropolitalnego. Gracz nie ustala ich samodzielnie.
                      </p>
                    </div>
                  </div>

                  {/* 1. KARTA GŁÓWNA: PODATEK GRUNTOWY */}
                  <div className="p-4 bg-stone-800/60 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📐</span>
                        <h4 className="font-bold text-stone-100 text-sm uppercase tracking-wide">
                          Podatek Gruntowy od Parceli i Nieruchomości
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed max-w-xl">
                        Naliczany z góry za każdy zajęty przez budynek kafelek siatki. Finansuje miejski bruk, granitowe nabrzeża rzeczne oraz latarnie gazowe.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-stone-400">
                        <span>Przykłady miesięczne:</span>
                        <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">Kamienica (1x2): £ 5.00</span>
                        <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">Ratusz (2x2): £ 10.00</span>
                        <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">Farma (3x4): £ 30.00</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 px-4 py-2 bg-stone-900/80 rounded-xl border border-stone-700/80">
                      <span className="text-3xl font-mono font-black text-emerald-400 tracking-tight block">
                        £ 2.50
                      </span>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                        za kratkę / msc
                      </span>
                    </div>
                  </div>

                  {/* 2. SIATKA 2-KOLUMNOWA: BRANŻOWE + LUDNOŚĆ */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* LEWA KOLUMNA: PODATKI BRANŻOWE */}
                    <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-700/50 pb-2">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🏭</span> Podatki Branżowe (Sektory)
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">3 sektory</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* ROLNICTWO */}
                        <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">🌾</span>
                              <span className="font-bold text-stone-200 text-xs">Rolnictwo & Aprowizacja</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">Ulga aprowizacyjna na mąkę i zboże</p>
                          </div>
                          <span className="text-xl font-mono font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            6.0%
                          </span>
                        </div>

                        {/* PRZEMYSŁ */}
                        <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">⚙️</span>
                              <span className="font-bold text-stone-200 text-xs">Przemysł & Manufaktury</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">Fabryki, młyny, elektrociepłownie</p>
                          </div>
                          <span className="text-xl font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            14.0%
                          </span>
                        </div>

                        {/* HANDEL */}
                        <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">🏪</span>
                              <span className="font-bold text-stone-200 text-xs">Handel & Usługi Miejskie</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">Składy towarowe i transport</p>
                          </div>
                          <span className="text-xl font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            10.0%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PRAWA KOLUMNA: PODATKI OD LUDNOŚCI */}
                    <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-700/50 pb-2">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>👥</span> Podatki od Ludności (Klasy)
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">3 klasy społeczne</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* KLASA R */}
                        <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">🔨</span>
                              <span className="font-bold text-stone-200 text-xs">Klasa R (Robotnicy)</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">Niski podatek pogłówny od płacy</p>
                          </div>
                          <span className="text-xl font-mono font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            3.5%
                          </span>
                        </div>

                        {/* KLASA M */}
                        <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">⚖️</span>
                              <span className="font-bold text-stone-200 text-xs">Klasa M (Mieszczanie)</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">Podatek od rzemiosła i handlu</p>
                          </div>
                          <span className="text-xl font-mono font-bold text-amber-300 px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            9.0%
                          </span>
                        </div>

                        {/* KLASA E */}
                        <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">🎩</span>
                              <span className="font-bold text-amber-300 text-xs">Klasa E (Elita / Burżuazja)</span>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-0.5">Podatek od kapitału i dywidend</p>
                          </div>
                          <span className="text-xl font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            16.5%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. DOLNY PAS: PODATEK OD SPRZEDAŻY + ŚRODOWISKO I CO2 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* PODATEK OD SPRZEDAŻY */}
                    <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                            <span>🪙</span> Podatek od Sprzedaży (Obrotowy / VAT)
                          </span>
                          <span className="text-2xl font-mono font-bold text-emerald-400">
                            4.5%
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-normal">
                          Pobierany z każdej transakcji rynkowej (ziarno, mąka, chleb, surowce przemysłowe).
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-700/50">
                        <span className="text-[10px] text-stone-400">Model 1880: Akcyza miejska i obrót</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Reforma na VAT w Epoce Nowoczesnej
                        </span>
                      </div>
                    </div>

                    {/* ZANIECZYSZCZENIA I CO2 */}
                    <div className="p-4 bg-stone-800/40 border border-stone-700/60 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                            <span>🌱</span> Opłaty Emisyjne i Zanieczyszczenia
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-700 text-stone-400 border border-stone-600">
                            1880 vs PÓŹNIEJSZY OKRES
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="p-2.5 bg-stone-900/70 border border-stone-800 rounded-xl">
                            <span className="text-[10px] uppercase font-mono text-stone-500 block font-semibold">Podatek od CO2</span>
                            <span className="text-base font-mono font-bold text-stone-500 block mt-0.5">£ 0.00 / t</span>
                            <span className="text-[10px] text-stone-500 block mt-1">W późniejszych epokach</span>
                          </div>

                          <div className="p-2.5 bg-stone-900/70 border border-stone-800 rounded-xl">
                            <span className="text-[10px] uppercase font-mono text-amber-400 block font-semibold">Dym Kominowy (1880)</span>
                            <span className="text-base font-mono font-bold text-amber-400 block mt-0.5">£ 5.00 / komin</span>
                            <span className="text-[10px] text-stone-400 block mt-1">Paleniska węglowe</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PODSTRONA 3: MOJE WNIOSKI (WNIOSKOWANIE O ULGI PODATKOWE DLA BIZNESU) */}
              {townHallTab === 'reliefs' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-start gap-2.5">
                    <span className="text-lg">✍️</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-emerald-300 text-xs uppercase tracking-wider">
                          Kancelaria Skarbowa • Petycje o Ulgi Podatkowe
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          {activeReliefsCount} z 4 aktywnych
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                        Złóż formalny wniosek do Rady Miasta o przyznanie celowej ulgi podatkowej dla swojego biznesu. Zatwierdzona uchwała obniża koszty prowadzenia fabryk, kamienic i farm.
                      </p>
                    </div>
                  </div>

                  {/* KARTY ULG */}
                  <div className="space-y-3">
                    {/* 1. ULGA ZA ZATRUDNIENIE PRACOWNIKÓW */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      activeReliefs['employment']
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                        : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">👥</span>
                          <div>
                            <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                              Rynek Pracy i Kapitał Ludzki
                            </span>
                            <h4 className="font-bold text-stone-100 text-sm">
                              Ulga za Zatrudnienie Pracowników (Klasy R i M)
                            </h4>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          activeReliefs['employment']
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-stone-700 text-stone-400'
                        }`}>
                          {activeReliefs['employment'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-3">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                          -2.0% podatku dochodowego
                        </span>
                        <span className="text-[11px] text-stone-300">
                          +10% zadowolenia załogi i brak ryzyka strajków
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                        Przyznawana przedsiębiorcom zatrudniającym min. 10 pracowników w farmach, manufakturach lub elektrociepłowni.
                      </p>

                      <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-stone-400">
                          Opłata kancelaryjna: <strong className="text-stone-200">£ 120</strong>
                        </span>
                        <button
                          onClick={() => toggleRelief('employment')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeReliefs['employment']
                              ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                              : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
                          }`}
                        >
                          {activeReliefs['employment'] ? '✓ Wycofaj ulgę' : '✍️ Złóż wniosek do Rady (£ 120)'}
                        </button>
                      </div>
                    </div>

                    {/* 2. ULGA DLA POŻĄDANYCH BRANŻ W MIEŚCIE */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      activeReliefs['priority_industry']
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                        : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🌾</span>
                          <div>
                            <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                              Sektory Strategiczne
                            </span>
                            <h4 className="font-bold text-stone-100 text-sm">
                              Ulga dla Pożądanych Branż (Aprowizacja i Energetyka)
                            </h4>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          activeReliefs['priority_industry']
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-stone-700 text-stone-400'
                        }`}>
                          {activeReliefs['priority_industry'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-3">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                          0% podatku od sprzedaży (Zwolnienie z 4.5%)
                        </span>
                        <span className="text-[11px] text-stone-300">
                          Maksymalizacja zysków z chleba i energii
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                        Miasto dotuje strategiczną produkcję żywności (farmy, młyny) i zaopatrzenie w prąd/parę wodną.
                      </p>

                      <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-stone-400">
                          Opłata kancelaryjna: <strong className="text-stone-200">£ 250</strong>
                        </span>
                        <button
                          onClick={() => toggleRelief('priority_industry')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeReliefs['priority_industry']
                              ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                              : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
                          }`}
                        >
                          {activeReliefs['priority_industry'] ? '✓ Wycofaj ulgę' : '✍️ Wnioskuj o subsydium (£ 250)'}
                        </button>
                      </div>
                    </div>

                    {/* 3. ULGA ZA NOWY BUDYNEK */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      activeReliefs['new_construction']
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                        : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🏗️</span>
                          <div>
                            <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                              Rozwój Przestrzenny Miasta
                            </span>
                            <h4 className="font-bold text-stone-100 text-sm">
                              Ulga Inwestycyjna za Nowy Budynek (Pionier)
                            </h4>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          activeReliefs['new_construction']
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-stone-700 text-stone-400'
                        }`}>
                          {activeReliefs['new_construction'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-3">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                          -50% podatku gruntowego (£ 1.25/kratkę)
                        </span>
                        <span className="text-[11px] text-stone-300">
                          Obowiązuje przez pierwsze 24 miesiące rozruchu
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                        Magistrat zwalnia w połowie z opłaty gruntowej każdą nowo oddaną do użytku parcelę przemysłową lub mieszkalną.
                      </p>

                      <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-stone-400">
                          Opłata kancelaryjna: <strong className="text-stone-200">£ 100</strong>
                        </span>
                        <button
                          onClick={() => toggleRelief('new_construction')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeReliefs['new_construction']
                              ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                              : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
                          }`}
                        >
                          {activeReliefs['new_construction'] ? '✓ Wycofaj ulgę' : '✍️ Złóż wniosek o ulgę (£ 100)'}
                        </button>
                      </div>
                    </div>

                    {/* 4. ULGA ZA INWESTYCJE W EKOLOGIĘ */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      activeReliefs['green_ecology']
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                        : 'bg-stone-800/40 border-stone-700/70 hover:border-stone-600'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🍃</span>
                          <div>
                            <span className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
                              Czyste Technologie & Środowisko
                            </span>
                            <h4 className="font-bold text-stone-100 text-sm">
                              Ulga za Inwestycje w Ekologię i Czyste Powietrze
                            </h4>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          activeReliefs['green_ecology']
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            : 'bg-stone-700 text-stone-400'
                        }`}>
                          {activeReliefs['green_ecology'] ? 'PRZYZNANA' : 'DOSTĘPNA'}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-3">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                          Zwolnienie z opłaty kominowej (£ 0/komin)
                        </span>
                        <span className="text-[11px] text-stone-300">
                          -20% podatku gruntowego, +15% zadowolenia
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                        Za montaż wiatraków mechanicznych (napęd eko zamiast węgla), budowę parków miejskich lub wdrożenie filtrów sadzy.
                      </p>

                      <div className="mt-3 pt-3 border-t border-stone-700/50 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-stone-400">
                          Opłata kancelaryjna: <strong className="text-stone-200">£ 180</strong>
                        </span>
                        <button
                          onClick={() => toggleRelief('green_ecology')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeReliefs['green_ecology']
                              ? 'bg-emerald-600/30 hover:bg-red-900/50 border border-emerald-500 text-emerald-200 hover:text-red-200'
                              : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-sm'
                          }`}
                        >
                          {activeReliefs['green_ecology'] ? '✓ Wycofaj ulgę' : '✍️ Wnioskuj o certyfikat eko (£ 180)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* POZOSTAŁE PRZEDSIĘBIORSTWA I BIZNESY     */}
          {/* ========================================= */}
          {isBusiness && !isFarm && !isMill && (
            <div className="space-y-4">
              {businessTab === 'production' ? (
                <div className="p-4 bg-stone-800/40 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-200">Przedsiębiorstwo Komercyjne / Przemysłowe</span>
                    <p className="text-[11px] text-stone-400">Zakład wymaga stałego zasilania napędu do maszyn i urządzeń.</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Biznes Aktywny
                  </span>
                </div>
              ) : (
                <BusinessEnergySection
                  businessTitle={building.name}
                  energySource={buildingState.businessEnergySource || 'elektrownia'}
                  energyScale={buildingState.businessEnergyScale || 'standard'}
                  hasGreenRelief={Boolean(activeReliefs['green_ecology'])}
                  onUpdateState={onUpdateState}
                />
              )}
            </div>
          )}

          {isPark && (
            <div className="p-4 bg-stone-800/40 rounded-2xl border border-stone-800 space-y-2">
              <p className="text-xs font-bold text-emerald-400">Efekt Środowiskowy Parku Miejskiego:</p>
              <p className="text-xs text-stone-300">+18% Zadowolenie okolicznych mieszkańców, -12% zanieczyszczenia smogowego.</p>
            </div>
          )}
        </div>

        {/* DOLNE PRZYCISKI AKCJI */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-800 flex-shrink-0">
          {isTownHall ? (
            <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
              <span>🏛️ Siedziba Magistratu (Obiekt Nienaruszalny)</span>
            </div>
          ) : (
            <button
              onClick={onDemolish}
              className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              🗑️ Wyburz budynek
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Zapisz i Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
