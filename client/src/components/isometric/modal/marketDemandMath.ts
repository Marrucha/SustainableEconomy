import type { BuildingState } from '../types';
import { getCityHousingPools } from './residentialResidents';
import type { WorldSupplierBuilding } from './industrySupplyConfig';
import { ALL_MARKET_GOODS, getAvailableMarketOffers } from './marketplaceGoods';
import { getContractMeta, type ContractType } from './industryContracts';
import { computeShipProductOffer } from './TradeShipSection';

export interface CityDemographics {
  elitePersons: number;
  middlePersons: number;
  workerPersons: number;
  totalPersons: number;
}

export type ProductDemandTier =
  | 'staple_daily'
  | 'everyday_food'
  | 'clothing_household'
  | 'durable_craft'
  | 'luxury_1880'
  | 'industrial_retail';

export interface ProductMonthlyDemandEstimate {
  monthlyVolume: number;
  tier: ProductDemandTier;
  tierLabel: string;
}

export interface ProductMarketScores {
  qualityScore: number;
  brandScore: number;
  priceScore: number;
  workersOverall: number; // 80% cena, 10% marka, 10% jakość
  middleOverall: number;  // 60% cena, 20% marka, 20% jakość
  eliteOverall: number;   // 30% cena, 35% marka, 35% jakość
}

export function resolveRetailPrice(
  sellerPrice: number | undefined,
  defaultPrice: number | undefined
): number {
  const def = defaultPrice && defaultPrice > 0 ? defaultPrice : 1;
  if (!sellerPrice || sellerPrice <= 0) return def;
  // Zabezpieczenie dla starych zapisów gry sprzed urealnienia cen z 1880 r. (np. rower za £6.50 zamiast £120)
  if (def >= 30 && sellerPrice < def * 0.25) return def;
  return sellerPrice;
}

export function computeProductPurchasePrice(
  productId: string,
  defaultPrice: number,
  supplierBuildingId: string | undefined,
  contractType: ContractType | undefined,
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): number {
  const offers = getAvailableMarketOffers(allWorldBuildings, buildingsState);
  const matchedOffer = offers.find(
    (o) => o.good.id === productId && o.building.id === supplierBuildingId
  );

  let rawBuyPrice = defaultPrice > 0 ? defaultPrice : 1;
  if (supplierBuildingId?.startsWith('trade_ship')) {
    const marketGood = ALL_MARKET_GOODS.find((g) => g.id === productId);
    rawBuyPrice = computeShipProductOffer(
      {
        id: productId,
        label: marketGood?.label || productId,
        icon: marketGood?.icon || '📦',
        producerTypeIds: marketGood?.producerTypeIds || [],
        defaultPrice: marketGood?.defaultPrice ?? rawBuyPrice,
        category: 'raw_agri',
        branch: '',
      },
      allWorldBuildings,
      buildingsState
    ).price;
  } else if (matchedOffer) {
    rawBuyPrice = matchedOffer.price;
  } else {
    rawBuyPrice = Number((rawBuyPrice * 0.78).toFixed(2));
  }

  const discountPct = contractType ? getContractMeta(contractType).discountPercent : 0;
  return Number((rawBuyPrice * (1 - discountPct / 100)).toFixed(2));
}

export function computeProductMarketScores(
  productId: string,
  retailPrice: number,
  defaultPrice: number,
  supplierBuildingId?: string,
  buildingsState?: Record<string, BuildingState>,
  allWorldBuildings?: WorldSupplierBuilding[]
): ProductMarketScores {
  const isShip = Boolean(supplierBuildingId?.startsWith('trade_ship'));
  const supState = supplierBuildingId ? buildingsState?.[supplierBuildingId] : undefined;

  let qualityScore = 75;
  let brandScore = 50;

  if (isShip) {
    const marketGood = ALL_MARKET_GOODS.find((g) => g.id === productId);
    const shipOffer = computeShipProductOffer(
      {
        id: productId,
        label: marketGood?.label || productId,
        icon: marketGood?.icon || '📦',
        producerTypeIds: marketGood?.producerTypeIds || [],
        defaultPrice: marketGood?.defaultPrice ?? defaultPrice,
        category: 'raw_agri',
        branch: '',
      },
      allWorldBuildings || [],
      buildingsState || {}
    );
    qualityScore = shipOffer.quality; // 50% średniej lokalnej lub 0% przy braku producenta w mieście
    brandScore = 0; // Statek Handlowy ma zawsze 0% marki
  } else {
    if (supState) {
      if (productId.startsWith('chleb') || productId === 'wypieki_cukiernicze') {
        qualityScore = supState.bakeryState?.breadQualityPercent ?? qualityScore;
      } else if (productId === 'suchary') {
        qualityScore = 82;
      } else if (supState.millState?.flourQualityPercent) {
        qualityScore = supState.millState.flourQualityPercent;
      }
    }
    brandScore = supState?.productBrand ?? 50;
    if ((supState?.newspaperAds?.length ?? 0) > 0) {
      brandScore = Math.min(100, brandScore + 15);
    }
  }

  qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));
  brandScore = Math.max(0, Math.min(100, Math.round(brandScore)));

  const safeDefault = defaultPrice > 0 ? defaultPrice : 1;
  const safeRetail = retailPrice > 0 ? retailPrice : safeDefault;
  const priceRatio = safeRetail / safeDefault;

  // Cena <= 1x: rośnie od 70% do 100%.
  // Cena 1x..2x: spada liniowo z 70% do 0%.
  // Cena > 2x: staje się ujemna — przy 3x wynosi -50% (-0.5), przy 4x wynosi -100% (-1.0).
  let priceScore: number;
  if (priceRatio <= 1) {
    priceScore = Math.min(100, Math.round(70 / Math.max(0.4, priceRatio)));
  } else if (priceRatio <= 2) {
    priceScore = Math.max(0, Math.round(70 * (2 - priceRatio)));
  } else {
    priceScore = Math.max(-100, Math.round((2 - priceRatio) * 50));
  }

  const workersOverall = Math.round(
    priceScore * 0.8 + brandScore * 0.1 + qualityScore * 0.1
  );
  const middleOverall = Math.round(
    priceScore * 0.6 + brandScore * 0.2 + qualityScore * 0.2
  );
  const eliteOverall = Math.round(
    priceScore * 0.3 + brandScore * 0.35 + qualityScore * 0.35
  );

  return {
    qualityScore,
    brandScore,
    priceScore,
    workersOverall,
    middleOverall,
    eliteOverall,
  };
}

export function computeCityDemographics(
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): CityDemographics {
  const cityBuildings = allWorldBuildings.filter((b) => !b.mapType || b.mapType === 'city');
  const pools = getCityHousingPools(cityBuildings as any, buildingsState);

  const elitePersons = pools.elite.reduce((s, h) => s + h.totalHouseholdPersons, 0);
  const middlePersons = pools.middle.reduce((s, h) => s + h.totalHouseholdPersons, 0);
  const workerPersons = pools.workers.reduce((s, h) => s + h.totalHouseholdPersons, 0);
  const totalPersons = elitePersons + middlePersons + workerPersons;

  // Fallback dla wczesnego startu mapy przed zasiedleniem kamienic
  if (totalPersons <= 0) {
    return {
      elitePersons: 16,
      middlePersons: 84,
      workerPersons: 400,
      totalPersons: 500,
    };
  }

  return { elitePersons, middlePersons, workerPersons, totalPersons };
}

const PRODUCT_TIER_MAP: Record<string, ProductDemandTier> = {
  // Chleb, mleko, podstawy codzienne
  chleb_pszenny: 'staple_daily',
  chleb_zytni: 'staple_daily',
  mleko: 'staple_daily',
  maka: 'staple_daily',
  zboze: 'staple_daily',

  // Pozostała żywność, napoje i zużywalne artykuły codzienne
  suchary: 'everyday_food',
  owoce: 'everyday_food',
  wypieki_cukiernicze: 'everyday_food',
  cukier: 'everyday_food',
  nabial: 'everyday_food',
  mieso_tusze: 'everyday_food',
  wedliny: 'everyday_food',
  piwo: 'everyday_food',
  konserwy: 'everyday_food',
  zapalki: 'everyday_food',
  mydlo: 'everyday_food',
  gazety: 'everyday_food',

  // Odzież, tkaniny, drobne wyroby domowe
  bielizna: 'clothing_household',
  koszule: 'clothing_household',
  obuwie: 'clothing_household',
  material_lniany: 'clothing_household',
  material_welniany: 'clothing_household',
  guziki: 'clothing_household',
  grzebienie: 'clothing_household',
  lampy_naftowe: 'clothing_household',
  wyroby_kowalskie: 'clothing_household',

  // Trwałe dobra rzemieślnicze / klasa średnia i elita
  gorsety: 'durable_craft',
  fraki: 'durable_craft',
  torba: 'durable_craft',
  kozuch: 'durable_craft',
  krzesla: 'durable_craft',
  stoly: 'durable_craft',
  kanapy: 'durable_craft',
  zelazko_na_dusze: 'durable_craft',
  fajerki: 'durable_craft',
  okulary: 'durable_craft',
  fajki: 'durable_craft',
  tabaka: 'durable_craft',
  ustniki_do_fajek: 'durable_craft',
  lalki: 'durable_craft',
  piora_wieczne: 'durable_craft',
  plakaty_reklamowe: 'durable_craft',
  zegarki: 'durable_craft',
  rowery: 'durable_craft',

  // Luksus i nowości techniczne z ok. 1880 r. (gramofony, jubilerstwo, luksusowe zegarki)
  gramofon: 'luxury_1880',
  zegarki_luksusowe: 'luxury_1880',
  zegar_z_kukulka: 'luxury_1880',
  magiel: 'luxury_1880',
  pierscionki: 'luxury_1880',
  obraczki: 'luxury_1880',
  naszyjniki: 'luxury_1880',
  kule_bilardowe: 'luxury_1880',
  zloto: 'luxury_1880',
};

const TIER_LABELS: Record<ProductDemandTier, string> = {
  staple_daily: 'Podstawy codzienne',
  everyday_food: 'Żywność i używki',
  clothing_household: 'Odzież i dom',
  durable_craft: 'Rzemiosło trwałe',
  luxury_1880: 'Luksus 1880 (Elita/Śr.)',
  industrial_retail: 'Surowce detal',
};

/**
 * Szacuje realistyczny miesięczny popyt na dany towar w wiktoriańskim mieście ok. 1880 r.
 * Uwzględnia populację miasta, strukturę klasową (Elita, Klasa Średnia, Robotnicy) oraz cenę detaliczną.
 */
export function estimateProductMonthlyDemand(
  productId: string,
  demographics: CityDemographics,
  retailPrice?: number,
  defaultPrice?: number
): ProductMonthlyDemandEstimate {
  const tier: ProductDemandTier = PRODUCT_TIER_MAP[productId] || 'industrial_retail';
  const { elitePersons, middlePersons, workerPersons, totalPersons } = demographics;
  const affluentPersons = elitePersons * 1.4 + middlePersons * 0.7;

  let rawDemand = 10;

  if (tier === 'staple_daily') {
    const rate =
      productId === 'chleb_pszenny' || productId === 'chleb_zytni'
        ? 0.45
        : productId === 'mleko'
        ? 0.36
        : 0.25;
    rawDemand = totalPersons * rate;
  } else if (tier === 'everyday_food') {
    const rate =
      productId === 'suchary'
        ? 0.14
        : productId === 'owoce'
        ? 0.18
        : productId === 'piwo' || productId === 'gazety'
        ? 0.22
        : 0.15;
    rawDemand = (workerPersons * 0.8 + middlePersons * 1.2 + elitePersons * 1.5) * rate;
  } else if (tier === 'clothing_household') {
    rawDemand = (workerPersons * 0.55 + middlePersons * 1.1 + elitePersons * 1.6) * 0.06;
  } else if (tier === 'durable_craft') {
    const rate = productId === 'rowery' ? 0.065 : 0.08;
    rawDemand = (workerPersons * 0.12 + affluentPersons) * rate;
  } else if (tier === 'luxury_1880') {
    // W 1880 r. w UK gramofony, luksusowe zegarki i biżuteria były dobrem elitarnym:
    // przy ~500 mieszkańcach (ok. 15-20% zamożniejszych) sprzedaje się ok. 2-4 szt./msc.
    const luxuryFactor = productId === 'gramofon' ? 0.025 : 0.035;
    rawDemand = Math.max(1, affluentPersons * luxuryFactor);
  } else {
    rawDemand = Math.max(2, totalPersons * 0.025);
  }

  // Elastyczność cenowa względem ceny rynkowej (bez dolnej blokady — powyżej 2x popyt wygasa do 0)
  let priceFactor = 1.0;
  if (retailPrice && defaultPrice && defaultPrice > 0) {
    const ratio = retailPrice / defaultPrice;
    if (ratio <= 2) {
      priceFactor = Math.max(0.25, Math.min(1.45, 1 / Math.pow(ratio, 0.9)));
    } else if (ratio < 4) {
      // Od 2x do 4x popyt spada liniowo do 0
      priceFactor = Math.max(0, 0.53 * ((4 - ratio) / 2));
    } else {
      priceFactor = 0;
    }
  }

  const monthlyVolume = Math.max(0, Math.round(rawDemand * priceFactor));

  return {
    monthlyVolume,
    tier,
    tierLabel: TIER_LABELS[tier],
  };
}
