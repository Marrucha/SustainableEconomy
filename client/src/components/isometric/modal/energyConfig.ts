import type { BusinessEnergySource, BusinessEnergyScale } from '../types';

export interface EnergySourceDetails {
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

export const ENERGY_SOURCES_INFO: Record<BusinessEnergySource, EnergySourceDetails> = {
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

export const SCALE_CONFIG: Record<
  BusinessEnergyScale,
  { label: string; multiplier: number; effMultiplier: number; sub: string }
> = {
  eco: {
    label: 'Ekonomiczny (65%)',
    multiplier: 0.65,
    effMultiplier: 0.70,
    sub: 'Oszczędne zasilanie, niższy koszt',
  },
  standard: {
    label: 'Standardowy (100%)',
    multiplier: 1.0,
    effMultiplier: 1.0,
    sub: 'Pełna moc znamionowa fabryki',
  },
  turbo: {
    label: 'Przemysłowy Turbo (145%)',
    multiplier: 1.45,
    effMultiplier: 1.30,
    sub: 'Forsowanie kotłów, maksymalny urobek',
  },
};
