import React, { useState } from 'react';
import type { BuildingState } from '../types';
import {
  INDUSTRY_SUPPLY_RULES,
  getProducerMarketAvailability,
  getSupplierStatusSummary,
  type WorldSupplierBuilding,
} from './industrySupplyConfig';
import {
  CONTRACT_OPTIONS,
  BASE_UNIT_MARKET_PRICE,
  computeContractBreakPenalty,
  computeContractRemainingMonths,
  getContractMeta,
  type ContractType,
} from './industryContracts';
import {
  getTransportCompanies,
  getAllowedTransportModes,
  resolveRouteForSupplier,
  TRANSPORT_MODE_LABELS,
} from './transportLogistics';

interface IndustryMerchantCardProps {
  buildingTypeId: string;
  buildingState: BuildingState;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
  canDelegateToWorker?: boolean;
  workersCount?: number;
  currentTotalMonths?: number;
  onSpendGold?: (amount: number) => void;
  onUpdateState: (updates: Partial<BuildingState>) => void;
}

export const IndustryMerchantCard: React.FC<IndustryMerchantCardProps> = ({
  buildingTypeId,
  buildingState,
  allWorldBuildings,
  buildingsState,
  canDelegateToWorker = false,
  workersCount = 0,
  currentTotalMonths = 1880 * 12 + 4,
  onSpendGold,
  onUpdateState,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pendingContract, setPendingContract] = useState<ContractType>(
    buildingState.merchantContractType || 'pay_as_you_go'
  );
  const rule = INDUSTRY_SUPPLY_RULES[buildingTypeId];
  if (!rule) return null;

  const matchingProducers = allWorldBuildings.filter((b) =>
    rule.allowedProducerTypeIds.includes(b.typeId)
  );
  const availableSuppliers = matchingProducers.filter(
    (b) => getProducerMarketAvailability(b, buildingsState[b.id]).isAvailable
  );
  const selectedSupplier = availableSuppliers.find(
    (s) => s.id === buildingState.merchantSupplierId
  );

  const activeContractMeta = getContractMeta(buildingState.merchantContractType);
  const remainingMonths = computeContractRemainingMonths(buildingState, currentTotalMonths);
  const hasLockedContract =
    Boolean(selectedSupplier) && activeContractMeta.durationMonths > 0 && remainingMonths > 0;

  const supplierPrice =
    (selectedSupplier ? buildingsState[selectedSupplier.id]?.productPrice : undefined) ??
    BASE_UNIT_MARKET_PRICE;
  const breakPenalty = hasLockedContract
    ? computeContractBreakPenalty(buildingState, supplierPrice, currentTotalMonths)
    : 0;
  const contractUnits = buildingState.merchantContractUnitsPerMonth ?? 1000;

  const transportCompanies = getTransportCompanies(allWorldBuildings);
  const route = resolveRouteForSupplier(selectedSupplier);
  const allowedModes = getAllowedTransportModes(route);
  const activeTransportMode =
    buildingState.merchantTransportMode && allowedModes.includes(buildingState.merchantTransportMode)
      ? buildingState.merchantTransportMode
      : allowedModes[0];

  const handleHireMerchant = () => {
    onUpdateState({ merchantHired: true });
    setIsPickerOpen(true);
  };

  const handleSelectSupplier = (supplierId: string) => {
    onUpdateState({
      merchantHired: true,
      merchantSupplierId: supplierId,
      merchantContractType: pendingContract,
      merchantContractStartTotalMonths:
        pendingContract === 'pay_as_you_go' ? undefined : currentTotalMonths,
      merchantContractUnitsPerMonth: contractUnits,
    });
    setIsPickerOpen(false);
  };

  const handleBreakContract = () => {
    if (breakPenalty > 0 && onSpendGold) {
      onSpendGold(breakPenalty);
    }
    onUpdateState({
      merchantSupplierId: undefined,
      merchantContractType: 'pay_as_you_go',
      merchantContractStartTotalMonths: undefined,
    });
    setIsPickerOpen(true);
  };

  const handleFireMerchant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLockedContract) return; // Nie można zwolnić kupca bez zerwania kontraktu
    onUpdateState({
      merchantHired: false,
      merchantSupplierId: undefined,
      merchantContractType: 'pay_as_you_go',
      merchantContractStartTotalMonths: undefined,
    });
    setIsPickerOpen(false);
  };

  return (
    <div className="p-3 bg-stone-950/60 rounded-xl border border-amber-500/25 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[11px] text-stone-400">
          Surowiec: <span className="text-stone-200 font-medium">{rule.requiredGoodsLabel}</span>
        </p>
        {buildingState.merchantHired && (
          <div className="flex items-center gap-1.5">
            {canDelegateToWorker && (
              <button
                type="button"
                onClick={() =>
                  onUpdateState({
                    merchantRoleMode:
                      buildingState.merchantRoleMode === 'worker' ? 'dedicated' : 'worker',
                  })
                }
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  buildingState.merchantRoleMode === 'worker'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-stone-800 border-stone-700 text-stone-300'
                }`}
              >
                {buildingState.merchantRoleMode === 'worker'
                  ? `👷 Robotnik (-${Math.min(100, workersCount * 10)}%)`
                  : '🧑‍💼 Etat'}
              </button>
            )}
            {!hasLockedContract && (
              <button
                type="button"
                onClick={handleFireMerchant}
                className="text-[10px] px-2 py-0.5 rounded border border-stone-700 text-stone-400 hover:text-rose-300 cursor-pointer"
              >
                Usuń
              </button>
            )}
          </div>
        )}
      </div>

      {!buildingState.merchantHired ? (
        <button
          type="button"
          onClick={handleHireMerchant}
          className="w-full p-2.5 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15 transition-all flex items-center justify-between cursor-pointer text-left"
        >
          <span className="text-xs font-bold text-amber-200">➕ Dodaj Kupca i wybierz dostawcę</span>
          <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-500/15">
            Dodaj
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => !hasLockedContract && setIsPickerOpen((prev) => !prev)}
            className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between text-left ${
              hasLockedContract ? 'cursor-default' : 'cursor-pointer'
            } ${
              selectedSupplier
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-amber-950/30 border-amber-500/40'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-stone-100">
                {selectedSupplier ? `Dostawca: ${selectedSupplier.name}` : 'Brak wybranego dostawcy'}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {selectedSupplier
                  ? `${getSupplierStatusSummary(selectedSupplier, buildingsState[selectedSupplier.id])} • ${activeContractMeta.label}${
                      hasLockedContract ? ` (${remainingMonths} mies. do końca)` : ''
                    }`
                  : 'Kliknij, aby wybrać dostawcę i kontrakt na rynku'}
              </p>
            </div>
            {!hasLockedContract && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-stone-800 border border-stone-600 text-amber-200">
                {isPickerOpen ? 'Zamknij ▲' : 'Wybierz ▼'}
              </span>
            )}
          </button>

          {/* Wynajem prywatnej firmy transportowej (obowiązkowy do dostaw w 1880 r.) */}
          {selectedSupplier && (
            <div className="p-2 rounded-lg bg-stone-900/90 border border-stone-700 space-y-1.5 text-[10px]">
              <p className="font-bold text-amber-300 flex items-center justify-between">
                <span>🚚 Firma Transportowa (Rok 1880)</span>
                <span className="text-stone-400 font-normal">
                  {route === 'rural_to_city' ? 'Wieś → Miasto: Konie lub Kolej' : 'Wewnątrz miasta: tylko Konie'}
                </span>
              </p>
              {transportCompanies.length === 0 ? (
                <p className="text-rose-300">
                  ⚠️ Brak Firmy Transportowej — wybuduj budynek Firmy Transportowej (2x2), aby dostarczać surowiec!
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={buildingState.merchantTransportCompanyId || ''}
                    onChange={(e) =>
                      onUpdateState({
                        merchantTransportCompanyId: e.target.value || undefined,
                        merchantTransportMode: activeTransportMode,
                      })
                    }
                    className="bg-stone-950 border border-stone-700 rounded px-1.5 py-1 text-stone-200"
                  >
                    <option value="">-- Wynajmij firmę transportową --</option>
                    {transportCompanies.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name} ({tc.x}, {tc.y})
                      </option>
                    ))}
                  </select>

                  <select
                    value={activeTransportMode}
                    onChange={(e) =>
                      onUpdateState({ merchantTransportMode: e.target.value as any })
                    }
                    className="bg-stone-950 border border-stone-700 rounded px-1.5 py-1 text-amber-200"
                  >
                    {allowedModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {TRANSPORT_MODE_LABELS[mode].icon} {TRANSPORT_MODE_LABELS[mode].label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Aktywny kontrakt - przycisk zerwania z karą 20% wartości do końca */}
          {hasLockedContract && (
            <div className="p-2 rounded-lg bg-stone-900/90 border border-amber-500/30 flex items-center justify-between gap-2 text-[10px]">
              <span className="text-amber-200">
                Kontrakt: <strong>{activeContractMeta.label}</strong> ({contractUnits} jedn./mies., zniżka -{activeContractMeta.discountPercent}%)
              </span>
              <button
                type="button"
                onClick={handleBreakContract}
                className="px-2 py-1 rounded bg-rose-500/20 border border-rose-500/50 text-rose-200 font-bold hover:bg-rose-500/35 cursor-pointer flex-shrink-0"
              >
                Zerwij kontrakt (kara: £{breakPenalty})
              </button>
            </div>
          )}

          {isPickerOpen && !hasLockedContract && (
            <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-700 space-y-2">
              <p className="text-[10px] font-bold text-amber-300 uppercase">Wybierz warunki zakupu:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {CONTRACT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPendingContract(opt.id)}
                    className={`p-1.5 rounded-lg border text-left text-[10px] cursor-pointer ${
                      pendingContract === opt.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                        : 'bg-stone-950/70 border-stone-800 text-stone-300'
                    }`}
                  >
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[9px] text-emerald-300">{opt.badge}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-300 pt-1">
                <span>Zamawiana ilość (jedn./mies.):</span>
                <input
                  type="number"
                  min={100}
                  max={20000}
                  step={100}
                  value={contractUnits}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val > 0) {
                      onUpdateState({ merchantContractUnitsPerMonth: val });
                    }
                  }}
                  className="w-20 bg-stone-950 border border-stone-700 rounded px-1.5 py-0.5 font-mono text-amber-200 text-right"
                />
              </div>

              <p className="text-[10px] text-stone-400 pt-1">
                Dostępni dostawcy na rynku ({availableSuppliers.length}):
              </p>
              {availableSuppliers.length === 0 ? (
                <p className="text-[11px] text-stone-400 p-2 bg-stone-950/60 rounded">
                  {matchingProducers.length > 0
                    ? 'Istniejące zakłady/farmy nie mają jeszcze zatrudnionego sprzedawcy lub zapasu towaru na magazynie.'
                    : rule.emptyHint}
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {availableSuppliers.map((supplier) => {
                    const isSelected = supplier.id === buildingState.merchantSupplierId;
                    const price = buildingsState[supplier.id]?.productPrice ?? BASE_UNIT_MARKET_PRICE;
                    const meta = getContractMeta(pendingContract);
                    const finalPrice = (price * (1 - meta.discountPercent / 100)).toFixed(2);
                    return (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => handleSelectSupplier(supplier.id)}
                        className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-[11px] cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400 text-emerald-100'
                            : 'bg-stone-950/70 border-stone-800 hover:border-amber-500/50 text-stone-200'
                        }`}
                      >
                        <div>
                          <p className="font-bold">
                            {supplier.mapType === 'rural' ? '🌾' : '🏭'}{' '}
                            <span className="text-amber-200/90">
                              {buildingsState[supplier.id]?.ownerName || supplier.playerName || 'JOHN BIG'}
                            </span>{' '}
                            • {supplier.cityName || 'Londyn'} •{' '}
                            {buildingsState[supplier.id]?.enterpriseName || supplier.name}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {supplier.mapType === 'rural' ? 'Wieś' : 'Miasto'} ({supplier.x}, {supplier.y}) •{' '}
                            {getSupplierStatusSummary(supplier, buildingsState[supplier.id])} • £{finalPrice}/jedn.
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300">
                          {isSelected ? '✓ Wybrany' : 'Kontraktuj'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
