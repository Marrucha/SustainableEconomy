import type { PlacedBuilding, BuildingState } from '../types';
import type { MapType } from '../mapConfig';
import { canWorkerHandleStage, getStageAssignedWorkerIds } from './farmGridTypes';

export interface WorldSupplierBuilding extends PlacedBuilding {
  mapType?: MapType;
}

export const CURRENT_PLAYER_NAME = 'JOHN BIG';
export const DEFAULT_CITY_NAME = 'Londyn';

function resolveNormalizedFarmDisplayName(
  b: { id?: string; name: string },
  buildingsState?: Record<string, BuildingState>
): string {
  if (b.name === 'Wielka Farma Zbożowa') {
    const crew = b.id ? buildingsState?.[b.id]?.farmCapitalism?.crew : undefined;
    const firstFarmer = crew?.find(
      (w) => w.profession === 'farmer' || w.profession === 'all_rounder'
    );
    if (firstFarmer) {
      const parts = firstFarmer.name.trim().split(/\s+/);
      const surname = parts[parts.length - 1] || firstFarmer.name.trim();
      return `Farma zbożowa ${surname}`;
    }
    return 'Farma Zbożowa';
  }
  if (b.name === 'Farma Bydła i Owiec') {
    return 'Farma Hodowlana';
  }
  return b.name;
}

export function formatSupplierOrderLabel(
  b: {
    id?: string;
    typeId?: string;
    name: string;
    playerName?: string;
    cityName?: string;
  },
  buildingsState?: Record<string, BuildingState>,
  allBuildings?: Array<{ id?: string; name: string }>
): string {
  const player = b.playerName || CURRENT_PLAYER_NAME;
  const city = b.cityName || DEFAULT_CITY_NAME;
  let displayName = resolveNormalizedFarmDisplayName(b, buildingsState);

  if (allBuildings && b.id) {
    const sameNameList = allBuildings.filter(
      (item) =>
        resolveNormalizedFarmDisplayName(item, buildingsState).toLowerCase() ===
        displayName.toLowerCase()
    );
    if (sameNameList.length > 1) {
      const idx = sameNameList.findIndex((item) => item.id === b.id);
      if (idx > 0) {
        displayName = `${displayName} ${idx + 1}`;
      }
    }
  }

  return `${player} • ${city} • ${displayName}`;
}

export function resolveUniqueFarmName(
  prefix: string,
  workerFullName: string,
  allBuildings: Array<{ id: string; name: string }>,
  excludeBuildingId: string
): string {
  const parts = workerFullName.trim().split(/\s+/);
  const surname = parts[parts.length - 1] || workerFullName.trim() || 'Rolnik';
  const baseName = `${prefix} ${surname}`;
  const taken = new Set(
    allBuildings.filter((b) => b.id !== excludeBuildingId).map((b) => b.name.toLowerCase())
  );
  if (!taken.has(baseName.toLowerCase())) return baseName;
  let idx = 2;
  while (taken.has(`${baseName} ${idx}`.toLowerCase())) {
    idx += 1;
  }
  return `${baseName} ${idx}`;
}

export interface IndustrySupplyRule {
  requiredGoodsLabel: string;
  allowedProducerTypeIds: string[];
  emptyHint: string;
}

export const INDUSTRY_SUPPLY_RULES: Record<string, IndustrySupplyRule> = {
  mill: {
    requiredGoodsLabel: 'Zboże (pszenica / żyto / jęczmień)',
    allowedProducerTypeIds: ['wheat_farm'],
    emptyHint: 'Brak farm zbożowych na rynku. Wybuduj Wielką Farmę Zbożową na mapie Wieś, aby móc zamawiać ziarno.',
  },
  sawmill: {
    requiredGoodsLabel: 'Surowa dłużyca drewniana',
    allowedProducerTypeIds: ['woodcutter'],
    emptyHint: 'Brak wyrębów drewna na rynku. Wybuduj Wyręb Drewna na mapie Wieś.',
  },
  spinning_mill: {
    requiredGoodsLabel: 'Włókno lnu lub wełna owcza',
    allowedProducerTypeIds: ['flax_farm', 'livestock_farm', 'pasture_sheep'],
    emptyHint: 'Brak plantacji lnu lub hodowli owiec na rynku.',
  },
  sewing_factory: {
    requiredGoodsLabel: 'Materiał lniany / wełniany (Fabryka włókiennicza), Guziki (Fabryka), Stal (Huta)',
    allowedProducerTypeIds: ['spinning_mill', 'factory', 'huta'],
    emptyHint: 'Brak fabryki włókienniczej, fabryki (guziki) lub huty (stal na gorsety) na rynku.',
  },
  brewery: {
    requiredGoodsLabel: 'Chmiel (Plantacja Chmielu), Pszenica (Farma) i Szkło (Huta)',
    allowedProducerTypeIds: ['hop_farm', 'wheat_farm', 'huta'],
    emptyHint: 'Brak farm chmielu, farm zbożowych lub huty (szkło na butelki) na rynku.',
  },
  tannery: {
    requiredGoodsLabel: 'Skóry surowe',
    allowedProducerTypeIds: ['slaughterhouse', 'livestock_farm'],
    emptyHint: 'Brak rzeźni ani farm hodowlanych na rynku.',
  },
  shoemaker: {
    requiredGoodsLabel: 'Skóra (Garbarnia), Stal (Huta - buty), Materiał wełniany (kożuch)',
    allowedProducerTypeIds: ['tannery', 'huta', 'spinning_mill'],
    emptyHint: 'Brak garbarni, huty lub fabryki włókienniczej na rynku.',
  },
  dairy: {
    requiredGoodsLabel: 'Świeże mleko krowie',
    allowedProducerTypeIds: ['livestock_farm', 'pasture_cattle'],
    emptyHint: 'Brak farm bydła lub pastwisk krów na rynku.',
  },
  slaughterhouse: {
    requiredGoodsLabel: 'Żywiec rzeźny (bydło i owce)',
    allowedProducerTypeIds: ['livestock_farm', 'pasture_cattle', 'pasture_sheep'],
    emptyHint: 'Brak gospodarstw hodowlanych na rynku.',
  },
  butcher: {
    requiredGoodsLabel: 'Mięso wołowe (Rzeźnia) i sól (Kopalnia)',
    allowedProducerTypeIds: ['slaughterhouse', 'mine_shaft'],
    emptyHint: 'Brak rzeźni miejskiej lub kopalni (sól) na rynku.',
  },
  furniture_factory: {
    requiredGoodsLabel: 'Deski (Tartak), Skóra (Garbarnia), Materiał, Ebonit (Fabryka), Drut (Walcownia)',
    allowedProducerTypeIds: ['sawmill', 'tannery', 'spinning_mill', 'factory', 'rolling_mill'],
    emptyHint: 'Brak tartaku, garbarni, fabryki włókienniczej, fabryki lub walcowni na rynku.',
  },
  huta: {
    requiredGoodsLabel: 'Węgiel, rudy, piasek i glina (Kopalnia) oraz Soda (Fabryka - szkło)',
    allowedProducerTypeIds: ['mine_shaft', 'factory'],
    emptyHint: 'Brak kopalni głębinowej lub fabryki (soda do szkła) na rynku.',
  },
  cement_plant: {
    requiredGoodsLabel: 'Minerały i glina',
    allowedProducerTypeIds: ['mine_shaft'],
    emptyHint: 'Brak kopalni głębinowej na rynku.',
  },
  brickworks: {
    requiredGoodsLabel: 'Glina i węgiel',
    allowedProducerTypeIds: ['mine_shaft'],
    emptyHint: 'Brak kopalni głębinowej na rynku.',
  },
  jeweler: {
    requiredGoodsLabel: 'Złoto (Huta) i Minerały (Kopalnia)',
    allowedProducerTypeIds: ['huta', 'mine_shaft'],
    emptyHint: 'Brak Huty (złoto) lub Kopalni (minerały) na rynku.',
  },
  factory: {
    requiredGoodsLabel: 'Kauczuk, Tytoń, Bawełna, Len, Huta, Walcownia, Drewno, Rzeźnia, Kopalnia, Fabryka',
    allowedProducerTypeIds: ['rubber_plantation', 'tobacco_field', 'cotton_plantation', 'flax_farm', 'huta', 'rolling_mill', 'sawmill', 'woodcutter', 'slaughterhouse', 'butcher', 'mine_shaft', 'factory'],
    emptyHint: 'Brak Plantacji, Huty, Walcowni, Tartaku, Rzeźni, Kopalni lub Fabryki na rynku.',
  },
  rolling_mill: {
    requiredGoodsLabel: 'Stal (Huta)',
    allowedProducerTypeIds: ['huta'],
    emptyHint: 'Brak Huty w mieście (stal do walcowania).',
  },
  newspaper_publisher: {
    requiredGoodsLabel: 'Papier i Tusz (Fabryka) / Drewno (Tartak / Wyręb)',
    allowedProducerTypeIds: ['factory', 'sawmill', 'woodcutter'],
    emptyHint: 'Brak Fabryki (papier i tusz) lub Tartaku / Wyrębu na rynku.',
  },
  watchmaker: {
    requiredGoodsLabel: 'Stal, Szkło i Złoto (Huta)',
    allowedProducerTypeIds: ['huta'],
    emptyHint: 'Brak Huty w mieście (stal, szkło, złoto).',
  },
  sugar_refinery: {
    requiredGoodsLabel: 'Buraki cukrowe (Plantacja) i węgiel (Kopalnia)',
    allowedProducerTypeIds: ['sugar_beet_farm', 'mine_shaft'],
    emptyHint: 'Brak Plantacji Buraków Cukrowych na wsi lub Kopalni.',
  },
  bakery: {
    requiredGoodsLabel: 'Mąka pszenna i żytnia',
    allowedProducerTypeIds: ['mill'],
    emptyHint: 'Brak młyna parowego na rynku.',
  },
};

const CROP_LABELS: Record<string, string> = {
  pszenica: 'Pszenica Złocista',
  zyto: 'Żyto Ozime',
  jeczmien: 'Jęczmień Browarny',
};

export interface ProducerAvailability {
  hasSeller: boolean;
  stockUnits: number;
  isAvailable: boolean;
  stockLabel: string;
}

export function getProducerMarketAvailability(
  supplier: WorldSupplierBuilding,
  st?: BuildingState
): ProducerAvailability {
  if (!st) {
    return { hasSeller: false, stockUnits: 0, isAvailable: false, stockLabel: '0' };
  }

  const hasFactorySeller = Boolean(st.factorySellerHired);

  if (supplier.typeId === 'wheat_farm') {
    const farmCap = st.farmCapitalism;
    const crew = farmCap?.crew || [];
    const sellingWorkerIds = getStageAssignedWorkerIds(farmCap?.stageAssignments, 'storing_selling');
    const hasAssignedMerchant = sellingWorkerIds.some((id) =>
      crew.some((m) => m.id === id && canWorkerHandleStage(m, 'storing_selling'))
    );
    const hasSeller = hasFactorySeller || hasAssignedMerchant;
    const grains = farmCap?.grainStockKg;
    const totalStock = grains
      ? Object.values(grains).reduce((s, v) => s + (Number(v) || 0), 0)
      : 0;
    // Nienaruszalna rezerwa siewna (min. 300 kg) nie podlega sprzedaży
    const sellableStock = Math.max(0, totalStock - 300);
    return {
      hasSeller,
      stockUnits: sellableStock,
      isAvailable: hasSeller && sellableStock > 0,
      stockLabel: `${Math.round(sellableStock)} kg (z ${Math.round(totalStock)} kg)`,
    };
  }

  if (supplier.typeId === 'orchard') {
    const crew = st.orchardState?.crew || [];
    const hasSeller =
      hasFactorySeller ||
      crew.some((m) => m.profession === 'merchant' || m.profession === 'all_rounder');
    const fruits = st.orchardState?.fruitStockKg
      ? Object.values(st.orchardState.fruitStockKg).reduce((s, v) => s + (Number(v) || 0), 0)
      : 0;
    const stock = fruits + (st.orchardState?.ciderStockL ?? 0);
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${Math.round(stock)} kg/L`,
    };
  }

  if (supplier.typeId === 'flax_farm') {
    const crew = st.flaxState?.crew || [];
    const hasSeller =
      hasFactorySeller ||
      crew.some((m) => m.profession === 'merchant' || m.profession === 'all_rounder');
    const stock =
      (st.flaxState?.fiberStockKg ?? 0) +
      (st.flaxState?.linseedStockKg ?? 0) +
      (st.flaxState?.towStockKg ?? 0);
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${Math.round(stock)} kg`,
    };
  }

  if (supplier.typeId === 'hop_farm') {
    const crew = st.hopState?.crew || [];
    const hasSeller =
      hasFactorySeller ||
      crew.some((m) => m.profession === 'merchant' || m.profession === 'all_rounder');
    const stock = (st.hopState?.driedConesStockKg ?? 0) + (st.hopState?.freshConesStockKg ?? 0);
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${Math.round(stock)} kg`,
    };
  }

  if (
    supplier.typeId === 'livestock_farm' ||
    supplier.typeId === 'pasture_cattle' ||
    supplier.typeId === 'pasture_sheep'
  ) {
    const crew = st.livestockState?.crew || [];
    const hasSeller = hasFactorySeller || crew.some((m) => m.profession === 'trader');
    const storage = st.livestockState?.storage;
    const stock = storage
      ? Object.values(storage).reduce((s, v) => s + (Number(v) || 0), 0)
      : 0;
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${Math.round(stock)} szt/kg`,
    };
  }

  if (supplier.typeId === 'mine_shaft') {
    const crew = st.mineCapitalism?.crew || [];
    const hasSeller =
      hasFactorySeller ||
      crew.some((m) => m.profession === 'merchant' || m.profession === 'warehouseman' || m.profession === 'manager');
    const stock = st.mineStock ?? 0;
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${stock.toFixed(1)} t`,
    };
  }

  if (supplier.typeId === 'woodcutter') {
    const stock = st.woodcutterStock ?? 0;
    return {
      hasSeller: hasFactorySeller,
      stockUnits: stock,
      isAvailable: hasFactorySeller && stock > 0,
      stockLabel: `${stock.toFixed(1)} t`,
    };
  }

  if (supplier.typeId === 'mill') {
    const crew = st.millState?.crew || [];
    const hasSeller =
      hasFactorySeller ||
      crew.some((m) => m.profession === 'merchant' || m.profession === 'warehouseman' || m.profession === 'manager');
    const stock = (st.millState?.flourStockKg ?? 0) + (st.millState?.branStockKg ?? 0);
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${Math.round(stock)} kg`,
    };
  }

  if (supplier.typeId === 'bakery') {
    const crew = st.bakeryState?.crew || [];
    const hasSeller =
      hasFactorySeller ||
      crew.some((m) => m.profession === 'merchant' || m.profession === 'warehouseman' || m.profession === 'manager');
    const stock = (st.bakeryState?.breadStockKg ?? 0) + (st.bakeryState?.rusksStockKg ?? 0);
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${Math.round(stock)} kg`,
    };
  }

  // Fabryki i zakłady przetwórcze
  const stock = st.productStockUnits ?? 0;
  return {
    hasSeller: hasFactorySeller,
    stockUnits: stock,
    isAvailable: hasFactorySeller && stock > 0,
    stockLabel: `${Math.round(stock)} jedn.`,
  };
}

export function getSupplierStatusSummary(
  supplier: WorldSupplierBuilding,
  supplierState?: BuildingState
): string {
  const owner = supplierState?.ownerName || 'Gracz';
  const farmOrFirmName = supplierState?.enterpriseName || supplier.name;
  const location = supplier.mapType === 'rural' ? 'Wieś' : 'Miasto';
  const coords = `${location} (${supplier.x}, ${supplier.y})`;
  const prefix = `Producent: ${owner} • ${farmOrFirmName} • ${coords}`;

  if (supplier.typeId === 'wheat_farm') {
    const cropKey = supplierState?.farmCapitalism?.cropType || supplierState?.cropType || 'pszenica';
    const cropName = CROP_LABELS[cropKey] || 'Zboże';
    const stock = supplierState?.farmCapitalism?.grainStockKg?.[cropKey];
    if (typeof stock === 'number') {
      return `${prefix} • Uprawa: ${cropName} • Spichlerz: ${Math.round(stock)} kg`;
    }
    return `${prefix} • Uprawa: ${cropName}`;
  }

  if (supplier.typeId === 'woodcutter' && typeof supplierState?.woodcutterStock === 'number') {
    return `${prefix} • Zapas drewna: ${supplierState.woodcutterStock.toFixed(1)} t`;
  }

  return prefix;
}

export interface IncomingSalesContractLine {
  id: string;
  buyerId: string;
  buyerLabel: string;
  isOurBuyer: boolean;
  productLabel: string;
  monthlyQtyLabel: string;
  contractLabel: string;
}

const EXTRA_ING_LABELS: Record<string, string> = {
  salt: 'Sól Kamienna',
  yeast: 'Drożdże Piekarskie',
  butter: 'Masło Świeże',
  sugar: 'Cukier',
};

const CONTRACT_LABELS: Record<string, string> = {
  pay_as_you_go: 'PAYG',
  contract_3y: 'Kontrakt 3-letni',
  contract_5y: 'Kontrakt 5-letni',
  contract_10y: 'Kontrakt 10-letni',
};

export function getIncomingSalesContracts(
  sellerBuildingId: string,
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): IncomingSalesContractLine[] {
  const lines: IncomingSalesContractLine[] = [];

  for (const b of allWorldBuildings) {
    const st = buildingsState[b.id];
    if (!st) continue;
    const owner = st.ownerName || b.playerName;
    const isOurBuyer = !owner || owner === 'Gracz';
    const buyerLabel = formatSupplierOrderLabel(b, buildingsState, allWorldBuildings);

    // 1. Piekarnia zamawiająca mąkę i dodatki
    if (b.typeId === 'bakery' && st.bakeryState) {
      const flourOrders = Array.isArray(st.bakeryState.flourOrders) ? st.bakeryState.flourOrders : [];
      flourOrders
        .filter((o) => o.supplierId === sellerBuildingId)
        .forEach((o, i) => {
          lines.push({
            id: `bakery_flour_${b.id}_${i}`,
            buyerId: b.id,
            buyerLabel,
            isOurBuyer,
            productLabel: 'Mąka Piekarnicza',
            monthlyQtyLabel: `${o.monthlyKg.toLocaleString('pl-PL')} kg/msc`,
            contractLabel: CONTRACT_LABELS[o.contractType] || o.contractType,
          });
        });

      const extraOrders = Array.isArray(st.bakeryState.extraOrders) ? st.bakeryState.extraOrders : [];
      extraOrders
        .filter((o) => o.supplierId === sellerBuildingId)
        .forEach((o, i) => {
          lines.push({
            id: `bakery_extra_${b.id}_${o.ingredient}_${i}`,
            buyerId: b.id,
            buyerLabel,
            isOurBuyer,
            productLabel: EXTRA_ING_LABELS[o.ingredient] || o.ingredient,
            monthlyQtyLabel: `${o.monthlyKg.toLocaleString('pl-PL')} kg/msc`,
            contractLabel: CONTRACT_LABELS[o.contractType] || o.contractType,
          });
        });
    }

    // 2. Młyn zamawiający ziarno
    if (b.typeId === 'mill' && st.millState) {
      const grainOrders = Array.isArray(st.millState.grainOrders)
        ? st.millState.grainOrders
        : st.millState.grainOrder
        ? [st.millState.grainOrder]
        : [];
      grainOrders
        .filter((o) => o.supplierId === sellerBuildingId)
        .forEach((o, i) => {
          lines.push({
            id: `mill_grain_${b.id}_${i}`,
            buyerId: b.id,
            buyerLabel,
            isOurBuyer,
            productLabel: 'Ziarno Zbożowe',
            monthlyQtyLabel: `${o.monthlyKg.toLocaleString('pl-PL')} kg/msc`,
            contractLabel: CONTRACT_LABELS[o.contractType] || o.contractType,
          });
        });
    }

    // 3. Ferma hodowlana zamawiająca paszę (w tym otręby z młyna) i ściółkę
    if (
      (b.typeId === 'livestock_farm' || b.typeId === 'pasture_cattle' || b.typeId === 'pasture_sheep') &&
      st.livestockState
    ) {
      const feedOrders = Array.isArray(st.livestockState.feedOrders)
        ? st.livestockState.feedOrders
        : st.livestockState.feedOrder
        ? [st.livestockState.feedOrder]
        : [];
      feedOrders
        .filter((o) => o.supplierId === sellerBuildingId)
        .forEach((o, i) => {
          lines.push({
            id: `ls_feed_${b.id}_${i}`,
            buyerId: b.id,
            buyerLabel,
            isOurBuyer,
            productLabel: 'Pasza / Otręby',
            monthlyQtyLabel: `${o.monthlyQuantityKg.toLocaleString('pl-PL')} kg/msc`,
            contractLabel: CONTRACT_LABELS[o.contractType] || o.contractType,
          });
        });

      const strawOrders = Array.isArray(st.livestockState.strawOrders)
        ? st.livestockState.strawOrders
        : st.livestockState.strawOrder
        ? [st.livestockState.strawOrder]
        : [];
      strawOrders
        .filter((o) => o.supplierId === sellerBuildingId)
        .forEach((o, i) => {
          lines.push({
            id: `ls_straw_${b.id}_${i}`,
            buyerId: b.id,
            buyerLabel,
            isOurBuyer,
            productLabel: 'Słoma / Ściółka',
            monthlyQtyLabel: `${o.monthlyQuantityKg.toLocaleString('pl-PL')} kg/msc`,
            contractLabel: CONTRACT_LABELS[o.contractType] || o.contractType,
          });
        });
    }

    // 4. Farma zbożowa zamawiająca obornik
    if (b.typeId === 'wheat_farm' && st.farmCapitalism?.manureOrder?.supplierId === sellerBuildingId) {
      const mo = st.farmCapitalism.manureOrder;
      lines.push({
        id: `farm_manure_${b.id}`,
        buyerId: b.id,
        buyerLabel,
        isOurBuyer,
        productLabel: 'Obornik Naturalny',
        monthlyQtyLabel: `${mo.monthlyQuantityKg.toLocaleString('pl-PL')} kg/msc`,
        contractLabel: CONTRACT_LABELS[mo.contractType] || mo.contractType,
      });
    }

    // 5. Kontrakty na węgiel do zasilania kotłów parowych
    if (st.coalOrder?.supplierId === sellerBuildingId) {
      const co = st.coalOrder;
      lines.push({
        id: `coal_energy_${b.id}`,
        buyerId: b.id,
        buyerLabel,
        isOurBuyer,
        productLabel: 'Węgiel kamienny (Energia)',
        monthlyQtyLabel: `${co.monthlyTons} t/msc`,
        contractLabel: CONTRACT_LABELS[co.contractType] || co.contractType,
      });
    }

    // 6. Kontrakty na węgiel drzewny do zasilania pieców
    if (st.charcoalOrder?.supplierId === sellerBuildingId) {
      const ch = st.charcoalOrder;
      lines.push({
        id: `charcoal_energy_${b.id}`,
        buyerId: b.id,
        buyerLabel,
        isOurBuyer,
        productLabel: 'Węgiel Drzewny (Energia)',
        monthlyQtyLabel: `${ch.monthlyTons} t/msc`,
        contractLabel: CONTRACT_LABELS[ch.contractType] || ch.contractType,
      });
    }

    // 7. Kontrakty na paszę dla koni roboczych (zakładka Energia)
    if (st.horseFeedOrder?.supplierId === sellerBuildingId) {
      const hf = st.horseFeedOrder;
      lines.push({
        id: `horse_feed_${b.id}`,
        buyerId: b.id,
        buyerLabel,
        isOurBuyer,
        productLabel: 'Pasza dla koni roboczych',
        monthlyQtyLabel: `${hf.monthlyKg.toLocaleString('pl-PL')} kg/msc`,
        contractLabel: CONTRACT_LABELS[hf.contractType] || hf.contractType,
      });
    }
  }

  return lines;
}
