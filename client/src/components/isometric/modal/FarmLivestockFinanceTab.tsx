import React, { useState } from 'react';
import type { BuildingState, PlacedBuilding } from '../types';
import { formatSupplierOrderLabel, type WorldSupplierBuilding } from './industrySupplyConfig';
import { BASE_UNIT_MARKET_PRICE, getContractMeta } from './industryContracts';
import { FarmFinanceSummary, type FinanceContractLine } from './FarmFinanceSummary';
import { FarmAnnualYieldChart } from './FarmAnnualYieldChart';
import { LivestockFinanceSummary } from './LivestockFinanceSummary';

interface FarmLivestockFinanceTabProps {
  building: PlacedBuilding;
  buildingState: BuildingState;
  attachedFieldsCount: number;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  onUpdateState?: (updates: Partial<BuildingState>) => void;
}

export const FarmLivestockFinanceTab: React.FC<FarmLivestockFinanceTabProps> = ({
  building,
  buildingState,
  attachedFieldsCount,
  allWorldBuildings,
  buildingsState,
  onUpdateState,
}) => {
  const [subTab, setSubTab] = useState<'summary' | 'pricelist' | 'yields'>('summary');
  const isFarm = building.typeId === 'wheat_farm';

  // Kontrakty odbiorców przemysłowych / usługowych wskazujące na ten budynek
  const industryBuyerLines: FinanceContractLine[] = [];
  allWorldBuildings.forEach((b) => {
    if (b.id === building.id) return;
    const st = buildingsState[b.id];
    if (st?.merchantSupplierId === building.id && st.merchantHired) {
      const meta = getContractMeta(st.merchantContractType);
      const units = st.merchantContractUnitsPerMonth ?? 1000;
      const rev = Number((units * BASE_UNIT_MARKET_PRICE * (1 - meta.discountPercent / 100)).toFixed(2));
      industryBuyerLines.push({
        id: `ind_${b.id}`,
        counterpartyName: formatSupplierOrderLabel(b),
        goodsLabel: 'Kontrakt surowcowy',
        amountLabel: `${units} jedn./msc`,
        contractLabel: meta.label,
        monthlyValueGbp: rev,
      });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2.5">
        <button
          type="button"
          onClick={() => setSubTab('summary')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'summary'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50'
              : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
          }`}
        >
          📊 Zestawienie
        </button>
        <button
          type="button"
          onClick={() => setSubTab('pricelist')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'pricelist'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50'
              : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
          }`}
        >
          🏷️ Cennik
        </button>
        {isFarm && (
          <button
            type="button"
            onClick={() => setSubTab('yields')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'yields'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-500/50'
                : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            📈 Plony roczne
          </button>
        )}
      </div>

      {isFarm && subTab === 'yields' ? (
        <FarmAnnualYieldChart
          buildingState={buildingState}
          attachedFieldsCount={attachedFieldsCount}
        />
      ) : isFarm ? (
        <FarmFinanceSummary
          building={building}
          buildingState={buildingState}
          attachedFieldsCount={attachedFieldsCount}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          industryBuyerLines={industryBuyerLines}
          activeSubTab={subTab === 'pricelist' ? 'pricelist' : 'summary'}
          onUpdateState={onUpdateState}
        />
      ) : (
        <LivestockFinanceSummary
          building={building}
          buildingState={buildingState}
          allWorldBuildings={allWorldBuildings}
          buildingsState={buildingsState}
          industryBuyerLines={industryBuyerLines}
          activeSubTab={subTab === 'pricelist' ? 'pricelist' : 'summary'}
          onUpdateState={onUpdateState}
        />
      )}
    </div>
  );
};
