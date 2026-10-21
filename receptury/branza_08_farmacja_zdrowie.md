# Specyfikacja Techniczna i Receptury Produkcyjne: Branża 8 – Zdrowie, Farmacja i Biotechnologia

**Katalog Bilansu Masowo-Energetycznego, Łańcuchów Dostaw i Parametrów Symulacyjnych**  
*Załącznik do Game Design Document v5.0 i Katalogu Danych Gry – Era 6, 7 i 8 (2005–2080)*

---

## 1. Architektura Procesowa Branży 8

Branża 8 (**Zdrowie, Farmacja i Biotechnologia**) odblokowywana jest w **Epoce 6 (2005–2030)** wraz z globalnym wejściem na rynki Azji (Chiny, Indie) i rozwojem bioinżynierii molekularnej. Obejmuje 20 produktów końcowych (katalogowe pozycje **#141–#160**):
* **Produkty 1–12 (#141–#152)**: Epoka 6 – Farmacja wielkotonażowa, biotechnologia fermentacyjna, diagnostyka domowa, aparatura elektromedyczna i szpitalna.
* **Produkty 13–17 (#153–#157)**: Epoka 7 – Medycyna personalizowana, przeciwciała monoklonalne, inżynieria genetyczna CRISPR, implanty 3D i krew syntetyczna.
* **Produkty 18–20 (#158–#160)**: Epoka 8 – Medycyna regeneracyjna, biodruk narządów naczyniowych 3D, nanorobotyka naczyniowa i reprogramowanie epigenetyczne.

### 1.1. Zasady Triady Produkcyjnej w Branży Biomedycznej
Zgodnie z mechaniką GDD, uruchomienie i cykl pracy każdej linii produkcyjnej wymaga równoległego spełnienia trzech warunków:
1. **LUDZIE [R / M / E]**:
   * `[R]` (**Robotnicy / Personel Techniczny**): Transport magazynowy, załadunek surowców, obsługa linii pakujących, sterylizacja wtórna, monitoring mechaniczny.
   * `[M]` (**Mieszczanie / Mistrzowie / Technolodzy / Inżynierowie**): Prowadzenie bioreaktorów, nadzór nad syntezą organiczną, kontrola procesowa GMP, kalibracja sensorów, obsługa drukarek 3D SLM i obróbka laserowa.
   * `[E]` (**Elita / Eksperci / Naukowcy**): Inżynierowie genetyczni, biolodzy molekularni, radiofarmaceuci, projektanci nanostruktur, lekarze biofizyki, audytorzy czystości komórkowej.
2. **ENERGIA [kWh]**:
   * Energia elektryczna i cieplna w Branży 8 jest determinowana przez:
     * Utrzymanie sterylności pomieszczeń czystych (**Cleanroom ISO 5–8 / HVAC** z filtracją HEPA/ULPA pracujący 24/7).
     * Pobór termiczny autoklawów, liofilizatorów próżniowych (-50°C do -80°C) oraz komór kriogenicznych.
     * Pobór mocy obrabiarek wysokiej precyzji: selektywnego spiekania laserowego (SLM), magnesów nadprzewodzących MRI czy syntezy nanoporowej.
3. **LICENCJA (Technologia i Patenty)**:
   * Wymóg odblokowania odpowiedniego węzła w Drzewku Technologii (za Punkty Nauki) lub posiadanie aktywnej licencji z uczelni medycznej / centrum R&D.

---

## 2. Półprodukty Poziomu 1 (L1) i Poziomu 2/3 (L2/L3) dla Branży 8

Każdy z produktów końcowych powstaje z rygorystycznie zdefiniowanych półproduktów pośrednich, tworząc realistyczny, zamknięty bilans masowy.

### 2.1. Półprodukty Poziomu 1 (Materiały Podstawowe)
| Półprodukt L1 | Kod Surowca Pierwotnego | Proces Przetwórczy | Wsad Surowcowy na 1 j. L1 | Energia L1 [kWh] |
| :--- | :--- | :--- | :--- | :--- |
| **Cukier Rafinowany** | Buraki Cukrowe (Rolnictwo) | Ekstrakcja cukrownicza, krystalizacja | 1.20 j. Buraki Cukrowe | 4 kWh |
| **Mąka / Skrobia Przemysłowa** | Pszenica (Rolnictwo) | Mielenie, separacja frakcji skrobiowej | 1.15 j. Pszenica | 3 kWh |
| **Biomasa z Alg Oczyszczona** | Algi Morskie (Farmy Morskie) | Odwirowanie, suszenie rozpyłowe, liofilizacja | 1.30 j. Algi Morskie | 8 kWh |
| **Sól Oczyszczona (NaCl cz.d.a.)** | Sól Kamienna (Kopalnie Soli) | Ługowanie, rekrystalizacja próżniowa | 1.05 j. Sól Kamienna | 5 kWh |
| **Chemikalia Organiczne / Rozpuszczalniki** | Ropa Naftowa + Sól Kamienna | Kraking parowy, synteza chloropochodnych | 0.8 j. Ropa + 0.3 j. Sól | 15 kWh |
| **Kwas Siarkowy i Chemia Nieorganiczna** | Sól Kamienna + Fosforyty | Proces kontaktowy, synteza kwasowa | 0.6 j. Sól + 0.5 j. Fosforyty | 12 kWh |
| **Krzem Monokrystaliczny (Wafelek)** | Piasek Kwarcowy | Redukcja karbotermiczna, proces Czochralskiego | 2.50 j. Piasek Kwarcowy | 45 kWh |
| **Szkło Laboratoryjne Boro-Krzemowe** | Piasek Kwarcowy | Topienie szklarskie z dodatkiem boranów | 1.20 j. Piasek Kwarcowy | 20 kWh |
| **Złoto Czyste (Au 99.99%)** | Ruda Złota (Kopalnie Głębinowe / Recykling) | Rafinacja elektrolityczna, ługowanie | 2.00 j. Ruda Złota | 35 kWh |
| **Tytan Medyczny (Ti-Grade 5)** | Boksyt / Minerały Tytanonośne | Proces Krolla, przetop łukowy próżniowy | 2.20 j. Ruda/Boksyt | 50 kWh |
| **Miedź Rafinowana Elektrolitycznie** | Ruda Miedzi (Huty) | Elektrorafinacja hutnicza | 1.40 j. Ruda Miedzi | 18 kWh |
| **Aluminium Hutnicze Czyste** | Boksyt (Huty Aluminium) | Elektroliza Halla-Héroulta | 1.80 j. Boksyt | 38 kWh |
| **Stal Nierdzewna Medyczna (316L)** | Ruda Żelaza + Złom | Przetop w piecu łukowym z dodatkiem niklu/chromu | 1.30 j. Ruda Żelaza | 22 kWh |
| **Koncentrat Litu / Sole Litu** | Ruda Litu (Kopalnie Specjalistyczne) | Ługowanie kwasowe, strącanie węglanu litu | 1.60 j. Ruda Litu | 28 kWh |
| **Tlenki Neodymu / Ziem Rzadkich** | Neodym i Ziemie Rzadkie | Ekstrakcja ciecz-ciecz, kalcynacja | 2.00 j. Ruda Neodymu | 40 kWh |
| **Wapno i Hydroksyapatyt Naturalny** | Wapień i Fosforyty | Kalcynacja i synteza hydrotermalna | 0.8 j. Wapień + 0.5 j. Fosforyty | 14 kWh |
| **Kolagen Oczyszczony** | Bydło (Ubojnie / Odzysk Surowcowy) | Ekstrakcja enzymatyczna ze skóry i ścięgien | 1.50 j. Bydło (surowiec) | 10 kWh |
| **Ciekły Hel i Gazy Techniczne** | Gaz Ziemny | Frakcjonowanie kriogeniczne helu | 1.50 j. Gaz Ziemny | 30 kWh |

---

### 2.2. Zaawansowane Półprodukty Poziomu 2 i 3 (Komponenty Farmaceutyczno-Medyczne)

Receptury wytwarzania kluczowych komponentów L2/L3 zasilających linie 20 produktów końcowych:

#### L2-BIO-01: Pożywka Bakteryjna i Fermentacyjna (100 l / 10 j.)
* **Składniki**: 4 j. Cukier Rafinowany + 4 j. Biomasa z Alg + 2 j. Sól Oczyszczona
* **Wymogi**: Ludzie: `[1 R, 1 M, 0 E]`, Energia: `25 kWh`, Licencja: *Bioprocesy Fermentacyjne*
* **Opis**: Podłoże bogate w węgiel, azot, mikroelementy i bufor soli do hodowli drobnoustrojów i komórek.

#### L2-BIO-02: Aktywne Substancje Farmaceutyczne (API) Kwasu Acetylosalicylowego / Paracetamolu (10 kg / 10 j.)
* **Składniki**: 6 j. Chemikalia Organiczne + 2 j. Kwas Siarkowy + 2 j. Sól Oczyszczona
* **Wymogi**: Ludzie: `[0 R, 2 M, 1 E]`, Energia: `40 kWh`, Licencja: *Farmakologia Syntetyczna*
* **Opis**: Wysokoczysta synteza organiczna, krystalizacja, wirowanie i suszenie próżniowe cząsteczki czynnej.

#### L2-BIO-03: Kapsułki Celulozowe i Blistry Aluminiowo-Foliowe (10 000 szt. / 10 j.)
* **Składniki**: 4 j. Mąka/Skrobia + 3 j. Folie Aluminiowe + 3 j. Tworzywa / Polimery
* **Wymogi**: Ludzie: `[2 R, 1 M, 0 E]`, Energia: `20 kWh`, Licencja: *Materiały Barierowe GMP*
* **Opis**: Tłoczenie folii barierowej zgrzewalnej oraz wytwarzanie wegańskich otoczek kapsułek.

#### L2-BIO-04: Matryca Syntetyczna mRNA i Nanocząstki Lipidowe LNP (10 j.)
* **Składniki**: 4 j. Biomasa z Alg + 3 j. Chemikalia Organiczne + 3 j. Cukier Rafinowany
* **Wymogi**: Ludzie: `[0 R, 2 M, 3 E]`, Energia: `80 kWh`, Licencja: *Inżynieria Genetyczna i Terapie mRNA*
* **Opis**: Transkrypcja *in vitro* matrycy mRNA oraz mikroprzepływowa synteza otoczek lipidowych (PEG-lipidy, lipidy jonizowalne).

#### L2-BIO-05: Rekombinowane Białka Lecznicze (Insulina Humana) (10 j.)
* **Składniki**: 5 j. Pożywka Fermentacyjna + 3 j. Cukier + 2 j. Odczynniki Nieorganiczne
* **Wymogi**: Ludzie: `[0 R, 2 M, 2 E]`, Energia: `60 kWh`, Licencja: *Rekombinowane Białka Lecznicze*
* **Opis**: Ekspresja w zmodyfikowanych genetycznie komórkach *Pichia pastoris*, rozbicie komórek, krystalizacja.

#### L2-BIO-06: Hydrożel Alginianowy i Membrany Biozgodne (10 j.)
* **Składniki**: 6 j. Biomasa z Alg (kwas alginowy) + 2 j. Wapno/Sole Wapnia + 2 j. Woda Destylowana/Odczynniki
* **Wymogi**: Ludzie: `[1 R, 2 M, 0 E]`, Energia: `25 kWh`, Licencja: *Polimery Hydrożelowe Biozgodne*
* **Opis**: Usieciowanie jonowe polimerów polisacharydowych tworzących wysoce chłonną, sterylną strukturę hydrożelu.

#### L2-BIO-07: Przeciwciała Monoklonalne (mAb) i Koniugaty Celowane (10 j.)
* **Składniki**: 6 j. Pożywka Fermentacyjna + 2 j. Biomasa z Alg + 2 j. Chemikalia Specjalistyczne
* **Wymogi**: Ludzie: `[0 R, 2 M, 4 E]`, Energia: `110 kWh`, Licencja: *Przeciwciała Monoklonalne i Terapia CAR-T*
* **Opis**: Klonowanie linii komórkowych CHO (Chinese Hamster Ovary), hodowla perfuzyjna, chromatografia powinowactwa (Protein A).

#### L2-BIO-08: Kompleks Enzymatyczny Cas9 i Prowadnice gRNA (10 j.)
* **Składniki**: 4 j. Pożywka Bakteryjna + 3 j. Chemikalia Organiczne + 3 j. Biomasa z Alg
* **Wymogi**: Ludzie: `[0 R, 1 M, 4 E]`, Energia: `90 kWh`, Licencja: *Precyzyjna Edycja Genomu CRISPR-Cas*
* **Opis**: Synteza enzymu endonukleazy Cas9, synteza chemiczna oligonukleotydów prowadzących sgRNA i enkapsulacja wektorowa AAV.

#### L2-BIO-09: Medyczny Proszek Tytanowy do Druku SLM (10 j.)
* **Składniki**: 8 j. Tytan Medyczny (Ti-Grade 5) + 2 j. Gazy Techniczne (Argon)
* **Wymogi**: Ludzie: `[1 R, 3 M, 0 E]`, Energia: `75 kWh`, Licencja: *Atomizacja Proszków Metalicznych*
* **Opis**: Rozpylanie plazmowe ciekłego stopu tytanu w osłonie gazu obojętnego na idealnie kuliste cząstki 15–45 µm.

#### L2-BIO-10: Syntetyczna Hemoglobina Polimeryzowana (HBOC) (10 j.)
* **Składniki**: 5 j. Pożywka Fermentacyjna + 3 j. Biomasa Oczyszczona + 2 j. Sól Oczyszczona
* **Wymogi**: Ludzie: `[0 R, 2 M, 3 E]`, Energia: `65 kWh`, Licencja: *Substytuty Krwi Przechowywane w Temperaturze Pokojowej*
* **Opis**: Bioreaktorowa ekspresja tetramerów hemoglobiny, sieciowanie glutaraldehydem zapobiegające nefrotoksyczności.

#### L2-BIO-11: Nanomotory Molekularne i Nanotuby Węglowe (10 j.)
* **Składniki**: 4 j. Złoto Czyste + 3 j. Krzem Monokrystaliczny + 3 j. Chemikalia Organiczne
* **Wymogi**: Ludzie: `[0 R, 2 M, 5 E]`, Energia: `130 kWh`, Licencja: *Nanorobotyka Dożylna*
* **Opis**: Precyzyjny montaż molekularny nano-wirników napędzanych gradientem protonowym oraz biokompatybilnych powłok diamentopodobnych.

---

## 3. Kompletne Receptury Produkcyjne: 20 Produktów Końcowych Branży 8

> **Uwaga bilansowa**:  
> Każda receptura podaje wsad w **jednostkach masowo-materiałowych [j.]** dla zbalansowanej partii referencyjnej towaru (np. 100 sztuk urządzeń, 1 000 opakowań leków, 1 000 ampułek), wymagane etaty pracowników `[R/M/E]`, jednostkowe zużycie prądu `[kWh]`, technologię odblokowującą oraz bilans odpadów.

---

### Produkt 1 (#141): Leki Przeciwbólowe i Przeciwgorączkowe
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Farmacja Syntetyczna
* **Jednostka partii**: 1 000 opakowań handlowych (po 20 tabletek, 500 mg API)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Ropa Naftowa (0.8 j.) + Sól Kamienna (0.5 j.) + Pszenica/Kukurydza (0.5 j.) + Boksyt (0.3 j.)
  * *Poziom 1 (L1)*: Chemikalia Organiczne (1.0 j.) + Sól Oczyszczona (0.3 j.) + Skrobia Wypełniająca (0.5 j.) + Folia Aluminiowa (0.3 j.)
  * *Poziom 2 (L2)*: Kwas Acetylosalicylowy / Paracetamol API [L2-BIO-02] (1.0 j.) + Wypełniacz Skrobiowy Farmaceutyczny (0.5 j.) + Blistry i Kartoniki [L2-BIO-03] (0.5 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[3 R, 4 M, 1 E]` (3 Robotników, 4 Mistrzów/Technologów, 1 Ekspert Farmakopei)
  * **Energia**: `45 kWh` / partię (granulacja na mokro, suszenie fluidalne, tabletkarki rotacyjne, zgrzewanie blistrów)
  * **Licencja**: *Farmakologia Syntetyczna (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `2.0 j.` $\to$ Produkt: `1.9 j.` gotowych leków + `0.1 j.` pyłów tabletkowych (zawracanych do granulacji)
* **Wpływ Systemowy**: Redukcja absencji chorobowej robotników w miastach o 15%, podstawa zapotrzebowania klasy R i M.

---

### Produkt 2 (#142): Antybiotyki Nowej Generacji i Leki Przeciwwirusowe
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Biofarmacja Sterylna
* **Jednostka partii**: 1 000 fiolek do iniekcji / opakowań liofilizatu
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Buraki Cukrowe (1.2 j.) + Algi Morskie (1.0 j.) + Sól Kamienna (0.4 j.) + Piasek Kwarcowy (0.4 j.)
  * *Poziom 1 (L1)*: Cukier Rafinowany (1.0 j.) + Biomasa z Alg (0.8 j.) + Szkło Laboratoryjne (0.4 j.)
  * *Poziom 2 (L2)*: Pożywka Bakteryjna [L2-BIO-01] (1.2 j.) + Wyekstrahowana Cząsteczka Czynna Antybiotyku (0.6 j.) + Szklane Fiolki Boro-Krzemowe Sterylne (0.4 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[2 R, 5 M, 3 E]` (Operatorzy bioreaktorów sterylnych, mikrobiolodzy, kontrola jałowości)
  * **Energia**: `85 kWh` / partię (stale napowietrzany bioreaktor 72h, wirowanie ciągłe, liofilizacja próżniowa -55°C)
  * **Licencja**: *Bioprocesy Fermentacyjne i Krystalizacja Leków (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `2.2 j.` $\to$ Produkt: `1.8 j.` sterylnych dawek + `0.4 j.` zużytej biomasy pofermentacyjnej (surowiec do kompostowni/biogazowni miejskiej)
* **Wpływ Systemowy**: Zwalcza miejskie epidemie bakteryjne, redukuje śmiertelność szpitalną o 25%.

---

### Produkt 3 (#143): Witaminy i Suplementy Diety (Roślinne/Algi)
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Nutraceutyka Eko
* **Jednostka partii**: 1 000 słoiczków (kapsułki miękkie z olejem z mikroalg i witaminami)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Algi Morskie (1.8 j.) + Słoneczniki (0.8 j.) + Drewno Okrągłe/Celuloza (0.4 j.) + Piasek (0.6 j.)
  * *Poziom 1 (L1)*: Biomasa z Alg (1.4 j.) + Olej Słonecznikowy (0.6 j.) + Szkło Ciemne (0.6 j.)
  * *Poziom 2 (L2)*: Ekstrakty Witaminowe A, D3, K2, Astaksantyna i Omega-3 [z L1] (1.0 j.) + Kapsułki Roślinne Celulozowe (0.4 j.) + Słoiczki z Bursztynowego Szkła Eko (0.6 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[3 R, 3 M, 1 E]`
  * **Energia**: `35 kWh` / partię (ekstrakcja CO2 w stanie nadkrytycznym pod ciśnieniem 300 bar, kapsułkowanie)
  * **Licencja**: *Ekstrakcja Nadkrytyczna CO2 Nutraceutyków (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `2.0 j.` $\to$ Produkt: `1.95 j.` suplementów + `0.05 j.` wytłoków algowych (odzysk w biokompostowniach)
* **Wpływ Systemowy**: Zwiększa zdrowie i satysfakcję Klasy Średniej i Elity o 10%, wysoka ocena Eko-Etyki (95/100).

---

### Produkt 4 (#144): Szczepionki (Tradycyjne i mRNA)
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Immunoprofilaktyka Zaawansowana
* **Jednostka partii**: 1 000 ampułko-strzykawek (dawki wieloporcjowe / monodawki)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Algi Morskie (1.0 j.) + Buraki Cukrowe (0.8 j.) + Ropa Naftowa (0.6 j.) + Piasek Kwarcowy (0.4 j.)
  * *Poziom 1 (L1)*: Biomasa Przetworzona (0.8 j.) + Cukier (0.6 j.) + Odczynniki Organiczne (0.5 j.) + Szkło Boro-Krzemowe (0.4 j.)
  * *Poziom 2 (L2)*: Syntetyczna Matryca mRNA w Nanocząstkach Lipidowych LNP [L2-BIO-04] (1.0 j.) + Bufor Solny Sterylny (0.5 j.) + Fiolki Nanofiltracyjne z Elastomerowym Korkiem (0.4 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[1 R, 4 M, 5 E]` (Wysoko wyspecjalizowany personel cleanroom, wirusolodzy, genetycy)
  * **Energia**: `95 kWh` / partię (komory aseptyczne ISO 5, ultraszybkie mieszanie mikroprzepływowe, chłodzenie kaskadowe -80°C)
  * **Licencja**: *Inżynieria Genetyczna i Terapie mRNA (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `1.9 j.` $\to$ Produkt: `1.8 j.` sterylnych dawek + `0.1 j.` popłuczyn filtracyjnych (dekontaminacja termiczna)
* **Wpływ Systemowy**: Całkowita odporność populacji metropolii na pandemie z Mapy Świata, zabezpiecza 100% ciągłości pracy fabryk.

---

### Produkt 5 (#145): Leki Kardiologiczne i Insulina
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Terapia Metaboliczna i Przewlekła
* **Jednostka partii**: 1 000 wstrzykiwaczy automatycznych (Pen z wkładem insuliny 300 IU)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Buraki Cukrowe (1.2 j.) + Algi (0.8 j.) + Ropa Naftowa (tworzywo Pena) (0.6 j.) + Ruda Żelaza (sprężynki) (0.2 j.)
  * *Poziom 1 (L1)*: Cukier (1.0 j.) + Biomasa (0.6 j.) + Plastik Medyczny (0.5 j.) + Stal Nierdzewna (0.2 j.)
  * *Poziom 2 (L2)*: Rekombinowana Insulina Ludzka Liofilizowana [L2-BIO-05] (1.0 j.) + Mechanizm Aplikatora Piórowego Pen z Mikroigłą (0.7 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[2 R, 4 M, 4 E]` (Biotechnolodzy rekombinacji białek, kalibratorzy dozowników mechanicznych)
  * **Energia**: `70 kWh` / partię (ciągła chromatografia kolumnowa HPLC, montaż automatyczny aplikatorów)
  * **Licencja**: *Rekombinowane Białka Lecznicze (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `1.7 j.` $\to$ Produkt: `1.65 j.` wyrobu gotowego + `0.05 j.` odpadu technicznego tworzywa (do regranulacji)
* **Wpływ Systemowy**: Wydłuża długość życia seniorów i mieszkańców Klasy Średniej o 12 lat, stały, nieelastyczny popyt miejski.

---

### Produkt 6 (#146): Środki Opatrunkowe i Hydrożele Medyczne
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Materiały Biomedyczne
* **Jednostka partii**: 1 000 zestawów sterylnych opatrunków hydrożelowych z nanosrebrem
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Bawełna (1.2 j.) + Algi Morskie (1.0 j.) + Ruda Srebra/Złota (0.1 j.) + Drewno Okrągłe (papier barierowy) (0.4 j.)
  * *Poziom 1 (L1)*: Przędza Bawełniana (1.0 j.) + Biomasa z Alg (0.8 j.) + Azotan Srebra Oczyszczony (0.1 j.) + Celuloza (0.4 j.)
  * *Poziom 2 (L2)*: Gaza Bawełniana Bielona Bezchlorowo (0.8 j.) + Płaty Hydrożelu Alginianowego [L2-BIO-06] (0.8 j.) + Siatka Ze Srebrem Nanokoloidalnym (0.1 j.) + Papier Barierowy Zgrzewany (0.3 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[4 R, 3 M, 1 E]`
  * **Energia**: `30 kWh` / partię (laminowanie warstwowe, sterylizacja promieniami gamma $\gamma$ lub wiązką elektronów E-beam)
  * **Licencja**: *Opatrunki Aktywne i Alginianowe (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `2.0 j.` $\to$ Produkt: `1.9 j.` gotowych pakietów + `0.1 j.` ścinek bawełnianych (recykling tekstylny)
* **Wpływ Systemowy**: Zaopatrzenie szpitali i ratownictwa medycznego, redukcja powikłań pourazowych w zakładach przemysłowych.

---

### Produkt 7 (#147): Soczewki Kontaktowe i Implanty Okulistyczne
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Inżynieria Optyki Medycznej
* **Jednostka partii**: 1 000 blistrów soczewek silikonowo-hydrożelowych / 100 soczewek wewnątrzgałkowych IOL
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Piasek Kwarcowy (0.8 j.) + Ropa Naftowa (0.8 j.) + Sól Kamienna (0.4 j.) + Boksyt (0.2 j.)
  * *Poziom 1 (L1)*: Polimery Krzemoorganiczne (Silikony) (0.8 j.) + Monomery Hydrożelowe (0.6 j.) + Roztwór NaCl 0.9% Sterylny (0.4 j.) + Folia Aluminiowa do Blistrów (0.2 j.)
  * *Poziom 2 (L2)*: Kopolimer Silikonowo-Hydrożelowy o Wysokim Dk/t (1.0 j.) + Płyn Buforowany z Kwasem Hialuronowym (0.4 j.) + Blisterki z Formowanego Polipropylenu (0.4 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[2 R, 4 M, 2 E]` (Precyzyjne odlewanie mikrometryczne, nanometrologia optyczna)
  * **Energia**: `40 kWh` / partię (odlewanie w formach z polimeryzacją UV, fotoutwardzanie, sterylizacja parowa w autoklawie 121°C)
  * **Licencja**: *Polimery Hydrożelowe Biozgodne (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `1.8 j.` $\to$ Produkt: `1.75 j.` wyrobu gotowego + `0.05 j.` odpadu krawędziowego
* **Wpływ Systemowy**: Podnosi jakość życia mieszkańców miast, eliminuje wady wzroku u pracowników biurowych i inżynierów.

---

### Produkt 8 (#148): Aparaty Słuchowe Cyfrowe
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Mikroelektronika Medyczna
* **Jednostka partii**: 100 sztuk miniaturowych zausznych/wewnątrzusznych aparatów słuchowych DSP
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Piasek Kwarcowy (0.6 j.) + Ruda Miedzi (0.4 j.) + Ruda Litu/Cynku (0.3 j.) + Ruda Złota (0.1 j.) + Ropa/Żywica (0.3 j.)
  * *Poziom 1 (L1)*: Krzem Monokrystaliczny (0.5 j.) + Miedź Rafinowana (0.3 j.) + Sole Litu (0.2 j.) + Złoto (0.1 j.) + Żywica Akrylowa Medyczna (0.3 j.)
  * *Poziom 2 (L2)*: Niskomocowy Procesor Sygnałowy DSP Audio [z Grupy I Elektroniki] (0.4 j.) + Mikrofon MEMS i Mikro-Przetwornik Armaturowy (0.3 j.) + Akumulator Li-Ion Medyczny (0.2 j.) + Obudowa Ucha Druk 3D UV (0.3 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[1 R, 5 M, 3 E]` (Audiolodzy techniczni, mikromonterzy elektroniki SMD)
  * **Energia**: `50 kWh` / partię (montaż powierzchniowy chipów flip-chip, złocenie ścieżek, precyzyjny druk 3D SLA obudów)
  * **Licencja**: *Cyfrowa Obróbka Sygnałów Akustycznych (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `1.2 j.` $\to$ Produkt: `1.15 j.` urządzeń + `0.05 j.` odpadów elektronicznych (100% Urban Mining)
* **Wpływ Systemowy**: Wzrost sprawności sensorycznej seniorów, naprawialność u Serwisantów miejskich (cyrkularność 85%).

---

### Produkt 9 (#149): Domowe Testery Diagnostyczne i Glukometry
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Biosensory Domowe
* **Jednostka partii**: 100 glukometrów cyfrowych + 5 000 pasków testowych elektrochemicznych
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Ruda Złota (0.2 j.) + Piasek Kwarcowy (0.6 j.) + Ropa Naftowa (0.8 j.) + Algi/Enzymy (0.3 j.)
  * *Poziom 1 (L1)*: Złoto Czyste w Paście Przewodzącej (0.2 j.) + Krzem Monokrystaliczny (0.4 j.) + Tworzywa Obudów (0.6 j.) + Oczyszczone Enzymy Oksydazy Glukozowej (0.3 j.)
  * *Poziom 2 (L2)*: Paski Biosensoryczne ze Ścieżką Nanometaliczną i Mediatorem (0.8 j.) + Płytka Czytnika z Wyświetlaczem LCD i Mikrokontrolerem (0.6 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[3 R, 4 M, 1 E]`
  * **Energia**: `40 kWh` / partię (sitodruk mikrościeżek enzymatycznych w reżimie wilgotności poniżej 20%, montaż automatyczny)
  * **Licencja**: *Biosensory Elektrochemiczne (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `1.5 j.` $\to$ Produkt: `1.45 j.` wyrobów gotowych + `0.05 j.` odpadu folii nośnej PET
* **Wpływ Systemowy**: Odciąża przychodnie i szpitale miejskie o 20%, obniża koszty miejskiej służby zdrowia w Ratuszu.

---

### Produkt 10 (#150): Wózki Inwalidzkie Elektryczne
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Mobilność i Rehabilitacja
* **Jednostka partii**: 10 w pełni zautomatyzowanych elektrycznych wózków rehabilitacyjnych
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Boksyt (15.0 j.) + Ruda Żelaza (5.0 j.) + Ruda Litu (3.0 j.) + Ruda Miedzi (3.0 j.) + Kauczuk Naturalny (2.0 j.)
  * *Poziom 1 (L1)*: Profile Aluminiowe (12.0 j.) + Stal Stopowa (4.0 j.) + Koncentrat Litu (2.0 j.) + Miedź (2.5 j.) + Guma Wulkanizowana (2.0 j.)
  * *Poziom 2 (L2)*: Lekka Rama Składana ze Stopów Aluminium (10.0 j.) + Dwa Bezszczotkowe Silniki w Piastach Kół BLDC [z Grupy H Maszynowej] (5.0 j.) + Moduł Baterii Li-Ion 24V/40Ah [z Grupy I] (4.0 j.) + Kontroler Joystick z Żyroskopem i Tapicerka (3.0 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[5 R, 4 M, 1 E]` (Spawacze TIG aluminium, mechatronicy, montażyści)
  * **Energia**: `180 kWh` / partię (spawanie zrobotyzowane w osłonie argonu, lakierowanie proszkowe, testy dynamiczne na hamowni)
  * **Licencja**: *Robotyka Rehabilitacyjna i Mobilność Osób Niepełnosprawnych (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `22.5 j.` $\to$ Produkt: `22.0 j.` (10 wózków po ok. 45–50 kg) + `0.5 j.` wiórów i skrawków aluminium (100% recykling huty)
* **Wpływ Systemowy**: Włączenie osób z ograniczeniami w rynek pracy miasta, wzrost wskaźnika Kapitału Społecznego o 8%.

---

### Produkt 11 (#151): Sprzęt Szpitalny (Respiratory, Kardiomonitory)
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Szpitalna Aparatura Podtrzymywania Życia
* **Jednostka partii**: 10 zaawansowanych kardiomonitorów modułowych i respiratorów turbinowych
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Ruda Żelaza (6.0 j.) + Boksyt (4.0 j.) + Piasek Kwarcowy (4.0 j.) + Ruda Miedzi (3.0 j.) + Ropa (2.0 j.)
  * *Poziom 1 (L1)*: Stal Kwasoodporna 316L (5.0 j.) + Aluminium (3.0 j.) + Krzem i Szkło Ekranowe (3.5 j.) + Miedź (2.5 j.) + Polimery Medyczne (1.8 j.)
  * *Poziom 2 (L2)*: Beztarciowa Turbina Tlenowa i Pneumatyka Proporcjonalna (4.0 j.) + Medyczny Ekran Dotykowy z Matrycą Przemysłową (3.0 j.) + Płyta Główna z Algorytmami EKG/SpO2/Alarmów (3.0 j.) + Obudowa Ekranowana EMC z Filtrami HEPA (4.0 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[2 R, 6 M, 4 E]` (Inżynierowie biomedyczni, kalibratorzy czujników przepływu gazów)
  * **Energia**: `220 kWh` / partię (komory kalibracyjne ciśnień, testy ciągłe 48h burn-in, certyfikacja bezpieczeństwa elektrycznego)
  * **Licencja**: *Aparatura Podtrzymywania Funkcji Życiowych (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `14.5 j.` $\to$ Produkt: `14.0 j.` certyfikowanego sprzętu + `0.5 j.` odpadu technologicznego (recykling metalurgiczny)
* **Wpływ Systemowy**: Podstawowy wymóg rozbudowy Szpitali Miejskich na III i IV poziom referencyjny, drastyczny spadek zgonów w nagłych wypadkach.

---

### Produkt 12 (#152): Skanery Obrazowania Medycznego (MRI / Tomografy)
* **Epoka**: Epoka 6 (2005–2030) | **Kategoria**: Ciężka Diagnostyka Obrazowa High-Tech
* **Jednostka partii**: 1 kompletny system Rezonansu Magnetycznego 3.0 Tesla z tunelem i kriogeniką
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Ruda Żelaza (40.0 j.) + Ruda Miedzi (25.0 j.) + Neodym i Ziemie Rzadkie / Niob (15.0 j.) + Gaz Ziemny/Hel (15.0 j.) + Boksyt (10.0 j.)
  * *Poziom 1 (L1)*: Stal Konstrukcyjna Ekranująca (35.0 j.) + Miedź Beztlenowa OFHC (20.0 j.) + Drut Nadprzewodzący Niob-Tytan (12.0 j.) + Ciekły Hel 4K (12.0 j.) + Aluminium (8.0 j.)
  * *Poziom 2 (L2)*: Magnes Nadprzewodzący w Kriostacie Próżniowym (40.0 j.) + Trójosiowe Cewki Gradientowe Dużej Mocy (20.0 j.) + Cyfrowy Układ Nadawczo-Odbiorczy RF i Detektory Macierzowe (15.0 j.) + Stacja Rekonstrukcji Obrazu GPU i Stół Pacjenta (10.0 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[4 R, 10 M, 8 E]` (Fizycy medyczni, specjaliści kriogeniki, inżynierowie nadprzewodnictwa)
  * **Energia**: `1 400 kWh` / partię (nawijanie cewek w osłonie próżniowej, chłodzenie kriostatu do 4.2 Kelwina, ładowanie pola magnetycznego do 3 Tesli)
  * **Licencja**: *Magnetyczny Rezonans Jądrowy i Tomografia Komputerowa (Era 6)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `87.0 j.` $\to$ Produkt: `85.0 j.` gotowego systemu MRI (masa ~6–7 ton) + `2.0 j.` gazów technologicznych (odzysk helu w obiegu zamkniętym)
* **Wpływ Systemowy**: Wczesne wykrywanie 90% chorób nowotworowych i neurologicznych w metropolii, podnosi prestiż akademicki miasta.

---

### Produkt 13 (#153): Terapie Celowane Onkologiczne i Immunoterapia
* **Epoka**: Epoka 7 (2030–2055) | **Kategoria**: Biofarmacja Celowana Nowotworom
* **Jednostka partii**: 100 cykli terapeutycznych (koniugaty przeciwciało-lek ADC i limfocyty CAR-T)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Buraki Cukrowe (3.0 j.) + Algi Morskie (2.5 j.) + Sól Kamienna (1.0 j.) + Ropa Naftowa (1.0 j.)
  * *Poziom 1 (L1)*: Cukier Rafinowany (2.5 j.) + Biomasa z Alg (2.0 j.) + Chemikalia Precyzyjne (0.8 j.) + Fiolki Boro-Krzemowe Sterylne (0.5 j.)
  * *Poziom 2 (L2)*: Rekombinowane Przeciwciała Monoklonalne (mAb) [L2-BIO-07] (2.0 j.) + Cytotoksyczne Inhibitory Molekularne (Payload) (0.6 j.) + Koniugatory Chemiczne z Linkerem Wrażliwym na pH Guzka (0.4 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[1 R, 5 M, 8 E]` (Biolodzy komórkowi, bioinformatycy, immunolodzy kliniczni)
  * **Energia**: `310 kWh` / partię (bioreaktory perfuzyjne jedno- i wielorazowe WAVE, wielostopniowa chromatografia powinowactwa, sterylizacja membranowa 0.1 µm)
  * **Licencja**: *Przeciwciała Monoklonalne i Terapia CAR-T (Era 7)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `3.2 j.` $\to$ Produkt: `3.0 j.` leku sterylnego + `0.2 j.` biodegradowalnego odpadu filtracyjnego
* **Wpływ Systemowy**: Zmniejsza śmiertelność onkologiczną seniorów o 80%, generuje olbrzymie przychody eksportowe na Mapie Świata.

---

### Produkt 14 (#154): Terapie Genowe CRISPR (Leczenie Chorób Rzadkich)
* **Epoka**: Epoka 7 (2030–2055) | **Kategoria**: Terapia Genowa i Edycja Nukleotydowa
* **Jednostka partii**: 50 zindywidualizowanych dawek infuzyjnych wektorów edycji in vivo
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Algi Morskie (2.0 j.) + Buraki Cukrowe (1.5 j.) + Sól Kamienna (0.5 j.) + Piasek/Krzem (0.5 j.)
  * *Poziom 1 (L1)*: Biomasa Oczyszczona (1.5 j.) + Cukier (1.2 j.) + Odczynniki Biochemiczne (0.8 j.) + Kartridże Aseptyczne (0.4 j.)
  * *Poziom 2 (L2)*: Kompleks Nukleazy Cas9 z Przewodnikiem gRNA [L2-BIO-08] (1.2 j.) + Apatogenne Wektory AAV (Adeno-Associated Virus) (1.0 j.) + Roztwór Krioprotekcyjny (0.5 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[0 R, 4 M, 9 E]` (Najwyższy wymóg ekspercki: inżynierowie edycji bazowej, genetycy syntetyczni)
  * **Energia**: `260 kWh` / partię (automatyczne syntezatory oligonukleotydów, hodowla wektorów wirusowych w bioreaktorach naczyniowych, kontrola sekwencjonowaniem głębokim NGS)
  * **Licencja**: *Precyzyjna Edycja Genomu CRISPR-Cas (Era 7)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `2.7 j.` $\to$ Produkt: `2.6 j.` preparatów terapeutycznych + `0.1 j.` zużytych kolumn chromatograficznych
* **Wpływ Systemowy**: Trwałe wyeliminowanie monogenowych wad wrodzonych w populacji, podnosi współczynnik Zdrowia Publicznego do poziomu 98%.

---

### Produkt 15 (#155): Bio-Implanty Stomatologiczne i Kostne 3D
* **Epoka**: Epoka 7 (2030–2055) | **Kategoria**: Bionika Kostna i Druk Organiczny
* **Jednostka partii**: 100 zindywidualizowanych implantów kostno-stawowych ze strukturą beleczkową
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Minerały Tytanu / Boksyt (8.0 j.) + Wapień i Fosforyty (4.0 j.) + Piasek Kwarcowy (1.0 j.)
  * *Poziom 1 (L1)*: Tytan Medyczny Ti-Grade 5 (6.0 j.) + Hydroksyapatyt Wapniowy Biomimetyczny (3.0 j.) + Krzem Oczyszczony (0.8 j.)
  * *Poziom 2 (L2)*: Sferyczny Proszek Tytanowy SLM [L2-BIO-09] (5.5 j.) + Nanopowłoka Hydroksyapatytowa Osteoindukcyjna (2.5 j.) + Opakowanie Sterylne Gazoszczelne (0.8 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[2 R, 6 M, 3 E]` (Technolodzy spiekania laserowego SLM, inżynierowie biomechaniki)
  * **Energia**: `280 kWh` / partię (drukarki 3D SLM z laserem światłowodowym 500W, komora z osłoną argonu, piec próżniowy do odprężania termicznego w 850°C)
  * **Licencja**: *Biodruk Struktur Kostnych i Osteointegracja (Era 7)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `8.8 j.` $\to$ Produkt: `8.0 j.` gotowych implantów + `0.8 j.` niespieczonego proszku tytanowego (przesiewany i regenerowany w 95%)
* **Wpływ Systemowy**: Pełna regeneracja ofiar wypadków drogowych i przemysłowych, 100% biozgodność bez odrzutów.

---

### Produkt 16 (#156): Sztuczna Krew i Płyny Krwiozastępcze
* **Epoka**: Epoka 7 (2030–2055) | **Kategoria**: Hematologia Syntetyczna
* **Jednostka partii**: 500 worków infuzyjnych (po 500 ml uniwersalnego nośnika tlenu i elektrolitów)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Algi Morskie (3.0 j.) + Buraki Cukrowe (2.0 j.) + Sól Kamienna (1.5 j.) + Ropa Naftowa (worki medyczne) (1.0 j.)
  * *Poziom 1 (L1)*: Biomasa Oczyszczona (2.4 j.) + Cukier (1.6 j.) + Sól Oczyszczona / Chlorek Potasu (1.2 j.) + Granulat Poliolefinowy EVA (0.8 j.)
  * *Poziom 2 (L2)*: Polimeryzowana Hemoglobina Syntetyczna HBOC [L2-BIO-10] (2.2 j.) + Zrównoważony Płyn Plazmatyczny Elektrolitowy (1.8 j.) + Worki Infuzyjne z Zestawem Drenów (0.8 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[3 R, 5 M, 3 E]`
  * **Energia**: `140 kWh` / partię (ciągłe odgazowywanie cieczy, polimeryzacja chemiczna, napełnianie aseptyczne w nadciśnieniu)
  * **Licencja**: *Substytuty Krwi Przechowywane w Temperaturze Pokojowej (Era 7)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `4.8 j.` $\to$ Produkt: `4.6 j.` płynów krwiozastępczych + `0.2 j.` odpadów płynnych z płukania aparatury
* **Wpływ Systemowy**: Przechowywanie w temp. pokojowej przez 2 lata (bez wymogu banków krwi i lodówek), likwiduje deficyt krwi w katastrofach.

---

### Produkt 17 (#157): Zestawy Mikrobiomu i Medycyny Prewencyjnej
* **Epoka**: Epoka 7 (2030–2055) | **Kategoria**: Medycyna Spersonalizowana i Bioinformatyka
* **Jednostka partii**: 1 000 zestawów diagnostyczno-terapeutycznych (sekwencer nanoporowy + spersonalizowane szczepy symbiotyczne)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Piasek Kwarcowy (1.5 j.) + Algi Morskie (1.5 j.) + Ruda Złota (0.2 j.) + Drewno Okrągłe (karton) (0.6 j.)
  * *Poziom 1 (L1)*: Krzem Monokrystaliczny (1.0 j.) + Biomasa z Alg (1.2 j.) + Złoto Przewodzące (0.2 j.) + Karton z Recyklingu (0.6 j.)
  * *Poziom 2 (L2)*: Chip Nanoporowy NGS z Membraną Białkową (1.0 j.) + Liofilizowany Koktajl Bakterii Autologicznych (1.0 j.) + Aplikator i Pudełko Smart (0.6 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[2 R, 6 M, 4 E]` (Bioinformatycy, specjaliści hodowli beztlenowej mikrobioty)
  * **Energia**: `120 kWh` / partię (litografia nanoporowa, liofilizacja probiotyków w atmosferze beztlenowej azotu)
  * **Licencja**: *Analiza Mikrobiomu Jelitowego i Sekwencjonowanie Jednocząsteczkowe (Era 7)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `2.6 j.` $\to$ Produkt: `2.5 j.` zestawów + `0.1 j.` skrawków materiałów
* **Wpływ Systemowy**: Zapobiega 70% chorób autoimmunologicznych i metabolicznych, redukuje zapotrzebowanie miasta na leki przeciwzapalne.

---

### Produkt 18 (#158): Organy Drukowane Biologicznie 3D (Biodruk z Biomatryc)
* **Epoka**: Epoka 8 (2055–2080) | **Kategoria**: Inżynieria Tkankowa i Regeneracyjna
* **Jednostka partii**: 5 w pełni unaczynionych, funkcjonalnych organów miąższowych (serce, nerka, płat wątroby)
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Algi Morskie (4.0 j.) + Bydło/Kolagen (4.0 j.) + Buraki Cukrowe (2.0 j.) + Piasek/Szkło (1.0 j.)
  * *Poziom 1 (L1)*: Alginiany Wysokiej Czystości (3.0 j.) + Kolagen Medyczny Typu I i IV (3.0 j.) + Cukry i Czynniki Wzrostu (1.5 j.) + Komory Bioreaktora (1.0 j.)
  * *Poziom 2 (L2)*: Autologiczny Biotusz Komórkowy Pacjenta (iPSC) (3.5 j.) + Biomatryca Tkankowa z Mikronaczyniami Włosowatymi (2.5 j.) + Płyn Perfuzji Naczyniowej z Tlenem (1.5 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[1 R, 5 M, 10 E]` (Elitarny zespół inżynierii tkankowej, kardiochirurdzy biodruku, embriolodzy molekularni)
  * **Energia**: `480 kWh` / partię (komory biodruku 3D z polem akustycznym i laserowym utwardzaniem wielofotonowym, inkubacja w bioreaktorach pulsacyjnych 14 dni)
  * **Licencja**: *Biodruk Narządów Miaższowych 3D (Era 8)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `7.5 j.` $\to$ Produkt: `7.0 j.` gotowych narządów w płynie perfuzyjnym + `0.5 j.` popłuczyn biozgodnych
* **Wpływ Systemowy**: Całkowita likwidacja kolejek transplantacyjnych, zerowe ryzyko odrzucenia (komórki własne pacjenta), przywrócenie pełnej witalności seniorów.

---

### Produkt 19 (#159): Nanoboty Medyczne Naczyniowe
* **Epoka**: Epoka 8 (2055–2080) | **Kategoria**: Nanotechnologia Molekularna i Nanomedycyna
* **Jednostka partii**: 1 000 dawek zawiesiny nanobotów do oczyszczania naczyń i mikrochirurgii
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Ruda Złota (1.5 j.) + Piasek Kwarcowy (1.2 j.) + Węgiel Kamienny / Sadza Grafitowa (1.0 j.) + Sól (0.5 j.)
  * *Poziom 1 (L1)*: Złoto Czyste Koloidalne (1.2 j.) + Krzem Monokrystaliczny (1.0 j.) + Grafen i Nanorurki Węglowe (0.8 j.) + Roztwór Solny (0.5 j.)
  * *Poziom 2 (L2)*: Molekularne Nanomotory Napędzane Glukozą [L2-BIO-11] (1.2 j.) + Sensory Złote Przeciwmiażdżycowe (0.8 j.) + Biokompatybilna Otoczka Węglowa Diamentopodobna DLC (0.8 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[0 R, 4 M, 12 E]` (Fizycy nanotechnologii, inżynierowie robotyki kwantowej)
  * **Energia**: `520 kWh` / partię (manipulatory sond skaningowych STM, epitaksja z wiązek molekularnych MBE, testy hydrodynamiczne w mikrotunelach)
  * **Licencja**: *Nanorobotyka Dożylna i Usuwanie Blaszek Miażdżycowych (Era 8)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `2.8 j.` $\to$ Produkt: `2.7 j.` gotowej zawiesiny nano-iniekcyjnej + `0.1 j.` odfiltrowanych struktur z defektami
* **Wpływ Systemowy**: Eliminuje 99% zawałów serca i udarów mózgu, oczyszcza tętnice w 48 godzin od iniekcji, wydłuża średnią długość życia w mieście powyżej 100 lat.

---

### Produkt 20 (#160): Terapie Regeneracji Komórkowej i Długowieczności
* **Epoka**: Epoka 8 (2055–2080) | **Kategoria**: Epigenetyka i Senolityka Przełomowa
* **Jednostka partii**: 100 kompletnych kuracji odwracających wiek biologiczny organizmu
* **Drzewo Łańcucha Wsadowego**:
  * *Poziom 0 (Surowce)*: Algi Morskie (3.0 j.) + Buraki Cukrowe (2.0 j.) + Odczynniki Chemiczne Specjalne (1.5 j.) + Piasek (0.5 j.)
  * *Poziom 1 (L1)*: Biomasa Przetworzona z Alg (2.5 j.) + Cukry Oczyszczone (1.8 j.) + Odczynniki Biochemiczne (1.2 j.) + Fiolki Krystaliczne (0.5 j.)
  * *Poziom 2 (L2)*: Zespół Czynników Transkrypcyjnych Yamanaka (OSKM) (1.8 j.) + Molekuły Senolityczne Eliminujące Komórki Starzejące się (1.5 j.) + Nanomembrany Liposomalne Wektoryzowane (1.2 j.)
* **Wymogi Triady Produkcyjnej**:
  * **Ludzie**: `[0 R, 3 M, 12 E]` (Genetycy epigenetyczni, gerontolodzy molekularni)
  * **Energia**: `380 kWh` / partię (sekwencjonowanie epigenetyczne metylacji DNA, bioreaktory fototroficzne, inkubatory komórkowe z regulacją tlenową)
  * **Licencja**: *Reprogramowanie Epigenetyczne i Senolityka (Era 8)*
* **Bilans Masowy i Odpady**:
  * Wsad łączny: `4.5 j.` $\to$ Produkt: `4.3 j.` koktajlu regeneracyjnego + `0.2 j.` resztek reakcyjnych (100% neutralizacja enzymatyczna)
* **Wpływ Systemowy**: Odwrócenie wieku biologicznego populacji o 20–30 lat, przesunięcie emerytalne, nieograniczona produktywność Elity i Inżynierów.

---

## 4. Zbiorcza Matryca Bilansu Masowo-Energetycznego (Silnik Gry)

Poniższa tabela stanowi bazę parametrów dla algorytmu symulacji ekonomicznej:

| # | Nazwa Produktu | Epoka | Wsad Kluczowy (L2/L3) | Ludzie [R/M/E] | Energia [kWh] | Licencja / Węzeł Technologiczny | Odpady i Eko-Etyka |
| :-: | :--- | :-: | :--- | :-: | :-: | :--- | :--- |
| **141** | Leki Przeciwbólowe | E6 | Paracetamol API + Skrobia + Blistry | `[3, 4, 1]` | **45** | Farmakologia Syntetyczna | Śladowy pył (zbiórka apteczna) |
| **142** | Antybiotyki i Przeciwwirusowe | E6 | Pożywka + Cząsteczka Czynna + Fiolki | `[2, 5, 3]` | **85** | Bioprocesy Fermentacyjne | Odpad bio $\to$ biometan |
| **143** | Witaminy i Suplementy Bio | E6 | Ekstrakty Alg + Kapsułki Celulozowe | `[3, 3, 1]` | **35** | Ekstrakcja Nadkrytyczna CO2 | Eko-szkło, kompost z alg |
| **144** | Szczepionki mRNA | E6 | mRNA w LNP + Bufor + Fiolki Nano | `[1, 4, 5]` | **95** | Inżynieria Genetyczna i mRNA | Neutralizacja termiczna |
| **145** | Insulina i Kardiologia | E6 | Rekombinowane Białko + Pen Dozownik | `[2, 4, 4]` | **70** | Rekombinowane Białka Lecznicze | Tworzywa do regranulacji |
| **146** | Środki Opatrunkowe i Hydrożel | E6 | Gaza + Hydrożel Alginianowy + Nanosrebro | `[4, 3, 1]` | **30** | Opatrunki Aktywne | Ścinki tekstylne do recyklingu |
| **147** | Soczewki i Implanty Okulistyczne | E6 | Silikon-Hydrożel + Sól Fizjologiczna | `[2, 4, 2]` | **40** | Polimery Hydrożelowe Biozgodne | Recykling blistrów PP |
| **148** | Aparaty Słuchowe Cyfrowe | E6 | Chip DSP + Mikrofon MEMS + Akumulator | `[1, 5, 3]` | **50** | Cyfrowa Obróbka Sygnałów | Urban mining złota i miedzi |
| **149** | Testery Domowe i Glukometry | E6 | Paski Enzymatyczne + Czytnik LCD | `[3, 4, 1]` | **40** | Biosensory Elektrochemiczne | Redukcja hospitalizacji |
| **150** | Wózki Inwalidzkie Elektryczne | E6 | Rama Alu + Silniki BLDC + Bateria Li-Ion | `[5, 4, 1]` | **180** | Robotyka Rehabilitacyjna | 100% odzysk ramy i silników |
| **151** | Sprzęt Szpitalny (Respiratory) | E6 | Turbina Tlenowa + Monitor + Płyta EKG | `[2, 6, 4]` | **220** | Aparatura Podtrzymywania Życia | Modułowy serwis 15 lat |
| **152** | Skanery Obrazowania (MRI 3T) | E6 | Magnes Nadprzewodzący + Hel + Gradienty | `[4, 10, 8]` | **1 400** | Rezonans Jądrowy i Tomografia | Zamknięty obieg helu kriogenicznego |
| **153** | Terapie Onkologiczne Celowane | E7 | Przeciwciała mAb + Cytotoksyna + Fiolki | `[1, 5, 8]` | **310** | Przeciwciała Monoklonalne / CAR-T | Filtry membranowe eko |
| **154** | Terapie Genowe CRISPR | E7 | Nukleaza Cas9 + gRNA + Wektory AAV | `[0, 4, 9]` | **260** | Precyzyjna Edycja Genomu | Trwała eliminacja wad wrodzonych |
| **155** | Bio-Implanty Kostne 3D | E7 | Proszek Ti-Grade 5 + Hydroksyapatyt | `[2, 6, 3]` | **280** | Biodruk Struktur Kostnych | 95% regeneracja proszku tytanu |
| **156** | Sztuczna Krew (HBOC) | E7 | Hemoglobina HBOC + Płyn Elektrolitowy | `[3, 5, 3]` | **140** | Substytuty Krwi w Temp. Pokojowej | Brak strat chłodniczych |
| **157** | Zestawy Mikrobiomu i Prewencji | E7 | Chip NGS + Szczepy Autologiczne | `[2, 6, 4]` | **120** | Analiza Mikrobiomu Jelitowego | Prewencja chorób cywilizacyjnych |
| **158** | Organy Drukowane 3D | E8 | Biotusz iPSC + Biomatryca Naczyniowa | `[1, 5, 10]` | **480** | Biodruk Narządów Miaższowych 3D | Zero odrzutów, narządy autologiczne |
| **159** | Nanoboty Medyczne Naczyniowe | E8 | Nanomotory + Sensory Au + Powłoka DLC | `[0, 4, 12]` | **520** | Nanorobotyka Dożylna | Usuwanie blaszek miażdżycowych |
| **160** | Regeneracja Komórkowa | E8 | Czynniki OSKM + Senolityki Liposomalne | `[0, 3, 12]` | **380** | Reprogramowanie Epigenetyczne | Odwrócenie starzenia o 25 lat |

---

## 5. Mechanika Cyrkularna i Odpady Medyczne w Symulacji

### 5.1. Rygor Odpadów i Zagrożenie Biologiczne
* **Klasyfikacja odpadów medycznych**: W odróżnieniu od branż mechanicznych, 15% odpadów farmaceutycznych i biologicznych posiada status **zagrożenia epidemicznego/chemicznego**.
* **Utylizacja i Cyrkularność**:
  1. *Frakcja stała sterylna (metale, szkło, tworzywa blistrów)* $\to$ kierowana do miejskich **Zakładów Recyklingu** z wysokim odzyskiem (aluminium 95%, szkło boro-krzemowe 90%).
  2. *Biomasa pofermentacyjna (pozbawiona patogenów)* $\to$ zasila miejskie **Biogazownie**, produkując biometan (zastępnik gazu ziemnego w Epoce 6–8) oraz biokompost rolniczy.
  3. *Odpady niebezpieczne (igły, materiał biologiczny)* $\to$ kierowane do miejskich **Spalarni Plazmowych / Termoutylizatorów**, odzyskujących energię cieplną do miejskiej sieci ciepłowniczej bez emisji dioksyn.
* **Apteczna zbiórka przeterminowanych leków**: Zmniejsza zanieczyszczenie wód gruntowych miasta o 80%, chroniąc wskaźnik Czystości Wody w Ratuszu przed karami ekologicznymi.

### 5.2. Skalowanie Zapotrzebowania w zależności od Klasy Społecznej
Zgodnie z formułą GDD:
$$\text{Demand}_{P, c} = N_c \cdot \text{BazoweZapotrzebowanie}_{P, c} \cdot \left(\frac{\text{Płaca}_c}{\text{PłacaReferencyjna}_c}\right) \cdot M_{\text{epoka}}(P)$$
* Produkty masowe (#141, #142, #146, #149) są kupowane w równym stopniu przez klasę `[R]`, `[M]` i `[E]`.
* Produkty średniej zaawansowania (#143, #147, #148, #150) wykazują najwyższy popyt w klasie `[M]`.
* Terapie przełomowe, medycyna genowa i regeneracja (#153, #154, #158, #159, #160) generują ogromny popyt w klasie `[E]`, a w Epoce 8 dzięki reformom Ratusza (*Medycyna Powszechna*) stają się usługą publiczną finansowaną z budżetu miasta.
