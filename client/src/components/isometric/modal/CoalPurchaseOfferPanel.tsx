import React, { useState } from 'react';
import type { BuildingState, BusinessEnergyScale, CoalSupplyOrder } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import {
  CONTRACT_OPTIONS,
  computeSupplyContractPenalty,
  getContractMeta,
  type ContractType,
} from './industryContracts';
import { SCALE_CONFIG } from './energyConfig';
import { MINE_DEPOSITS } from './mine/mineTypes';

interface CoalPurchaseOfferPanelProps {
  fuelKind?: 'wegiel' | 'wegiel_drzewny';
  coalStockTons: number;
  coalOrder?: CoalSupplyOrder;
  coalInterventionBuyEnabled?: boolean;
  energyScale: BusinessEnergyScale;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onSpendGold?: (amount: number) => void;
  onUpdateAnyBuildingState?: (buildingId: string, newState: Partial<BuildingState>) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const CoalPurchaseOfferPanel: React.FC<CoalPurchaseOfferPanelProps> = ({
  fuelKind = 'wegiel',
  coalStockTons,
  coalOrder,
  coalInterventionBuyEnabled,
  energyScale,
  allWorldBuildings,
  buildingsState,
  onSpendGold,
  onUpdateAnyBuildingState,
  onUpdateState,
}) => {
  const isCharcoal = fuelKind === 'wegiel_drzewny';
  const [feedback, setFeedback] = useState<string | null>(null);
  const scaleMultiplier = SCALE_CONFIG[energyScale || 'standard'].multiplier;
  const monthlyNeedTons = Number(((isCharcoal ? 1.8 : 2.4) * scaleMultiplier).toFixed(2));

  const shipSupplier: WorldSupplierBuilding = allWorldBuildings.find(
    (b) => b.typeId === 'trade_ship'
  ) || {
    id: 'trade_ship_init',
    typeId: 'trade_ship',
    name: 'Statek Handlowy (Port Londyn)',
    x: 0,
    y: 0,
    sizeX: 1,
    sizeY: 2,
    rotation: 0,
    cost: 0,
    mapType: 'city',
  };

  const coalMines = isCharcoal
    ? []
    : allWorldBuildings.filter(
        (b) =>
          b.typeId === 'coal_mine' ||
          (b.typeId === 'mine_shaft' && (buildingsState[b.id]?.mineDepositType || 'coal') === 'coal')
      );
  const suppliers = [shipSupplier, ...coalMines];

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    coalOrder?.supplierId || shipSupplier.id
  );
  const [monthlyTons, setMonthlyTons] = useState<number>(
    coalOrder?.monthlyTons || monthlyNeedTons
  );
  const [contractType, setContractType] = useState<ContractType>(
    coalOrder?.contractType || 'pay_as_you_go'
  );

  const activeSupplierId = suppliers.some((s) => s.id === selectedSupplierId)
    ? selectedSupplierId
    : shipSupplier.id;
  const isShipSelected = activeSupplierId.startsWith('trade_ship');
  const shipPricePerTon = Number(
    ((isCharcoal ? 6.0 : MINE_DEPOSITS.coal.basePricePerTon) * 1.1).toFixed(2)
  );
  const selectedMineState = !isShipSelected ? buildingsState[activeSupplierId] : undefined;
  const unitPrice = isShipSelected
    ? shipPricePerTon
    : selectedMineState?.mineCapitalism?.pricePerTon ?? MINE_DEPOSITS.coal.basePricePerTon;

  const meta = getContractMeta(contractType);
  const monthlyCost = Number(
    (monthlyTons * unitPrice * (1 - meta.discountPercent / 100)).toFixed(2)
  );
  const qtyOptions = Array.from(new Set([monthlyNeedTons, 1, 2, 2.4, 3.6, 5, 10])).sort(
    (a, b) => a - b
  );

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSaveContract = () => {
    const nextOrder: CoalSupplyOrder = {
      supplierId: activeSupplierId,
      monthlyTons,
      contractType,
      monthsRemaining: meta.durationMonths,
    };
    onUpdateState(isCharcoal ? { charcoalOrder: nextOrder } : { coalOrder: nextOrder });
    notify(
      `📜 Zapisano kontrakt na ${isCharcoal ? 'węgiel drzewny' : 'węgiel'} (${monthlyTons} t/msc, ${meta.label}) od kolejnego miesiąca.`
    );
  };

  const handleRemoveContract = () => {
    if (!coalOrder) return;
    const activeMeta = getContractMeta(coalOrder.contractType);
    const penalty =
      activeMeta.durationMonths > 0
        ? computeSupplyContractPenalty(
            coalOrder.monthlyTons,
            shipPricePerTon,
            coalOrder.contractType,
            coalOrder.monthsRemaining
          )
        : 0;
    if (penalty > 0) onSpendGold?.(penalty);
    onUpdateState(isCharcoal ? { charcoalOrder: undefined } : { coalOrder: undefined });
    notify(
      penalty > 0
        ? `Zerwano kontrakt na ${isCharcoal ? 'węgiel drzewny' : 'węgiel'} (kara: £${penalty}).`
        : `Anulowano kontrakt na ${isCharcoal ? 'węgiel drzewny' : 'węgiel'}.`
    );
  };

  const handleQuickBuyOnce = () => {
    const cost = Number((monthlyNeedTons * unitPrice).toFixed(2));
    if (!isShipSelected && selectedMineState) {
      const avail = selectedMineState.mineStock ?? 0;
      const bought = Math.min(monthlyNeedTons, avail);
      if (bought <= 0) {
        notify('⚠️ Wybrana kopalnia nie ma węgla na hałdzie.');
        return;
      }
      const actualCost = Number((bought * unitPrice).toFixed(2));
      onSpendGold?.(actualCost);
      onUpdateAnyBuildingState?.(activeSupplierId, {
        mineStock: Number(Math.max(0, avail - bought).toFixed(2)),
        ...(selectedMineState.mineCapitalism
          ? {
              mineCapitalism: {
                ...selectedMineState.mineCapitalism,
                totalRevenue: Number((selectedMineState.mineCapitalism.totalRevenue + actualCost).toFixed(2)),
              },
            }
          : {}),
      });
      onUpdateState(
        isCharcoal
          ? { charcoalStockTons: Number((coalStockTons + bought).toFixed(2)) }
          : { coalStockTons: Number((coalStockTons + bought).toFixed(2)) }
      );
      notify(`⛏️ Dokupiono jednorazowo ${bought} t węgla za £${actualCost.toFixed(2)}!`);
      return;
    }
    onSpendGold?.(cost);
    onUpdateState(
      isCharcoal
        ? { charcoalStockTons: Number((coalStockTons + monthlyNeedTons).toFixed(2)) }
        : { coalStockTons: Number((coalStockTons + monthlyNeedTons).toFixed(2)) }
    );
    notify(
      `🚢 Dokupiono jednorazowo ${monthlyNeedTons} t ${isCharcoal ? 'węgla drzewnego' : 'węgla'} za £${cost.toFixed(2)}!`
    );
  };

  const activeOrderMeta = coalOrder ? getContractMeta(coalOrder.contractType) : null;
  const activeSupplierObj = coalOrder ? suppliers.find((s) => s.id === coalOrder.supplierId) : undefined;
  const activeIsShip = Boolean(coalOrder?.supplierId.startsWith('trade_ship'));
  const activeOwner = coalOrder ? buildingsState[coalOrder.supplierId]?.ownerName || activeSupplierObj?.playerName : undefined;
  const activeIsOurs = !activeIsShip && (!activeOwner || activeOwner === 'Gracz');
  const activePenalty =
    coalOrder && activeOrderMeta && activeOrderMeta.durationMonths > 0
      ? computeSupplyContractPenalty(
          coalOrder.monthlyTons,
          shipPricePerTon,
          coalOrder.contractType,
          coalOrder.monthsRemaining
        )
      : 0;

  return (
    <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
          {isCharcoal
            ? '🪵 Kontrakt Zakupu Węgla Drzewnego (Mielerz)'
            : '🪨 Kontrakt Zakupu Węgla (Zasilanie Kotła)'}
        </span>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-amber-200">
            Zapotrzebowanie: <strong className="text-yellow-300">{monthlyNeedTons.toFixed(2)} t/msc</strong>
          </span>
          <span className={coalStockTons > 0 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
            Zapas: {coalStockTons} t
          </span>
        </div>
      </div>

      {coalStockTons <= 0 && (
        <div className="bg-rose-500/15 border border-rose-500/40 text-rose-200 text-[11px] px-3 py-1.5 rounded-xl font-semibold flex flex-wrap items-center justify-between gap-2">
          <span>⚠️ Brak węgla na składzie — ustaw kontrakt i dokup pierwszą partię, aby uruchomić kocioł.</span>
          <button
            type="button"
            onClick={handleQuickBuyOnce}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] cursor-pointer"
          >
            🛒 Dokup teraz {monthlyNeedTons} t (£{(monthlyNeedTons * unitPrice).toFixed(2)})
          </button>
        </div>
      )}

      {feedback && (
        <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs px-3 py-1.5 rounded-xl">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={activeSupplierId}
          onChange={(e) => setSelectedSupplierId(e.target.value)}
          className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-stone-200 cursor-pointer"
        >
          {suppliers.map((s) => {
            if (s.typeId === 'trade_ship') {
              return (
                <option key={s.id} value={s.id}>
                  🚢 Statek Handlowy (£{shipPricePerTon.toFixed(2)}/t)
                </option>
              );
            }
            const st = buildingsState[s.id];
            const avail = st?.mineStock ?? 0;
            const price = st?.mineCapitalism?.pricePerTon ?? MINE_DEPOSITS.coal.basePricePerTon;
            return (
              <option key={s.id} value={s.id}>
                ⛏️ {formatSupplierOrderLabel(s)} ({avail} t • £{price}/t)
              </option>
            );
          })}
        </select>

        <select
          value={monthlyTons}
          onChange={(e) => setMonthlyTons(Number(e.target.value))}
          className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-[11px] text-stone-200 cursor-pointer"
        >
          {qtyOptions.map((t) => (
            <option key={t} value={t}>
              {t} t / msc{t === monthlyNeedTons ? ' (zapotrzebowanie)' : ''}
            </option>
          ))}
        </select>

        <select
          value={contractType}
          onChange={(e) => setContractType(e.target.value as ContractType)}
          className="bg-stone-900 border border-amber-500/40 rounded-lg px-2 py-1.5 text-[11px] text-amber-200 font-semibold cursor-pointer"
        >
          {CONTRACT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label} ({opt.discountPercent > 0 ? `-${opt.discountPercent}%` : '0%'})
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSaveContract}
        className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold cursor-pointer"
      >
        📜 Zawrzyj kontrakt na węgiel (£{monthlyCost.toFixed(2)} / msc)
      </button>

      <label className="flex items-center gap-2 bg-stone-900/70 border border-amber-500/30 rounded-lg px-2.5 py-1 text-[10px] text-amber-200 cursor-pointer">
        <input
          type="checkbox"
          checked={!!coalInterventionBuyEnabled}
          onChange={(e) => onUpdateState({ coalInterventionBuyEnabled: e.target.checked })}
          className="accent-amber-500 cursor-pointer"
        />
        <span className="font-semibold">🛟 Zakup interwencyjny ze statku (+10% do ceny statku)</span>
        <span
          title="Gdy kopalnia nie dostarczy pełnej ilości węgla w danym miesiącu, brakująca część zostanie dokupiona ze Statku Handlowego po cenie statku + 10%."
          className="text-stone-400 hover:text-amber-300 cursor-help ml-auto"
        >
          ℹ
        </span>
      </label>

      {coalOrder && activeOrderMeta && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px]">
          <div className="text-emerald-200 font-semibold">
            ✓{' '}
            <span className="text-white font-bold">
              {isCharcoal ? 'Węgiel drzewny' : 'Węgiel kamienny'}
            </span>{' '}
            •{' '}
            <span
              className={
                activeIsOurs
                  ? 'text-sky-300 font-bold'
                  : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'
              }
            >
              {activeIsShip
                ? '🚢 Statek Handlowy'
                : activeSupplierObj
                ? formatSupplierOrderLabel(activeSupplierObj)
                : 'Kopalnia Węgla'}
            </span>{' '}
            •{' '}
            <span className="font-mono font-bold text-yellow-300">
              {coalOrder.monthlyTons} t/msc
            </span>{' '}
            • {activeOrderMeta.label}
            {activeOrderMeta.durationMonths > 0
              ? ` (${coalOrder.monthsRemaining}/${activeOrderMeta.durationMonths} msc)`
              : ''}
          </div>
          <button
            type="button"
            onClick={handleRemoveContract}
            className="px-2 py-0.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-bold cursor-pointer"
          >
            ✕{activePenalty > 0 ? ` (£${activePenalty})` : ''}
          </button>
        </div>
      )}
    </div>
  );
};
