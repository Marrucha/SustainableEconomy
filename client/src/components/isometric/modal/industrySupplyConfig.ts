import type { PlacedBuilding, BuildingState } from '../types';
import type { MapType } from '../mapConfig';

export interface WorldSupplierBuilding extends PlacedBuilding {
  mapType?: MapType;
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
    requiredGoodsLabel: 'Chmiel i ziarno słodowe',
    allowedProducerTypeIds: ['hop_farm', 'wheat_farm'],
    emptyHint: 'Brak farm chmielu lub farm zbożowych na rynku.',
  },
  tannery: {
    requiredGoodsLabel: 'Skóry surowe',
    allowedProducerTypeIds: ['slaughterhouse', 'livestock_farm'],
    emptyHint: 'Brak rzeźni ani farm hodowlanych na rynku.',
  },
  shoemaker: {
    requiredGoodsLabel: 'Skóra wyprawiona',
    allowedProducerTypeIds: ['tannery'],
    emptyHint: 'Brak garbarni na rynku miejskim.',
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
    requiredGoodsLabel: 'Tusze mięsne',
    allowedProducerTypeIds: ['slaughterhouse'],
    emptyHint: 'Brak rzeźni miejskiej na rynku.',
  },
  furniture_factory: {
    requiredGoodsLabel: 'Tarcica i deski stolarskie',
    allowedProducerTypeIds: ['sawmill'],
    emptyHint: 'Brak tartaku parowego na rynku.',
  },
  huta: {
    requiredGoodsLabel: 'Węgiel i odpowiednia ruda (żelaza / złota / miedzi / piasek)',
    allowedProducerTypeIds: ['mine_shaft'],
    emptyHint: 'Brak kopalni głębinowej na rynku.',
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
    requiredGoodsLabel: 'Kauczuk, Tytoń, Bawełna, Huta, Drewno, Rzeźnia, Kopalnia, Fabryka (kwas/soda/celuloid)',
    allowedProducerTypeIds: ['rubber_plantation', 'tobacco_field', 'cotton_plantation', 'huta', 'sawmill', 'woodcutter', 'slaughterhouse', 'butcher', 'mine_shaft', 'factory'],
    emptyHint: 'Brak Plantacji Kauczuku, Tytoniu, Bawełny, Huty, Tartaku, Rzeźni, Kopalni lub Fabryki na rynku.',
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
    const crew = st.farmCapitalism?.crew || [];
    const hasSeller =
      hasFactorySeller ||
      crew.some((m) => m.profession === 'merchant' || m.profession === 'all_rounder');
    const grains = st.farmCapitalism?.grainStockKg;
    const stock = grains
      ? Object.values(grains).reduce((s, v) => s + (Number(v) || 0), 0)
      : 0;
    return {
      hasSeller,
      stockUnits: stock,
      isAvailable: hasSeller && stock > 0,
      stockLabel: `${Math.round(stock)} kg`,
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
