# Prompt / Specyfikacja: Budowa Kart Budynków (Sustainable Economy 1880)

> Poniższy dokument jest gotowym promptem-szablonem opisującym standardy projektowania i implementacji okien modalnych (kart) budynków produkcyjnych w grze **Sustainable Economy (1880)** na podstawie wzorcowych implementacji **Farmy Zbożowej** oraz **Farmy Hodowlanej**.

---

## 1. Zasady Architektoniczne i Jakości Kodu (`AGENTS.md`)

1. **Limit 500 linii kodu na plik:** Żaden plik źródłowy nie powinien przekraczać 500 linii. Duże moduły dziel na:
   - `*Types.ts` / `catalog.ts` — typy, stałe i stany domyślne,
   - `use*Ticks.ts` — logika cykli dziennych, miesięcznych i rocznych (zawsze wywoływana **przed** jakimkolwiek warunkowym `return` w komponencie — zasada hooków React!),
   - `*Math.ts` — czyste funkcje kalkulacyjne (np. plon, wydajność, jakość),
   - dedykowane subkomponenty UI (`*StageCard.tsx`, `*CrewTab.tsx`, `*StorageBins.tsx`, `*FinanceSummary.tsx`).
2. **Jedno źródło prawdy dla parametrów i kontraktów:**
   - Kontrakty terminowe **zawsze** importuj z `client/src/components/isometric/modal/industryContracts.ts` (`CONTRACT_OPTIONS`, `getContractMeta`, `ContractType`):
     - `pay_as_you_go` (`PAYG`, `0` msc, `0%` zniżki)
     - `contract_3y` (`Kontrakt 3-letni`, `36` msc, `-10%` zniżki)
     - `contract_5y` (`Kontrakt 5-letni`, `60` msc, `-15%` zniżki)
     - `contract_10y` (`Kontrakt 10-letni`, `120` msc, `-20%` zniżki)
   - Parametry symulacji (pojemności bazowe, dawki, czasy, skuteczności) pobieraj przez `loadGameParameters()` z `client/src/components/isometric/admin/gameParameters.ts` i dodawaj do zakładek w `AdminParametersModal.tsx`.
3. **Realizm historyczny (1880 r.):**
   - Budynki rolnicze i hodowlane nie używają prądu z sieci miejskiej ani przemysłowych kotłów — w zakładce energii pozostaw wyłącznie napęd koński (`allowedSources={['konie']}`).
4. **Zasady obsady (Wieś vs Fabryki i Przetwórnie):**
   - **Na wsi (farmy):** 1 pracownik może być przypisany do kilku etapów cyklu jednocześnie.
   - **W fabrykach i przetwórniach (np. Młyn Parowy):** obowiązuje zasada **1 osoba = 1 krok lejka** — pracownik przypisany do jednego etapu nie może być przypisany do kolejnego kroku.
   - **Wymagany Zarządca (Klasa M):** każda fabryka o powierzchni co najmniej `2×1` (`sizeX * sizeY >= 2`, w tym `1×2`) **musi** mieć zatrudnionego **Zarządcę** do uruchomienia produkcji.

---

## 2. Układ Główny Karty Budynku (`BuildingModal.tsx`)

Każda karta budynku otwiera się w spójnym ciemnym kontenerze (`bg-stone-900/95`, obramowanie `border-amber-500/50`, `rounded-3xl`) o **stałym zakotwiczeniu na ekranie** (`items-start pt-[3vh]` + `h-[92vh]` dla szerokich kart), dzięki czemu karta nie skacze przy przełączaniu zakładek.

### Nagłówek karty
- **Lewa strona:** plakietka epoki i daty (`Epoka 1 • {formatGameDate(clock.date)}`), nazwa budynku (`h2` w `font-serif text-amber-100`) oraz **ikona statusu checklisty produkcji obok nazwy**:
  - **Zielony ptaszek `✓`** — gdy wszystkie 4 warunki produkcji są spełnione,
  - **Czerwony krzyżyk `✕`** (klikalny przycisk) — gdy którykolwiek warunek jest niespełniony; kliknięcie otwiera modal (`ProductionChecklistModal`) pokazujący dokładnie brakujące warunki i przycisk przejścia do `📋 Podsumowanie`.
- **Prawa strona:** szybkie sterowanie zegarem (`⏸️/▶️`, `1x`, `2x`, `5x`), przycisk zmiany nazwy / wyburzenia oraz przycisk zamknięcia (`✕`).

### Główne zakładki budynku (`businessTab`)
0. **`📋 Podsumowanie`** (`BusinessSummaryTab.tsx`, `productionChecklist.ts`) — **zawsze pierwsza zakładka przed `🏭 Produkcja`** (wdrożona dla Młyna, Piekarni, Farmy Zbożowej, Farmy Hodowlanej, Kopalni i zakładów przemysłowych):
   - Checklista 4 warunków uruchomienia produkcji (jeśli choć jeden nie jest spełniony, **produkcja zostaje zatrzymana** w ticku symulacji, a na lejku wyświetla się status wstrzymania):
     1. `⚡ Energia` — aktywne źródło energii/paliwa/koni oraz `max produkcji ≤ max energii`,
     2. `👷 Załoga` — pełna obsada lejka produkcyjnego i wymaganego zarządcy/agronoma,
     3. `📦 Surowce` — dostępne surowce wsadowe (ziarno, mąka, pasza/ziarno siewne),
     4. `🏛️ Magazyn wyrobów` — magazyn produktów gotowych nie jest przepełniony (`stock < capacity`).
1. **`🏭 Produkcja`** (uniwersalna nazwa w każdym budynku) — na jednym poziomie podzakładek (jedna linia):
   - *Cykl* (`Cykl Przemiału` / `Wąż Cyklu Produkcji` / `Cykl Rozrodu`),
   - *Stado / Pola* (opcjonalnie, jeśli budynek posiada),
   - *Załoga* (`Załoga` / `Kadra i Specjaliści`),
   - **`⚡ Zakup Energii`** na końcu linii — konfiguracja zasilania budynku; gdy warunek energii jest spełniony, wyświetlaj **zielony ptaszek w kółku** (`w-4 h-4 rounded-full bg-emerald-500 text-stone-950 ✓`).
2. **`📦 Produkty`** (`FarmLivestockProductsTab.tsx`, `MillProductsTab.tsx`) — z podzakładkami:
   - **`📦 Stany magazynowe`** — lista wszystkich produktów, które budynek **produkuje** i **zamawia** (wartość `0` na czerwono `text-rose-400`, pasek zapełnienia pojemności, jakość i cena jednostkowa),
   - **`📜 Przepisy`** (w przetwórniach i fabrykach) — receptury produkcyjne z dokładnym przelicznikiem **wszystkich składników i ich ilości** (np. `-120 kg mąki pszennej/d`, `-2 kg soli/d`, `-1.5 kg drożdży/d` → `+162 kg chleba + 6 kg bułki tartej`).
3. **`🛒 Zakup/Sprzedaż`** (`MillStorageBins.tsx`) — magazyny surowców i wyrobów gotowych, kontrakty dostaw z wielu źródeł z listą aktywnych umów na dole (`✕` z karą przy zerwaniu) oraz sprzedaż partiami.
4. **`📊 Zestawienie`** (`FarmLivestockFinanceTab.tsx`, `MillFinanceTab.tsx`) — podsumowanie finansowe i operacyjne z podzakładkami:
   - `📊 Zestawienie` (bilans kosztów, przychodów, lista aktywnych kontraktów odbiorców/dostawców),
   - `🏷️ Cennik` (edytowalne ceny sprzedaży produktów/żywca),
   - `📈 Plony / Przemiał roczny` — wykres słupkowy zebranych plonów/przemiału w kolejnych latach + prognoza bieżącego cyklu.

---

## 3. Standardy Wizualne i Budowa Lejka Produkcyjnego (Rurociągu)

Wzorzec: `FarmCycleSnake.tsx` + `FarmStageCard.tsx` oraz `HorsePipeline.tsx` / `CattlePipeline.tsx` / `SheepPipeline.tsx` + `LivestockStageCard.tsx`.

### Pasek postępu na górze lejka
- Pokazuje aktualny cykl, nazwę uprawy/gatunku, procent postępu (`0..100%`) oraz status pracy (np. brak obsady lub brak koni roboczych).
- **Ważne:** dla procesów indywidualnych (np. rozród każdej klaczy osobno) nie wyświetlaj zbiorczego, sztucznego paska postępu — stan każdego osobnika prezentuj na jego własnej karcie w zakładce *Stado*.

### Kafelki etapów (`*StageCard.tsx`) i strzałki (`FarmPipelineArrow.tsx`)
- **Układ „węża” (serpentyna 2-rzędowa):**
  - **Rząd 1 (od lewej do prawej):** `grid-cols-1 md:grid-cols-[1fr_28px_1fr_28px_1fr]` (lub 4 kolumny: `[1fr_28px_1fr_28px_1fr_28px_1fr]`) ze strzałkami `FarmPipelineArrow` o `direction="right"` pomiędzy kolejnymi etapami.
  - **Zakręt pionowy w dół:** pod ostatnim kafelkiem Rzędu 1 (`hidden md:grid ...`, `col-start-5` dla 3 kolumn lub `col-start-7` dla 4 kolumn) wyśrodkowana strzałka pionowa `FarmPipelineArrow` z `direction="down"`.
  - **Rząd 2 (od prawej do lewej):** etapy ułożone w odwrotnej kolejności (np. `6 ◄── 5 ◄── 4`) ze strzałkami `FarmPipelineArrow` o `direction="left"`.
  - **Stany strzałek (identyczne z Farmą):**
    - `ready` (zielona): gdy cały cykl jest gotowy (`isReady === true`),
    - `blocked` (czerwona): gdy brakuje wymaganej obsady/surowca/energii (`isReady === false`),
    - `optional_bypassed` (żółta przerywana): dla strzałki **wchodzącej** do etapu opcjonalnego i **wychodzącej** z niego, gdy etap opcjonalny jest wyłączony lub nieobsadzony,
    - `isActivePulse={true}`: pulsująca czerwono-biała poświata dla strzałki wychodzącej z aktualnie aktywnego etapu (`isCurrent`).
- **Kolorystyka i obramowanie kafelka:**
  - **Kafelek standardowy (obsadzony):** jasny kamienny pergamin `bg-stone-200 border border-stone-400 text-stone-900`.
  - **Brak wymaganego pracownika (blokujący):** `bg-rose-100 border-2 border-rose-500 text-stone-900`.
  - **Etap opcjonalny:** obramowanie **przerywane (`border-dashed border-2`)** — szare gdy wyłączony checkboxem, żółte (`bg-amber-100 border-amber-500`) gdy włączony bez obsady, zielone (`border-emerald-600`) gdy włączony i obsadzony.
  - **Etap aktualnie aktywny (`isCurrent`):** ciepły gradient bursztynowo-pomarańczowy (`from-orange-300 via-amber-300 to-orange-400 border-2 border-red-600`) + pulsująca ikona `⚡`.
- **Kontener kafelka:** `relative h-full rounded-xl px-2 py-1 transition-all duration-200 flex flex-col gap-0.5 select-none` (zwarty układ bez `justify-between` i bez dużych odstępów).
- **Górny pasek kafelka (`flex items-center justify-between gap-1 bg-stone-400/65 px-1.5 py-0.5 rounded-lg border border-stone-500/75 shadow-xs`):**
  - **Lewa grupa (`flex items-center gap-1.5 min-w-0 leading-tight`):**
    1. Ikona etapu na białym tle (`text-sm p-0.5 rounded bg-white border border-stone-500 shadow-sm contrast-125 shrink-0`).
    2. Numer i krótki tytuł (`font-bold text-[11px] text-blue-950 tracking-wide truncate border-b-[3px] border-double border-blue-950 leading-none pb-[1px]`).
    3. Przycisk **`ℹ`** (`w-4 h-4 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px]`) umieszczony **bezpośrednio obok tytułu** (w lewej grupie, nie przy prawej krawędzi).
  - **Prawa grupa (`flex items-center gap-1 leading-tight shrink-0`):**
    - Pulsująca plakietka `⚡` gdy etap jest aktywny (`isCurrent`), ewentualny checkbox włączenia etapu opcjonalnego (`w-3.5 h-3.5 accent-emerald-500`),
    - **BEZWZGLĘDNA ZASADA IKONY OBSADY (ZERO PRZYCISKU `👥 Obsada` NA DOLE KAFELKA):**
      - **NIGDY nie umieszczaj przycisku `👥 Obsada` na dole kafelka** (ani dla braku pracownika, ani dla obsadzonego etapu).
      - **ZAWSZE** (również gdy liczba przypisanych wynosi `0`) w prawym górnym rogu kafelka wyświetlaj okrągły przycisk **`w-6 h-6 rounded-full`** z wektorową sylwetką człowieka SVG (`<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">`), bez długich imion, list `<select>` ani emoji `👤`:
        - brak obsady (`0`): `bg-rose-950/90 hover:bg-rose-900 border border-rose-400 text-rose-300` (lub `bg-amber-950/90 border-amber-400 text-amber-300` dla etapu opcjonalnego),
        - kolor standardowej załogi (`>= 1`): `bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-400 text-emerald-400`,
        - kolor nadzoru specjalisty (np. Agronom / Mistrz Młynarski): `bg-sky-950/90 hover:bg-sky-900 border border-sky-400 text-sky-300`,
        - w prawym dolnym rogu przycisku (`-bottom-1 -right-1`) okrągła czarna plakietka `w-3.5 h-3.5 rounded-full bg-stone-950 border border-white/80 text-white text-[8px] font-mono font-bold` z liczbą przypisanych pracowników (`0`, `1`, `2`, ...).
      - Po kliknięciu tej okrągłej ikonki otwiera się okno modalne obsady w jednolitym stylu Piekarni (`PRZYPISANI DO TEGO KROKU (N)`, zielone wiersze z przyciskiem `Odepnij` oraz pomarańczowy przycisk `➕ Zatrudnij i przypisz (<Zawód> • £X/d)`).
- **Środkowy obszar kafelka (parametry etapu):**
  - Zamiast białych ramek używaj zwartych wierszy `my-0.5 flex items-center justify-between text-[11px] leading-tight` z etykietą `text-stone-700` po lewej i kamienną plakietką/przełącznikiem `px-2 py-0.5 rounded-md bg-stone-300 border border-stone-400 text-stone-900 font-bold text-[10px] font-mono` po prawej.
- **Dolny obszar kafelka i okno modalne obsady:**
  - Gdy etap opcjonalny jest wyłączony, wyświetl na dole pasek `mt-0.5 pt-1 border-t border-stone-300` z plakietką `bg-stone-300 border-stone-400 text-stone-700 text-[10px] text-center` (`⚪ Wyłączony`). Dla aktywnych etapów nie wyświetlaj przycisku `👥 Obsada` na dole — kliknięcie okrągłej ikony pracownika w prawym górnym rogu otwiera okno modalne obsady (`fixed inset-0 z-[90] bg-black/75`), w którym gracz widzi aktualnego pracownika (imię, profesję, stawkę `£/d`), może wybrać pracownika z listy lub zatrudnić nowego jednym kliknięciem.
  - **Ważne (warstwy `z-index`):** okno modalne obsady (`fixed inset-0 z-[90]`) **musi** być renderowane **poza** głównym `<div>` kafelka (jako rodzeństwo we fragmencie `<>...</>`), w przeciwnym razie `z-10` kolejnych kafelków spowoduje ich nakładanie się na otwarty modal.
- **Kontrolki specyficzne dla etapu wewnątrz kafelka:**
  - *Nasiona:* przełącznik źródła (`Rynek £22` vs `Własny Spichlerz` — zużywa aktywne zboże ze spichlerza).
  - *Nawożenie:* przyciski poziomu `0%` / `50% (+20%)` / `100% (+30%)` + stan obornika (`stan kg / wymagane kg`) i ostrzeżenie `⚠️ Za mało!`.
  - *Wzrost & Gleba / Żniwa:* checkbox `💧 Nawadnianie` w fazie wzrostu oraz dynamiczny wskaźnik pogody (`🌧️ 100%`, `☁️ 90%`, `☀️ 80%`, `⛈️ 80%` na wzroście; `☀️ 100%`, `⛅ 90%`, `☁️ 80%`, `🌧️ 70%` na żniwach), **ukryty** aż cykl dotrze do danego etapu.

---

## 4. Zakładka Załogi i Kadr (`FarmCrewTab.tsx`, `LivestockCrewTab.tsx`)

1. **Nagłówek sekcji:** tytuł `👥 Kadra ...`, ikonka `ℹ` (`InfoHoverIcon`) z opisem ról i bonusów, przycisk `➕ Zatrudnij`.
2. **Zwarte okno zatrudnienia (inline toggle):**
   - Pole imienia z przyciskiem **`🎲`** (`generateRandomEnglishName`),
   - `<select>` wyboru profesji,
   - Suwak płacy dziennej (`£/d`) + przycisk `OK`.
3. **Zwarte wiersze pracowników (od najnowszego na górze `[...crew].reverse()`):**
   - Avatar + imię + plakietka profesji + `InfoHoverIcon` (szczegóły kompetencji schowane w dymku, nie zaśmiecają listy),
   - Prawa strona: status przypisania (`✓ Etapy` na zielono lub `Nieprzypisany`), stawka `£/d`, przycisk `Zwolnij`.
   - Wiersz przypisany do etapu ma zielone obramowanie (`border-emerald-500/40`), nieprzypisany jest lekko przygaszony (`opacity-80`).
   - **Zarządca (Klasa M):** wiersz oraz plakietka na górnym pasku cyklu mają **granatowe tło** (`bg-blue-950/90 border-blue-500/60`), a po prawej stronie wiersza zamiast `Nieprzypisany` wyświetla się status `✓ Nadzoruje: <Nazwa budynku>` (`text-blue-300`).
4. **Stopka płac:** łączna liczba zatrudnionych oraz dzienny i miesięczny (`× 30`) fundusz płac.

---

## 5. Magazyny, Zamawianie Surowców i Sprzedaż (`*StorageBins.tsx`, `LivestockSupplyOrderCard.tsx`)

### Wygląd zbiorników / magazynów i układ `🛒 Zakup/Sprzedaż` (Obowiązkowy Template dla każdego budynku)
- **Zasada ogólna:** Każda zakładka `🛒 Zakup/Sprzedaż` w każdym budynku (Młyn, Piekarnia, Farma Zbożowa, Ferma Hodowlana, Kopalnia, Stoisko Targowe itd.) **musi** mieć dokładnie tę samą organizację:
- **Podział na 2 podzakładki:** `🛒 Zakupy (Surowce)` oraz `🤝 Sprzedaż (Wyroby)`.
- **Układ 2 kolumn (`grid-cols-1 lg:grid-cols-2`) w obu podzakładkach:**
  - **Lewa kolumna — Produkty, magazyny i formatki:** na górze **wymogi i stany magazynów** (z ramką zapotrzebowania miesięcznego `X kg/msc` w prawym górnym rogu), a poniżej **formatki zamówień** / karty produktów.
  - **Prawa kolumna — Zawarte kontrakty:** lista aktywnych umów zakupu (`Zawarte Kontrakty Zakupu`) lub przychodzących umów sprzedaży (`IncomingSalesContractsCard` / `Zawarte Kontrakty Sprzedaży`).
- **Kolorystyka i typografia surowców oraz kontraktów:**
  - **Nazwy surowców** na kartach magazynów i na liście kontraktów: **białą czcionką** (`text-white font-bold`).
  - **Dostawca** na liście kontraktów: **niebieską czcionką** (`text-sky-300 font-bold`) dla naszego budynku lub **granatową** (`text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded font-bold`) dla obcego dostawcy / statku.
  - **Zamówienie miesięczne** (`X kg/msc`) na liście kontraktów: **żółtą czcionką** (`text-yellow-300 font-mono font-bold`).
- **Opisy schowane w dymkach (`ℹ`):** nie zaśmiecaj kart magazynów długimi akapitami tekstu — wszelkie opisy zasad chowaj w małym dymku informacyjnym **`ℹ`** obok tytułu karty.
- Siatka kart (`bg-stone-900/90 rounded-2xl p-4 border`), z których każda prezentuje:
  - Ikonę, **konkretną** nazwę surowca (np. `Pszenica Złocista`, `Żyto Ozime`, `Jęczmień Browarny` — nigdy ogólne „Ziarno Zbożowe”) i jednostkę (`kg` / `l`),
  - Pasek zapełnienia pokazujący `aktualny_stan / pojemność_max` (pobieraną z `gameParameters.ts` / `farmGridTypes.ts`, np. Spichlerz `10 000 kg` z rozbudową do **`Farma × 4 + pole × 2`** poziomów po `10 t`, gdzie każde przyległe pole to `+5 ha`; Stóg słomy `20 000 kg`, Hałda obornika `10 000 kg`) oraz `%` zapełnienia.
  - Nadmiar wyprodukowanego surowca ponad limit pojemności **przepada** (np. obornik nie mieszczący się na hałdzie).

### Zamawianie surowców od innych budynków (`LivestockSupplyOrderCard.tsx`, `FarmManureBinCard.tsx`, `MillStorageBins.tsx`)
1. **Lista producentów:** `<select>` z budynkami danego typu na mapie świata w formacie `<Gracz> • <Miasto> • <Nazwa budynku> • <Konkretny produkt> (X kg)`. **Na pierwszym miejscu każdej listy dostawców zawsze musi pojawiać się `🚢 Statek Handlowy`** (import portowy dostępny od ręki w cenie `110%` i obniżonej jakości `0%` lub `50%` średniej lokalnych producentów), a dopiero po nim lokalni producenci z mapy. Nazwy farm używają nazwiska pierwszego rolnika (`Farma zbożowa <Nazwisko>`), z automatycznym numerowaniem duplikatów (`... 2`, `... 3`).
2. **Wybór ilości miesięcznej:** przyciski szybkiej zmiany ilości (**`--1t`**, **`-100`**, **`+100`**, **`++1t`**) wokół czytelnego licznika `X kg/msc` (zamiast sztywnej listy kilku wartości).
3. **Wybór kontraktu terminowego:** `<select>` zasilany wyłącznie przez `CONTRACT_OPTIONS` (`PAYG`, `3-letni -10%`, `5-letni -15%`, `10-letni -20%`).
4. **Lista aktywnych kontraktów na samym dole panelu:**
   - Wszystkie aktywne kontrakty wyświetlają się **zawsze na samym dole** pod przyciskiem zapisu zamówienia.
   - Każdy wiersz zawiera nazwę dostawcy, **nazwę produktu**, ilość miesięczną, typ/czas kontraktu oraz przycisk **`✕`** do kasowania (przy kontrakcie terminowym z naliczeniem kary przez `computeSupplyContractPenalty`).
5. **Realizacja cykliczna (globalne ticki w `useWorldSimulationTicks.ts`):** ticki dzienne/miesięczne (np. `useMillWorldTick`, `useFarmAnnualTick`) muszą działać globalnie w tle (niezależnie od tego, czy okno budynku jest otwarte), pobierając surowiec od dostawcy, naliczając koszt z rabatem (`onSpendGold`), aktualizując przychód dostawcy i odliczając `monthsRemaining`.
6. **Zamawianie z wielu źródeł (mieszanie w jednym zbiorniku):** ten sam surowiec (np. ziarno w młynie, pasza na fermie hodowlanej — zboże z farm + otręby z młynów) można zamawiać równolegle z **wielu** źródeł (osobny kontrakt na każdego dostawcę). Comiesięczne dostawy ze wszystkich aktywnych kontraktów sumują się do wspólnego zbiornika (do limitu jego pojemności), a surowce mieszają się razem.

### Sprzedaż produktów z magazynu
- Przyciski sprzedaży partii (np. `100 kg` obornika, `100 l` mleka, `50 kg` wełny) lub pełnej partii ziarna wymagają zatrudnionego **Kupca** (lub Hodowcy), a w modelu zamkniętym rynku brak NPC kupujących automatycznie — przychód wynika wyłącznie z realnych kontraktów i transakcji z innymi budynkami/miastem.

---

## 6. Stoisko Targowe / Sklep Detaliczny (`MarketplaceSection.tsx`, `MarketStallModal.tsx`, `MarketStallTradeTab.tsx`, `MarketStallStaffModal.tsx`)

### Licytacja i dzierżawa slotów na targu
- **Wolne sloty** można licytować zawsze (brak globalnej blokady po jednej licytacji w roku).
- Dopiero **zajęty slot** (wygrany przez gracza lub NPC) czeka na wygaśnięcie dzierżawy.
- Dzierżawa wylicytowanego stoiska trwa **pełne 12 miesięcy (360 dni)** od dnia wylicytowania (`rentedUntilTotalDays`), a nie do końca roku kalendarzowego.

### Karta stoiska (okno `max-w-6xl h-[92vh]` na wzór Piekarni)
- Kliknięcie wylicytowanego stoiska gracza otwiera osobną kartę modalną z 4 zakładkami: `🏭 Proces Sprzedaży`, `📦 Produkty`, `🛒 Zakup/Sprzedaż`, `📊 Finanse — Zestawienie`.
- **Zakładka `🏭 Proces Sprzedaży` — 3 kroki w stylu `BakeryStageCard`:**
  1. **`1. Zaopatrzenie`** → **`2. Handlarz`** → **`3. Dostawa`**, połączone strzałkami `FarmPipelineArrow`.
  2. Każdy kafelek posiada ikonę **`ℹ`** oraz okrągły przycisk z **ikonką ludzika SVG** i licznikiem obsady (czerwony dla `0`, zielony dla `> 0`), otwierający modal zatrudniania identyczny z Piekarnią (`PRZYPISANI DO TEGO KROKU`, `Odepnij`, `➕ Zatrudnij i przypisz`).
  3. **Krok 1 (`Zaopatrzenie`):** jedno okienko `<select>` łączące **produkt i dostawcę** (jak przy zamawianiu w Piekarni). Na liście **najpierw** wyświetlają się lokalni producenci oferujący **wyłącznie produkty faktycznie będące w produkcji** (konkretne wyroby, np. `Chleb Pszenny`, `Chleb Żytni na Zakwasie`, `Rogaliki`, `Bułka Tarta` — nigdy ogólne „Pieczywo i Wypieki”), a następnie pozycje ze **Statku Handlowego**.
  4. **Krok 2 (`Handlarz`):** pasek wyboru produktu z zawartych kontraktów, do którego przypisywany jest sprzedawca.
- **Zakładka `🛒 Zakup/Sprzedaż` (`MarketStallTradeTab.tsx`):**
  - Zgodna z sekcją 5 (podzakładki `🛒 Zakupy` / `🤝 Sprzedaż`, układ 2-kolumnowy `grid-cols-1 lg:grid-cols-2`, przyciski `--1t`, `-100`, `+100`, `++1t`, kontrakty `CONTRACT_OPTIONS`, opcja zakupu interwencyjnego z `ℹ`).
  - **Zasada `1 sprzedawca = 1 dobro`:** jeden sprzedawca nie może być przypisany jednocześnie do dwóch dóbr na ladzie (listy wyboru pokazują wyłącznie wolnych sprzedawców).
