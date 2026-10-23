# Dokumentacja Budynków i Kosztów Budowy (Epoka 1 • Rok 1880)

Niniejszy dokument przedstawia katalog budynków, fabryk, kamienic oraz infrastruktury rolniczo-wydobywczej dostępnych w **Epoce 1 (1880: Wiek Pary i Cegły)** w grze **Sustainable Economy**, wraz z ich wymiarami w siatce izometrycznej, podziałem na widok miejski i wiejski, kosztami budowy, zapotrzebowaniem na surowce, energię i siłę roboczą (Triada Produkcyjna: `[R/M/E]` + `kWh`).

---

## 1. Zasady Wymiarowania i Podział na Mapy (Miasto 🏙️ vs Wieś 🌾)

Gra posiada dwa niezależne, zsynchronizowane widoki świata gry:
1. **Widok Miejski (City View)**:
   - Siatka: $14 \times 12$ pól.
   - Wymiary kafelka: $W = 128\text{px}$, $H = 64\text{px}$ (standard True Dimetric 2:1, kąt osi $26.565^\circ$, $\text{Slope} = 0.5000$).
   - Przeznaczenie: zabudowa miejska, kamienice czynszowe, rzemiosło, elektrownia, ratusz, parki miejskie, nabrzeże portowe.
2. **Widok Wiejski (Rural View)**:
   - Siatka: $28 \times 24$ pól.
   - Wymiary kafelka: $W = 64\text{px}$, $H = 32\text{px}$ (pola są $2\times$ mniejsze w pikselach).
   - Przeznaczenie: rolnictwo, hodowla, sadownictwo, wydobycie surowców (węgiel, ruda, tartaki), wiejskie trakty gruntowe.
   - **Zasada Skalowania Pól**: Ponieważ pola wiejskie są $2\times$ mniejsze, duże parcele gospodarcze zajmują na wsi $2\times$ więcej kratek wzdłuż każdej osi ($4\times$ więcej powierzchni siatki), dzięki czemu zachowują **identyczny rozmiar fizyczny na ekranie** i perfekcyjną spójność skali (np. wóz gospodarczy vs zwierzęta).

### Zasady orientacji i obrotu (Klawisz R):
- Budynki prostokątne posiadają dwie wersje rzutu:
  - **Normalna (`_norm`)**: orientacja domyślna wzdłuż osi (np. $4 \times 3$, $3 \times 2$, $1 \times 2$).
  - **Obrócona o $90^\circ$ (`_rot90`)**: lustrzane odbicie rzutu izometrycznego dopasowane do prostopadłej osi siatki (np. $3 \times 4$, $2 \times 3$, $2 \times 1$).

---

## 2. Katalog Budynków Epoki 1 (1880)

| Kategoria | Budynek | Wymiar (Miasto) | Wymiar (Wieś) | Dozwolona mapa | Koszt (£) | Materiały budowlane | Załoga [R / M / E] | Energia | Funkcja / Produkcja |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :---: | :---: | :--- |
| **Administracja** | **Wiktoriański Ratusz** *(Town Hall)* | **$3 \times 3$** | — | Tylko Miasto | £ 15,000 | 120t Cegła klinkierowa, 40t Drewno, 20t Żeliwo, 15t Miedź | 0 / 15 / 5 | 25 kWh | Centrum administracji, licencje, podatki |
| **Rolnictwo** | **Wielka Farma Zbożowa** | **$3 \times 4$** / $4 \times 3$ | **$6 \times 8$** / $8 \times 6$ | Tylko Wieś | £ 2,800 | 35t Drewno, 10t Cegła, 2t Okucia żelazne | 12 / 1 / 0 | 0 kWh | 120t Pszenicy i Żyta / cykl |
| **Hodowla** | **Farma Bydła i Owiec** *(Livestock)* | **$3 \times 4$** / $4 \times 3$ | **$6 \times 8$** / $8 \times 6$ | Tylko Wieś | £ 2,400 | 40t Drewno, 15t Cegła, 10t Słoma i pasza | 8 / 1 / 0 | 0 kWh | 40t Mięsa, 25t Mleka, 15t Wełny, 20t Skór |
| **Hodowla** | **Pastwisko Bydła** *(Cattle Pasture)* | **$2 \times 2$** | **$4 \times 4$** | Tylko Wieś | £ 1,200 | 20t Drewno, 5t Żelazo, 10t Pasza | 4 / 0 / 0 | 0 kWh | 30t Mleka, 25t Mięsa, 15t Skór / cykl |
| **Hodowla** | **Pastwisko Owiec** *(Sheep Pasture)* | **$2 \times 2$** | **$4 \times 4$** | Tylko Wieś | £ 1,100 | 20t Drewno, 2t Żelazo, 8t Siano | 3 / 0 / 0 | 0 kWh | 25t Wełny, 15t Mięsa, 10t Mleka owczego / cykl |
| **Sadownictwo** | **Sad Owocowy** *(Orchard)* | **$2 \times 2$** | **$4 \times 4$** | Tylko Wieś | £ 1,800 | 15t Drewno, 5t Żelazo, 60 Drzewek owocowych | 6 / 1 / 0 | 0 kWh | 50t Świeżych owoców / cykl |
| **Górnictwo** | **Kopalnia Węgla i Rudy** *(Mine)* | **$2 \times 2$** | **$4 \times 4$** | Tylko Wieś | £ 5,000 | 80t Drewno kopalniakowe, 35t Stal, Maszyna wyciągowa | 30 / 3 / 0 | 60 kWh | 180t Węgla LUB 90t Rudy żelaza |
| **Mieszkalnictwo** | **Kamienica Robotnicza** *(Klasa R)* | **$1 \times 2$** / $2 \times 1$ | — | Tylko Miasto | £ 1,200 | 45t Cegła przemysłowa, 15t Drewno, 3t Żeliwo | +60 [R] | 5 kWh | Siła robocza fizyczna dla fabryk i kopalń |
| **Mieszkalnictwo** | **Kamienica Mieszczańska** *(Klasa M)* | **$1 \times 2$** / $2 \times 1$ | — | Tylko Miasto | £ 2,600 | 50t Cegła klinkierowa, 20t Drewno, 5t Szkło | +35 [M] | 10 kWh | Urzędnicy, majstrowie, inżynierowie |
| **Mieszkalnictwo** | **Willa Arystokracji** *(Klasa E)* | **$2 \times 2$** | — | Tylko Miasto | £ 5,500 | 60t Piaskowiec, 25t Marmur, 10t Szkło, 6t Mosiądz | +12 [E] | 20 kWh | Kapitał, patenty, kadra zarządzająca |
| **Przemysł** | **Wiktoriański Młyn Parowy** | **$1 \times 2$** / $2 \times 1$ | — | Tylko Miasto | £ 3,500 | 60t Cegła palona, 25t Drewno, 15t Żeliwo, Silnik parowy | 16 / 2 / 0 | 45 kWh | Przerób zboża $\rightarrow$ Mąka piekarnicza |
| **Energetyka** | **Elektrociepłownia Węglowa** | **$1 \times 2$** / $2 \times 1$ | — | Tylko Miasto | £ 6,200 | 90t Cegła szamotowa, 40t Stal/Żeliwo, Rury ciśnieniowe | 20 / 4 / 1 | +350 kWh | Generowanie energii elektrycznej z węgla |
| **Środowisko** | **Wiktoriański Park z Dębem** | **$2 \times 2$** | — | Tylko Miasto | £ 1,500 | 10t Kamień polny, 5t Kute żelazo, Sadzonki | 2 / 0 / 0 | 0 kWh | +18% Zadowolenie, redukcja smogu o 12% |
| **Rzemiosło** | **Piekarnia Rzemieślnicza** | **$1 \times 1$** | — | Tylko Miasto | £ 850 | 18t Cegła szamotowa, 8t Drewno, Piec chlebowy | 4 / 1 / 0 | 8 kWh | Wypiek chleba powszedniego i sucharów |
| **Rzemiosło** | **Kuźnia i Ślusarnia** | **$1 \times 1$** | — | Tylko Miasto | £ 950 | 20t Kamień/Cegła, 12t Żelazo kowalskie, Kowadło | 3 / 1 / 0 | 12 kWh | Gwoździe, okucia budowlane, narzędzia |
| **Infrastruktura** | **Miejski Bruk Granitowy** | **$1 \times 1$** | — | Tylko Miasto | £ 50 | 2t Kostka granitowa | — | — | Komunikacja miejska, chodnik |
| **Infrastruktura** | **Wiejski Trakt Gruntowy** | — | **$1 \times 1$** (małe) | Tylko Wieś | £ 15 | 1t Żwir, ubita ziemia | — | — | Komunikacja wiejska, transport płodów rolnych |

---

## 3. Logistyka, Strefy Wpływu i Karczowanie Lasu
1. **Dostęp do dróg**:
   - Każdy budynek miejski musi mieć bezpośredni kontakt z brukowaną ulicą (`road`).
   - Każda farma wiejska, sad i kopalnia wymaga połączenia traktem polnym (`road_dirt`).
2. **Automatyczne karczowanie terenu**:
   - Postawienie dowolnego budynku lub drogi na kafelkach zalesionych (`forest_oak`, `forest_pine`, `forest_grove`) automatycznie oczyszcza obrys działki z drzew, zmieniając podłoże na trawę (`grass`).
3. **Cienie i grafika**:
   - Budynki rolnicze posiadają zintegrowane, autentyczne wiejskie podłoże (pastwisko, gleba, rżysko) otoczone drewnianym płotem żerdziowym bez sztucznego cienia rombowego na sąsiadujących drogach.
