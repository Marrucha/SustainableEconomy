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
