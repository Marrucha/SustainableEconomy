# Dokumentacja Budynków i Kosztów Budowy (Epoka 1 • Rok 1880)

Niniejszy dokument przedstawia katalog budynków, fabryk, kamienic oraz infrastruktury rolniczo-wydobywczej dostępnych w **Epoce 1 (1880: Wiek Pary i Cegły)** w grze **Sustainable Economy**, wraz z ich wymiarami w siatce izometrycznej, kosztami budowy, zapotrzebowaniem na surowce, energię i siłę roboczą (Triada Produkcyjna: `[R/M/E]` + `kWh`).

---

## 1. Zasady Wymiarowania i Orientacji na Siatce
- **Kąt izometrii**: $2:1$ (nachylenie osi $\frac{32}{60} \approx 0.5333$).
- **Wymiary kafelka**: $W = 120\text{px}$, $H = 64\text{px}$.
- **Warianty orientacji**: Każdy budynek posiada dwie wersje graficzne:
  - **Normalna (`_norm`)**: orientacja wzdłuż osi domyślnej (np. $1 \times 2$ lub $2 \times 3$).
  - **Obrócona o $90^\circ$ (`_rot90`)**: lustrzane odbicie rzutu izometrycznego dopasowane do prostopadłej osi siatki (np. $2 \times 1$ lub $3 \times 2$).

---

## 2. Katalog Budynków Epoki 1 (1880)

| Kategoria | Budynek | Wymiary siatki | Koszt budowy (Złoto / £) | Materiały budowlane | Załoga [R / M / E] | Energia (kWh / cykl) | Funkcja / Produkcja |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| **Administracja** | **Wiktoriański Ratusz Miejski** *(Town Hall)* | **$3 \times 3$** | £ 15,000 | 120t Cegła klinkierowa, 40t Drewno ciosane, 20t Żeliwo, 15t Blacha miedziana | 0 / 15 / 5 | 25 kWh (Oświetlenie gazowe) | Centrum administracji, wydawanie licencji, podatki |
| **Rolnictwo** | **Wielka Farma Zbożowa** *(Pole + Spichlerz)* | **$3 \times 4$** / $4 \times 3$ | £ 2,800 | 35t Drewno konstrukcyjne, 10t Cegła palona, 2t Okucia żelazne | 12 / 1 / 0 | 0 kWh (Wiatrak / Siła pociągowa) | 120t Pszenicy i Żyta / cykl |
| **Mieszkalnictwo** | **Kamienica Robotnicza** *(Klasa R)* | **$1 \times 2$** / $2 \times 1$ | £ 1,200 | 45t Cegła przemysłowa, 15t Drewno, 3t Rury żeliwne | Mieszkańcy: +60 [R] | 5 kWh | Zapewnia siłę roboczą fizyczną dla fabryk i kopalń |
| **Mieszkalnictwo** | **Kamienica Mieszczańska** *(Klasa M)* | **$1 \times 2$** / $2 \times 1$ | £ 2,600 | 50t Cegła klinkierowa, 20t Drewno szlachetne, 5t Szkło, 4t Żeliwo | Mieszkańcy: +35 [M] | 10 kWh | Zapewnia urzędników, majstrów i inżynierów |
| **Mieszkalnictwo** | **Willa Arystokracji** *(Klasa E)* | **$2 \times 2$** | £ 5,500 | 60t Kamień piaskowiec, 25t Marmur/Klinkier, 10t Szkło, 6t Mosiądz | Mieszkańcy: +12 [E] | 20 kWh | Zapewnia kapitał, patenty i kadrę zarządzającą |
| **Przemysł Spożywczy**| **Wiktoriański Młyn Parowy** *(Flour Mill)* | **$1 \times 2$** / $2 \times 1$ | £ 3,500 | 60t Cegła palona, 25t Drewno, 15t Żeliwo maszynowe, 1 Silnik parowy | 16 / 2 / 0 | 45 kWh (Węgiel / Para) | Mąka piekarnicza, otręby zbożowe |
| **Energetyka** | **Elektrociepłownia Węglowa** *(Power Plant)*| **$1 \times 2$** / $2 \times 1$ | £ 6,200 | 90t Cegła szamotowa, 40t Stal/Żeliwo, 20t Rury ciśnieniowe | 20 / 4 / 1 | Generuje: +350 kWh / cykl | Spalanie węgla kamiennego $\rightarrow$ Para $\rightarrow$ Energia elektryczna |
| **Środowisko** | **Wiktoriański Park z Dębem** *(Public Park)*| **$2 \times 2$** | £ 1,500 | 10t Kamień polny, 5t Kute żelazo (ławki), 30 Sadzonek krzewów | 2 / 0 / 0 | 0 kWh | +18% Zadowolenie mieszkańców, redukcja smogu o 12% |
| **Górnictwo** | **Kopalnia Węgla i Rudy** *(Shaft Mine)* | **$2 \times 2$** | £ 5,000 | 80t Drewno kopalniakowe, 35t Stal konstrukcyjna, 1 Maszyna wyciągowa | 30 / 3 / 0 | 60 kWh | 180t Węgla kamiennego LUB 90t Rudy żelaza |
| **Hodowla** | **Farma Bydła i Owiec** *(Livestock)* | **$2 \times 2$** | £ 2,400 | 40t Drewno, 15t Cegła, 10t Słoma i pasza | 8 / 1 / 0 | 0 kWh | 40t Mięsa, 25t Mleka, 15t Wełny, 20t Skór surowych |
| **Sadownictwo** | **Sad Jabłoniowy i Gruszowy** *(Orchard)* | **$2 \times 2$** | £ 1,800 | 15t Drewno, 5t Żelazo (narzędzia/pompy), 60 Drzewek owocowych | 6 / 1 / 0 | 0 kWh | 50t Świeżych owoców / cykl |
| **Rzemiosło** | **Piekarnia Rzemieślnicza** | **$1 \times 1$** | £ 850 | 18t Cegła szamotowa, 8t Drewno, 2t Żeliwo (piec) | 4 / 1 / 0 | 8 kWh | Chleb powszedni, suchary |
| **Rzemiosło** | **Kuźnia i Ślusarnia** | **$1 \times 1$** | £ 950 | 20t Kamień/Cegła, 12t Żelazo kowalskie, 1 Kowadło i miech | 3 / 1 / 0 | 12 kWh | Gwoździe, okucia, podkowy, narzędzia |

---

## 3. Bilans Terenu i Logistyki
1. **Dostęp do dróg**: Każdy budynek przemysłowy i mieszkalny musi przylegać co najmniej jednym bokiem do brukowanej ulicy (`road`).
2. **Nabrzeże portowe (`quay`)**: Wymagane dla statków rzecznych i barek węglowych transportujących węgiel i rudę do elektrociepłowni i młyna.
3. **Rotacja budynków w grze**: 
   - Klawisz **`R`** lub przycisk w menu budowania obraca budynek o $90^\circ$ (zamienia wymiar $X \times Y$ na $Y \times X$ i podmienia sprite na wariant `_rot90`).
