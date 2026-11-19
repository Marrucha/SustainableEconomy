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
