# Plan i Założenia Gry (Game Design Document – v5.0 Final)
**Koncepcja: Hybryda *Capitalism* + *Civilization* w paradygmacie Gospodarki Zrównoważonej**

> [!IMPORTANT]
> Kompletny dokument projektowy i architektoniczny (**v5.0 Final**) opracowany w wyniku 50-etapowego wywiadu projektowego (`/grill-me`). Szczegółowy katalog wszystkich **24 surowców**, **36 półproduktów**, **200 produktów końcowych (10 branż × 20)**, **8 gałęzi usług** oraz **Drzewka Technologii (40 węzłów)** i **Drzewka Idei (32 węzły)** znajduje się w załączniku: [game_data_catalog.md](file:///C:/Users/Budy3/.gemini/antigravity/brain/aad56b15-a9be-4586-96b5-f672c1282435/game_data_catalog.md).

---

## 1. Wizja, Tryby Rozgrywki Sieciowej i Tempo Sezonu

* **Rola gracza**: Zarząd korporacji / konsorcjum przemysłowo-rozwojowego działającego na mapie świata, wpływającego na miasta, ekosystem i politykę.
* **Skala świata i tryby gry**:
  1. **Tryb Sieciowy Wieloosobowy (Persistent Multiplayer – do 200–300 graczy na świat)**:
     * Serwer działa w czasie rzeczywistym 24/7 przez cały sezon obejmujący **200 lat historii gospodarczej (1880–2080)** podzielonych na **8 Epok (po 25 lat każda)**:
       * **Serwer 1x (Standard)**: pełny cykl 200 lat trwa **3 miesiące czasu rzeczywistego (~90 dni)** ($\approx 54\text{ min}$ czasu realnego na 1 miesiąc w grze).
       * **Serwer 2x (Przyspieszony)**: pełny cykl trwa **1,5 miesiąca (~45 dni)**.
       * **Serwer Turbo 3x**: pełny cykl trwa **1 miesiąc (~30 dni)**.
  2. **Tryb Jednoosobowy / Sesyjny z Botami AI**:
     * Pozwala na rozgrywkę z wybraną liczbą Botów AI oraz aktywną pauzą i regulacją tempa symulacji.

---

## 2. Geograficzna Globalizacja w 8 Epokach i Architektura Mapy

Gra wykorzystuje **dwuwarstwowy układ mapy (2D Top-Down)**:
1. **Warstwa 1: Heksagonalna Mapa Świata (Hex Grid)** – biomy, złoża 24 surowców, elektrownie oraz miasta połączone automatyczną logistyką.
2. **Warstwa 2: Widok Miasta (Ortogonalna Siatka Ulic i Działek)** – fabryki, zakłady przetwórcze, sklepy detaliczne, budynki usługowe, zakłady recyklingu, infrastruktura społeczna (osiedla, szkoły, szpitale, parki) oraz Ratusz i Giełda Miejska.

### 2.1. Historyczny Rozwój Globalizacji (Od Wielkiej Brytanii na Cały Świat)
* **Start w Epoce 1 (Wielka Brytania – UK)**: Rozgrywka rozpoczyna się w kolebce rewolucji przemysłowej (Wielka Brytania). Liczba miast startowych skaluje się z liczbą graczy w proporcji **1 miasto na ok. 10 graczy** (np. 20 miast w UK dla 200 graczy; 30 miast dla 300 graczy). Każdy gracz może inwestować we wszystkich dostępnych miastach.
* **Ekspansja geograficzna w kolejnych epokach**: W każdej nowej Epoce (Epoki 2–8) na Mapie Świata pojawia się **1 nowe miasto na każdych 20 graczy**, położone coraz dalej geograficznie (co zwiększa koszty i emisje transportu, ale otwiera nowe rynki zbytu oraz unikalne złoża surowców):

| Epoka | Lata | Nowy Region Geograficzny (Globalizacja) | Nowo Otwierana Branża Towarowa | Narzut Polityki Eko |
| :--- | :--- | :--- | :--- | :---: |
| **Epoka 1** | 1880–1905 | **Wielka Brytania (UK)** *(Start: 1 miasto / 10 graczy)* | **1. Żywność i Napoje**<br>**2. Odzież, Obuwie i Moda**<br>**3. Dom, Meble i Budownictwo** | **0%** |
| **Epoka 2** | 1905–1930 | **Europa Kontynentalna** *(+1 miasto / 20 graczy)* | **4. Transport i Pojazdy** | **~7%** |
| **Epoka 3** | 1930–1955 | **Ameryka Północna (USA / Kanada)** | **5. Chemia Gospodarcza i Kosmetyki** | **~14%** |
| **Epoka 4** | 1955–1980 | **Bliski Wschód i Ameryka Południowa** | **6. Elektronika i Komunikacja** *(+ Usługi IT)* | **~21%** |
| **Epoka 5** | 1980–2005 | **Japonia, Korea Południowa i Australia** | **7. Kultura, Zabawki i Sport** | **~28%** |
| **Epoka 6** | 2005–2030 | **Chiny, Indie i Azja Południowo-Wschodnia** | **8. Zdrowie, Farmacja i Biotechnologia** | **~35%** |
| **Epoka 7** | 2030–2055 | **Afryka (Metropolie i Huby Solarne/Surowcowe)** | **9. Energetyka Użytkowa i Eko-Technologie** | **~42%** |
| **Epoka 8** | 2055–2080 | **Globalne Eko-Metropolie Przyszłości** | **10. Bionika i Robotyka** | **50%** |

* **Premia Pioniera**: Ramy 25-letnie wyznaczają naturalny rytm epok dla świata, ale korporacja silnie inwestująca w R&D i Uniwersytety może zbadać przełomową technologię nowej Epoki i wejść w nową branżę wcześniej niż konkurenci.

---

## 3. Gospodarka, Anonimowa Giełda B2B i Sektor Usług

### 3.1. Trójstopniowa Struktura Towarowa
1. **25 Surowców Bazowych**: Wydobywane na Mapie Świata lub odzyskiwane w miejskich **Zakładach Recyklingu** ze wspólnej puli „Odpadów Zmieszanych”.
2. **Wielopoziomowe Półprodukty Przemysłowe (L1, L2, L3)**: 
   * **36 Półproduktów Poziomu 1 (L1)** – materiały podstawowe wytwarzane bezpośrednio z 25 surowców,
   * **72 Półprodukty Poziomu 2 i Złożone (L2/L3)** – zaawansowane komponenty i podzespoły powstające z połączenia L1, innych L2, a w przemyśle high-tech nawet z 3 poziomów (np. płytki drukowane, mikroprocesory, silniki, ekrany, baterie, stopy metali, bio-matryce).
3. **200 Produktów Końcowych (10 Branż × 20 Produktów)**: Każdy produkt wymaga połączenia od **1 do 3 składników**. Nowe epoki zmieniają generacje/nazwy części produktów, wygaszają popyt na produkty przestarzałe i wprowadzają nowe.

### 3.2. Anonimowa Giełda Towarowa w Miastach (Handel B2B między Graczami)
* Handel surowcami, półproduktami i produktami między graczami jest dozwolony **wyłącznie poprzez Anonimowe Giełdy Miejskie** (zabezpieczenie przed zmowami cenowymi i nieuczciwym transferem kapitału).
* Gracz wystawia towar na giełdę w swoim mieście **anonimowo** (widoczna jest ilość, cena, jakość oraz parametry Eko-Etyki, bez nazwy firmy sprzedającego).
* Inny gracz może nabyć towar wyłącznie poprzez:
  1. **Anonimowy kontrakt giełdowy** (cykliczne dostawy do fabryki/sklepu), lub
  2. **Jednorazowy zakup (Spot)** z giełdy miejskiej.

### 3.3. Kategoria 11: Sektor Usług (10 Gałęzi) i Triada Wymogów Produkcyjnych
Budynki usługowe w miastach generują przychód oraz dają efekty systemowe:
1. **Handel**, 2. **Bankowość**, 3. **Księgowość**, 4. **Ubezpieczenia**, 5. **Uniwersytety** (kształcenie kadr + Punkty Nauki), 6. **R&D** (badania i patenty), 7. **Serwisanci** (obieg zamknięty i redukcja odpadów), 8. **Usługi IT** *(od Epoki 4)*, 9. **Energetyka i Dystrybucja Mocy** (zasilanie fabryk i miast), 10. **Transport i Spedycja** (przepływ surowców po mapie).

> [!IMPORTANT]
> **Triada Wymogów Produkcyjnych**: Każda fabryka i zakład przetwórczy do uruchomienia produkcji wymaga spełnienia trzech warunków:
> 1. **LUDZIE** – obsada miejsc pracy odpowiednią klasą społeczną (Robotnicy / Specjaliści / Naukowcy) z godnymi płacami.
> 2. **ENERGIA** – stały przydział mocy z miejskiej sieci energetycznej (usługa Energetyki).
> 3. **LICENCJA** – odblokowana technologia/patent w Drzewku Technologii lub licencja badawcza z R&D/Uniwersytetu.

---

## 4. Społeczeństwo, Wspólny Ratusz (Lobbing) i Finanse

* **3 Klasy Społeczne w Miastach**: **1. Robotnicy**, **2. Klasa Średnia / Specjaliści**, **3. Elita / Naukowcy**.
* **Wspólny Ratusz i Przeciąganie Liny Lobbingu**:
  * Każda korporacja rozwija własne **Drzewko Technologii** (za Punkty Nauki) i **Drzewko Idei** (za Kapitał Społeczny).
  * W Ratuszach Miast wszyscy obecni w mieście gracze mogą przeznaczać swój Kapitał Społeczny na popieranie lub opóźnianie projektów miejskich i regulacji (np. przyspieszenie podatków ekologicznych, budowa usług publicznych).
* **Uproszczone Finanse i Aukcje Majątku**:
  * Brak giełdy akcji – firmy korzystają z własnego konta i kredytów bankowych.
  * Gdy firma zbankrutuje, nie jest zastępowana nowym podmiotem, a jej budynki i działki trafiają na **aukcję miejską/państwową**, gdzie każdy gracz może je wylicytować.

---

## 5. Specyfikacja Matematyczna Silnika Symulacji

### 5.1. Popyt Miejski, 5-Składnikowa Ocena i Podział Rynku
1. **Miesięczny popyt miasta na produkt $P$ dla klasy społecznej $c \in \{R, M, E\}$**:
   $$\text{Demand}_{P, c} = N_c \cdot \text{BazoweZapotrzebowanie}_{P, c} \cdot \left(\frac{\text{Płaca}_c}{\text{PłacaReferencyjna}_c}\right) \cdot M_{\text{epoka}}(P)$$
2. **5-Składnikowa Ocena Produktu w sklepie $i$ (100% jawności, brak greenwashingu)**:
   $$S_{i, c} = w_{1,c} \cdot \text{Cena}_i + w_{2,c} \cdot \text{Jakość}_i + w_{3,c} \cdot \text{Marka}_i + w_{4,c} \cdot \text{Trwałość}_i + w_{5,c} \cdot \text{EkoEtyka}_i$$
   *(Z progiem bojkotu $S_{i,c} = 0$ przy przekroczeniu ceny maksymalnej lub spadku Eko-Etyki poniżej minimum epokowego).*
3. **Udział sklepu $i$ w rynku miasta**:
   $$\text{UdziałRynkowy}_{i, c} = \frac{S_{i, c}^2}{\sum_{j} S_{j, c}^2}$$

### 5.2. Emisja CO2, Eko-Etyka, Odpady i Recykling
1. **Miesięczna emisja CO2 zakładu ($\text{CO2}_b$)**:
   $$\text{CO2}_b = \text{EmisjaBazowa}_b \cdot (1 - \text{RedukcjaZFiltrów}_b) + (\text{ZużyciePrądu}_b \cdot \text{EmisyjnośćSieciMiasta}) + \text{EmisjaTransportuDostaw}_b$$
2. **Eko-Etyka Produktu ($\text{EkoEtyka}_P \in [0, 100]$)**:
   $$\text{EkoEtyka}_P = 0.40 \cdot \text{CzystośćFabrykiIPrądu} + 0.30 \cdot \text{UdziałSurowcówZRecyklinguIBio} + 0.30 \cdot \text{OcenaPłacIBHP}$$
3. **Miesięczny przyrost Odpadów Zmieszanych w mieście**:
   $$\text{Odpady}_{\text{nowe}} = \sum_{P} \text{SprzedaneSztuki}_P \cdot \text{Masa}_P \cdot \left(1 - 0.7 \cdot \frac{\text{Trwałość}_P}{100}\right) \cdot \left(1 - \text{PokrycieSerwisoweMiasta}\right)$$
4. **Odzysk surowców w Zakładach Recyklingu**:
   $$\text{SurowceWtórne}_{\text{miesiąc}} = \text{PrzerobioneOdpady} \cdot \eta_{\text{recykling}} \quad (\eta_{\text{recykling}} \in [30\%, 95\%])$$

### 5.3. Progresywny System Podatkowy (0% $\to$ 50%) i Punktacja Końcowa (50/25/25)
1. **Współczynnik Polityki Ekologicznej Epoki ($P_{\text{eko}}(e)$)**:
   $$P_{\text{eko}}(e) = \frac{e - 1}{7} \cdot 0.50 \quad \text{(od } 0\% \text{ w Epoce 1 do } 50\% \text{ w Epoce 8)}$$
2. **Roczny Podatek Korporacji**:
   $$\text{Podatek}_{\text{rok}} = \max(0, \text{ZyskNetto} \cdot \tau_{\text{CIT}}) + P_{\text{eko}}(e) \cdot \left( \text{EmisjaCO2}_{\text{rok}} \cdot k_{\text{CO2}} + \text{ŚladOdpadowy}_{\text{rok}} \cdot k_{\text{odpady}} - \text{UlgiZaInwestycjeOZEiMiasta} \right)$$
3. **Końcowy Wynik Zwycięstwa (na koniec 8. Epoki – rok 2080)**:
   $$\text{Wynik Końcowy} = 0.50 \cdot \text{Punkty}_{\text{ZYSK}} + 0.25 \cdot \text{Punkty}_{\text{LUDZIE}} + 0.25 \cdot \text{Punkty}_{\text{PLANETA}}$$

---

## 6. Architektura Techniczna i Plan Wdrożenia (Roadmap)

### 6.1. Zatwierdzony Stos Technologiczny
* **Frontend (Klient Webowy)**: `TypeScript` + `React` + `Vite` + `HTML5 Canvas / PixiJS` (renderowanie 2D Heksagonalnej Mapy Świata oraz Ortogonalnej Siatki Miasta) + `TailwindCSS` (Górny Pasek Statusu i 5-zakładkowy Panel Zarządzania).
* **Backend (Serwer Autorytatywny Tick Engine)**: `Node.js` + `TypeScript` + `WebSockets` (obsługa pokoi/światów do 300 graczy, przeliczanie ticków miesięcznych i rocznych, rozstrzyganie anonimowych zleceń giełdowych i aukcji).
* **Baza Danych i Synchronizacja Stanu**: **Google Cloud Firestore** (przechowywanie stanu światów/sezonów, profili graczy, miast, budynków, ofert na Anonimowej Giełdzie Miejskiej oraz logów historii ekonomicznej; możliwość pracy na lokalnym Firebase Emulator Suite podczas dewelopmentu).
  * *Zasada bezpieczeństwa*: Żaden projekt chmurowy w Firebase/GCP nie zostanie utworzony ani zmodyfikowany bez uprzedniego zapytania użytkownika o dokładną nazwę projektu i uzyskania wyraźnej zgody.

### 6.2. Etapy Realizacji Projektu (Milestones)
1. **Etap 1 – Fundament Danych i Silnik Matematyczny (Core Engine)**:
   * Implementacja struktur TypeScript dla 24 surowców, 36 półproduktów, 200 produktów, 8 usług oraz obu drzewek rozwoju.
   * Implementacja czystych funkcji matematycznych (popyt 3 klas społecznych, 5-składnikowa ocena zakupowa, emisje CO2, odpady, recykling i podatki 0% $\to$ 50%) wraz z testami jednostkowymi.
2. **Etap 2 – Dwuwarstwowa Mapa 2D i Interfejs Gracza (Frontend UI + Canvas)**:
   * Widok Heksagonalnej Mapy Świata (zaczynając od UK w Epoce 1 i odblokowując kolejne regiony świata) oraz Widok Siatki Miasta.
   * Zmodernizowany Panel Budynku (fabryki, sklepy, usługi, zakłady recyklingu) oraz ekran Anonimowej Giełdy Miejskiej.
3. **Etap 3 – Integracja z Cloud Firestore i Silnikiem Czasu (Multiplayer + Boty AI)**:
   * Po zatwierdzeniu przez użytkownika konfiguracji Firebase/Firestore (lub emulatora lokalnego): zapis stanu świata, obsługa 3 trybów prędkości serwera (`1x`, `2x`, `Turbo 3x`) oraz logika Botów AI i lobbingu w Ratuszu.
4. **Etap 4 – Balans 8 Epok, Drzewka Technologii/Idei i Ranking Końcowy (50/25/25)**:
   * Pełne spięcie 200 lat rozgrywki (1880–2080), aukcji zbankrutowanych firm oraz tablicy wyników końcowych.
