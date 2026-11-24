# Project Guidelines: Sustainable Economy

## Zasada Kontroli Rozmiaru Plików (Maksymalnie 500 Linii)

- **Limit 500 linii kodu na plik:** Żaden plik źródłowy w projekcie nie powinien przekraczać 500 linii kodu.
- **Obowiązek pytania o refaktoryzację:** Zawsze, gdy jakikolwiek plik osiągnie lub przekroczy 500 linii, asystent ma bezwzględny obowiązek poinformować użytkownika, wskazać dokładną liczbę linii, przedstawić propozycję logicznego podziału na moduły i zapytać użytkownika o zgodę na przeprowadzenie refaktoryzacji.
- **Modularność:** Rozdzielaj duże komponenty na:
  - `catalog.ts` / `constants.ts` (stałe i konfiguracje)
  - `types.ts` (definicje typów)
  - `use*.ts` (custom hooki)
  - `*Renderer.ts` / `*Math.ts` (czyste funkcje i renderowanie Canvas)
  - Dedykowane subkomponenty UI w podkatalogach.

## Standard Kontraktów Terminowych (Jedno Źródło Prawdy)

- Wszystkie kontrakty terminowe na dostawy surowców/paszy/ściółki między budynkami MUSZĄ korzystać bezpośrednio z `CONTRACT_OPTIONS`, `getContractMeta` i `ContractType` z `client/src/components/isometric/modal/industryContracts.ts`:
  - `pay_as_you_go` — Bez kontraktu (`0` msc, `0%` zniżki)
  - `contract_3y` — **Kontrakt 3-letni** (`36` msc, `-10%` zniżki)
  - `contract_5y` — **Kontrakt 5-letni** (`60` msc, `-15%` zniżki)
  - `contract_10y` — **Kontrakt 10-letni** (`120` msc, `-20%` zniżki)
- Zakaz tworzenia własnych, lokalnych długości kontraktów i progów rabatowych w kolejnych budynkach.

## Standard Karty Produktu Handlowego (Sklepy i Targowisko)

- Wszystkie budynki handlowe (Targowisko Miejskie, Sklep Spożywczy i kolejne sklepy detaliczne) MUSZĄ korzystać ze wspólnego komponentu `MarketProductsOfferGrid` (`client/src/components/isometric/modal/MarketProductsOfferGrid.tsx`) w zakładce `Produkty`.
- **Układ karty 2-kolumnowy (`grid-cols-[1fr_1fr]`):**
  - **Lewa kolumna:** nazwa produktu (`text-sm`), etykieta producenta/dostawcy (niebieska dla naszej firmy, czerwona dla konkurencji, szara `🚢 Import` dla statku), wspólna otoczka ceny (`Cena £` + `Zakup: £...` poniżej w tej samej ramce) oraz **4 trójwymiarowe (3D) pionowe słupki:** `Jakość`, `Marka`, `Cena`, `Lokal.`.
  - **Prawa kolumna:** placeholder na zdjęcie produktu wpasowany w lukę nad ściśniętymi od dołu ocenami klas społecznych (`Robotnicy`, `Mieszczanie`, `Elita`).
- **Parametr `Lokalizacja` (`computeBuildingLocationScore` w `marketDemandMath.ts`):**
  - Na Targowisku Miejskim zawsze `100%`.
  - Dla pozostałych budynków handlowych: odległość z twierdzenia Pitagorasa (`Math.hypot(dx, dy)`) od środka najbliższego targowiska do najbliższej krawędzi budynku; każda szerokość kratki obniża wynik o `2%` (`0..100%`).
- **Wagi ocen klas społecznych (suma = 100%):**
  - **Robotnicy:** `72%` Cena + `9%` Marka + `9%` Jakość + `10%` Lokalizacja
  - **Mieszczanie:** `48%` Cena + `16%` Marka + `16%` Jakość + `20%` Lokalizacja
  - **Elita:** `20%` Cena + `25%` Marka + `25%` Jakość + `30%` Lokalizacja
