import { useEffect, useRef } from 'react';
import type { PlacedBuilding, BuildingState } from './types';
import type { GameDate } from './clock/gameClockTypes';
import { getStageForMonth } from './clock/gameClockTypes';
import {
  checkIsProductionReady,
  getGrainSiloCapacityKg,
  getGrainSiloDailyCostPence,
  getStrawStackCapacityKg,
  type CropType,
  type FarmCapitalismState,
  type FarmWeatherType,
} from './modal/farmGridTypes';
import { computeFarmYieldSummary } from './modal/farmYieldMath';
import { countAttachedWheatFields } from './pastureTopology';
import { loadGameParameters } from './admin/gameParameters';

interface UseFarmAnnualTickParams {
  clockDate: GameDate;
  placedBuildings: PlacedBuilding[];
  buildingsState: Record<string, BuildingState>;
  setBuildingsState: React.Dispatch<React.SetStateAction<Record<string, BuildingState>>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Globalny cykl wegetacyjny dla wszystkich farm zbożowych (działa nawet przy zamkniętym oknie farmy):
 * - Synchronizuje aktywny etap z kalendarzem 1880 r.
 * - W dniu zbiorów (1 Września, tuż po sierpniowych żniwach) nalicza plon ziarna (do spichlerza lub sprzedaż),
 *   proporcjonalną ściółkę słomy (2x plon ziarna) oraz pobiera zużyty obornik naturalny i nasiona z magazynu.
 */
export function useFarmAnnualTick({
  clockDate,
  placedBuildings,
  buildingsState,
  setBuildingsState,
  setGold,
}: UseFarmAnnualTickParams) {
  const placedRef = useRef(placedBuildings);
  placedRef.current = placedBuildings;
  const stateRef = useRef(buildingsState);
  stateRef.current = buildingsState;

  useEffect(() => {
    const farms = placedRef.current.filter((b) => b.typeId === 'wheat_farm');
    if (farms.length === 0) return;

    const isHarvestSettlementDay = clockDate.month === 1 && clockDate.day === 1 && clockDate.year > 1880;
    const completedYear = clockDate.year - 1;
    let totalMarketRevenue = 0;
    let totalDailyStorageCostGbp = 0;

    setBuildingsState((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const farm of farms) {
        const bState = prev[farm.id];
        const farmCap = bState?.farmCapitalism;
        if (!farmCap || !Array.isArray(farmCap.crew) || farmCap.crew.length === 0) continue;

        const ownedHorsesCount = bState?.ownedHorses?.length ?? 0;
        const patch: Partial<FarmCapitalismState> = {};

        const rollGrowthWeather = (): FarmWeatherType => {
          const opts: FarmWeatherType[] = ['rainy', 'cloudy', 'sunny', 'stormy'];
          return opts[Math.floor(Math.random() * opts.length)];
        };
        const rollHarvestWeather = (): FarmWeatherType => {
          const opts: FarmWeatherType[] = ['sunny', 'partly_cloudy', 'cloudy', 'rainy'];
          return opts[Math.floor(Math.random() * opts.length)];
        };

        if (!farmCap.growingWeather || isHarvestSettlementDay) {
          patch.growingWeather = rollGrowthWeather();
        }
        if (!farmCap.harvestWeather || isHarvestSettlementDay) {
          patch.harvestWeather = rollHarvestWeather();
        }

        // Dzienne zużycie paszy zbożowej przez konie robocze na farmie (ze zboża w spichlerzu)
        if (ownedHorsesCount > 0) {
          const dailyFeedPerHorse = loadGameParameters().horseDailyFeedKg;
          const totalHorseFeedKg = ownedHorsesCount * dailyFeedPerHorse;
          const activeCrop: CropType = farmCap.cropType || 'pszenica';
          const curGrainMap = farmCap.grainStockKg || { pszenica: farmCap.wheatStockKg ?? 0, zyto: 0, owies: 0, jeczmien: 0 };
          const curStock = curGrainMap[activeCrop] ?? farmCap.wheatStockKg ?? 0;
          if (curStock > 0) {
            const nextStock = Math.max(0, Number((curStock - totalHorseFeedKg).toFixed(2)));
            patch.grainStockKg = { ...curGrainMap, [activeCrop]: nextStock };
            patch.wheatStockKg = nextStock;
          }
        }

        const readyCheck = checkIsProductionReady(farmCap, ownedHorsesCount);
        if (!readyCheck.isReady) {
          if (Object.keys(patch).length > 0) {
            changed = true;
            next[farm.id] = { ...bState, farmCapitalism: { ...farmCap, ...patch } };
          }
          continue;
        }

        const extraFields = countAttachedWheatFields(farm, placedRef.current);
        const yieldSummary = computeFarmYieldSummary(farmCap, extraFields, false, ownedHorsesCount);

        let scheduledStage = getStageForMonth(clockDate.month);
        if (
          scheduledStage === 'fertilizing' &&
          (!farmCap.enableFertilizing || !yieldSummary.hasFertWorker || !yieldSummary.hasEnoughManure)
        ) {
          scheduledStage = 'plowing';
        }
        if (
          scheduledStage === 'weeding' &&
          ((!farmCap.enableWeeding && !farmCap.enableIrrigation) || !yieldSummary.hasWeedWorker)
        ) {
          scheduledStage = 'growing';
        }
        if (scheduledStage !== farmCap.currentStage) {
          patch.currentStage = scheduledStage;
        }

        // Miesięczna utrata jakości składowanego ziarna (-1% / miesiąc, 1. dnia miesiąca) oraz dzienny koszt składowania
        const storedGrainMap = farmCap.grainStockKg || { pszenica: 0, zyto: 0, owies: 0, jeczmien: 0 };
        const totalStoredKg =
          (storedGrainMap.pszenica || 0) +
          (storedGrainMap.zyto || 0) +
          (storedGrainMap.owies || 0) +
          (storedGrainMap.jeczmien || 0);
        if (totalStoredKg > 0) {
          if (clockDate.day === 1) {
            const curQuality = farmCap.grainQualityPercent ?? 100;
            if (curQuality > 0) {
              patch.grainQualityPercent = Math.max(0, Math.round(curQuality - 1));
            }
          }
          totalDailyStorageCostGbp += getGrainSiloDailyCostPence(farmCap.siloLevel) / 100;
        }

        // Powiadomienie o niewystarczającej ilości obornika (nie pobieramy obornika poniżej progu 50%)
        if (
          farmCap.enableFertilizing &&
          yieldSummary.hasFertWorker &&
          yieldSummary.manureUsedKg === 0 &&
          yieldSummary.manureRequiredKg > 0 &&
          clockDate.month === 3 &&
          clockDate.day === 1
        ) {
          patch.manureShortageWarning = `Farma (${farm.name}): Niewystarczająca ilość obornika (wymagane min. ${100 * (1 + extraFields)} kg dla trybu 50%). Obornik nie został pobrany.`;
        } else if (yieldSummary.hasEnoughManure && farmCap.manureShortageWarning) {
          patch.manureShortageWarning = undefined;
        }

        // Rozliczenie cyklu na koniec roku wegetacyjnego (po zakończeniu etapu 8. Zbyt / Silos -> 1 Stycznia)
        if (isHarvestSettlementDay && farmCap.lastHarvestYear !== completedYear) {
          const activeCrop: CropType = farmCap.cropType || 'pszenica';
          const totalYieldKg = yieldSummary.totalYieldKg;
          const strawYieldKg = totalYieldKg * 2; // 3 t ziarna -> 6 t ściółki (proporcjonalnie z mnożnikami)

          // Pobranie obornika naturalnego z magazynu
          const currentManure = farmCap.manureStockKg ?? farmCap.fertilizerStockKg ?? 0;
          const nextManure = Math.max(0, currentManure - yieldSummary.manureUsedKg);
          patch.manureStockKg = nextManure;
          patch.fertilizerStockKg = nextManure;

          // Pobranie nasion ze spichlerza, jeśli źródłem jest własny magazyn
          if (farmCap.seedSource === 'storage') {
            patch.seedsStockKg = Math.max(0, (farmCap.seedsStockKg || 0) - yieldSummary.seedRequiredKg);
          }

          // Dodanie słomy (ściółki) do stogu/magazynu (limit bazowy 20 t, rozbudowa do 80 t)
          const strawCapKg = getStrawStackCapacityKg(farmCap.strawLevel);
          patch.strawStockKg = Math.min(strawCapKg, (farmCap.strawStockKg || 0) + strawYieldKg);

          const seedCost = farmCap.seedSource === 'market' ? 22 : 0;
          const fertCost = yieldSummary.manureUsedKg > 0 ? (yieldSummary.fertilizerBonusPct === 30 ? 14 : 7) : 0;
          const sprayCost = yieldSummary.hasWeedWorker
            ? (farmCap.enableWeeding ? 9 : 0) + (farmCap.enableIrrigation ? 8 : 0)
            : 0;
          const crewCost = farmCap.crew.reduce((acc, w) => acc + w.wageDaily, 0);
          const agroCost = farmCap.agronomist?.hired ? farmCap.agronomist.wageDaily : 0;
          const siloCostGbp = getGrainSiloDailyCostPence(farmCap.siloLevel) / 100;
          const totalCosts = Number((seedCost + fertCost + sprayCost + crewCost + agroCost + siloCostGbp).toFixed(2));

          // W cyklu zamkniętym brak automatycznej sprzedaży NPC — przychód wynosi £0 bez realnego nabywcy/kontraktu
          const revenue = 0;

          patch.totalCyclesCompleted = (farmCap.totalCyclesCompleted || 0) + 1;
          patch.lastHarvestYear = completedYear;
          patch.lastCycleYieldKg = totalYieldKg;
          patch.annualYieldHistory = [
            ...(farmCap.annualYieldHistory || []),
            {
              year: completedYear,
              cropType: activeCrop,
              yieldKg: totalYieldKg,
              hectares: yieldSummary.totalHectares,
            },
          ];
          patch.lastCycleRevenue = revenue;
          patch.lastCycleCost = totalCosts;

          // Zawsze składujemy zbiory do spichlerza (jednokomorowego do 10 t), dopóki nie zostaną sprzedane graczowi/młynowi
          const rawGrainMap = farmCap.grainStockKg || { pszenica: 0, zyto: 0, owies: 0, jeczmien: 0 };
          const isLegacyDummy =
            activeCrop === 'pszenica' && rawGrainMap.zyto === 120 && rawGrainMap.owies === 80;
          const grainMap = isLegacyDummy
            ? { ...rawGrainMap, zyto: 0, owies: 0 }
            : rawGrainMap;
          const currentCropKg = grainMap[activeCrop] ?? 0;
          const otherGrainKg = (Object.entries(grainMap) as [CropType, number][])
            .filter(([crop]) => crop !== activeCrop)
            .reduce((sum, [, kg]) => sum + (kg || 0), 0);

          if (otherGrainKg === 0) {
            const siloCapKg = getGrainSiloCapacityKg(farmCap.siloLevel);
            const nextAmount = Math.min(siloCapKg, currentCropKg + totalYieldKg);
            const addedKg = Math.max(0, nextAmount - currentCropKg);
            const oldQuality = patch.grainQualityPercent ?? farmCap.grainQualityPercent ?? 100;
            const harvestQuality = yieldSummary.harvestQualityPercent;
            if (nextAmount > 0 && addedKg > 0) {
              const blendedQuality = (currentCropKg * oldQuality + addedKg * harvestQuality) / nextAmount;
              patch.grainQualityPercent = Math.min(100, Math.round(blendedQuality * 10) / 10);
            }
            patch.wheatStockKg = nextAmount;
            patch.grainStockKg = {
              ...grainMap,
              [activeCrop]: nextAmount,
            };
          }
        }

        if (Object.keys(patch).length > 0) {
          changed = true;
          next[farm.id] = {
            ...bState,
            farmCapitalism: {
              ...farmCap,
              ...patch,
            },
          };
        }
      }

      return changed ? next : prev;
    });

    const netGoldDelta = totalMarketRevenue - totalDailyStorageCostGbp;
    if (netGoldDelta !== 0) {
      setGold((g) => Math.max(0, Number((g + netGoldDelta).toFixed(2))));
    }
  }, [clockDate.year, clockDate.month, clockDate.day, setBuildingsState, setGold]);
}
