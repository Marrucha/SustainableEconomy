import React, { useEffect, useRef } from 'react';
import type { PlacedBuilding, BuildingState } from '../types';
import type { UseGameClockReturn } from '../clock/useGameClock';
import { INDUSTRY_PROFILES } from './industryProfiles';
import { INDUSTRY_SUPPLY_RULES, type WorldSupplierBuilding } from './industrySupplyConfig';
import { IndustryMerchantCard } from './IndustryMerchantCard';
import { computeFactoryStaffMetrics } from './industryStaffMath';
import { FarmPipelineArrow } from './FarmPipelineArrow';
import { syncRosterCount } from './englishNames';
import { FactoryStaffPicker } from './FactoryStaffPicker';
import {
  computeMonthlyProductionUnits,
  computeContractedDemandForSupplier,
} from './industryContracts';

interface IndustryPipelineCardProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  isSteamPowered: boolean;
  clock?: UseGameClockReturn;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

const ENERGY_LABELS: Record<string, string> = {
  elektrownia: '⚡ Sieć Elektryczna',
  wegiel: '🪨 Kocioł Węglowy',
  drewno: '🪵 Kocioł na Drewno',
  gaz: '🔥 Gaz Miejski',
  wodor: '💧 Ogniwo Wodorowe',
  konie: '🐎 Kierat Konny',
};

export const IndustryPipelineCard: React.FC<IndustryPipelineCardProps> = ({
  building,
  buildingState,
  allWorldBuildings,
  buildingsState,
  isSteamPowered,
  clock,
  onSpendGold,
  onUpdateState,
}) => {
  const rule = INDUSTRY_SUPPLY_RULES[building.typeId];
  const profile = INDUSTRY_PROFILES[building.typeId];
  const activeTargetId = buildingState.productionTarget || profile?.options[0]?.id;
  const activeOption = profile?.options.find((o) => o.id === activeTargetId) || profile?.options[0];
  const productName = activeOption ? activeOption.label : building.name;

  const m = computeFactoryStaffMetrics(building.sizeX, building.sizeY, buildingState);

  const energyKey = buildingState.businessEnergySource || (isSteamPowered ? 'wegiel' : 'elektrownia');
  const energyLabel = ENERGY_LABELS[energyKey] || energyKey;

  const stage1Ready = Boolean(
    m.merchantActive && buildingState.merchantSupplierId && buildingState.merchantTransportCompanyId
  );
  const stage2Ready = stage1Ready && m.workersCount > 0 && m.hasEnoughManagers;
  const stage3Ready = stage2Ready && m.warehousemenCount > 0;
  const stage4Ready = stage3Ready && m.sellerActive;

  const monthlyCapacityUnits = computeMonthlyProductionUnits(
    m.workersCount,
    m.totalProductionPercent,
    buildingState
  );
  const { totalContractedUnits, buyersCount } = computeContractedDemandForSupplier(
    building.id,
    allWorldBuildings,
    buildingsState
  );
  const sellerCapacityPct =
    monthlyCapacityUnits > 0
      ? Math.min(100, Math.round((totalContractedUnits / monthlyCapacityUnits) * 100))
      : 0;

  const day = clock?.date.day ?? 1;
  const month = clock?.date.month ?? 1;
  const year = clock?.date.year ?? 1880;
  const currentTotalMonths = year * 12 + month;

  // Miesięczny postęp paska produkcji (1..30 dni -> 0%..100% w cyklu miesięcznym)
  const monthlyProgressPct = stage4Ready ? Math.round((day / 30) * 100) : 0;

  // Naliczanie produkcji miesięcznej oraz postępu szkoły/doświadczenia przy przejściu miesiąca
  const lastProcessedMonthRef = useRef<number>(currentTotalMonths);
  useEffect(() => {
    if (currentTotalMonths > lastProcessedMonthRef.current) {
      const monthsElapsed = currentTotalMonths - lastProcessedMonthRef.current;
      lastProcessedMonthRef.current = currentTotalMonths;

      const updates: Partial<BuildingState> = {};
      if (stage4Ready && monthlyCapacityUnits > 0) {
        const netToWarehouse = Math.max(0, monthlyCapacityUnits - totalContractedUnits);
        updates.productStockUnits = (buildingState.productStockUnits ?? 0) + netToWarehouse * monthsElapsed;
      }
      if (m.workersCount > 0 && monthsElapsed >= 1) {
        if (month === 1) {
          updates.workerExperienceYears = (buildingState.workerExperienceYears ?? 0) + 1;
        }
        const schoolLeft = buildingState.workerInSchoolMonthsLeft ?? 0;
        if (schoolLeft > 0) {
          const nextLeft = Math.max(0, schoolLeft - monthsElapsed);
          updates.workerInSchoolMonthsLeft = nextLeft;
          if (nextLeft === 0) {
            updates.workerSchoolCoursesCompleted =
              (buildingState.workerSchoolCoursesCompleted ?? 0) + 1;
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        onUpdateState(updates);
      }
    }
  }, [currentTotalMonths]);

  if (!rule) return null;

  const roster = buildingState.factoryRoster || [];

  const handleSetWorkers = (nextCount: number) => {
    const clampedWorkers = Math.max(0, Math.min(m.maxWorkers, nextCount));
    const nextMaxWarehousemen = clampedWorkers > 0 ? Math.ceil(clampedWorkers / 10) : 0;
    const nextWarehousemen = Math.min(m.warehousemenCount, nextMaxWarehousemen);
    let nextRoster = syncRosterCount(roster, 'worker', clampedWorkers);
    nextRoster = syncRosterCount(nextRoster, 'warehouseman', nextWarehousemen);
    onUpdateState({
      factoryWorkersCount: clampedWorkers,
      factoryWarehousemenCount: nextWarehousemen,
      factoryRoster: nextRoster as BuildingState['factoryRoster'],
    });
  };

  const handleSetWarehousemen = (nextCount: number) => {
    const clamped = Math.max(0, Math.min(m.maxWarehousemen, nextCount));
    onUpdateState({
      factoryWarehousemenCount: clamped,
      factoryRoster: syncRosterCount(roster, 'warehouseman', clamped) as BuildingState['factoryRoster'],
    });
  };

  const handleSetManagers = (nextCount: number) => {
    const clamped = Math.max(0, Math.min(m.maxManagers, nextCount));
    onUpdateState({
      factoryManagersCount: clamped,
      factoryRoster: syncRosterCount(roster, 'manager', clamped) as BuildingState['factoryRoster'],
    });
  };

  const expYears = buildingState.workerExperienceYears ?? 0;
  const schoolCourses = buildingState.workerSchoolCoursesCompleted ?? 0;
  const schoolMonthsLeft = buildingState.workerInSchoolMonthsLeft ?? 0;

  const boxStyle = (ready: boolean) =>
    `rounded-2xl p-3.5 transition-all duration-200 flex flex-col justify-between space-y-2.5 ${
      ready
        ? 'border border-emerald-500/70 bg-stone-900/90 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
        : 'border-2 border-rose-500/80 bg-rose-950/25 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
    }`;

  const renderMonthlyProgressBar = (ready: boolean, label: string) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className={ready ? 'text-emerald-300' : 'text-rose-300'}>
          {!ready ? 'Brak obsady' : stage4Ready ? label : 'Gotowy (oczekuje na resztę)'}
        </span>
        <span className="text-stone-300">{ready && stage4Ready ? `${monthlyProgressPct}%` : '0%'}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-stone-950 border border-stone-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${!ready ? 'bg-rose-500/50' : 'bg-emerald-500'}`}
          style={{ width: `${ready && stage4Ready ? monthlyProgressPct : 0}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* RZĄD 1 WĘŻA: [1. Kupiec + Energia] ───► [2. Produkcja] */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_52px_1fr] gap-2 items-stretch">
        <div className={boxStyle(stage1Ready)}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">1. Zaopatrzenie (Kupiec + Energia)</span>
            <span className="text-[10px] font-mono text-stone-400">{energyLabel}</span>
          </div>
          {renderMonthlyProgressBar(stage1Ready, 'Cykl miesięczny dostaw')}
          <IndustryMerchantCard
            buildingTypeId={building.typeId}
            buildingState={buildingState}
            allWorldBuildings={allWorldBuildings}
            buildingsState={buildingsState}
            canDelegateToWorker={m.canDelegateRoles || m.merchantMode === 'worker'}
            workersCount={m.workersCount}
            currentTotalMonths={currentTotalMonths}
            onSpendGold={onSpendGold}
            onUpdateState={onUpdateState}
          />
        </div>

        <div className="hidden md:flex items-center justify-center">
          <FarmPipelineArrow direction="right" status={stage1Ready ? 'ready' : 'blocked'} />
        </div>

        {/* KRATKA 2: Produkcja (1000 jedn./mies. + Doświadczenie + Szkoła) */}
        <div className={boxStyle(stage2Ready)}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">2. Produkcja ({productName})</span>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-200">
              {m.workersCount} / {m.maxWorkers} rob.
            </span>
          </div>
          {renderMonthlyProgressBar(stage2Ready, `Produkcja (${monthlyCapacityUnits.toLocaleString()} jedn./mies.)`)}

          <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between gap-2">
            <div className="text-[11px] text-stone-300">
              <p>
                Moc: <strong className="text-emerald-400">{monthlyCapacityUnits.toLocaleString()}</strong> jedn./mies. ({m.totalProductionPercent}%)
              </p>
              <p className="text-[10px] text-stone-400">
                Staż: +{expYears}% ({expYears} l.) • Szkoła: +{schoolCourses * 10}%
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={m.workersCount <= 0}
                onClick={() => handleSetWorkers(m.workersCount - 1)}
                className="px-2 py-1 rounded bg-stone-800 border border-stone-700 text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                -1
              </button>
              <button
                type="button"
                disabled={m.workersCount >= m.maxWorkers}
                onClick={() => handleSetWorkers(m.workersCount + 1)}
                className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-200 disabled:opacity-40 cursor-pointer"
              >
                +1
              </button>
              <button
                type="button"
                disabled={m.workersCount >= m.maxWorkers}
                onClick={() => handleSetWorkers(m.workersCount + 5)}
                className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-200 disabled:opacity-40 cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>

          <FactoryStaffPicker
            role="worker"
            roleLabel="👷 Załoga produkcyjna"
            maxCount={m.maxWorkers}
            roster={roster}
            onHireNew={() => handleSetWorkers(m.workersCount + 1)}
          />

          {/* Szkoła branżowa + Zarządca */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              type="button"
              disabled={m.workersCount === 0 || schoolMonthsLeft > 0}
              onClick={() => onUpdateState({ workerInSchoolMonthsLeft: 12 })}
              className="p-2 rounded-xl border border-sky-500/40 bg-sky-950/30 hover:bg-sky-900/40 text-sky-200 font-semibold disabled:opacity-50 cursor-pointer text-left"
            >
              {schoolMonthsLeft > 0
                ? `🎓 Kurs w toku (${schoolMonthsLeft} mies.)`
                : '🎓 Szkoła branżowa (1 rok = +10%)'}
            </button>

            <div
              className={`p-2 rounded-xl border flex items-center justify-between ${
                !m.hasEnoughManagers ? 'bg-rose-950/40 border-rose-500/60 text-rose-200' : 'bg-stone-950/60 border-stone-800 text-stone-300'
              }`}
            >
              <span>👔 Zarządca {m.requiredManagers > 0 ? `(min.${m.requiredManagers})` : ''}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={m.managersCount <= 0}
                  onClick={() => handleSetManagers(m.managersCount - 1)}
                  className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-bold disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono font-bold text-amber-200">{m.managersCount}</span>
                <button
                  type="button"
                  disabled={m.managersCount >= m.maxManagers}
                  onClick={() => handleSetManagers(m.managersCount + 1)}
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 font-bold text-amber-200 disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ŁĄCZNIK PIONOWY 2 -> 3 */}
      <div className="hidden md:grid grid-cols-[1fr_52px_1fr] items-center">
        <div />
        <div />
        <div className="flex justify-center">
          <FarmPipelineArrow direction="down" status={stage2Ready ? 'ready' : 'blocked'} />
        </div>
      </div>

      {/* RZĄD 2 WĘŻA: [4. Sprzedawca (Capacity)] ◄─── [3. Magazynier] */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_52px_1fr] gap-2 items-stretch">
        {/* KRATKA 4: Sprzedawca - pasek TYLKO gdy ktoś kupuje (pokazuje zapełnienie capacity) */}
        <div className={boxStyle(stage4Ready)}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-300">4. Sprzedawca (Rynek)</span>
            <div className="flex items-center gap-1">
              {m.sellerActive && (m.canDelegateRoles || m.sellerMode === 'worker') && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateState({ sellerRoleMode: m.sellerMode === 'worker' ? 'dedicated' : 'worker' })
                  }
                  className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer ${
                    m.sellerMode === 'worker'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-stone-800 border-stone-700 text-stone-300'
                  }`}
                >
                  {m.sellerMode === 'worker' ? '👷 Robotnik' : '🏪 Etat'}
                </button>
              )}
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-200">
                {m.sellerActive ? 1 : 0} / 1
              </span>
            </div>
          </div>

          {/* Brak paska postępu gdy nikt nie kupuje! Pasek pojawia się dopiero przy zakontraktowaniu */}
          {buyersCount > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-emerald-300">
                  Zapełnienie capacity ({buyersCount} {buyersCount === 1 ? 'odbiorca' : 'odbiorców'})
                </span>
                <span className="text-amber-200">
                  {totalContractedUnits.toLocaleString()} / {monthlyCapacityUnits.toLocaleString()} ({sellerCapacityPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-950 border border-stone-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${sellerCapacityPct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 italic py-1">
              Nikt jeszcze nie kupuje z tego zakładu (0 zakontraktowanych odbiorców).
            </p>
          )}

          <button
            type="button"
            onClick={() => onUpdateState({ factorySellerHired: !m.sellerActive })}
            className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              m.sellerActive
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15 text-amber-200'
            }`}
          >
            {m.sellerActive ? '✓ Sprzedawca aktywny (Usuń)' : '➕ Dodaj Sprzedawcę na Rynek'}
          </button>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <FarmPipelineArrow direction="left" status={stage3Ready ? 'ready' : 'blocked'} />
        </div>

        {/* KRATKA 3: Magazynier */}
        <div className={boxStyle(stage3Ready)}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-300">3. Magazynier (Skład)</span>
            <div className="flex items-center gap-1">
              {m.warehousemenCount > 0 && (m.canDelegateRoles || m.warehousemanMode === 'worker') && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateState({
                      warehousemanRoleMode: m.warehousemanMode === 'worker' ? 'dedicated' : 'worker',
                    })
                  }
                  className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer ${
                    m.warehousemanMode === 'worker'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-stone-800 border-stone-700 text-stone-300'
                  }`}
                >
                  {m.warehousemanMode === 'worker' ? '👷 Robotnik' : '📦 Etat'}
                </button>
              )}
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-200">
                {m.warehousemenCount} / {m.maxWarehousemen}
              </span>
            </div>
          </div>
          {renderMonthlyProgressBar(stage3Ready, 'Składowanie w magazynie')}
          <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between text-[11px]">
            <span className="text-stone-300">Max 1 na 10 robotników</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={m.warehousemenCount <= 0}
                onClick={() => handleSetWarehousemen(m.warehousemenCount - 1)}
                className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 font-bold disabled:opacity-40 cursor-pointer"
              >
                -1
              </button>
              <button
                type="button"
                disabled={m.warehousemenCount >= m.maxWarehousemen}
                onClick={() => handleSetWarehousemen(m.warehousemenCount + 1)}
                className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 font-bold text-amber-200 disabled:opacity-40 cursor-pointer"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
