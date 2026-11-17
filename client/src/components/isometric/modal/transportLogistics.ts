import type { TransportMode1880 } from '../types';
import type { WorldSupplierBuilding } from './industrySupplyConfig';

export type TransportOriginRoute =
  | 'same_city'
  | 'rural_to_city'
  | 'other_city_same_continent'
  | 'other_city_other_continent';

export const TRANSPORT_MODE_LABELS: Record<
  TransportMode1880,
  { label: string; icon: string; desc: string }
> = {
  horses: {
    label: 'Konie pociągowe (Wozy)',
    icon: '🐎',
    desc: 'Lokalny transport zaprzęgowy (miasto / wieś)',
  },
  rail: {
    label: 'Kolej parowa (Pociąg)',
    icon: '🚂',
    desc: 'Przewóz towarowy koleją (wieś → miasto lub ten sam kontynent)',
  },
  ship: {
    label: 'Statek parowy (Żegluga)',
    icon: '🚢',
    desc: 'Morski transport towarów z innych kontynentów',
  },
};

export function getAllowedTransportModes(route: TransportOriginRoute): TransportMode1880[] {
  switch (route) {
    case 'same_city':
      return ['horses'];
    case 'rural_to_city':
      return ['horses', 'rail'];
    case 'other_city_same_continent':
      return ['rail'];
    case 'other_city_other_continent':
      return ['ship'];
  }
}

export function resolveRouteForSupplier(supplier?: WorldSupplierBuilding): TransportOriginRoute {
  if (supplier?.mapType === 'rural') return 'rural_to_city';
  return 'same_city';
}

export function getTransportCompanies(
  allWorldBuildings: WorldSupplierBuilding[]
): WorldSupplierBuilding[] {
  return allWorldBuildings.filter((b) => b.typeId === 'transport_company');
}
