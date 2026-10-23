import { useEffect, useRef, useState } from 'react';

export function useIsometricAssets() {
  const assetsRef = useRef<Record<string, HTMLImageElement>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedAssets: Record<string, HTMLImageElement> = {};
    const assetUrls: Record<string, string> = {
      // 1. Farma Zbożowa 3x4 (oraz obrót 4x3)
      wheat_farm_norm: '/sprites/assets_1880/wheat_farm_norm.png',
      wheat_farm_rot90: '/sprites/assets_1880/wheat_farm_rot90.png',

      // 2. Sad Owocowy 2x2
      orchard_norm: '/sprites/assets_1880/orchard_norm.png',
      orchard_rot90: '/sprites/assets_1880/orchard_rot90.png',

      // 2b. Farma Hodowlana i Pastwiska
      livestock_farm_norm: '/sprites/assets_1880/livestock_farm_norm.png',
      livestock_farm_rot90: '/sprites/assets_1880/livestock_farm_rot90.png',
      pasture_cattle_norm: '/sprites/assets_1880/pasture_cattle_norm.png',
      pasture_cattle_rot90: '/sprites/assets_1880/pasture_cattle_rot90.png',
      pasture_sheep_norm: '/sprites/assets_1880/pasture_sheep_norm.png',
      pasture_sheep_rot90: '/sprites/assets_1880/pasture_sheep_rot90.png',

      // 3. Wiktoriański Młyn Parowy 1x2
      mill_norm: '/sprites/assets_1880/mill_norm.png',
      mill_rot90: '/sprites/assets_1880/mill_rot90.png',

      // 4. Elektrociepłownia Węglowa 1x2
      coal_plant_norm: '/sprites/assets_1880/coal_plant_norm.png',
      coal_plant_rot90: '/sprites/assets_1880/coal_plant_rot90.png',

      // 5. Rzemiosło miejskie 1x1
      bakery_norm: '/sprites/assets_1880/bakery_norm.png',
      bakery_rot90: '/sprites/assets_1880/bakery_rot90.png',
      blacksmith_norm: '/sprites/assets_1880/blacksmith_norm.png',
      blacksmith_rot90: '/sprites/assets_1880/blacksmith_rot90.png',

      // 6. Kamienica Robotnicza 1x2 / 2x1
      tenement_workers_norm: '/sprites/assets_1880/tenement_workers_norm.png',
      tenement_workers_rot90: '/sprites/assets_1880/tenement_workers_rot90.png',

      // 7. Kamienica Mieszczańska 1x2
      tenement_middle_norm: '/sprites/assets_1880/tenement_middle_norm.png',
      tenement_middle_rot90: '/sprites/assets_1880/tenement_middle_rot90.png',

      // 8. Willa Arystokracji 2x2
      tenement_elite_norm: '/sprites/assets_1880/tenement_elite_norm.png',
      tenement_elite_rot90: '/sprites/assets_1880/tenement_elite_rot90.png',

      // 9. Wiktoriański Ratusz Miejski 3x3
      town_hall_norm: '/sprites/assets_1880/town_hall_norm.png',
      town_hall_rot90: '/sprites/assets_1880/town_hall_rot90.png',

      // 10. Park z Dębem 2x2
      oak_norm: '/sprites/assets_1880/oak_norm.png',
      oak_rot90: '/sprites/assets_1880/oak_rot90.png',

      // 11. Kafelki terenu i 3 rodzaje dróg
      tile_grass: '/sprites/assets_1880/tile_grass.png',
      tile_road_x: '/sprites/assets_1880/tile_road_x.png',
      tile_road_y: '/sprites/assets_1880/tile_road_y.png',
      tile_road_norm: '/sprites/assets_1880/tile_road_y.png',
      tile_road_rot90: '/sprites/assets_1880/tile_road_x.png',
      tile_road_cobble_seamless_x: '/sprites/assets_1880/tile_road_cobble_seamless_x.png',
      tile_road_cobble_seamless_y: '/sprites/assets_1880/tile_road_cobble_seamless_y.png',
      tile_road_cobble_seamless_norm: '/sprites/assets_1880/tile_road_cobble_seamless_y.png',
      tile_road_cobble_seamless_rot90: '/sprites/assets_1880/tile_road_cobble_seamless_x.png',
      tile_road_dirt_x: '/sprites/assets_1880/tile_road_dirt_x.png',
      tile_road_dirt_y: '/sprites/assets_1880/tile_road_dirt_y.png',
      tile_road_dirt_norm: '/sprites/assets_1880/tile_road_dirt_y.png',
      tile_road_dirt_rot90: '/sprites/assets_1880/tile_road_dirt_x.png',
      tile_water: '/sprites/assets_1880/tile_water.png',
      tile_quay: '/sprites/assets_1880/tile_quay.png',
      tile_forest_oak: '/sprites/assets_1880/tile_forest_oak.png',
      tile_forest_pine: '/sprites/assets_1880/tile_forest_pine.png',
      tile_forest_grove: '/sprites/assets_1880/tile_forest_grove.png',
    };

    const ts = Date.now() + 3;
    let loadedCount = 0;
    const totalCount = Object.keys(assetUrls).length;

    Object.entries(assetUrls).forEach(([key, url]) => {
      const img = new Image();
      img.src = `${url}?v=${ts}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= totalCount) {
          setIsLoaded(true);
        }
      };
      loadedAssets[key] = img;
    });

    assetsRef.current = loadedAssets;
  }, []);

  return { assetsRef, isLoaded };
}
