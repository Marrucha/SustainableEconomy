import type { BuildingState } from '../types';
import { getProducerMarketAvailability, type WorldSupplierBuilding } from './industrySupplyConfig';
import { BASE_UNIT_MARKET_PRICE } from './industryContracts';

export interface MarketGoodOption {
  id: string;
  label: string;
  icon: string;
  producerTypeIds: string[];
  defaultPrice: number;
}

export const ALL_MARKET_GOODS: MarketGoodOption[] = [
  { id: 'zboze', label: 'Zboże (Pszenica/Żyto)', icon: '🌾', producerTypeIds: ['wheat_farm'], defaultPrice: 1.1 },
  { id: 'owoce', label: 'Owoce i Cydr', icon: '🍎', producerTypeIds: ['orchard'], defaultPrice: 1.4 },
  { id: 'len', label: 'Len i Siemię Lniane', icon: '🌿', producerTypeIds: ['flax_farm'], defaultPrice: 1.3 },
  { id: 'chmiel', label: 'Chmiel Browarny', icon: '🍺', producerTypeIds: ['hop_farm'], defaultPrice: 1.6 },
  { id: 'mleko', label: 'Świeże Mleko', icon: '🥛', producerTypeIds: ['livestock_farm', 'pasture_cattle', 'dairy'], defaultPrice: 1.2 },
  { id: 'welna', label: 'Wełna Owcza', icon: '🐑', producerTypeIds: ['livestock_farm', 'pasture_sheep'], defaultPrice: 1.5 },
  { id: 'konie', label: 'Konie', icon: '🐎', producerTypeIds: ['horse_ranch', 'livestock_farm'], defaultPrice: 9.5 },
  { id: 'drewno', label: 'Drewno i Dłużyca', icon: '🪵', producerTypeIds: ['woodcutter'], defaultPrice: 1.3 },
  { id: 'wegiel_ruda', label: 'Węgiel, Ruda i Siarka', icon: '⛏️', producerTypeIds: ['mine_shaft'], defaultPrice: 1.8 },
  { id: 'maka', label: 'Mąka i Kasza', icon: '🥖', producerTypeIds: ['mill'], defaultPrice: 1.5 },
  { id: 'chleb', label: 'Pieczywo i Wypieki', icon: '🥐', producerTypeIds: ['bakery'], defaultPrice: 1.7 },
  { id: 'tarcica', label: 'Tarcica i Deski', icon: '🪚', producerTypeIds: ['sawmill'], defaultPrice: 1.6 },
  { id: 'material_lniany', label: 'Materiał Lniany', icon: '🧶', producerTypeIds: ['spinning_mill'], defaultPrice: 2.0 },
  { id: 'material_welniany', label: 'Materiał Wełniany', icon: '🧵', producerTypeIds: ['spinning_mill'], defaultPrice: 2.4 },
  { id: 'bielizna', label: 'Bielizna', icon: '🩲', producerTypeIds: ['sewing_factory'], defaultPrice: 2.5 },
  { id: 'gorsety', label: 'Gorsety', icon: '👗', producerTypeIds: ['sewing_factory'], defaultPrice: 4.8 },
  { id: 'koszule', label: 'Koszule', icon: '👔', producerTypeIds: ['sewing_factory'], defaultPrice: 3.2 },
  { id: 'fraki', label: 'Fraki', icon: '🤵', producerTypeIds: ['sewing_factory'], defaultPrice: 6.2 },
  { id: 'piwo', label: 'Piwo (Ale & Stout)', icon: '🍻', producerTypeIds: ['brewery'], defaultPrice: 2.2 },
  { id: 'skora', label: 'Skóra Wyprawiona', icon: '🐄', producerTypeIds: ['tannery'], defaultPrice: 2.4 },
  { id: 'obuwie', label: 'Buty Skórzane', icon: '👞', producerTypeIds: ['shoemaker'], defaultPrice: 3.1 },
  { id: 'torba', label: 'Torba Skórzana', icon: '👜', producerTypeIds: ['shoemaker'], defaultPrice: 3.4 },
  { id: 'kozuch', label: 'Kożuch', icon: '🧥', producerTypeIds: ['shoemaker'], defaultPrice: 5.8 },
  { id: 'nabial', label: 'Masło i Sery', icon: '🧀', producerTypeIds: ['dairy'], defaultPrice: 2.1 },
  { id: 'mieso_tusze', label: 'Mięso, Tusze i Tłuszcz Zwierzęcy', icon: '🥩', producerTypeIds: ['slaughterhouse'], defaultPrice: 2.5 },
  { id: 'wedliny', label: 'Wędliny i Kiełbasy', icon: '🥓', producerTypeIds: ['butcher'], defaultPrice: 2.9 },
  { id: 'krzesla', label: 'Krzesła', icon: '🪑', producerTypeIds: ['furniture_factory'], defaultPrice: 3.5 },
  { id: 'kanapy', label: 'Kanapy', icon: '🛋️', producerTypeIds: ['furniture_factory'], defaultPrice: 6.4 },
  { id: 'stoly', label: 'Stoły', icon: '🪵', producerTypeIds: ['furniture_factory'], defaultPrice: 4.2 },
  { id: 'zegar_z_kukulka', label: 'Zegar z Kukułką', icon: '🕰️', producerTypeIds: ['furniture_factory'], defaultPrice: 7.2 },
  { id: 'blacha', label: 'Blacha', icon: '🪙', producerTypeIds: ['rolling_mill'], defaultPrice: 3.6 },
  { id: 'blacha_ocynkowana', label: 'Blacha Ocynkowana', icon: '🛡️', producerTypeIds: ['rolling_mill'], defaultPrice: 4.1 },
  { id: 'prety_zbrojeniowe', label: 'Pręty Zbrojeniowe', icon: '📏', producerTypeIds: ['rolling_mill'], defaultPrice: 3.8 },
  { id: 'drut', label: 'Drut', icon: '〰️', producerTypeIds: ['rolling_mill'], defaultPrice: 3.5 },
  { id: 'papier', label: 'Papier', icon: '📄', producerTypeIds: ['factory', 'sawmill'], defaultPrice: 2.2 },
  { id: 'tusz', label: 'Tusz / Atrament', icon: '🖋️', producerTypeIds: ['factory'], defaultPrice: 3.0 },
  { id: 'gazety', label: 'Gazety', icon: '📰', producerTypeIds: ['newspaper_publisher'], defaultPrice: 1.4 },
  { id: 'plakaty_reklamowe', label: 'Plakaty Reklamowe', icon: '🪧', producerTypeIds: ['newspaper_publisher'], defaultPrice: 2.6 },
  { id: 'stal', label: 'Stal', icon: '🔩', producerTypeIds: ['huta'], defaultPrice: 3.4 },
  { id: 'zeliwo', label: 'Żeliwo', icon: '⚙️', producerTypeIds: ['huta'], defaultPrice: 3.0 },
  { id: 'zloto', label: 'Złoto', icon: '🪙', producerTypeIds: ['huta'], defaultPrice: 12.0 },
  { id: 'miedz', label: 'Miedź', icon: '🟠', producerTypeIds: ['huta'], defaultPrice: 4.5 },
  { id: 'szklo', label: 'Szkło', icon: '🪟', producerTypeIds: ['huta'], defaultPrice: 2.8 },
  { id: 'cement', label: 'Cement', icon: '🏗️', producerTypeIds: ['cement_plant'], defaultPrice: 2.1 },
  { id: 'cegla', label: 'Cegła', icon: '🧱', producerTypeIds: ['brickworks'], defaultPrice: 1.9 },
  { id: 'kauczuk', label: 'Kauczuk Surowy', icon: '🌳', producerTypeIds: ['rubber_plantation'], defaultPrice: 2.3 },
  { id: 'buraki_cukrowe', label: 'Buraki Cukrowe', icon: '🟣', producerTypeIds: ['sugar_beet_farm'], defaultPrice: 1.2 },
  { id: 'tyton', label: 'Tytoń', icon: '🌿', producerTypeIds: ['tobacco_field'], defaultPrice: 2.2 },
  { id: 'bawelna', label: 'Bawełna', icon: '☁️', producerTypeIds: ['cotton_plantation'], defaultPrice: 2.0 },
  { id: 'cukier', label: 'Cukier', icon: '🍬', producerTypeIds: ['sugar_refinery'], defaultPrice: 2.4 },
  { id: 'guma', label: 'Guma', icon: '🛞', producerTypeIds: ['factory'], defaultPrice: 2.9 },
  { id: 'rowery', label: 'Rowery', icon: '🚲', producerTypeIds: ['factory'], defaultPrice: 6.5 },
  { id: 'fajerki', label: 'Fajerki Żeliwne', icon: '⭕', producerTypeIds: ['factory'], defaultPrice: 2.7 },
  { id: 'lampy_naftowe', label: 'Lampy Naftowe', icon: '🪔', producerTypeIds: ['factory'], defaultPrice: 3.8 },
  { id: 'zelazko_na_dusze', label: 'Żelazko na Duszę', icon: '🔥', producerTypeIds: ['factory'], defaultPrice: 4.2 },
  { id: 'magiel', label: 'Magiel', icon: '🪵', producerTypeIds: ['factory'], defaultPrice: 7.5 },
  { id: 'gramofon', label: 'Gramofon', icon: '📻', producerTypeIds: ['factory'], defaultPrice: 12.5 },
  { id: 'konserwy', label: 'Konserwy Mięsne', icon: '🥫', producerTypeIds: ['factory'], defaultPrice: 3.6 },
  { id: 'okulary', label: 'Okulary', icon: '👓', producerTypeIds: ['factory'], defaultPrice: 4.6 },
  { id: 'zapalki', label: 'Zapałki', icon: '🔥', producerTypeIds: ['factory'], defaultPrice: 1.5 },
  { id: 'kwas_siarkowy', label: 'Kwas Siarkowy', icon: '🧪', producerTypeIds: ['factory'], defaultPrice: 2.8 },
  { id: 'soda', label: 'Soda', icon: '⚗️', producerTypeIds: ['factory'], defaultPrice: 3.1 },
  { id: 'mydlo', label: 'Mydło', icon: '🧼', producerTypeIds: ['factory'], defaultPrice: 2.6 },
  { id: 'fajki', label: 'Fajki', icon: '🪈', producerTypeIds: ['factory'], defaultPrice: 3.9 },
  { id: 'tabaka', label: 'Tabaka', icon: '🥫', producerTypeIds: ['factory'], defaultPrice: 4.4 },
  { id: 'celuloid', label: 'Celuloid', icon: '🎞️', producerTypeIds: ['factory'], defaultPrice: 3.7 },
  { id: 'grzebienie', label: 'Grzebienie', icon: '💇', producerTypeIds: ['factory'], defaultPrice: 2.5 },
  { id: 'lalki', label: 'Lalki', icon: '🪆', producerTypeIds: ['factory'], defaultPrice: 4.9 },
  { id: 'kule_bilardowe', label: 'Kule Bilardowe', icon: '🎱', producerTypeIds: ['factory'], defaultPrice: 6.0 },
  { id: 'ebonit', label: 'Ebonit', icon: '⬛', producerTypeIds: ['factory'], defaultPrice: 3.4 },
  { id: 'guziki', label: 'Guziki', icon: '🔘', producerTypeIds: ['factory'], defaultPrice: 1.8 },
  { id: 'piora_wieczne', label: 'Pióra Wieczne', icon: '✒️', producerTypeIds: ['factory'], defaultPrice: 5.5 },
  { id: 'ustniki_do_fajek', label: 'Ustniki do Fajek', icon: '🔸', producerTypeIds: ['factory'], defaultPrice: 2.0 },
  { id: 'zegarki', label: 'Zegarki', icon: '⌚', producerTypeIds: ['watchmaker'], defaultPrice: 8.5 },
  { id: 'zegarki_luksusowe', label: 'Zegarki Luksusowe', icon: '🕰️', producerTypeIds: ['watchmaker'], defaultPrice: 18.0 },
  { id: 'pierscionki', label: 'Pierścionki', icon: '💍', producerTypeIds: ['jeweler'], defaultPrice: 14.0 },
  { id: 'obraczki', label: 'Obrączki Złote', icon: '🟡', producerTypeIds: ['jeweler'], defaultPrice: 11.5 },
  { id: 'naszyjniki', label: 'Naszyjniki', icon: '📿', producerTypeIds: ['jeweler'], defaultPrice: 16.0 },
  { id: 'wyroby_kowalskie', label: 'Narzędzia i Żelazo', icon: '⚒️', producerTypeIds: ['blacksmith'], defaultPrice: 2.6 },
];

export interface AvailableMarketOffer {
  offerKey: string;
  good: MarketGoodOption;
  building: WorldSupplierBuilding;
  ownerName: string;
  enterpriseName: string;
  locationLabel: string;
  price: number;
}

export function getAvailableMarketOffers(
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): AvailableMarketOffer[] {
  const offers: AvailableMarketOffer[] = [];
  for (const b of allWorldBuildings) {
    const matchingGoods = ALL_MARKET_GOODS.filter((g) => g.producerTypeIds.includes(b.typeId));
    if (matchingGoods.length === 0) continue;
    const st = buildingsState[b.id];
    const availability = getProducerMarketAvailability(b, st);
    if (!availability.isAvailable) continue;
    const ownerName = st?.ownerName || 'Gracz 1';
    const enterpriseName = st?.enterpriseName || b.name;
    const area = b.mapType === 'rural' ? 'Wieś' : 'Miasto';
    const locationLabel = `${area} (${b.x}, ${b.y}) • Magazyn: ${availability.stockLabel}`;
    for (const good of matchingGoods) {
      offers.push({
        offerKey: `${good.id}::${b.id}`,
        good,
        building: b,
        ownerName,
        enterpriseName,
        locationLabel,
        price: st?.productPrice ?? good.defaultPrice ?? BASE_UNIT_MARKET_PRICE,
      });
    }
  }
  return offers;
}

export function getProducersForMarketGood(
  goodId: string,
  allWorldBuildings: WorldSupplierBuilding[],
  buildingsState: Record<string, BuildingState>
): Array<{
  building: WorldSupplierBuilding;
  ownerName: string;
  enterpriseName: string;
  locationLabel: string;
  price: number;
}> {
  const good = ALL_MARKET_GOODS.find((g) => g.id === goodId);
  if (!good) return [];
  return allWorldBuildings
    .filter((b) => {
      if (!good.producerTypeIds.includes(b.typeId)) return false;
      return getProducerMarketAvailability(b, buildingsState[b.id]).isAvailable;
    })
    .map((b) => {
      const st = buildingsState[b.id];
      const availability = getProducerMarketAvailability(b, st);
      const ownerName = st?.ownerName || 'Gracz 1';
      const enterpriseName = st?.enterpriseName || b.name;
      const area = b.mapType === 'rural' ? 'Wieś' : 'Miasto';
      return {
        building: b,
        ownerName,
        enterpriseName,
        locationLabel: `${area} (${b.x}, ${b.y}) • Magazyn: ${availability.stockLabel}`,
        price: st?.productPrice ?? good.defaultPrice ?? BASE_UNIT_MARKET_PRICE,
      };
    });
}
