import { useEffect, useRef, useState } from 'react';

export function useIsometricAssets() {
  const assetsRef = useRef<Record<string, HTMLImageElement>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedAssets: Record<string, HTMLImageElement> = {};
    const assetUrls: Record<string, string> = {
      // 1. Farma Zbożowa 3x4 (oraz obrót 4x3) i Pole Pszenicy 6x6
      wheat_farm_norm: '/sprites/assets_1880/wheat_farm_norm.png',
      wheat_farm_rot90: '/sprites/assets_1880/wheat_farm_rot90.png',
      wheat_field_norm: '/sprites/assets_1880/wheat_field_norm.png',
      wheat_field_rot90: '/sprites/assets_1880/wheat_field_rot90.png',

      // 2. Sad Owocowy 2x2
      orchard_norm: '/sprites/assets_1880/orchard_norm.png',
      orchard_rot90: '/sprites/assets_1880/orchard_rot90.png',

      // 2a. Plantacja Lnu 2x2 i Pole Lnu 2x2 (4x4 wiejskie)
      flax_farm_norm: '/sprites/assets_1880/flax_farm_norm.png',
      flax_farm_rot90: '/sprites/assets_1880/flax_farm_rot90.png',
      flax_field_norm: '/sprites/assets_1880/flax_field_norm.png',
      flax_field_rot90: '/sprites/assets_1880/flax_field_rot90.png',

      // 2aa. Farma Chmielu 2x2 i Chmielnik 2x2 (4x4 wiejskie)
      hop_farm_norm: '/sprites/assets_1880/hop_farm_norm.png',
      hop_farm_rot90: '/sprites/assets_1880/hop_farm_rot90.png',
      hop_field_norm: '/sprites/assets_1880/hop_field_norm.png',
      hop_field_rot90: '/sprites/assets_1880/hop_field_rot90.png',

      // 2b. Farma Hodowlana i Pastwiska
      livestock_farm_norm: '/sprites/assets_1880/livestock_farm_norm.png',
      livestock_farm_rot90: '/sprites/assets_1880/livestock_farm_rot90.png',
      pasture_cattle_norm: '/sprites/assets_1880/pasture_cattle_norm.png',
      pasture_cattle_rot90: '/sprites/assets_1880/pasture_cattle_rot90.png',
      pasture_sheep_norm: '/sprites/assets_1880/pasture_sheep_norm.png',
      pasture_sheep_rot90: '/sprites/assets_1880/pasture_sheep_rot90.png',

      // 2c. Średnie Miasto 12x12 (Dla widoku wiejskiego)
      city_miniature_norm: '/sprites/assets_1880/city_miniature_norm.png',
      city_miniature_rot90: '/sprites/assets_1880/city_miniature_rot90.png',
      city_medium_12x12_norm: '/sprites/assets_1880/city_medium_12x12_norm.png',
      city_medium_12x12_rot90: '/sprites/assets_1880/city_medium_12x12_rot90.png',

      // 2d. Kopalnia Węgla i Rudy (Wiejska 8x8)
      mine_shaft_norm: '/sprites/assets_1880/mine_shaft_rectified_norm.png',
      mine_shaft_rot90: '/sprites/assets_1880/mine_shaft_rectified_rot90.png',
      mine_shaft_rectified_norm: '/sprites/assets_1880/mine_shaft_rectified_norm.png',
      mine_shaft_rectified_rot90: '/sprites/assets_1880/mine_shaft_rectified_rot90.png',

      // 2e. Wyręb Drewna 8x4 wiejski (4x2 miejski)
      woodcutter_8x4_norm: '/sprites/assets_1880/woodcutter_8x4_norm.png?v=2',
      woodcutter_8x4_rot90: '/sprites/assets_1880/woodcutter_8x4_rot90.png?v=2',
      woodcutter_norm: '/sprites/assets_1880/woodcutter_8x4_norm.png?v=2',
      woodcutter_rot90: '/sprites/assets_1880/woodcutter_8x4_rot90.png?v=2',

      // 3. Wiktoriański Młyn Parowy 1x2
      mill_norm: '/sprites/assets_1880/mill_norm.png',
      mill_rot90: '/sprites/assets_1880/mill_rot90.png',

      // 3b. Wiktoriański Tartak Parowy 1x2
      sawmill_norm: '/sprites/assets_1880/sawmill_norm.png?v=solid3',
      sawmill_rot90: '/sprites/assets_1880/sawmill_rot90.png?v=solid3',

      // 3c. Wiktoriańska Przędzalnia Parowa 1x2
      spinning_mill_norm: '/sprites/assets_1880/spinning_mill_norm.png?v=solid3',
      spinning_mill_rot90: '/sprites/assets_1880/spinning_mill_rot90.png?v=solid3',

      // 3d. Wiktoriańska Szwalnia i Manufaktura Odzieżowa 1x2
      sewing_factory_norm: '/sprites/assets_1880/sewing_factory_norm.png?v=solid3',
      sewing_factory_rot90: '/sprites/assets_1880/sewing_factory_rot90.png?v=solid3',

      // 3e. Wiktoriański Browar Parowy 2x1
      brewery_norm: '/sprites/assets_1880/brewery_norm.png?v=solid3',
      brewery_rot90: '/sprites/assets_1880/brewery_rot90.png?v=solid3',

      // 3f. Wiktoriańska Garbarnia Parowa 2x1
      tannery_norm: '/sprites/assets_1880/tannery_norm.png?v=solid3',
      tannery_rot90: '/sprites/assets_1880/tannery_rot90.png?v=solid3',

      // 3g. Wiktoriańska Manufaktura Szewska 1x1
      shoemaker_norm: '/sprites/assets_1880/shoemaker_norm.png?v=solid3',
      shoemaker_rot90: '/sprites/assets_1880/shoemaker_rot90.png?v=solid3',

      // 3h. Wiktoriańska Mleczarnia Miejska 2x1
      dairy_norm: '/sprites/assets_1880/dairy_norm.png?v=solid3',
      dairy_rot90: '/sprites/assets_1880/dairy_rot90.png?v=solid3',

      // 3i. Wiktoriańska Rzeźnia Miejska 2x1
      slaughterhouse_norm: '/sprites/assets_1880/slaughterhouse_norm.png?v=solid3',
      slaughterhouse_rot90: '/sprites/assets_1880/slaughterhouse_rot90.png?v=solid3',

      // 3j. Wiktoriańska Masarnia i Wędliniarnia 1x1
      butcher_norm: '/sprites/assets_1880/butcher_norm.png?v=solid3',
      butcher_rot90: '/sprites/assets_1880/butcher_rot90.png?v=solid3',

      // 3k. Wiktoriańska Fabryka Mebli 2x1
      furniture_factory_norm: '/sprites/assets_1880/furniture_factory_norm.png?v=solid3',
      furniture_factory_rot90: '/sprites/assets_1880/furniture_factory_rot90.png?v=solid3',

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

    const ts = Date.now() + 2000;
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
