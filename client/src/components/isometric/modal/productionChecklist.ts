import type { BuildingState, PlacedBuilding } from '../types';
import { SCALE_CONFIG } from './energyConfig';
import {
  checkIsProductionReady,
  createDefaultFarmCapitalismState,
  CROPS_CONFIG,
  getGrainSiloCapacityKg,
  getManureBinCapacityKg,
  getStrawStackCapacityKg,
} from './farmGridTypes';
import { computeFarmYieldSummary } from './farmYieldMath';
import {
  checkIsMillProductionReady,
  createDefaultMillState,
} from './mill/millTypes';
import { computeMillYieldSummary } from './mill/millMath';
import {
  checkIsBakeryProductionReady,
  createDefaultBakeryState,
} from './bakery/bakeryTypes';
import { computeBakeryYieldSummary } from './bakery/bakeryMath';
import {
  checkIsMineProductionReady,
  createDefaultMineCapitalismState,
} from './mine/mineCapitalismTypes';
import { createDefaultLivestockState } from './livestock/livestockTypes';
import { computeFactoryStaffMetrics } from './industryStaffMath';
import { getHorseEffectiveCapacityHa } from './horseEnergyMath';
import { loadGameParameters } from '../admin/gameParameters';

export interface ProductionChecklistItem {
  id: 'energy' | 'crew' | 'materials' | 'storage';
  icon: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface SummaryInventoryItem {
  icon: string;
  label: string;
  valueLabel: string;
  pct?: number;
  isZero?: boolean;
  isFull?: boolean;
}

export interface ProductionChecklistResult {
  allPassed: boolean;
  items: ProductionChecklistItem[];
  rawMaterials: SummaryInventoryItem[];
  products: SummaryInventoryItem[];
}

function makeInvItem(icon: string, label: string, current: number, max: number | null, unit: string): SummaryInventoryItem {
  const pct = max && max > 0 ? Math.min(100, Math.round((current / max) * 100)) : undefined;
  return {
    icon,
    label,
    valueLabel: max && max > 0 ? `${current.toLocaleString('pl-PL')} / ${max.toLocaleString('pl-PL')} ${unit}` : `${current.toLocaleString('pl-PL')} ${unit}`,
    pct,
    isZero: current <= 0,
    isFull: Boolean(max && max > 0 && current >= max),
  };
}

function getFuelInventoryItem(buildingState: BuildingState): SummaryInventoryItem | null {
  const src = buildingState.businessEnergySource;
  if (src === 'wegiel') {
    const cur = buildingState.coalStockTons ?? 0;
    const scaleMult = SCALE_CONFIG[buildingState.businessEnergyScale || 'standard'].multiplier;
    const max = Math.max(10, Math.ceil(2.4 * scaleMult * 4));
    return makeInvItem('🪨', 'Węgiel kamienny', Number(cur.toFixed(2)), max, 't');
  }
  if (src === 'wegiel_drzewny') {
    const cur = buildingState.charcoalStockTons ?? 0;
    const scaleMult = SCALE_CONFIG[buildingState.businessEnergyScale || 'standard'].multiplier;
    const max = Math.max(10, Math.ceil(1.8 * scaleMult * 4));
    return makeInvItem('🪵', 'Węgiel drzewny', Number(cur.toFixed(2)), max, 't');
  }
  if (src === 'konie' || (buildingState.ownedHorses?.length ?? 0) > 0) {
    return makeInvItem('🌾', 'Pasza koni roboczych', buildingState.horseFeedStockKg ?? 0, 10000, 'kg');
  }
  return null;
}

function hasBuildingFuelOrPower(buildingState: BuildingState, defaultSource?: string): boolean {
  const src = buildingState.businessEnergySource || defaultSource;
  if (src === 'wegiel') return (buildingState.coalStockTons ?? 0) > 0;
  if (src === 'wegiel_drzewny') return (buildingState.charcoalStockTons ?? 0) > 0;
  if (src === 'konie') return (buildingState.ownedHorses || []).some((h) => !h.isDeceased);
  return Boolean(src);
}

export function computeProductionChecklist(
  building: PlacedBuilding,
  buildingState: BuildingState,
  attachedFieldsCount = 0
): ProductionChecklistResult {
  const typeId = building.typeId;
  const sizeTiles = Math.max(1, building.sizeX * building.sizeY);
  const items: ProductionChecklistItem[] = [];

  if (typeId === 'wheat_farm') {
    const rawCap = buildingState.farmCapitalism;
    const farmCap =
      rawCap && Array.isArray(rawCap.crew) && rawCap.agronomist && rawCap.stageAssignments
        ? rawCap
        : createDefaultFarmCapitalismState();
    const horses = (buildingState.ownedHorses || []).filter((h) => !h.isDeceased);
    const ready = checkIsProductionReady(farmCap, horses.length);
    const yieldSum = computeFarmYieldSummary(
      farmCap,
      attachedFieldsCount,
      false,
      horses.length,
      buildingState.ownedHorses
    );
    const horseCapHa = getHorseEffectiveCapacityHa(
      horses,
      loadGameParameters().horseWorkCapacityHa || 5
    );
    const energyOk = horses.length > 0 && horseCapHa >= yieldSum.totalHectares;
    const crewOk = ready.isReady;
    const cropKey = farmCap.cropType || 'pszenica';
    const cropLabel = CROPS_CONFIG[cropKey]?.name || 'Zboże';
    const grainStock = farmCap.grainStockKg?.[cropKey] ?? farmCap.wheatStockKg ?? 0;
    const siloCap = getGrainSiloCapacityKg(farmCap.siloLevel ?? 1);
    const strawStock = farmCap.strawStockKg ?? 0;
    const strawCap = getStrawStackCapacityKg(farmCap.strawLevel ?? 1);
    const manureStock = farmCap.manureStockKg ?? farmCap.fertilizerStockKg ?? 0;
    const manureCap = getManureBinCapacityKg(farmCap.manureLevel ?? 1);
    const storageOk = grainStock < siloCap;

    items.push(
      {
        id: 'energy',
        icon: '⚡',
        label: 'Energia (konie robocze ≥ zapotrzebowanie pola)',
        passed: energyOk,
        detail:
          horses.length === 0
            ? 'Brak koni roboczych w zakładce Energia.'
            : `Moc koni: ${horseCapHa} ha / powierzchnia farmy: ${yieldSum.totalHectares} ha.`,
      },
      {
        id: 'crew',
        icon: '👷',
        label: 'Załoga na lejku produkcyjnym',
        passed: crewOk,
        detail: crewOk
          ? 'Obsadzone wszystkie etapy cyklu i agronom.'
          : `Brakuje obsady (${ready.missingStages.map((s) => s.label).join(', ') || 'sprawdź Załogę'}).`,
      },
      {
        id: 'materials',
        icon: '📦',
        label: 'Surowce do produkcji (ziarno siewne / pasza koni)',
        passed: (buildingState.horseFeedStockKg ?? 0) > 0 || horses.length === 0,
        detail: `Pasza koni: ${buildingState.horseFeedStockKg ?? 0} kg · Ziarno siewne: ${yieldSum.seedRequiredKg} kg.`,
      },
      {
        id: 'storage',
        icon: '🏛️',
        label: storageOk ? 'Miejsce w magazynie wyrobów' : 'Magazyn wyrobów jest przepełniony',
        passed: storageOk,
        detail: `Spichlerz: ${grainStock.toLocaleString('pl-PL')} / ${siloCap.toLocaleString('pl-PL')} kg.`,
      }
    );
    const rawMaterials: SummaryInventoryItem[] = [
      makeInvItem('🌾', 'Pasza koni roboczych', buildingState.horseFeedStockKg ?? 0, 10000, 'kg'),
      makeInvItem('🐂', 'Obornik naturalny', manureStock, manureCap, 'kg'),
    ];
    const products: SummaryInventoryItem[] = [
      makeInvItem('🌾', cropLabel, grainStock, siloCap, 'kg'),
      makeInvItem('🟨', 'Słoma (Ściółka)', strawStock, strawCap, 'kg'),
    ];
    return { allPassed: items.every((i) => i.passed), items, rawMaterials, products };
  }

  if (typeId === 'mill') {
    const mill = buildingState.millState || createDefaultMillState();
    const ready = checkIsMillProductionReady(mill, buildingState, sizeTiles);
    const summary = computeMillYieldSummary(mill, buildingState);
    const hasFuel = hasBuildingFuelOrPower(buildingState, 'wegiel');
    const scaleMult = SCALE_CONFIG[buildingState.businessEnergyScale || 'standard'].multiplier;
    const energyOk = hasFuel && scaleMult >= 1 && summary.dailyGrainInputKg > 0;
    const crewOk = !ready.missingReasons.some((r) => /Zarządc|etap|obsad|Załog/i.test(r));
    const materialsOk = mill.grainStockKg > 0;
    const storageOk = mill.flourStockKg < mill.flourCapacityKg;
    items.push(
      {
        id: 'energy',
        icon: '⚡',
        label: 'Energia (max produkcji ≤ max energii)',
        passed: energyOk,
        detail: hasFuel
          ? `Skala energii: ${Math.round(scaleMult * 100)}% · Przemiał: ${summary.dailyGrainInputKg} kg/d.`
          : 'Brak paliwa (węgiel/konie) do napędu młyna.',
      },
      {
        id: 'crew',
        icon: '👷',
        label: 'Załoga na lejku produkcyjnym',
        passed: crewOk,
        detail: crewOk
          ? 'Zarządca i wszystkie stanowiska przemiału obsadzone.'
          : ready.missingReasons.filter((r) => /Zarządc|etap|obsad|Załog/i.test(r)).join('; ') || 'Niepełna obsada.',
      },
      {
        id: 'materials',
        icon: '📦',
        label: 'Surowce (ziarno w koszu zasypowym)',
        passed: materialsOk,
        detail: `Ziarno w koszu: ${mill.grainStockKg} / ${mill.grainCapacityKg} kg.`,
      },
      {
        id: 'storage',
        icon: '🏛️',
        label: storageOk ? 'Miejsce w magazynie wyrobów' : 'Magazyn wyrobów jest przepełniony',
        passed: storageOk,
        detail: `Magazyn mąki: ${mill.flourStockKg} / ${mill.flourCapacityKg} kg.`,
      }
    );
    const fuelItem = getFuelInventoryItem({ ...buildingState, businessEnergySource: buildingState.businessEnergySource || 'wegiel' });
    const rawMaterials: SummaryInventoryItem[] = [
      makeInvItem('🌾', 'Ziarno w koszu', mill.grainStockKg, mill.grainCapacityKg, 'kg'),
      ...(fuelItem ? [fuelItem] : []),
    ];
    const products: SummaryInventoryItem[] = [
      makeInvItem('🥖', 'Mąka', mill.flourStockKg, mill.flourCapacityKg, 'kg'),
      makeInvItem('🌾', 'Otręby', mill.branStockKg, mill.branCapacityKg, 'kg'),
    ];
    return { allPassed: items.every((i) => i.passed), items, rawMaterials, products };
  }

  if (typeId === 'bakery') {
    const bakery = buildingState.bakeryState || createDefaultBakeryState();
    const ready = checkIsBakeryProductionReady(bakery, buildingState, sizeTiles);
    const summary = computeBakeryYieldSummary(bakery, buildingState);
    const hasFuel = hasBuildingFuelOrPower(buildingState, 'wegiel');
    const scaleMult = SCALE_CONFIG[buildingState.businessEnergyScale || 'standard'].multiplier;
    const energyOk = hasFuel && scaleMult >= 1 && summary.dailyFlourInputKg > 0;
    const crewOk = !ready.missingReasons.some((r) => /Zarządc|etap|obsad|Załog|Piekarz/i.test(r));
    const materialsOk = bakery.flourStockKg > 0;
    const storageOk = bakery.breadStockKg < bakery.breadCapacityKg;
    items.push(
      {
        id: 'energy',
        icon: '⚡',
        label: 'Energia (max produkcji ≤ max energii)',
        passed: energyOk,
        detail: hasFuel
          ? `Skala energii: ${Math.round(scaleMult * 100)}% · Wypiek: ${summary.dailyFlourInputKg} kg mąki/d.`
          : 'Brak opału lub energii do wypieku.',
      },
      {
        id: 'crew',
        icon: '👷',
        label: 'Załoga na lejku produkcyjnym',
        passed: crewOk,
        detail: crewOk
          ? 'Zarządca i wszystkie etapy wypieku obsadzone.'
          : ready.missingReasons.filter((r) => /Zarządc|etap|obsad|Załog|Piekarz/i.test(r)).join('; ') || 'Niepełna obsada.',
      },
      {
        id: 'materials',
        icon: '📦',
        label: 'Surowce (mąka do wypieku)',
        passed: materialsOk,
        detail: `Mąka w magazynie: ${bakery.flourStockKg} / ${bakery.flourCapacityKg} kg.`,
      },
      {
        id: 'storage',
        icon: '🏛️',
        label: storageOk ? 'Miejsce w magazynie wyrobów' : 'Magazyn wyrobów jest przepełniony',
        passed: storageOk,
        detail: `Magazyn pieczywa: ${bakery.breadStockKg} / ${bakery.breadCapacityKg} kg.`,
      }
    );
    const fuelItem = getFuelInventoryItem({ ...buildingState, businessEnergySource: buildingState.businessEnergySource || 'wegiel' });
    const rawMaterials: SummaryInventoryItem[] = [
      makeInvItem('🥖', 'Mąka do wypieku', bakery.flourStockKg, bakery.flourCapacityKg, 'kg'),
      ...(fuelItem ? [fuelItem] : []),
    ];
    const products: SummaryInventoryItem[] = [
      makeInvItem('🍞', 'Pieczywo', bakery.breadStockKg, bakery.breadCapacityKg, 'kg'),
      makeInvItem('🥐', 'Bułka tarta', bakery.rusksStockKg, bakery.rusksCapacityKg, 'kg'),
    ];
    return { allPassed: items.every((i) => i.passed), items, rawMaterials, products };
  }

  if (typeId.startsWith('mine_')) {
    const mine =
      buildingState.mineCapitalism ||
      createDefaultMineCapitalismState(buildingState.mineDepositType);
    const ready = checkIsMineProductionReady(mine, buildingState, sizeTiles);
    const maxCap = mine.capacityTons ?? 500;
    const curStock = buildingState.mineStock ?? 0;
    const hasFuel = hasBuildingFuelOrPower(buildingState, 'konie');
    const crewOk = !ready.missingReasons.some((r) => /Sztygar|etap|obsad|Załog|Górnik/i.test(r));
    items.push(
      {
        id: 'energy',
        icon: '⚡',
        label: 'Energia (kierat / maszyna parowa / prąd)',
        passed: hasFuel,
        detail: hasFuel ? 'Zasilanie kopalni aktywne.' : 'Brak zasilania lub paliwa/koni.',
      },
      {
        id: 'crew',
        icon: '👷',
        label: 'Załoga i sztygar na lejku wydobywczym',
        passed: crewOk,
        detail: crewOk
          ? 'Sztygar i wszystkie szyby wydobywcze obsadzone.'
          : ready.missingReasons.filter((r) => /Sztygar|etap|obsad|Załog|Górnik/i.test(r)).join('; ') || 'Niepełna obsada.',
      },
      {
        id: 'materials',
        icon: '📦',
        label: 'Surowce wsadowe',
        passed: true,
        detail: 'Wydobycie ze złoża nie wymaga surowców wsadowych.',
      },
      {
        id: 'storage',
        icon: '🏛️',
        label: curStock < maxCap ? 'Miejsce w magazynie urobku' : 'Magazyn urobku jest przepełniony',
        passed: curStock < maxCap,
        detail: `Skład urobku: ${curStock.toFixed(1)} / ${maxCap} t.`,
      }
    );
    const fuelItem = getFuelInventoryItem({ ...buildingState, businessEnergySource: buildingState.businessEnergySource || 'konie' });
    const rawMaterials: SummaryInventoryItem[] = fuelItem ? [fuelItem] : [];
    const products: SummaryInventoryItem[] = [
      makeInvItem('⛏️', 'Urobek w składzie', Number(curStock.toFixed(1)), maxCap, 't'),
    ];
    return { allPassed: items.every((i) => i.passed), items, rawMaterials, products };
  }

  if (typeId === 'livestock_farm') {
    const ls = buildingState.livestockState || createDefaultLivestockState();
    const species = ls.activeSpecies || 'cattle';
    const isHorseBreeding = species === 'horses';
    const horses = (buildingState.ownedHorses || []).filter((h) => !h.isDeceased);
    const herdHorses = (ls.herd?.horses || []).filter((h) => !h.isDeceased);
    const crewOk = ls.crew.length > 0;
    const feedStock = ls.supplies?.feedGrainKg ?? 0;
    const strawStock = ls.supplies?.strawBeddingKg ?? 0;
    const feedOk = feedStock > 0 && strawStock > 0;
    const energyOk = isHorseBreeding ? herdHorses.length > 0 : horses.length > 0;

    const perAnimalCap = loadGameParameters().manurePenCapacityKg || 1000;
    const totalAnimalsForPen = isHorseBreeding
      ? Math.max(1, herdHorses.length)
      : species === 'sheep'
      ? Math.max(1, (ls.herd?.sheepFlockCount ?? 0) + (ls.herd?.growingLambsCount ?? 0))
      : Math.max(1, (ls.herd?.milkingGroupCows ?? 0) + (ls.herd?.growingGroupCalves ?? 0));
    const penCap = Math.max(perAnimalCap, totalAnimalsForPen * perAnimalCap);
    const penManureKg = Math.round(Math.min(penCap, ls.penManureKg ?? 0));

    const storageDetail =
      species === 'horses'
        ? `Zagroda koni: ${herdHorses.length} szt. · Obornik w zagrodzie: ${penManureKg} / ${penCap} kg${penManureKg >= penCap ? ' (nadwyżka utylizowana)' : ''}.`
        : species === 'sheep'
        ? `Baranina: ${ls.storage?.muttonKg ?? 0} kg · Wełna: ${ls.storage?.woolKg ?? 0} kg.`
        : species === 'poultry'
        ? `Jaja: ${ls.storage?.eggsCount ?? 0} szt. · Drób: ${ls.storage?.poultryMeatKg ?? 0} kg.`
        : `Mleko: ${ls.storage?.milkLiters ?? 0} L · Wołowina: ${ls.storage?.beefKg ?? 0} kg.`;

    items.push(
      {
        id: 'energy',
        icon: '⚡',
        label: isHorseBreeding ? 'Energia (własne stado koni)' : 'Energia (konie robocze)',
        passed: energyOk,
        detail: isHorseBreeding
          ? herdHorses.length > 0
            ? `Konie ze stada (${herdHorses.length} szt.) same dostarczają energię.`
            : 'Brak koni w stadzie.'
          : energyOk
          ? `Posiadane konie robocze: ${horses.length} szt.`
          : 'Brak koni roboczych.',
      },
      {
        id: 'crew',
        icon: '👷',
        label: 'Załoga fermy i zootechnik',
        passed: crewOk,
        detail: crewOk ? `Załoga: ${ls.crew.length} os.` : 'Brak pełnej obsady lub zootechnika.',
      },
      {
        id: 'materials',
        icon: '📦',
        label: 'Pasza i ściółka w magazynie (nie wstrzymuje wzrostu)',
        passed: true,
        detail: feedOk
          ? `Pasza: ${feedStock} kg · Ściółka: ${strawStock} kg.`
          : `⚠️ Brak paszy/ściółki (${feedStock} kg / ${strawStock} kg) — wzrost trwa, ale zwierzęta tracą zdrowie!`,
      },
      {
        id: 'storage',
        icon: '🏛️',
        label: isHorseBreeding ? 'Zagroda i pojemność (nadwyżki obornika utylizowane)' : 'Magazyn wyrobów nie jest przepełniony',
        passed: true,
        detail: storageDetail,
      }
    );
    const fuelItem = isHorseBreeding
      ? null
      : getFuelInventoryItem({ ...buildingState, businessEnergySource: 'konie' });
    const rawMaterials: SummaryInventoryItem[] = [
      makeInvItem('🌾', 'Pasza zbożowa', feedStock, 10000, 'kg'),
      makeInvItem('🟨', 'Ściółka ze słomy', strawStock, 20000, 'kg'),
      ...(fuelItem ? [fuelItem] : []),
    ];
    const saleHorsesCount = herdHorses.filter((h) => h.group === 'sale').length;
    const products: SummaryInventoryItem[] =
      species === 'horses'
        ? [
            makeInvItem('🐎', 'Konie w zagrodzie', herdHorses.length, null, 'szt.'),
            makeInvItem('🏷️', 'Konie na sprzedaż', saleHorsesCount, null, 'szt.'),
            makeInvItem('🐂', 'Obornik w zagrodzie', penManureKg, penCap, 'kg'),
            makeInvItem('💩', 'Obornik na hałdzie (na sprzedaż)', ls.storage?.manureKg ?? 0, null, 'kg'),
          ]
        : species === 'sheep'
        ? [
            makeInvItem('🥩', 'Baranina', ls.storage?.muttonKg ?? 0, null, 'kg'),
            makeInvItem('🧶', 'Wełna', ls.storage?.woolKg ?? 0, null, 'kg'),
            makeInvItem('🐂', 'Obornik', ls.storage?.manureKg ?? 0, null, 'kg'),
          ]
        : species === 'poultry'
        ? [
            makeInvItem('🥚', 'Jaja kurze', ls.storage?.eggsCount ?? 0, null, 'szt.'),
            makeInvItem('🍗', 'Mięso drobiowe', ls.storage?.poultryMeatKg ?? 0, null, 'kg'),
            makeInvItem('🐂', 'Obornik', ls.storage?.manureKg ?? 0, null, 'kg'),
          ]
        : [
            makeInvItem('🥛', 'Mleko', ls.storage?.milkLiters ?? 0, null, 'l'),
            makeInvItem('🥩', 'Wołowina', ls.storage?.beefKg ?? 0, null, 'kg'),
            makeInvItem('🐂', 'Obornik', ls.storage?.manureKg ?? 0, null, 'kg'),
          ];
    return { allPassed: items.every((i) => i.passed), items, rawMaterials, products };
  }

  // Ogólny zakład przemysłowy / rzemieślniczy
  const staff = computeFactoryStaffMetrics(building.sizeX, building.sizeY, buildingState);
  const scaleMult = SCALE_CONFIG[buildingState.businessEnergyScale || 'standard'].multiplier;
  const hasEnergyFuel = hasBuildingFuelOrPower(buildingState);
  const energyOk = hasEnergyFuel && scaleMult >= 1;
  const crewOk = staff.workersCount > 0 && staff.managersCount > 0;

  items.push(
    {
      id: 'energy',
      icon: '⚡',
      label: 'Energia (max produkcji ≤ max energii)',
      passed: energyOk,
      detail: hasEnergyFuel
        ? `Skala mocy: ${Math.round(scaleMult * 100)}%.`
        : 'Brak wybranego źródła energii lub paliwa na składzie.',
    },
    {
      id: 'crew',
      icon: '👷',
      label: 'Załoga na lejku produkcyjnym',
      passed: crewOk,
      detail: `Pracownicy: ${staff.workersCount} · Zarządcy: ${staff.managersCount}.`,
    },
    {
      id: 'materials',
      icon: '📦',
      label: 'Surowce do produkcji',
      passed: true,
      detail: 'Zaopatrzenie surowcowe aktywne.',
    },
    {
      id: 'storage',
      icon: '🏛️',
      label: 'Magazyn wyrobów nie jest przepełniony',
      passed: true,
      detail: 'Miejsce w magazynie wyrobów dostępne.',
    }
  );

  const fuelItem = getFuelInventoryItem(buildingState);
  const rawMaterials: SummaryInventoryItem[] = fuelItem ? [fuelItem] : [];
  const products: SummaryInventoryItem[] = [];
  return { allPassed: items.every((i) => i.passed), items, rawMaterials, products };
}
