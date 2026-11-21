import React, { useMemo, useState } from 'react';
import type { BuildingState } from '../types';
import { getIncomingSalesContracts, type WorldSupplierBuilding } from './industrySupplyConfig';
import { ALL_MARKET_GOODS, type MarketGoodOption } from './marketplaceGoods';
import { MINE_DEPOSITS, type MineDepositType } from './mine/mineTypes';
import { TradeShipInterventionLogsTab } from './TradeShipInterventionLogsTab';

interface TradeShipSectionProps {
  buildingId?: string;
  allWorldBuildings: WorldSupplierBuilding[];
  buildingsState: Record<string, BuildingState>;
}

type ShipCategoryId =
  | 'raw_agri'
  | 'food_drink'
  | 'textiles_leather'
  | 'heavy_construction'
  | 'craft'
  | 'press_luxury';

interface ShipCategoryMeta {
  id: ShipCategoryId;
  label: string;
  icon: string;
}

interface ShipGoodItem extends MarketGoodOption {
  category: ShipCategoryId;
  branch: string;
  depositType?: MineDepositType;
  subTarget?: string;
}

const SHIP_CATEGORIES: ShipCategoryMeta[] = [
  { id: 'raw_agri', label: 'Rolnictwo i Surowce', icon: '🌾' },
  { id: 'food_drink', label: 'Spożywcze i Używki', icon: '🥖' },
  { id: 'textiles_leather', label: 'Tekstylia i Skóra', icon: '🧵' },
  { id: 'heavy_construction', label: 'Przemysł i Budownictwo', icon: '⚒️' },
  { id: 'craft', label: 'Rzemiosło', icon: '🛋️' },
  { id: 'press_luxury', label: 'Druk i Luksus', icon: '🕰️' },
];

const EXPANDED_REPLACE_IDS = new Set([
  'zboze',
  'owoce',
  'len',
  'konie',
  'drewno',
  'wegiel_ruda',
  'maka',
  'chleb',
  'chleb_pszenny',
  'chleb_zytni',
  'wypieki_cukiernicze',
  'suchary',
  'tarcica',
  'nabial',
  'mieso_tusze',
  'wedliny',
]);

const INDIVIDUAL_SHIP_GOODS: ShipGoodItem[] = [
  // Uprawy i Plantacje (rozdzielone)
  { id: 'pszenica', label: 'Pszenica Złocista', icon: '🌾', producerTypeIds: ['wheat_farm'], defaultPrice: 1.1, category: 'raw_agri', branch: 'Uprawy i Plantacje', subTarget: 'pszenica' },
  { id: 'zyto', label: 'Żyto Ozime', icon: '🌾', producerTypeIds: ['wheat_farm'], defaultPrice: 1.0, category: 'raw_agri', branch: 'Uprawy i Plantacje', subTarget: 'zyto' },
  { id: 'jeczmien', label: 'Jęczmień Browarny', icon: '🌾', producerTypeIds: ['wheat_farm'], defaultPrice: 1.05, category: 'raw_agri', branch: 'Uprawy i Plantacje', subTarget: 'jeczmien' },
  { id: 'jablka_owoce', label: 'Świeże Owoce', icon: '🍎', producerTypeIds: ['orchard'], defaultPrice: 1.4, category: 'raw_agri', branch: 'Uprawy i Plantacje' },
  { id: 'len_wlokno', label: 'Włókno Lniane', icon: '🌿', producerTypeIds: ['flax_farm'], defaultPrice: 1.3, category: 'raw_agri', branch: 'Uprawy i Plantacje' },
  { id: 'siemie_lniane', label: 'Siemię Lniane', icon: '🌱', producerTypeIds: ['flax_farm'], defaultPrice: 1.1, category: 'raw_agri', branch: 'Uprawy i Plantacje' },

  // Leśnictwo i Górnictwo (każde złoże osobno)
  { id: 'drewno_okragle', label: 'Drewno Opałowe', icon: '🪵', producerTypeIds: ['woodcutter'], defaultPrice: 1.3, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo' },
  { id: 'dluzyca', label: 'Dłużyca Tartaczna', icon: '🪵', producerTypeIds: ['woodcutter'], defaultPrice: 1.5, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo' },
  { id: 'wegiel_drzewny', label: 'Węgiel Drzewny', icon: '🪵', producerTypeIds: ['woodcutter'], defaultPrice: 6.0, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo' },
  { id: 'mine_coal', label: 'Węgiel kamienny', icon: MINE_DEPOSITS.coal.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.coal.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'coal' },
  { id: 'mine_iron_ore', label: 'Ruda żelaza', icon: MINE_DEPOSITS.iron_ore.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.iron_ore.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'iron_ore' },
  { id: 'mine_copper_ore', label: 'Ruda miedzi', icon: MINE_DEPOSITS.copper_ore.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.copper_ore.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'copper_ore' },
  { id: 'mine_gold_ore', label: 'Złoto (ruda)', icon: MINE_DEPOSITS.gold_ore.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.gold_ore.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'gold_ore' },
  { id: 'mine_quartz_sand', label: 'Piasek kwarcowy', icon: MINE_DEPOSITS.quartz_sand.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.quartz_sand.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'quartz_sand' },
  { id: 'mine_rock_salt', label: 'Sól kamienna', icon: MINE_DEPOSITS.rock_salt.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.rock_salt.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'rock_salt' },
  { id: 'mine_clay', label: 'Glina ceramiczna', icon: MINE_DEPOSITS.clay.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.clay.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'clay' },
  { id: 'mine_limestone', label: 'Minerały i wapień', icon: MINE_DEPOSITS.limestone.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.limestone.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'limestone' },
  { id: 'mine_sulfur', label: 'Siarka', icon: MINE_DEPOSITS.sulfur.icon, producerTypeIds: ['mine_shaft'], defaultPrice: MINE_DEPOSITS.sulfur.basePricePerTon, category: 'raw_agri', branch: 'Leśnictwo i Górnictwo', depositType: 'sulfur' },

  // Młynarstwo i Piekarstwo (osobne produkty)
  { id: 'maka_pszenna', label: 'Mąka Pszenna', icon: '🥖', producerTypeIds: ['mill'], defaultPrice: 1.5, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo', subTarget: 'maka_pszenna' },
  { id: 'maka_zytnia', label: 'Mąka Żytnia', icon: '🍞', producerTypeIds: ['mill'], defaultPrice: 1.35, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo', subTarget: 'maka_zytnia' },
  { id: 'kasza', label: 'Kasza i Płatki', icon: '🥣', producerTypeIds: ['mill'], defaultPrice: 1.4, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo', subTarget: 'kasza' },
  { id: 'otreby', label: 'Otręby Paszowe', icon: '🥣', producerTypeIds: ['mill'], defaultPrice: 0.45, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo' },
  { id: 'chleb_pszenny', label: 'Chleb Pszenny', icon: '🥖', producerTypeIds: ['bakery'], defaultPrice: 1.7, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo', subTarget: 'chleb_pszenny' },
  { id: 'chleb_zytni', label: 'Chleb Żytni na Zakwasie', icon: '🍞', producerTypeIds: ['bakery'], defaultPrice: 1.55, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo', subTarget: 'chleb_zytni' },
  { id: 'wypieki_cukiernicze', label: 'Rogaliki', icon: '🥐', producerTypeIds: ['bakery'], defaultPrice: 2.4, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo', subTarget: 'wypieki_cukiernicze' },
  { id: 'suchary', label: 'Bułka Tarta', icon: '🥣', producerTypeIds: ['bakery'], defaultPrice: 0.65, category: 'food_drink', branch: 'Młynarstwo i Piekarstwo' },

  // Mleczarstwo i Rzeźnictwo (osobne produkty)
  { id: 'maslo', label: 'Masło Świeże', icon: '🧈', producerTypeIds: ['dairy'], defaultPrice: 2.2, category: 'food_drink', branch: 'Mleczarstwo i Rzeźnictwo' },
  { id: 'sery', label: 'Sery Dojrzewające', icon: '🧀', producerTypeIds: ['dairy'], defaultPrice: 2.4, category: 'food_drink', branch: 'Mleczarstwo i Rzeźnictwo' },
  { id: 'mieso', label: 'Mięso Świeże', icon: '🥩', producerTypeIds: ['slaughterhouse'], defaultPrice: 2.5, category: 'food_drink', branch: 'Mleczarstwo i Rzeźnictwo' },
  { id: 'tluszcz_zwierzecy', label: 'Tłuszcz Zwierzęcy', icon: '🥓', producerTypeIds: ['slaughterhouse'], defaultPrice: 1.8, category: 'food_drink', branch: 'Mleczarstwo i Rzeźnictwo' },
  { id: 'kielbasy', label: 'Kiełbasy', icon: '🌭', producerTypeIds: ['butcher'], defaultPrice: 2.9, category: 'food_drink', branch: 'Mleczarstwo i Rzeźnictwo' },
  { id: 'szynki_wedliny', label: 'Szynki i Wędliny', icon: '🍖', producerTypeIds: ['butcher'], defaultPrice: 3.3, category: 'food_drink', branch: 'Mleczarstwo i Rzeźnictwo' },

  // Cydr osobno
  { id: 'cydr', label: 'Cydr Owocowy', icon: '🍾', producerTypeIds: ['orchard'], defaultPrice: 1.9, category: 'food_drink', branch: 'Browarnictwo i Cukrownictwo' },

  // Drób (Jaja i Pierze) oraz Konie
  { id: 'jaja', label: 'Jaja Świeże', icon: '🥚', producerTypeIds: ['livestock_farm'], defaultPrice: 1.3, category: 'raw_agri', branch: 'Hodowla i Surowce Zwierzęce' },
  { id: 'pierze', label: 'Pierze i Puch', icon: '🪶', producerTypeIds: ['livestock_farm'], defaultPrice: 1.8, category: 'raw_agri', branch: 'Hodowla i Surowce Zwierzęce' },
  { id: 'konie', label: 'Konie Robocze', icon: '🐎', producerTypeIds: ['horse_ranch', 'livestock_farm'], defaultPrice: 85, category: 'raw_agri', branch: 'Hodowla i Surowce Zwierzęce' },

  // Tartak osobno
  { id: 'tarcica_deski', label: 'Tarcica i Deski Budowlane', icon: '🪚', producerTypeIds: ['sawmill'], defaultPrice: 1.6, category: 'heavy_construction', branch: 'Tartak i Materiały Budowlane' },
];

function classifyGood(good: MarketGoodOption): { category: ShipCategoryId; branch: string } {
  const p = good.producerTypeIds[0] || '';
  if (['wheat_farm', 'flax_farm', 'hop_farm', 'orchard', 'sugar_beet_farm', 'cotton_plantation', 'tobacco_field', 'rubber_plantation'].includes(p)) {
    return { category: 'raw_agri', branch: 'Uprawy i Plantacje' };
  }
  if (p === 'livestock_farm' || p === 'horse_ranch') {
    return { category: 'raw_agri', branch: 'Hodowla i Surowce Zwierzęce' };
  }
  if (p === 'woodcutter' || p === 'mine_shaft') {
    return { category: 'raw_agri', branch: 'Leśnictwo i Górnictwo' };
  }
  if (p === 'mill' || p === 'bakery') {
    return { category: 'food_drink', branch: 'Młynarstwo i Piekarstwo' };
  }
  if (p === 'dairy' || p === 'slaughterhouse' || p === 'butcher' || good.id === 'konserwy') {
    return { category: 'food_drink', branch: 'Mleczarstwo i Rzeźnictwo' };
  }
  if (p === 'brewery' || p === 'sugar_refinery') {
    return { category: 'food_drink', branch: 'Browarnictwo i Cukrownictwo' };
  }
  if (['fajki', 'tabaka'].includes(good.id)) {
    return { category: 'food_drink', branch: 'Wyroby Tytoniowe' };
  }
  if (p === 'spinning_mill' || p === 'sewing_factory') {
    return { category: 'textiles_leather', branch: 'Przędzalnictwo i Szwactwo' };
  }
  if (p === 'tannery' || p === 'shoemaker') {
    return { category: 'textiles_leather', branch: 'Garbarstwo i Szewstwo' };
  }
  if (p === 'huta' || p === 'rolling_mill') {
    return { category: 'heavy_construction', branch: 'Hutnictwo i Walcownictwo' };
  }
  if (p === 'sawmill' || p === 'cement_plant' || p === 'brickworks') {
    return { category: 'heavy_construction', branch: 'Tartak i Materiały Budowlane' };
  }
  if (['guma', 'kwas_siarkowy', 'soda', 'mydlo', 'celuloid', 'ebonit', 'zapalki'].includes(good.id)) {
    return { category: 'heavy_construction', branch: 'Przemysł Chemiczny i Tworzywa' };
  }
  if (p === 'furniture_factory' || p === 'blacksmith') {
    return { category: 'craft', branch: 'Meblarstwo i Kowalstwo' };
  }
  if (p === 'newspaper_publisher' || ['papier', 'tusz'].includes(good.id)) {
    return { category: 'press_luxury', branch: 'Papiernictwo i Prasa' };
  }
  if (p === 'watchmaker' || p === 'jeweler') {
    return { category: 'press_luxury', branch: 'Zegarmistrzostwo i Jubilerstwo' };
  }
  return { category: 'craft', branch: 'Wyroby Fabryczne i Domowe' };
}

const ALL_SHIP_GOODS: ShipGoodItem[] = [
  ...INDIVIDUAL_SHIP_GOODS,
  ...ALL_MARKET_GOODS.filter((g) => !EXPANDED_REPLACE_IDS.has(g.id)).map((g) => ({
    ...g,
    ...classifyGood(g),
  })),
];

function getProducerQuality(
  b: WorldSupplierBuilding,
  st: BuildingState | undefined,
  good: ShipGoodItem
): number | null {
  if (!st) return null;
  if (b.typeId.startsWith('mine_')) {
    if (good.depositType && st.mineDepositType !== good.depositType) return null;
    return st.mineCapitalism?.oreQualityPercent ?? null;
  }
  if (b.typeId === 'mill') {
    if (good.subTarget && st.millState?.productTarget !== good.subTarget) return null;
    return st.millState?.flourQualityPercent ?? null;
  }
  if (b.typeId === 'bakery') {
    if (good.subTarget && st.bakeryState?.productTarget !== good.subTarget) return null;
    return st.bakeryState?.breadQualityPercent ?? null;
  }
  if (b.typeId === 'wheat_farm') return st.farmCapitalism ? 80 : null;
  if (b.typeId === 'livestock_farm' || b.typeId === 'pasture_cattle' || b.typeId === 'pasture_sheep') {
    return st.livestockState ? 80 : null;
  }
  if (b.typeId.startsWith('orchard')) return st.orchardState ? 80 : null;
  if (b.typeId === 'flax_farm') return st.flaxState ? 80 : null;
  if (b.typeId === 'hop_farm') return st.hopState ? 80 : null;
  if (b.typeId === 'woodcutter') return st.woodcutterStock !== undefined ? 75 : null;
  if ((st.productStockUnits ?? 0) > 0 || st.factorySellerHired) return 75;
  return null;
}

function getProducerPrice(
  b: WorldSupplierBuilding,
  st: BuildingState | undefined,
  good: ShipGoodItem
): number | null {
  if (!st) return null;
  if (b.typeId.startsWith('mine_')) {
    if (good.depositType && st.mineDepositType !== good.depositType) return null;
    return st.mineCapitalism?.pricePerTon ?? null;
  }
  if (b.typeId === 'mill') {
    if (good.subTarget && st.millState?.productTarget !== good.subTarget) return null;
    return st.millState?.flourPricePerKg ?? null;
  }
  if (b.typeId === 'bakery') {
    if (good.subTarget && st.bakeryState?.productTarget !== good.subTarget) return null;
    return st.bakeryState?.breadPricePerKg ?? null;
  }
  return null;
}

export function computeShipProductOffer(
  good: ShipGoodItem,
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): { quality: number; hasLocalProducer: boolean; price: number } {
  const localProducers = allWorldBuildings.filter((b) => {
    if (b.mapType === 'rural') return false;
    if (good.producerTypeIds.includes('mine_shaft') && b.typeId.startsWith('mine_')) return true;
    return good.producerTypeIds.includes(b.typeId);
  });

  const qualities = localProducers
    .map((b) => getProducerQuality(b, buildingsState[b.id], good))
    .filter((q): q is number => typeof q === 'number' && q > 0);

  const prices = localProducers
    .map((b) => getProducerPrice(b, buildingsState[b.id], good))
    .filter((p): p is number => typeof p === 'number' && p > 0);

  const hasLocalProducer = qualities.length > 0;
  const quality = hasLocalProducer
    ? Math.round((qualities.reduce((s, v) => s + v, 0) / qualities.length) * 0.5)
    : 0;

  const baseOrAvgPrice =
    prices.length > 0 ? prices.reduce((s, v) => s + v, 0) / prices.length : good.defaultPrice;
  const price = Number((baseOrAvgPrice * 1.1).toFixed(2));

  return { quality, hasLocalProducer, price };
}

export const TradeShipSection: React.FC<TradeShipSectionProps> = ({
  buildingId = 'trade_ship_init',
  allWorldBuildings,
  buildingsState,
}) => {
  const [subTab, setSubTab] = useState<'products' | 'contracts' | 'logs'>('products');
  const [onlyMyContracts, setOnlyMyContracts] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ShipCategoryId | 'all'>('all');
  const shipContracts = getIncomingSalesContracts(buildingId, allWorldBuildings, buildingsState);
  const shipLogs =
    buildingsState[buildingId]?.shipInterventionLogs ||
    buildingsState['trade_ship_init']?.shipInterventionLogs ||
    [];
  const visibleContracts = onlyMyContracts
    ? shipContracts.filter((sc) => sc.isOurBuyer)
    : shipContracts;

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = ALL_SHIP_GOODS.filter((g) => g.label.toLowerCase().includes(q));

    return SHIP_CATEGORIES.filter(
      (cat) => activeCategory === 'all' || cat.id === activeCategory
    )
      .map((cat) => {
        const branchesMap = new Map<string, ShipGoodItem[]>();
        for (const good of filtered) {
          if (good.category !== cat.id) continue;
          const list = branchesMap.get(good.branch) || [];
          list.push(good);
          branchesMap.set(good.branch, list);
        }
        return {
          ...cat,
          branches: Array.from(branchesMap.entries()).map(([branch, goods]) => ({
            branch,
            goods,
          })),
        };
      })
      .filter((cat) => cat.branches.length > 0);
  }, [search, activeCategory]);

  return (
    <div className="space-y-3">
      <div className="bg-stone-950/90 border border-sky-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🚢</span>
          <div>
            <h3 className="text-sm font-bold text-sky-200">
              Statek Handlowy — Port Londyn (Zaślepka 2×1)
            </h3>
            <p className="text-[11px] text-stone-400">
              Każdy produkt w osobnej linii ({ALL_SHIP_GOODS.length} pozycji). Ilość surowców i towarów na statku jest nieograniczona (∞). Zakupy realizuje się bezpośrednio z poziomu poszczególnych budynków.
            </p>
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj towaru..."
          className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 w-52"
        />
      </div>

      {/* Podzakładki Statku: Produkty / Kontrakty */}
      <div className="flex gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        <button
          type="button"
          onClick={() => setSubTab('products')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'products'
              ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          📦 Produkty ({ALL_SHIP_GOODS.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('contracts')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'contracts'
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          📜 Kontrakty ({shipContracts.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('logs')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            subTab === 'logs'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          🛟 Logi interwencyjne ({shipLogs.length})
        </button>
      </div>

      {subTab === 'logs' ? (
        <TradeShipInterventionLogsTab logs={shipLogs} />
      ) : subTab === 'contracts' ? (
        <div className="bg-stone-900/90 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              📜 Zawarte Kontrakty Importowe ze Statku Handlowego
            </h4>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyMyContracts}
                  onChange={(e) => setOnlyMyContracts(e.target.checked)}
                  className="accent-sky-400 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Wyświetl tylko moje</span>
              </label>
              <span className="text-[11px] font-mono text-stone-400">
                Aktywne: <strong className="text-emerald-300">{visibleContracts.length}</strong>
              </span>
            </div>
          </div>
          {visibleContracts.length === 0 ? (
            <p className="text-xs text-stone-400 italic">
              {onlyMyContracts
                ? 'Brak Twoich aktywnych kontraktów zawartych ze Statkiem Handlowym.'
                : 'Brak aktywnych kontraktów zawartych ze Statkiem Handlowym.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {visibleContracts.map((sc) => (
                <div
                  key={sc.id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs"
                >
                  <div className="text-emerald-200 font-semibold">
                    ✓ <span className="text-white font-bold">{sc.productLabel}</span> →{' '}
                    <span
                      className={
                        sc.isOurBuyer
                          ? 'text-sky-300 font-bold'
                          : 'text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold'
                      }
                    >
                      {sc.buyerLabel}
                    </span>{' '}
                    •{' '}
                    <span className="font-mono font-bold text-yellow-300">
                      {sc.monthlyQtyLabel}
                    </span>{' '}
                    • {sc.contractLabel}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Pasek kategorii */}
      <div className="flex flex-wrap gap-1.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
            activeCategory === 'all'
              ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          Wszystkie ({ALL_SHIP_GOODS.length})
        </button>
        {SHIP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
              activeCategory === cat.id
                ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="max-h-[64vh] overflow-y-auto space-y-3 pr-1">
        {grouped.map((cat) => (
          <div
            key={cat.id}
            className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 space-y-2.5"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 border-b border-stone-800 pb-1.5 flex items-center gap-1.5">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </h4>

            <div className="space-y-2.5">
              {cat.branches.map((br) => (
                <div key={br.branch} className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-300/90 pl-1">
                    ▸ {br.branch} ({br.goods.length})
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-stone-800">
                    <table className="w-full table-fixed text-left text-xs">
                      <thead className="bg-stone-950/90 text-stone-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-1.5 px-3 w-[38%]">Produkt</th>
                          <th className="py-1.5 px-3 w-[12%] text-right">Ilość</th>
                          <th className="py-1.5 px-3 w-[22%] text-right">Jakość</th>
                          <th className="py-1.5 px-3 w-[12%] text-right">Marka</th>
                          <th className="py-1.5 px-3 w-[16%] text-right">Cena</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/80 bg-stone-950/60">
                        {br.goods.map((good) => {
                          const { quality, hasLocalProducer, price } = computeShipProductOffer(
                            good,
                            allWorldBuildings,
                            buildingsState
                          );
                          return (
                            <tr key={good.id} className="hover:bg-stone-800/40">
                              <td className="py-1.5 px-3 font-bold text-stone-100">
                                <span className="mr-1.5">{good.icon}</span>
                                {good.label}
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono">
                                <span
                                  title="Nieograniczona ilość na statku"
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300"
                                >
                                  ∞
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    quality === 0
                                      ? 'bg-rose-500/20 text-rose-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {quality}%
                                  {hasLocalProducer ? ' (50% śr. lokalnej)' : ''}
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-400">
                                  0%
                                </span>
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold text-amber-300">
                                £{price.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
};
