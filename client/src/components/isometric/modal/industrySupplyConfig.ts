import type { PlacedBuilding, BuildingState } from '../types';
import type { MapType } from '../mapConfig';
import { canWorkerHandleStage, getStageAssignedWorkerIds } from './farmGridTypes';

export interface WorldSupplierBuilding extends PlacedBuilding {
  mapType?: MapType;
}

export const CURRENT_PLAYER_NAME = 'JOHN BIG';
export const DEFAULT_CITY_NAME = 'Londyn';

export function formatSupplierOrderLabel(b: {
  name: string;
  playerName?: string;
  cityName?: string;
}): string {
  const player = b.playerName || CURRENT_PLAYER_NAME;
  const city = b.cityName || DEFAULT_CITY_NAME;
  return `${player} • ${city} • ${b.name}`;
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
    requiredGoodsLabel: 'Zboże (pszenica / żyto / owies / jęczmień)',
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
  pszenica: 'Pszenica',
  zyto: 'Żyto',
  owies: 'Owies',
  jeczmien: 'Jęczmień',
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
    const stock = st.mineStock ?? 0;
    return {
      hasSeller: hasFactorySeller,
      stockUnits: stock,
      isAvailable: hasFactorySeller && stock > 0,
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
