import type { BuildingState } from '../types';

export type SupportRoleMode = 'dedicated' | 'worker';

export interface FactoryStaffMetrics {
  tileCount: number;
  maxWorkers: number;
  workersCount: number;
  canDelegateRoles: boolean;
  merchantActive: boolean;
  merchantMode: SupportRoleMode;
  warehousemanActive: boolean;
  warehousemanMode: SupportRoleMode;
  maxWarehousemen: number;
  warehousemenCount: number;
  sellerActive: boolean;
  sellerMode: SupportRoleMode;
  dedicatedSupportCount: number;
  totalStaffCount: number;
  requiredManagers: number;
  maxManagers: number;
  managersCount: number;
  hasEnoughManagers: boolean;
  delegatedRolesCount: number;
  delegatedWorkerPenaltyPercent: number;
  delegatedWorkerProductivityPercent: number;
  totalProductionPercent: number;
}

export function computeFactoryStaffMetrics(
  sizeX: number,
  sizeY: number,
  state: BuildingState
): FactoryStaffMetrics {
  const tileCount = sizeX * sizeY;
  const maxWorkers = tileCount * 10;
  const workersCount = Math.min(maxWorkers, Math.max(0, state.factoryWorkersCount ?? 0));

  // W małych firmach (< 10 osób) robotnik może pełnić funkcję kupca, magazyniera lub sprzedawcy
  const rawMerchantMode: SupportRoleMode =
    state.merchantRoleMode === 'worker' && workersCount > 0 && workersCount < 10 ? 'worker' : 'dedicated';
  const rawWarehouseMode: SupportRoleMode =
    state.warehousemanRoleMode === 'worker' && workersCount > 0 && workersCount < 10 ? 'worker' : 'dedicated';
  const rawSellerMode: SupportRoleMode =
    state.sellerRoleMode === 'worker' && workersCount > 0 && workersCount < 10 ? 'worker' : 'dedicated';

  const merchantActive = Boolean(state.merchantHired);
  const maxWarehousemen = workersCount > 0 ? Math.ceil(workersCount / 10) : 0;
  const warehousemenCount = Math.min(
    maxWarehousemen,
    Math.max(0, state.factoryWarehousemenCount ?? 0)
  );
  const warehousemanActive = warehousemenCount > 0;
  const sellerActive = Boolean(state.factorySellerHired);

  const merchantDedicated = merchantActive && rawMerchantMode === 'dedicated' ? 1 : 0;
  const warehouseDedicated =
    warehousemanActive && rawWarehouseMode === 'dedicated' ? warehousemenCount : 0;
  const sellerDedicated = sellerActive && rawSellerMode === 'dedicated' ? 1 : 0;

  const dedicatedSupportCount = merchantDedicated + warehouseDedicated + sellerDedicated;
  const totalStaffCount = workersCount + dedicatedSupportCount;

  // Mała firma to < 10 łącznych pracowników
  const canDelegateRoles = workersCount > 0 && totalStaffCount < 10;

  const merchantMode: SupportRoleMode =
    canDelegateRoles && rawMerchantMode === 'worker' ? 'worker' : 'dedicated';
  const warehousemanMode: SupportRoleMode =
    canDelegateRoles && rawWarehouseMode === 'worker' ? 'worker' : 'dedicated';
  const sellerMode: SupportRoleMode =
    canDelegateRoles && rawSellerMode === 'worker' ? 'worker' : 'dedicated';

  const delegatedRolesCount =
    (merchantActive && merchantMode === 'worker' ? 1 : 0) +
    (warehousemanActive && warehousemanMode === 'worker' ? 1 : 0) +
    (sellerActive && sellerMode === 'worker' ? 1 : 0);

  // Spadek produktywności 1 robotnika pełniącego dodatkowe funkcje:
  // (workersCount * delegatedRolesCount) * 10%
  const delegatedWorkerPenaltyPercent =
    workersCount > 0 && delegatedRolesCount > 0
      ? Math.min(100, workersCount * delegatedRolesCount * 10)
      : 0;
  const delegatedWorkerProductivityPercent = Math.max(0, 100 - delegatedWorkerPenaltyPercent);

  const totalProductionPercent =
    workersCount === 0
      ? 0
      : delegatedRolesCount > 0
      ? (workersCount - 1) * 100 + delegatedWorkerProductivityPercent
      : workersCount * 100;

  // Zarządca wymagany powyżej 5 pracowników łącznie (1 zarządca na max 10 pracowników)
  const requiredManagers = totalStaffCount > 5 ? Math.ceil(totalStaffCount / 10) : 0;
  const maxPossibleStaff = 1 + maxWorkers + Math.ceil(maxWorkers / 10) + 1;
  const maxManagers = Math.max(1, Math.ceil(maxPossibleStaff / 10));
  const managersCount = Math.min(maxManagers, Math.max(0, state.factoryManagersCount ?? 0));
  const hasEnoughManagers = managersCount >= requiredManagers;

  return {
    tileCount,
    maxWorkers,
    workersCount,
    canDelegateRoles,
    merchantActive,
    merchantMode,
    warehousemanActive,
    warehousemanMode,
    maxWarehousemen,
    warehousemenCount,
    sellerActive,
    sellerMode,
    dedicatedSupportCount,
    totalStaffCount,
    requiredManagers,
    maxManagers,
    managersCount,
    hasEnoughManagers,
    delegatedRolesCount,
    delegatedWorkerPenaltyPercent,
    delegatedWorkerProductivityPercent,
    totalProductionPercent,
  };
}
