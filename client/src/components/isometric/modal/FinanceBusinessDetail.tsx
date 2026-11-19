import React from 'react';
import type { BuildingState } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { getProducerMarketAvailability } from './industrySupplyConfig';
import { getContractMeta, BASE_UNIT_MARKET_PRICE } from './industryContracts';
import { FinanceMonthlyChart } from './FinanceMonthlyChart';

interface FinanceBusinessDetailProps {
  building: WorldSupplierBuilding;
  buildingState?: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  sectorLabel: string;
  onBack: () => void;
}

export const FinanceBusinessDetail: React.FC<FinanceBusinessDetailProps> = ({
  building,
  buildingState,
  allWorldBuildings,
  buildingsState,
  sectorLabel,
  onBack,
}) => {
  const st = buildingState || {};
  const avail = getProducerMarketAvailability(building, st);
  const unitPrice = st.productPrice ?? BASE_UNIT_MARKET_PRICE;
  const stockValue = Math.round(avail.stockUnits * unitPrice);

  // Załoga i płace miesięczne (30 dni w miesiącu)
  const workers = st.factoryWorkersCount ?? 0;
  const managers = st.factoryManagersCount ?? st.managersCount ?? 0;
  const warehousemen =
    st.warehousemanRoleMode === 'worker' ? 0 : st.factoryWarehousemenCount ?? 0;
  const merchantCount = st.merchantHired && st.merchantRoleMode !== 'worker' ? 1 : 0;
  const sellerCount = st.factorySellerHired && st.sellerRoleMode !== 'worker' ? 1 : 0;
  const ruralCrewCount =
    (st.farmCapitalism?.crew?.length ?? 0) +
    (st.flaxState?.crew?.length ?? 0) +
    (st.hopState?.crew?.length ?? 0) +
    (st.orchardState?.crew?.length ?? 0) +
    (st.livestockState?.crew?.length ?? 0) +
    (st.mineStaff?.minersCount ?? 0) +
    (st.mineStaff?.surfaceWorkersCount ?? 0);

  const workerMonthlyWage = (st.workerWage ?? 1.8) * 30;
  const managerMonthlyWage = (st.managerWage ?? 4.5) * 30;
  const wagesMonthly = Math.round(
    (workers + ruralCrewCount) * workerMonthlyWage +
      (warehousemen + merchantCount + sellerCount) * (workerMonthlyWage * 1.15) +
      managers * managerMonthlyWage
  );

  // Koszty surowców (kontrakt zaopatrzeniowca)
  const supplier = st.merchantSupplierId
    ? allWorldBuildings.find((b) => b.id === st.merchantSupplierId)
    : undefined;
  const supplierPrice =
    (supplier ? buildingsState[supplier.id]?.productPrice : undefined) ?? BASE_UNIT_MARKET_PRICE;
  const contractMeta = getContractMeta(st.merchantContractType);
  const contractUnits = st.merchantHired && supplier ? st.merchantContractUnitsPerMonth ?? 1000 : 0;
  const supplyMonthlyCost = Math.round(
    contractUnits * supplierPrice * (1 - contractMeta.discountPercent / 100)
  );

  // Energia / utrzymanie / czynsz targowy
  const energyBaseCost =
    st.businessEnergyScale === 'turbo' ? 180 : st.businessEnergyScale === 'eco' ? 60 : 110;
  const playerStalls = (st.marketStalls || []).filter((s) => s.tenantName === 'Gracz');
  const marketRentMonthly = Math.round(
    playerStalls.reduce((s, slot) => s + (slot.annualRent || 0), 0) / 12
  );
  const maintenanceMonthly =
    building.typeId === 'marketplace' ? marketRentMonthly : energyBaseCost;

  // Szacowane przychody miesięczne
  const monthlyOutputUnits =
    building.typeId === 'marketplace'
      ? playerStalls.reduce((s, slot) => s + (slot.sellers?.length ?? 0) * 400, 0)
      : avail.hasSeller
      ? Math.max(avail.stockUnits, workers * 1000 || ruralCrewCount * 450)
      : 0;
  const estimatedMonthlyRevenue = Math.round(monthlyOutputUnits * unitPrice);

  const totalMonthlyCosts = wagesMonthly + supplyMonthlyCost + maintenanceMonthly;
  const netMonthlyProfit = estimatedMonthlyRevenue - totalMonthlyCosts;
  const netAnnualProfit = netMonthlyProfit * 12;
  const isAgriculture = sectorLabel === 'Rolnictwo';
  const periodFactor = isAgriculture ? 12 : 1;
  const periodSuffix = isAgriculture ? '/ rok' : '/ mies.';

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
      <div className="flex items-center justify-between gap-2 bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-amber-300 font-mono">
            {sectorLabel} • {building.mapType === 'rural' ? 'Wieś' : 'Miasto'} ({building.x}, {building.y})
          </p>
          <h3 className="text-lg font-bold text-stone-100">
            {st.enterpriseName || building.name}
          </h3>
          <p className="text-[11px] text-stone-400">
            Właściciel: <strong className="text-stone-200">{st.ownerName || 'Gracz 1'}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-bold text-amber-200 cursor-pointer"
        >
          ← Powrót do listy
        </button>
      </div>

      {/* Główne podsumowanie finansowe zakładu */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase">Przychód szac. {periodSuffix}</p>
          <p className="text-base font-mono font-bold text-emerald-400">
            +£{(estimatedMonthlyRevenue * periodFactor).toLocaleString('en-US')}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase">Koszty łączne {periodSuffix}</p>
          <p className="text-base font-mono font-bold text-rose-400">
            -£{(totalMonthlyCosts * periodFactor).toLocaleString('en-US')}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase">Bilans netto {periodSuffix}</p>
          <p
            className={`text-base font-mono font-bold ${
              netMonthlyProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'
            }`}
          >
            {netMonthlyProfit >= 0 ? '+' : ''}£{(netMonthlyProfit * periodFactor).toLocaleString('en-US')}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
          <p className="text-[10px] text-stone-400 uppercase">
            {isAgriculture ? 'Cykl rozliczeniowy' : 'Prognoza roczna'}
          </p>
          <p
            className={`text-base font-mono font-bold ${
              netAnnualProfit >= 0 ? 'text-amber-300' : 'text-rose-400'
            }`}
          >
            {isAgriculture
              ? 'Roczny (Żniwa)'
              : `${netAnnualProfit >= 0 ? '+' : ''}£${netAnnualProfit.toLocaleString('en-US')}`}
          </p>
        </div>
      </div>

      {/* Szczegółowe przepływy: Przychody vs Koszty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-stone-950/70 border border-emerald-500/30 space-y-2">
          <h4 className="font-bold text-emerald-300 uppercase text-[11px] tracking-wider">
            📈 Przychody i Magazyn
          </h4>
          <div className="flex justify-between">
            <span className="text-stone-400">Cena jednostkowa produktu:</span>
            <span className="font-mono text-stone-100">£{unitPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Stan magazynu:</span>
            <span className="font-mono text-amber-200">{avail.stockLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Wartość zapasów w magazynie:</span>
            <span className="font-mono text-emerald-300">£{stockValue.toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Status sprzedawcy:</span>
            <span className={avail.hasSeller ? 'text-emerald-300 font-semibold' : 'text-rose-300'}>
              {avail.hasSeller ? 'Aktywny (sprzedaż odblokowana)' : 'Brak sprzedawcy'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-950/70 border border-rose-500/30 space-y-2">
          <h4 className="font-bold text-rose-300 uppercase text-[11px] tracking-wider">
            📉 Koszty Miesięczne
          </h4>
          <div className="flex justify-between">
            <span className="text-stone-400">Wynagrodzenia załogi ({workers + ruralCrewCount + managers + warehousemen + merchantCount + sellerCount} os.):</span>
            <span className="font-mono text-rose-300">-£{wagesMonthly.toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Zakup surowców / kontrakty ({contractMeta.label}):</span>
            <span className="font-mono text-rose-300">-£{supplyMonthlyCost.toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">
              {building.typeId === 'marketplace' ? 'Czynsz za stoiska:' : 'Energia i utrzymanie:'}
            </span>
            <span className="font-mono text-rose-300">-£{maintenanceMonthly.toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between border-t border-stone-800 pt-1.5 font-bold">
            <span className="text-stone-200">Koszty razem / mies.:</span>
            <span className="font-mono text-rose-400">-£{totalMonthlyCosts.toLocaleString('en-US')}</span>
          </div>
        </div>
      </div>

      <FinanceMonthlyChart
        mode={isAgriculture ? 'annual' : 'monthly'}
        monthlyRevenue={estimatedMonthlyRevenue}
        monthlyWages={wagesMonthly}
        monthlySupply={supplyMonthlyCost}
        monthlyRent={maintenanceMonthly}
      />
    </div>
  );
};
