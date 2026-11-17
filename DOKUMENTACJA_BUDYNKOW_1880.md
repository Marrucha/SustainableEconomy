# Dokumentacja Projektu: Sustainable Economy (Era Wiktoriańska 1880)

## 1. Mapy Świata i Układ Startowy
Gra rozgrywa się na dwóch naprzemiennych widokach w **prawdziwym rzucie dimetrycznym 2:1** (`dy / dx = 0.5000`, `26.565°`):
- **Mapa Wiejska (Produkcja surowców):** Bazowo `28 × 24` pola (`gridSizeX: 28`, `gridSizeY: 24`).
- **Mapa Miejska (Przemysł, handel, edukacja, mieszkalnictwo):** Bazowo `14 × 12` pól (`gridSizeX: 14`, `gridSizeY: 12`) z automatycznym powiększaniem terenu.

### Bazowy Układ Startowy Miasta (`initialWorld.ts`)
Każda nowa mapa miejska startuje z pojedynczymi, 1-polowymi drogami (bez dwupasmówek), infrastrukturą publiczną i bez młyna na starcie:
- **Ratusz (`town_hall`, 3×3):** Budynek miejski stykający się z drogą.
- **Targowisko Miejskie (`marketplace`, 3×3):** Zawsze przylega **prawym bokiem bezpośrednio do Ratusza** oraz styka się z drogą.
- **Szkoła Branżowa (`trade_school`, 2×2)** i **Wiktoriański Uniwersytet (`university`, 3×3):** Budynki edukacyjne stykające się z drogą.
- **Park Miejski (`oak`, 2×2):** Teren zielony przy drodze miejskiej.
- **Elektrociepłownia Węglowa (`coal_plant`, 1×2):** Przylega do drogi miejskiej.
- **Budynki mieszkalne (po 1 sztuce na start):**
  - 1 × Willa Elity (`tenement_elite`, 2×2) – zamieszkiwana na start przez burmistrza.
  - 1 × Kamienica Mieszczańska (`tenement_middle`, 1×2).
  - 1 × Kamienica Robotnicza (`tenement_workers`, 1×2).

---

## 2. Katalog Budynków 1880

### A. Budynki Miejskie, Edukacyjne, Handlowe i Transportowe
| Nazwa budynku | `typeId` | Rozmiar | Koszt (£) | Rola w grze |
| :--- | :--- | :---: | :---: | :--- |
| **Ratusz Miejski** | `town_hall` | 3×3 | Publiczny | Zarządzanie miastem, podgląd populacji, mieszkań, graczy i automatycznej rozbudowy |
| **Targowisko Miejskie** | `marketplace` | 3×3 | Publiczny | 8 stoisk targowych do wynajęcia w rocznej licytacji |
| **Szkoła Branżowa** | `trade_school` | 2×2 | Publiczny | Roczne kursy podnoszące wydajność pracowników (+10% / kurs) |
| **Wiktoriański Uniwersytet** | `university` | 3×3 | Publiczny | Kształcenie kadr zarządzających i badania |
| **Park Miejski** | `oak` | 2×2 | Publiczny | Miejski park rekreacyjny |
| **Firma Transportowa** | `transport_company` | 2×2 | 3 200 | Prywatny przewoźnik wymagany do dostaw surowców i towarów |
| **Sklep Mięsny** | `meat_shop` | 1×1 | 1 100 | Detaliczna sprzedaż mięsa i wyrobów mięsnych |
| **Sklep Spożywczy** | `grocery_shop` | 1×1 | 1 050 | Detaliczna sprzedaż artykułów spożywczych |
| **Sklep Odzieżowy** | `clothing_shop` | 2×1 | 2 200 | Detaliczna sprzedaż odzieży i obuwia |
| **Skład Budowlany** | `building_depot` | 2×1 | 2 400 | Sprzedaż materiałów budowlanych i wyposażenia |

### B. Budynki Wiejskie (Rolnictwo, Plantacje i Kopalnie)
| Nazwa budynku | `typeId` | Rozmiar | Główne surowce / produkty |
| :--- | :--- | :---: | :--- |
| **Wielka Farma Zbożowa** | `wheat_farm` | 3×4 | Zboże (pszenica, żyto, owies, jęczmień) |
| **Sad Owocowy** | `orchard` | 2×2 | Owoce, cydr |
| **Plantacja Lnu** | `flax_farm` | 2×2 | Włókno lnu, siemię lniane |
| **Plantacja Chmielu** | `hop_farm` | 2×2 | Chmiel browarny |
| **Plantacja Kauczuku** *(zaślepka)* | `rubber_plantation` | 2×2 | Kauczuk surowy (lateks) |
| **Plantacja Buraków Cukrowych** *(zaślepka)* | `sugar_beet_farm` | 2×2 | Buraki cukrowe |
| **Pole Tytoniu** *(zaślepka)* | `tobacco_field` | 2×2 | Liście tytoniu |
| **Plantacja Bawełny** *(zaślepka)* | `cotton_plantation` | 2×2 | Bawełna surowa |
| **Hodowla / Pastwiska** | `livestock_farm`, `pasture_cattle`, `pasture_sheep` | 2×2 / 3×3 | Mleko, wełna owcza, żywiec |
| **Kopalnia Głębinowa** | `mine_shaft` | 2×2 | Węgiel, ruda żelaza/miedzi/złota, **Minerały**, glina, piasek kwarcowy, sól, **Siarka** |
| **Wyręb Drewna** | `woodcutter` | 2×2 | Drewno / dłużyca |

### C. Przemysł Miejski (Fabryki, Huty i Przetwórstwo)
| Nazwa budynku | `typeId` | Rozmiar | Koszt (£) | Główne produkty i wymagane surowce |
| :--- | :--- | :---: | :---: | :--- |
| **Młyn Parowy** | `mill` | 1×2 | 2 200 | Mąka, płatki, otręby (ze zboża) |
| **Piekarnia Wiktoriańska** | `bakery` | 1×1 | 1 500 | Chleb, bułki, ciasta (z mąki) |
| **Browar Parowy** | `brewery` | 2×1 | 3 200 | Piwo, słód (z chmielu i zboża) |
| **Fabryka Włókiennicza** | `spinning_mill` | 1×2 | 2 600 | **Materiał Lniany** (len), **Materiał Wełniany** (wełna) |
| **Szwalnia** | `sewing_factory` | 2×1 | 2 800 | **Bielizna** (materiał lniany), **Koszule** (materiał lniany + guziki), **Fraki** (materiał wełniany + guziki), **Gorsety** (stal + materiał + guziki) |
| **Garbarnia** | `tannery` | 2×1 | 2 500 | Skóra garbowana (ze skór surowych) |
| **Zakład Szewski** | `shoemaker` | 1×1 | 1 400 | Buty skórzane (ze skóry) |
| **Mleczarnia** | `dairy` | 2×1 | 2 700 | Masło, ser, śmietana (z mleka) |
| **Rzeźnia** | `slaughterhouse` | 2×1 | 2 900 | Mięso surowe, skóry surowe, **Tłuszcz Zwierzęcy** |
| **Masarnia** | `butcher` | 1×1 | 1 600 | Wędliny, kiełbasy |
| **Fabryka Mebli** | `furniture_factory` | 2×1 | 3 500 | Meble drewniane (z tarcicy) |
| **Huta** *(zaślepka)* | `huta` | 2×2 | 6 800 | **Stal**, **Żeliwo**, **Złoto**, **Miedź**, **Szkło** (każde wymaga węgla + odpowiedniej rudy) |
| **Cementownia** *(zaślepka)* | `cement_plant` | 2×1 | 4 200 | Cement (z **minerałów** i **gliny**) |
| **Cegielnia** *(zaślepka)* | `brickworks` | 2×1 | 3 400 | Cegła, dachówka (z gliny i węgla) |
| **Cukrownia** *(zaślepka)* | `sugar_refinery` | 2×1 | 4 400 | Cukier kryształ, kostki cukru, melasa (z buraków cukrowych i węgla) |
| **Jubiler** *(zaślepka)* | `jeweler` | 1×1 | 4 600 | Pierścionki (złoto + minerały), Obrączki (samo złoto), Naszyjniki (złoto + minerały) |
| **Zegarmistrz** *(zaślepka)* | `watchmaker` | 1×1 | 3 800 | Zegarki (stal + szkło), Zegarki Luksusowe (złoto + stal + szkło) |
| **Fabryka** *(zaślepka)* | `factory` | 2×1 | 5 200 | **Guma** (kauczuk), **Rowery** (stal + kauczuk), **Fajerki** (żeliwo), **Lampy Naftowe** (szkło + stal), **Żelazko na Duszę** (żeliwo + stal), **Magiel** (stal + drewno + żeliwo), **Gramofon** (stal + drewno), **Konserwy** (stal + mięso), **Zapałki** (siarka + drewno), **Kwas Siarkowy** (siarka), **Soda Kaustyczna** (kwas siarkowy + sól + glina), **Mydło** (soda kaustyczna + tłuszcz zwierzęcy), **Celuloid** (kwas siarkowy + bawełna), **Grzebienie / Lalki / Kule Bilardowe** (celuloid), **Ebonit** (siarka + kauczuk), **Guziki / Ustniki do Fajek** (ebonit), **Pióra Wieczne** (stal + ebonit), **Fajki** (glina + tytoń + ustniki), **Tabaka** (stal + tytoń) |

### D. Mieszkalnictwo i Automatyczny Rozwój Miasta
| Budynek mieszkalny | `typeId` | Rozmiar | Pojemność | Kto mieszka |
| :--- | :--- | :---: | :---: | :--- |
| **Kamienica Robotnicza** | `tenement_workers` | 1×2 | **20 rodzin** | Robotnicy, sprzedawcy, zaopatrzeniowcy, magazynierzy |
| **Kamienica Mieszczańska** | `tenement_middle` | 1×2 | **5 rodzin** | Zarządcy |
| **Willa Elity** | `tenement_elite` | 2×2 | **1 rodzina** | 1 willa na każdego gracza w mieście + startowo burmistrz |

**Zasady automatycznej rozbudowy (`cityAutoGrowth.ts`, `useCityHousingGrowth.ts`, `useWorldMaps.ts`):**
- Gdy liczba zatrudnionych robotników/sprzedawców/zaopatrzeniowców przekroczy pojemność bloków robotniczych (20 rodzin / blok), miasto **automatycznie buduje nową Kamienicę Robotniczą** przy drodze.
- Gdy liczba zatrudnionych zarządców przekroczy pojemność kamienic mieszczańskich (5 rodzin / kamienica), miasto **automatycznie buduje nową Kamienicę Mieszczańską** przy drodze.
- Gdy w mieście pojawi się nowy gracz, miasto **automatycznie buduje dla niego nową Willę Elity**.
- **Powiększanie mapy przy < 3×3 miejsca:** Gdy na mapie miasta zostaje mniej wolnego miejsca przy drodze niż `3×3`, teren miasta automatycznie powiększa się w dół (`gridSizeY`) o nowy pas z pojedynczą drogą (bez tworzenia dwupasmówek), aby zawsze zmieścił się co najmniej budynek `3×3`.

---

## 3. Zatrudnienie, Dostępność Produktów i Targowisko

### A. Domyślny stan i dostępność towarów
- **Każdy nowo wybudowany budynek jest w 100% nieobsadzony.**
- **Warunek dostępności produktu na rynku (`getProducerMarketAvailability`):** Aby produkt był widoczny u zaopatrzeniowca, fabryka, gospodarstwo lub kopalnia muszą mieć **zatrudnionego sprzedawcę** oraz **zapas towaru na magazynie** (`> 0`). Wybór produktu zawsze pokazuje nazwę firmy/farmy, gracza, lokalizację oraz stan magazynu.

### B. Kolejka Produkcyjna Fabryk i Sklepów
Budynki przemysłowe działają w układzie 4-etapowej linii (`IndustryPipelineCard.tsx`):
1. **Zaopatrzeniowcy (Kupcy):** Zamawiają surowce od dostępnych producentów (wymagają wynajęcia **Firmy Transportowej**).
2. **Magazynierzy:** Wymagany **1 magazynier na każdych 10 robotników**.
3. **Robotnicy Produkcyjni (max 10 na 1 pole budynku):**
   - Bazowa wydajność: **1000 jednostek / miesiąc / pracownika** (`+1% / rok stażu`, `+10% za 1-roczny kurs w Szkole Branżowej`).
   - **Zarządca:** Wymagany przy łącznej załodze `> 5` osób (**1 zarządca na 10 pracowników**).
   - **Kara za brak delegacji zadań (< 10 osób):** `liczba_pracowników × liczba_ról × 10%`.
4. **Sprzedawcy:** Nie generują paska postępu ani sprzedaży, dopóki nie mają zakontraktowanej pojemności / nabywców.

### C. Kontrakty Dostaw i Targowisko Miejskie
- **Kontrakty (`industryContracts.ts`):** `PAY AS YOU GO`, `3 lata (-10%)`, `5 lat (-15%)`, `10 lat (-20%)` (kara za zerwanie: **20% pozostałej wartości kontraktu**).
- **Targowisko (`MarketplaceSection.tsx`, `MarketStallDetailPanel.tsx`):** 8 stoisk w rocznej licytacji (do 4 jednocześnie); 1 zaopatrzeniowiec obsługuje do 4 stoisk i ma 4 sloty zamówień z realnych ofert graczy; do 4 sprzedawców na stoisko wybiera po 1 produkcie zabezpieczonym przez zaopatrzeniowca.

---

## 4. Logistyka Transportu w Roku 1880 (`transportLogistics.ts`)
Każdy zaopatrzeniowiec / kupiec musi wynająć prywatną **Firmę Transportową** (`transport_company`):
- **Wewnątrz tego samego miasta:** wyłącznie **Konie (wozy konne)**.
- **Ze wsi do miasta:** **Konie** lub **Kolej**.
- **Z innego miasta na tym samym kontynencie:** **Kolej**.
- **Z innego miasta na innym kontynencie:** **Statek**.
