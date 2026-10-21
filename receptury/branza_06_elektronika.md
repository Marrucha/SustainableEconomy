# Branża 6: Elektronika i Komunikacja – Receptury i Bilans Masowo-Energetyczny
**Dokumentacja Inżynierii Procesowej, Triady Produkcyjnej i Urban Miningu**
*Załącznik Technologiczny do GDD v5.0 oraz Drzew Produkcyjnych 200 Produktów*

---

## 1. Wprowadzenie i Standardy Metrologiczne

Branża 6 (Elektronika i Komunikacja) stanowi technologiczne serce nowoczesnej gospodarki w symulacji (od Epoki 4: 1955 r. do Epoki 8: 2080 r.). Charakteryzuje się:
1. **Wysoką kapitałochłonnością i zapotrzebowaniem na energię elektryczną** (procesy wysokotemperaturowe hutnictwa krzemu, czyste pomieszczenia *Cleanroom* ISO 3–5, precyzyjna fotolitografia EUV/DUV oraz testy wygrzewania *burn-in*).
2. **Krytycznym zapotrzebowaniem na kadrę specjalistyczną i naukową** (`[M]` Inżynierowie/Technicy oraz `[E]` Naukowcy/Fizycy ciała stałego).
3. **Strategicznym znaczeniem surowców krytycznych** (Złoto, Lit, Neodym, Krzem wysokiej czystości, Miedź elektrolityczna).
4. **Ogromnym potencjałem odzysku w ramach Urban Miningu** – zużyte urządzenia Branży 6 są najbogatszą rudą antropogeniczną w grze.

### Jednostki w Modelu Gry:
* **Jednostka fizyczna (j.)**: 1 jednostka towarowa w magazynie/na giełdzie B2B (reprezentuje określoną partię produkcyjną lub wagowy ekwiwalent, np. 1 j. krzemu = 1 kg krzemu czystości 99.9999%).
* **Energia elektryczna**: wyrażona w **kWh** przypadających na wytworzenie 1 j. produktu lub półproduktu.
* **Zasoby ludzkie (Pracownicy na linię produkcyjną)**: `[R]` Robotnicy (montaż mechaniczny, pakowanie), `[M]` Specjaliści/Technicy (obsługa maszyn SMT, kalibracja, kontrola jakości), `[E]` Naukowcy/Inżynierowie (litografia, synteza nanostruktur, fizyka kwantowa).
* **Licencja**: Odblokowana technologia w Drzewku Technologii lub patent z jednostki R&D/Uniwersytetu.

---

## 2. Półprodukty Poziomu 1 (L1) – Od Surowców do Czystych Materiałów

Półprodukty L1 powstają w miejskich hutach, rafineriach i zakładach chemicznych bezpośrednio z surowców wydobywanych na Mapie Świata lub pozyskiwanych z Zakładów Recyklingu.

| Kod Półproduktu | Nazwa Półproduktu L1 | Surowce Wsadowe (L0) | Wskaźnik Wsadu (na 1 j. L1) | Energia [kWh/j] | Załoga [R/M/E] | Wymagana Technologia / Licencja |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **L1-KRZ** | **Krzem Metalurgiczny / Polikrzem** | Piasek Kwarcowy + Węgiel (reduktor) | 2.2 j. Piasku + 0.6 j. Węgla | 28.0 kWh | 6R / 2M / 0E | *Metalurgia Krzemu i Redukcja Łukowa (Era 4)* |
| **L1-MIE** | **Miedź Rafinowana (Katodowa)** | Ruda Miedzi + Kwas Siarkowy | 2.5 j. Rudy Miedzi + 0.2 j. Kwasu | 12.5 kWh | 8R / 2M / 0E | *Elektrorafinacja Miedzi (Era 1/2)* |
| **L1-ZLO** | **Złoto Czyste (Przemysłowe 99.99%)**| Ruda Złota + Chemikalia | 5.0 j. Rudy Złota + 0.5 j. Kwasu | 45.0 kWh | 5R / 4M / 1E | *Hydrometalurgia i Rafinacja Metali Szlachetnych (Era 2)*|
| **L1-LIT** | **Koncentrat Litu (Węglan Litu)** | Ruda Litu / Solanki + Chemikalia | 3.0 j. Rudy Litu + 0.4 j. Kwasu | 18.0 kWh | 6R / 3M / 0E | *Ekstrakcja i Rafinacja Związków Litu (Era 4)* |
| **L1-NDM** | **Tlenki Neodymu i Ziem Rzadkich** | Neodym i Ziemie Rzadkie + Odczynniki| 4.0 j. Rudy Ziem Rzadkich + 0.8 j. Chemikaliów | 35.0 kWh | 4R / 5M / 1E | *Separacja Jonowymienna Lantanowców (Era 5)* |
| **L1-ALU** | **Aluminium Hutnicze** | Boksyt + Soda / Wapno | 3.0 j. Boksytu + 0.3 j. Wapna | 32.0 kWh | 8R / 2M / 0E | *Proces Halla-Héroulta i Elektroliza Boksytu (Era 2)*|
| **L1-PLT** | **Tworzywa Sztuczne (Granulat ABS/PC)**| Ropa Naftowa (Frakcje Naftowe) | 1.8 j. Ropy Naftowej | 8.5 kWh | 5R / 3M / 0E | *Polimeryzacja Petrochemiczna (Era 3)* |
| **L1-SZK** | **Szkło Płaskie / Techniczne** | Piasek Kwarcowy + Wapień + Soda | 1.5 j. Piasku + 0.3 j. Wapienia | 6.0 kWh | 6R / 1M / 0E | *Hutnictwo Szkła Float (Era 2)* |
| **L1-STA** | **Stal Precyzyjna / Blacha** | Ruda Żelaza + Koks Przemysłowy | 1.8 j. Rudy Żelaza + 0.5 j. Koksu | 14.0 kWh | 8R / 2M / 0E | *Konwertorowe Wytapianie Stali (Era 1/2)* |

---

## 3. Półprodukty Poziomu 2 i 3 (L2/L3) – Komponenty Elektroniczne i Moduły

Półprodukty L2/L3 powstają w specjalistycznych fabrykach komponentów, odlewniach precyzyjnych i ultraczystych laboratoriach półprzewodnikowych (*Foundries / Fabs*).

### 3.1. Receptury Półproduktów L2/L3

#### L2-WAF: Wafle Krzemowe Monokrystaliczne (Ingoty Czochralskiego cięte laserem)
* **Wsad materiałowy**: 1.3 j. Krzem Metalurgiczny (L1-KRZ) + 0.2 j. Chemia Nieorganiczna (oczyszczanie kwasowe trichlorosilanem)
* **Uzysk procesowy**: 1.0 j. Wafla Krzemowego (odpady krzemowe wracają w 90% do powtórnego przetopu)
* **Energia**: **65.0 kWh / j.** (utrzymanie temperatury topnienia krzemu 1425°C przez wiele dni w próżni)
* **Załoga**: `0 [R]`, `6 [M]`, `4 [E]`
* **Wymagana Licencja**: *Krystalografia Półprzewodników i Metoda Czochralskiego (Era 4/5)*

#### L2-PCB: Płytki Obwodów Drukowanych Wielowarstwowe (PCB)
* **Wsad materiałowy**: 0.4 j. Miedź Rafinowana (L1-MIE, folia miedziana) + 0.5 j. Tworzywa (L1-PLT, laminat epoksydowo-szklany FR4) + 0.1 j. Chemia (kąpiele trawienne)
* **Uzysk procesowy**: 1.0 j. Płytki PCB
* **Energia**: **14.0 kWh / j.** (naświetlanie UV, trawienie kwasowe, metalizacja otworów przelotowych)
* **Załoga**: `4 [R]`, `5 [M]`, `1 [E]`
* **Wymagana Licencja**: *Technologia Obwodów Drukowanych i Metalizacji Przelotowej (Era 4)*

#### L2-PAS: Elementy Pasywne (Kondensatory, Rezystory, Cewki)
* **Wsad materiałowy**: 0.5 j. Miedź Rafinowana (L1-MIE) + 0.3 j. Tworzywa (L1-PLT) + 0.2 j. Szkło/Ceramika (L1-SZK)
* **Uzysk procesowy**: 1.0 j. Kompletów Elementów Pasywnych (1 j. = zestaw ~1000 szt. SMD)
* **Energia**: **9.0 kWh / j.** (precyzyjne nawijanie, spiekanie ceramiczne, pakowanie w taśmy blistrowe)
* **Załoga**: `5 [R]`, `4 [M]`, `1 [E]`
* **Wymagana Licencja**: *Miniaturyzacja Komponentów Biernych SMD (Era 4)*

#### L2-CPU: Mikroprocesory i Układy Scalone SoC (Mikroczipy Logiczne)
* **Wsad materiałowy**: 0.6 j. Wafle Krzemowe (L2-WAF) + 0.1 j. Złoto Czyste (L1-ZLO, bondowanie wyprowadzeń) + 0.2 j. Miedź (L1-MIE, interkonekty) + 0.2 j. Tworzywa (obudowa BGA)
* **Uzysk procesowy**: 1.0 j. Układów CPU (uzysk struktur waha się 70–90% w zależności od węzła technologicznego)
* **Energia**: **85.0 kWh / j.** (fotolitografia DUV/EUV, implantacja jonów, ultra-czyste powietrze ISO 3, ultra-czysta woda dejonizowana UPW)
* **Załoga**: `0 [R]`, `5 [M]`, `8 [E]`
* **Wymagana Licencja**: *Fotolitografia Submikronowa i Architektura VLSI (Era 5)*

#### L2-MEM: Kości Pamięci RAM i Pamięci Masowej Flash NAND / SSD
* **Wsad materiałowy**: 0.5 j. Wafle Krzemowe (L2-WAF) + 0.05 j. Złoto Czyste (L1-ZLO) + 0.2 j. Miedź (L1-MIE) + 0.2 j. Tworzywa (L1-PLT)
* **Uzysk procesowy**: 1.0 j. Pamięci Cyfrowych (zestawy kości DDR / macierzy 3D NAND)
* **Energia**: **55.0 kWh / j.** (wielowarstwowe trawienie pionowe 3D NAND, precyzyjne nanoszenie warstw dielektryka)
* **Załoga**: `1 [R]`, `6 [M]`, `5 [E]`
* **Wymagana Licencja**: *Półprzewodnikowe Pamięci Masowe i Dynamiczne RAM (Era 5)*

#### L2-DIS: Ekrany i Matryce Wyświetlaczy (CRT / LCD / OLED / Micro-LED)
* **Wsad materiałowy**: 0.6 j. Szkło Płaskie (L1-SZK) + 0.2 j. Krzem (L1-KRZ, tranzystory TFT) + 0.1 j. Miedź (L1-MIE) + 0.1 j. Tlenki Ziem Rzadkich (L1-NDM, luminofory/warstwy emisyjne)
* **Uzysk procesowy**: 1.0 j. Wyświetlaczy
* **Energia**: **38.0 kWh / j.** (napylanie próżniowe warstw organicznych OLED, laminacja polaryzatorów w komorach bezpyłowych)
* **Załoga**: `3 [R]`, `6 [M]`, `2 [E]`
* **Wymagana Licencja**: *Matryce Aktywne TFT i Emisja Organiczna OLED (Era 5/6)*

#### L2-BAT: Ogniwa Akumulatorowe Litowo-Jonowe / Li-Polymer
* **Wsad materiałowy**: 0.4 j. Koncentrat Litu (L1-LIT) + 0.3 j. Miedź (L1-MIE, folia anody) + 0.2 j. Aluminium (L1-ALU, folia katody) + 0.2 j. Tworzywa (separator polimerowy i elektrolit)
* **Uzysk procesowy**: 1.0 j. Baterii Li-Ion
* **Energia**: **24.0 kWh / j.** (suszenie elektrod w próżni, nawijanie/prymowanie w *dry-roomie* o punkcie rosy -40°C, formowanie elektrochemiczne)
* **Załoga**: `4 [R]`, `5 [M]`, `1 [E]`
* **Wymagana Licencja**: *Elektrochemia Baterii Litowo-Jonowych (Era 5)*

#### L2-CAS: Obudowy Precyzyjne i Radiatory (Tworzywa / Aluminium Unibody / Stopy Tytanu)
* **Wsad materiałowy**: 0.6 j. Aluminium Hutnicze (L1-ALU) + 0.4 j. Tworzywa (L1-PLT) + 0.1 j. Stal (L1-STA, śruby/wzmocnienia)
* **Uzysk procesowy**: 1.0 j. Zestawów Obudów Precyzyjnych
* **Energia**: **11.0 kWh / j.** (frezowanie CNC ze sztaby unibody, wtrysk ciśnieniowy, anodowanie elektrochemiczne)
* **Załoga**: `6 [R]`, `3 [M]`, `0E`
* **Wymagana Licencja**: *Obróbka Skrawaniem CNC i Tłoczenie Precyzyjne (Era 4/5)*

#### L2-MOT: Precyzyjne Silniki Bezszczotkowe (BLDC) i Przetworniki Elektroakustyczne
* **Wsad materiałowy**: 0.4 j. Miedź Rafinowana (L1-MIE, uzwojenia mikrometryczne) + 0.3 j. Tlenki Neodymu (L1-NDM, magnesy trwałe NdFeB) + 0.3 j. Stal (L1-STA, wirnik i łożyska)
* **Uzysk procesowy**: 1.0 j. Silników BLDC / Przetworników
* **Energia**: **16.0 kWh / j.** (spiekanie magnesów neodymowych w atmosferze argonu, automatyczne nawijanie cewek)
* **Załoga**: `4 [R]`, `4 [M]`, `1 [E]`
* **Wymagana Licencja**: *Silniki Bezkolektorowe i Magnesy Trwałe Spiekane (Era 5/6)*

#### L2-SEN: Moduły Radiowe (RF MIMO / Wi-Fi), Optyka CMOS i Sensory Biometryczne
* **Wsad materiałowy**: 0.3 j. Płytka PCB (L2-PCB) + 0.3 j. Mikroprocesory (L2-CPU) + 0.2 j. Szkło Optyczne (L1-SZK) + 0.1 j. Złoto (L1-ZLO)
* **Uzysk procesowy**: 1.0 j. Modułów Sensoryczno-Radiowych
* **Energia**: **22.0 kWh / j.** (kalibracja spektralna matryc światłoczułych, strojenie torów radiowych w komorach bezodbiciowych)
* **Załoga**: `2 [R]`, `6 [M]`, `3 [E]`
* **Wymagana Licencja**: *Systemy Radiowe Wysokich Częstotliwości i Matryce CMOS (Era 5/6)*

#### L3-QPU: Nadprzewodzące Matryce Kubitowe z Mikrochłodziarką (Epoka 8)
* **Wsad materiałowy**: 0.4 j. Wafle Krzemowe Specjalne (L2-WAF) + 0.3 j. Złoto Czyste (L1-ZLO) + 0.2 j. Tlenki Neodymu / Ziem Rzadkich (L1-NDM) + 0.2 j. Stal Niemagnetyczna / Tytan
* **Uzysk procesowy**: 1.0 j. Modułów QPU
* **Energia**: **140.0 kWh / j.** (litografia wiązką elektronową e-beam, zamykanie kriostatu helowego rozcieńczalnikowego <15 mK)
* **Załoga**: `0 [R]`, `3 [M]`, `10 [E]`
* **Wymagana Licencja**: *Koherencja Kwantowa i Nadprzewodnictwo Wysokotemperaturowe (Era 8)*

#### L3-BCI: Biokompatybilne Elektrody Grafenowo-Złote i Neuro-Przetworniki (Epoka 8)
* **Wsad materiałowy**: 0.3 j. Złoto Czyste (L1-ZLO) + 0.3 j. Wafle Krzemowe (L2-WAF) + 0.3 j. Biopolimery / Hydrożel Medyczny + 0.1 j. Nanomateriały Węglowe
* **Uzysk procesowy**: 1.0 j. Matryc Neuro-Interfejsu
* **Energia**: **60.0 kWh / j.** (nanodruk elektrod elastycznych, enkapsulacja biozgodna)
* **Załoga**: `0 [R]`, `4 [M]`, `8 [E]`
* **Wymagana Licencja**: *Interfejsy Mózg-Maszyna i Bioelektronika Elastyczna (Era 8)*

---

## 4. Receptury 20 Produktów Końcowych Branży 6

Poniżej przedstawiono kompletne receptury inżynieryjne dla wszystkich 20 produktów końcowych Branży 6 zgodnie z kanonem GDD v5.0, wraz z triadą produkcyjną, bilansem energii i wskaźnikami Urban Miningu.

---

### Produkt 1 (ID 101): Odbiorniki Radiowe Tranzystorowe
* **Okres**: Epoka 4 (1955–1980) $\to$ [Wygasa w Epoce 6; rynek przejmują smartfony i głośniki smart].
* **Receptura montażowa**:
  * 1.0 j. Płytki PCB THT (L2-PCB)
  * 1.0 j. Elementy Pasywne i Tranzystory (L2-PAS)
  * 1.0 j. Obudowa z Tworzywa / Bakelitu z Anteną (L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu gotowego: ~1.2 kg / j.
  * Odpady montażowe: 0.05 j. ścinek miedzianych i tworzyw (do recyklingu).
* **Triada Produkcyjna**:
  * **Ludzie**: `8 [R]`, `3 [M]`, `0 [E]`
  * **Energia**: **6.5 kWh / j.** (lutowanie na fali cynowo-ołowiowej, formowanie wtryskowe obudowy, strojenie odbiornika)
  * **Licencja**: *Tranzystory Bipolarne i Odbiorniki Superheterodynowe (Era 4)*
* **Urban Mining & Recykling**: Odzysk miedzi z transformatora i cewek głośnika (85%), złom z płytek drukowanych (klasa średnia).

---

### Produkt 2 (ID 102): Telewizory Kineskopowe CRT / Ekrany OLED
* **Okres**: Epoka 4 (Kineskopy CRT) $\to$ w Epoce 6 transformacja w: **Płaskie Telewizory OLED** $\to$ w Epoce 8 w: **Projektory Holograficzne**.
* **Receptura montażowa (Wariant E6 – Telewizory OLED 4K/8K)**:
  * 1.5 j. Wielkoformatowe Matryce OLED (L2-DIS)
  * 1.0 j. Płyta Główna PCB z Procesorem Wideo (L2-PCB + L2-CPU)
  * 1.0 j. Zintegrowana Rama Aluminiowa i Zasilacz (L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu gotowego: ~14.0 kg / j. (vs 35 kg dawnego telewizora CRT).
  * Odpady montażowe: 0.15 j. tworzyw i folii optycznych.
* **Triada Produkcyjna**:
  * **Ludzie**: `5 [R]`, `6 [M]`, `2 [E]`
  * **Energia**: **32.0 kWh / j.** (laminacja matrycy bez pęcherzyków powietrza w próżni, testy termiczne zasilacza impulsowego)
  * **Licencja**: *Wielkoformatowe Panele Organiczne OLED i Cyfrowe Przetwarzanie Wideo (Era 6)*
* **Urban Mining & Recykling**: Wysoce opłacalny odzysk ramy ze stopu aluminium (95%), miedzi z cewek zasilacza (90%) oraz metali szlachetnych z procesora logicznego.

---

### Produkt 3 (ID 103): Telefony Stacjonarne Tarczowe / Przyciskowe
* **Okres**: Epoka 4 (1955–1980) $\to$ [Wygasa w Epoce 6; wyparte przez GSM i smartfony].
* **Receptura montażowa**:
  * 0.8 j. Obudowa z Tworzywa ABS z Mikrotelefonem (L2-CAS)
  * 0.6 j. Płyta Wybierania Tarczowego/Tonowego DTMF (L2-PCB)
  * 0.6 j. Dzwonek Elektromechaniczny i Przetwornik Węglowy (L2-MOT / L2-PAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~1.1 kg / j.
  * Odpady: 0.04 j. tworzywa ze wtryskarek.
* **Triada Produkcyjna**:
  * **Ludzie**: `7 [R]`, `2 [M]`, `0 [E]`
  * **Energia**: **4.5 kWh / j.** (wtrysk tworzywa ABS, montaż manualny wiązek, kontrola ciągłości linii)
  * **Licencja**: *Komutacja Telefoniczna i Sygnalizacja Wieloczęstotliwościowa (Era 4)*
* **Urban Mining & Recykling**: Plastik obudowy ABS (100% recyklingu termoplastycznego), mosiądz i miedź z przewodów spiralnych.

---

### Produkt 4 (ID 104): Magnetofony i Gramofony Hi-Fi / Odtwarzacze CD
* **Okres**: Epoka 4 (Szpulowe/Kasetowe) $\to$ w Epoce 5: **Odtwarzacze Cyfrowe CD/Audio Hi-Fi** $\to$ [Wygasa w Epoce 7].
* **Receptura montażowa (Wariant E5 – Zestaw Hi-Fi CD/DSP)**:
  * 1.0 j. Precyzyjny Mechanizm Napędu Optycznego / Paskowego (L2-MOT)
  * 1.0 j. Płyta Główna Audio DAC z Wzmacniaczem (L2-PCB + L2-PAS)
  * 1.0 j. Front-Panel ze Szczotkowanego Aluminium i Obudowa (L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~5.5 kg / j.
  * Odpady: 0.1 j. wiórów aluminiowych i ścinek przewodów ekranowanych.
* **Triada Produkcyjna**:
  * **Ludzie**: `4 [R]`, `6 [M]`, `1 [E]`
  * **Energia**: **14.5 kWh / j.** (precyzyjna kalibracja głowicy laserowej/magnetycznej, pomiary zniekształceń THD w komorze audio)
  * **Licencja**: *Cyfrowy Zapis Dźwięku PCM i Optyczny Odczyt Danych (Era 5)*
* **Urban Mining & Recykling**: Wysokiej czystości blacha aluminiowa (100%), miedź z transformatora toroidalnego, złocone złącza audio RCA.

---

### Produkt 5 (ID 105): Kalkulatory Elektroniczne
* **Okres**: Epoka 4 (1965–1980) $\to$ [Wygasa w Epoce 6; funkcja wchłonięta przez smartfony i komputery].
* **Receptura montażowa**:
  * 0.4 j. Układ Scalony Kalkulatora LSI (L2-CPU)
  * 0.4 j. Wyświetlacz Siedmiosegmentowy LED / VFD / LCD (L2-DIS)
  * 0.5 j. Obudowa Kieszonkowa z Klawiaturą Elastomerową (L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.18 kg / j.
  * Odpady: 0.02 j. odpadów foliowych i ścinek taśm montażowych.
* **Triada Produkcyjna**:
  * **Ludzie**: `4 [R]`, `4 [M]`, `0 [E]`
  * **Energia**: **3.2 kWh / j.** (automatyczny montaż SMT, zgrzewanie ultradźwiękowe obudowy)
  * **Licencja**: *Skalowanie Układów LSI i Kalkulatory Kieszonkowe (Era 4)*
* **Urban Mining & Recykling**: Złoto z mikropołączeń układu jednoukładowego, tworzywo polistyrenowe/ABS.

---

### Produkt 6 (ID 106): Aparaty Fotograficzne Analogowe / Cyfrowe
* **Okres**: Epoka 4 (Lustrzanki Analogowe SLR) $\to$ w Epoce 6: **Zaawansowane Bezusterkowce Cyfrowe (Mirrorless 8K)**.
* **Receptura montażowa (Wariant E6 – Bezlusterkowiec Cyfrowy Profesjonalny)**:
  * 1.0 j. Pełnoklatkowa Matryca Światłoczuła CMOS z Procesorem Obrazu (L2-SEN + L2-CPU)
  * 1.0 j. Zespół Soczewek Optycznych z Silnikiem Autofocus (L1-SZK + L2-MOT)
  * 1.0 j. Korpus ze Stopu Magnezu/Aluminium z Uszczelnieniem (L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.85 kg / j.
  * Odpady: 0.06 j. pyłu szlifierskiego szkła optycznego i skrawków stopów lekkich.
* **Triada Produkcyjna**:
  * **Ludzie**: `2 [R]`, `7 [M]`, `4 [E]`
  * **Energia**: **21.0 kWh / j.** (centrowanie osi optycznej z dokładnością submikronową, kalibracja balansu bieli i szumów matrycy)
  * **Licencja**: *Cyfrowe Przetworniki Obrazu CMOS i Stabilizacja Optyczna (Era 6)*
* **Urban Mining & Recykling**: Stop magnezowy szkieletu, złoto z wyprowadzeń sensora BSI-CMOS, miedź z elektromagnesów stabilizacji matrycy IBIS.

---

### Produkt 7 (ID 107): Komputery Osobiste Stacjonarne (PC)
* **Okres**: Epoka 5 (1981–2005) $\to$ w Epoce 7: **Modułowe Eko-Stacje Robocze (Cyrkularne)**.
* **Receptura montażowa (Standard E5/E6)**:
  * 1.0 j. Płyta Główna z Procesorem Wielordzeniowym (L2-PCB + L2-CPU)
  * 1.0 j. Moduły Pamięci RAM i Dysk Półprzewodnikowy SSD (L2-MEM)
  * 1.0 j. Obudowa Tower z Zasilaczem Impulsowym i Chłodzeniem (L2-CAS + L2-PAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~8.0 kg / j.
  * Odpady: 0.25 j. kartonu, folii antystatycznej ESD, resztek pasty termoprzewodzącej.
* **Triada Produkcyjna**:
  * **Ludzie**: `3 [R]`, `7 [M]`, `3 [E]`
  * **Energia**: **26.0 kWh / j.** (automatyczny montaż SMT, lutowanie rozpływowe w atmosferze azotu, 24-godzinny test obciążeniowy *burn-in*)
  * **Licencja**: *Architektura Komputerowa Wielordzeniowa x86/ARM i Magistrale High-Speed (Era 5)*
* **Urban Mining & Recykling**: **Najwyższa wartość odzysku per jednostka**: ~0.25 g czystego złota z pinów CPU/RAM, 1.2 kg czystej miedzi z radiatorów i zasilacza, stal ze struktury obudowy (100%).

---

### Produkt 8 (ID 108): Laptopy i Notebooki
* **Okres**: Epoka 5 (1985–2005) $\to$ w Epoce 7: **Laptopy Modułowe Fair-Tech (100% Naprawialne)**.
* **Receptura montażowa**:
  * 1.0 j. Płyta Główna z Energooszczędnym SoC i Pamięcią (L2-CPU + L2-MEM)
  * 1.0 j. Matryca Wyświetlacza Niskonapięciowego IPS/OLED (L2-DIS)
  * 1.0 j. Akumulator Li-Polymer oraz Obudowa Slim (L2-BAT + L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~1.6 kg / j.
  * Odpady: 0.08 j. taśm termoprzewodzących i folii ochronnych.
* **Triada Produkcyjna**:
  * **Ludzie**: `3 [R]`, `8 [M]`, `3 [E]`
  * **Energia**: **22.5 kWh / j.** (precyzyjny zautomatyzowany montaż zgrzewany/śrubowy, kalibracja profilu baterii BMS, testy matrycy)
  * **Licencja**: *Mobilne Jednostki Obliczeniowe i Zarządzanie Energią ACPI (Era 5)*
* **Urban Mining & Recykling**: Odzysk litu i kobaltu z pakietu bateryjnego, złota ze złączy eDP i pamięci RAM, frezowanego aluminium obudowy.

---

### Produkt 9 (ID 109): Telefony Komórkowe i Smartfony
* **Okres**: Epoka 5 (GSM) $\to$ w Epoce 6: **Smartfony 5G z Ekranem Dotykowym** $\to$ w Epoce 7: **Modułowe Smartfony Cyrkularne**.
* **Receptura montażowa (Wariant E6/E7 Smartfon)**:
  * 1.0 j. Płyta Główna HDI z Procesorem SoC i Pamięcią (L2-CPU + L2-MEM + L2-PCB)
  * 1.0 j. Ekran Dotykowy AMOLED z Zespołem Aparatów (L2-DIS + L2-SEN)
  * 1.0 j. Akumulator Li-Ion Szybkiego Ładowania w Ramie Unibody (L2-BAT + L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.21 kg / j.
  * Odpady: 0.03 j. mikroskopijnych ścinek taśm miedzianych i klejów UV.
* **Triada Produkcyjna**:
  * **Ludzie**: `2 [R]`, `9 [M]`, `5 [E]`
  * **Energia**: **28.0 kWh / j.** (montaż precyzyjny w klasie czystości ISO 5, hermetyzacja wodoszczelna IP68, kalibracja anten RF)
  * **Licencja**: *Telefonia Komórkowa Wysokich Generacji i Ekrany Pojemnościowe (Era 5/6)*
* **Urban Mining & Recykling**: **Absolutny rekord koncentracji metali szlachetnych**: ruda antropogeniczna bogatsza 50-krotnie od naturalnej rudy złota (złoto, tantal, neodym z głośnika i wibratora haptics, lit z baterii).

---

### Produkt 10 (ID 110): Drukarki Biurowe i Domowe / Drukarki 3D
* **Okres**: Epoka 5 (Laserowe i Atramentowe) $\to$ w Epoce 7: **Precyzyjne Drukarki Przestrzenne 3D (Biopolimerowe / Proszkowe)**.
* **Receptura montażowa (Wariant E7 – Drukarka 3D / Additive Manufacturing)**:
  * 1.0 j. Precyzyjne Prowadnice Liniowe z Silnikami Krokowymi BLDC (L2-MOT)
  * 1.0 j. Głowica Drukująca Wysokotemperaturowa / Ekstruder (L2-CAS + L2-PAS)
  * 1.0 j. Płyta Główna Sterownika z Zasilaczem i Stołem Grzewczym (L2-PCB + L2-CPU)
* **Bilans materiałowy**:
  * Masa wyrobu: ~9.5 kg / j.
  * Odpady: 0.2 j. tworzyw technologicznych do pierwszych kalibracji stołu.
* **Triada Produkcyjna**:
  * **Ludzie**: `4 [R]`, `6 [M]`, `2 [E]`
  * **Energia**: **18.0 kWh / j.** (frezowanie ram sztywnych, kalibracja czujników poziomowania stołu, wygrzewanie głowicy)
  * **Licencja**: *Wytwarzanie Przyrostowe i Precyzyjna Kinematyka Krokowa (Era 5/7)*
* **Urban Mining & Recykling**: Profile aluminiowe ramy V-Slot (100%), miedź z silników krokowych NEMA, układy scalone sterowników MOS-FET.

---

### Produkt 11 (ID 111): Routery i Urządzenia Sieciowe (Wi-Fi / Światłowód)
* **Okres**: Epoka 5 (1995–2005) $\to$ E6/E7: **Routery Światłowodowe Wi-Fi 7 / Siatki Mesh**.
* **Receptura montażowa**:
  * 1.0 j. Dedykowany Procesor Sieciowy NPU z Pamięcią Buforową (L2-CPU + L2-MEM)
  * 1.0 j. Moduł Radiowy Wielopasmowy RF MIMO i Porty Optyczne (L2-SEN + L2-PCB)
  * 1.0 j. Obudowa z Pasywnymi Radiatorami Aluminiowymi i Antenami (L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.75 kg / j.
  * Odpady: 0.04 j. odpadów laminatu i tworzywa.
* **Triada Produkcyjna**:
  * **Ludzie**: `2 [R]`, `7 [M]`, `3 [E]`
  * **Energia**: **12.0 kWh / j.** (automatyczny montaż SMT, kalibracja tłumienia w paśmie 5–6 GHz, testy przepustowości pakietowej)
  * **Licencja**: *Transmisja Szerokopasmowa i Routing Pakietowy Wielu Strumieni (Era 5)*
* **Urban Mining & Recykling**: Grube odlewane radiatory ze stopu aluminium, złocenia styków w portach RJ-45 i gniazdach optycznych SFP.

---

### Produkt 12 (ID 112): Monitory Komputerowe
* **Okres**: Epoka 5 (LCD) $\to$ w Epoce 6: **Profesjonalne Monitory OLED / Mini-LED 144Hz+**.
* **Receptura montażowa**:
  * 1.5 j. Panel Wyświetlacza Wysokiej Rozdzielczości (L2-DIS)
  * 1.0 j. Płyta Skalera Wideo z Przetwornikiem Zasilania (L2-PCB + L2-PAS)
  * 1.0 j. Ergonomiczna Podstawa Aluminiowa i Obudowa (L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~6.2 kg / j.
  * Odpady: 0.18 j. zabezpieczeń ochronnych matrycy.
* **Triada Produkcyjna**:
  * **Ludzie**: `4 [R]`, `6 [M]`, `1 [E]`
  * **Energia**: **19.5 kWh / j.** (kalibracja kolorymetryczna tabel 3D LUT, montaż mechaniczny ramienia ze sprężyną gazową)
  * **Licencja**: *Panele Szerokogamutowe i Płynne Odświeżanie Obrazu (Era 5)*
* **Urban Mining & Recykling**: Ciężki odlew podstawy ze stopu cynku/aluminium (100% przetopu), cenne szkło matrycy i elektronika logiczna.

---

### Produkt 13 (ID 113): Tablety i Czytniki E-Booków (E-Papier)
* **Okres**: Epoka 6 (2005–2030) $\to$ E7: **Elastyczne E-Notatniki Bezrefleksyjne**.
* **Receptura montażowa**:
  * 1.0 j. Ekran Elektroforetyczny E-Ink / Cienki Panel OLED (L2-DIS)
  * 1.0 j. Płyta Główna SoC Niskiego Poboru Mocy z Pamięcią (L2-CPU + L2-MEM)
  * 1.0 j. Płaska Bateria Li-Polymer w Aluminiowej Obudowie (L2-BAT + L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.42 kg / j.
  * Odpady: 0.03 j. folii laminacyjnych digitizera dotykowego.
* **Triada Produkcyjna**:
  * **Ludzie**: `2 [R]`, `7 [M]`, `3 [E]`
  * **Energia**: **16.0 kWh / j.** (klejenie warstwy dotykowej klejem ciekłym LOCA utwardzanym UV, kalibracja czułości rysika)
  * **Licencja**: *Mikrokapsułkowy Atrament Elektroniczny i Panele Niskonapięciowe (Era 6)*
* **Urban Mining & Recykling**: Cienka bateria Li-Po (lit i kobalt), aluminium ze sztywnego tylnego korpusu, procesor z mikropołączeniami złotymi.

---

### Produkt 14 (ID 114): Słuchawki Bezprzewodowe i Głośniki Smart
* **Okres**: Epoka 6 (2005–2030) $\to$ E7: **Biometryczne Słuchawki TWS z Tłumieniem Hałasu AI**.
* **Receptura montażowa**:
  * 1.0 j. Przetworniki Akustyczne z Silnymi Magnesami Neodymowymi (L2-MOT)
  * 1.0 j. Moduł Łączności Bluetooth DSP z Aktywną Redukcją Szumów (L2-SEN + L2-CPU)
  * 1.0 j. Miniaturowe Ogniwa Bateryjne w Kapsułkach Dokanałowych / Obudowie (L2-BAT + L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.15 kg / j. (słuchawki z etui ładującym).
  * Odpady: 0.02 j. silikonowych końcówek i taśm elastycznych.
* **Triada Produkcyjna**:
  * **Ludzie**: `2 [R]`, `8 [M]`, `3 [E]`
  * **Energia**: **11.0 kWh / j.** (mikromontaż precyzyjny w mikroskopach stereoskopowych, kalibracja fazowa mikrofonów ANC)
  * **Licencja**: *Cyfrowa Redukcja Szumów ANC i Transmisja Prawdziwie Bezprzewodowa TWS (Era 6)*
* **Urban Mining & Recykling**: **Neodym i lantanowce** w miniaturowych magnesach przetwornika (najwyższa gęstość strumienia magnetycznego), lit z miniaturowych pastylek bateryjnych.

---

### Produkt 15 (ID 115): Smartwatche i Opaski Zdrowotne
* **Okres**: Epoka 6 (2005–2030) $\to$ E7: **Ciągłe Monitory Parametrów Życiowych i Glukozy**.
* **Receptura montażowa**:
  * 1.0 j. Optyczny Zespół Czujników Biometrycznych PPG/EKG (L2-SEN)
  * 1.0 j. Zakrzywiony Ekran Micro-OLED / AMOLED z Procesorem (L2-DIS + L2-CPU)
  * 1.0 j. Bateria Zakrzywiona w Kopercie ze Stali / Ceramiki z Paskiem (L2-BAT + L2-CAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.08 kg / j.
  * Odpady: 0.01 j. uszczelek fluoroelastomerowych.
* **Triada Produkcyjna**:
  * **Ludzie**: `1 [R]`, `8 [M]`, `4 [E]`
  * **Energia**: **15.0 kWh / j.** (hermetyzacja wodoszczelna do 50 m ciśnienia, kalibracja spektrofotometryczna diod pomiaru tętna)
  * **Licencja**: *Sensory Nieinwazyjnej Biometrii i Przenośne Urządzenia Telemedyczne (Era 6)*
* **Urban Mining & Recykling**: Piny ładujące ze złocenia galwanicznego, tytan lub ceramika koperty, złoto i miedź z elastycznych płytek FPC.

---

### Produkt 16 (ID 116): Serwery i Macierze Danych dla Chmury
* **Okres**: Epoka 5 (Szafy Rack) $\to$ w Epoce 7: **Eko-Serwery Zanurzeniowe (Chłodzone Cieczą z Odzyskiem Ciepła)**.
* **Receptura montażowa (Wariant E7 – Jednostka Serwerowa 2U Chłodzona Cieczą)**:
  * 2.0 j. Wielordzeniowe Procesory Serwerowe i Pamięci Masowe NVMe (L2-CPU + L2-MEM)
  * 1.0 j. Płyta Główna Wielowarstwowa z Kartami Sieciowymi 400G (L2-PCB + L2-SEN)
  * 1.5 j. Miedziane Bloki Chłodzenia Cieczą i Obudowa Rack ze Stali (L2-CAS + L2-PAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~18.5 kg / j.
  * Odpady: 0.4 j. uszczelek złącz bezwyciekowych cieczy dielektrycznej.
* **Triada Produkcyjna**:
  * **Ludzie**: `1 [R]`, `7 [M]`, `8 [E]`
  * **Energia**: **75.0 kWh / j.** (wielogodzinne procedury certyfikacyjne klastrów pamięci, ciśnieniowe testy szczelności bloków wodnych)
  * **Licencja**: *Wielkoskalowe Przetwarzanie Rozproszone i Bezpośrednie Chłodzenie Cieczą (Era 5/7)*
* **Urban Mining & Recykling**: **Masywny zasób surowcowy**: do 3 g czystego złota, 4 kg miedzi elektrolitycznej, neodym z wentylatorów lewitujących magnetycznie.

---

### Produkt 17 (ID 117): Zestawy Wirtualnej i Rozszerzonej Rzeczywistości (VR/AR)
* **Okres**: Epoka 6 (Headsety VR) $\to$ w Epoce 7: **Lekkie Okulary Przestrzenne AR z Mikroprojektorami Fotonowymi**.
* **Receptura montażowa (Wariant E7 – Okulary AR Waveguide)**:
  * 1.0 j. Mikrowyświetlacze Micro-LED Fotonowe z Soczewkami Falowodowymi (L2-DIS + L1-SZK)
  * 1.0 j. Procesor Przetwarzania Przestrzennego SLAM z Kamerami Śledzącymi (L2-CPU + L2-SEN)
  * 1.0 j. Ultralekka Tytanowo-Polimerowa Oprawa z Baterią Skroniową (L2-CAS + L2-BAT)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.12 kg / j.
  * Odpady: 0.02 j. odpadów nanostruktur falowodowych.
* **Triada Produkcyjna**:
  * **Ludzie**: `1 [R]`, `6 [M]`, `8 [E]`
  * **Energia**: **34.0 kWh / j.** (nanolitografia siatek dyfrakcyjnych w szkle optycznym, kalibracja matrycy śledzenia gałek ocznych w podczerwieni)
  * **Licencja**: *Optyka Falowodowa i Przestrzenne Renderowanie Fotonowe 6DoF (Era 6/7)*
* **Urban Mining & Recykling**: Tytan medyczny oprawek, precyzyjne kryształy optyczne, mikroskopijne złącza ze złota i indu.

---

### Produkt 18 (ID 118): Drony Użytkowe i Fotograficzne
* **Okres**: Epoka 6 (2005–2030) $\to$ E7: **Autonomiczne Drony Inspekcyjne i Ratunkowe AI**.
* **Receptura montażowa**:
  * 1.0 j. Kompozytowa Rama z Silnikami Bezszczotkowymi i Śmigłami (L2-CAS + L2-MOT)
  * 1.0 j. Kontroler Lotu z Modułem Pozycjonowania i Kamerą Gimbal (L2-CPU + L2-SEN)
  * 1.0 j. Akumulator Wysokoprądowy Li-Po o Zwiększonej Gęstości (L2-BAT)
* **Bilans materiałowy**:
  * Masa wyrobu: ~1.4 kg / j.
  * Odpady: 0.07 j. ścinek włókna węglowego i żywicy.
* **Triada Produkcyjna**:
  * **Ludzie**: `3 [R]`, `7 [M]`, `4 [E]`
  * **Energia**: **25.0 kWh / j.** (wygrzewanie kompozytów węglowych w autoklawie, kalibracja kompasów magnetometrycznych i PID)
  * **Licencja**: *Bezzałogowe Systemy Autonomiczne i Nawigacja Wizyjna AI (Era 6)*
* **Urban Mining & Recykling**: Magnesy neodymowe silników wirnika, miedź ze zwojów stojana, lit z pakietu baterii trakcyjnej.

---

### Produkt 19 (ID 119): Komputery Kwantowe Osobiste / Terminale AI
* **Okres**: Epoka 8 (2055–2080) – Przełomowa technologia koherencji w temperaturze pokojowej.
* **Receptura montażowa**:
  * 1.0 j. Procesor Kubitowy QPU z Pętlą Laserową / Nadprzewodzącą (L3-QPU)
  * 1.0 j. Hybrydowy Kontroler Klasyczno-Kwantowy z Szyną Fotonową (L2-CPU + L2-SEN)
  * 1.0 j. Ekranowana Obudowa Mu-Metalowa z Mikrochłodzeniem (L2-CAS + L2-PAS)
* **Bilans materiałowy**:
  * Masa wyrobu: ~3.8 kg / j.
  * Odpady: 0.05 j. odpadów gazów szlachetnych i dielektryków kriogenicznych.
* **Triada Produkcyjna**:
  * **Ludzie**: `0 [R]`, `3 [M]`, `12 [E]`
  * **Energia**: **160.0 kWh / j.** (stabilizacja stanów splątania kubitów, litografia atomowa, kalibracja bramek logiki kwantowej)
  * **Licencja**: *Koherencja Kwantowa w Skali Makro i Algorytmy Odporne na Dekoherecję (Era 8)*
* **Urban Mining & Recykling**: 100% zamknięty obieg surowcowy – całkowity odzysk złota chemicznego, itru, neodymu oraz specjalistycznych kryształów nieliniowych.

---

### Produkt 20 (ID 120): Komunikatory Neuro-Interfejsowe (BCI)
* **Okres**: Epoka 8 (2055–2080) – Bezpośrednie sterowanie myślą, likwidujące fizyczne ekrany i klawiatury.
* **Receptura montażowa**:
  * 1.0 j. Biokompatybilna Matryca Neuro-Elektrod Grafenowo-Złotych (L3-BCI)
  * 1.0 j. Neuromorficzny Układ Dekodowania Fal Mózgowych (L2-CPU + L2-SEN)
  * 1.0 j. Elastyczna Opaska Skroniowa / Dysk Zaubzny z Biożelem (L2-CAS + L2-BAT)
* **Bilans materiałowy**:
  * Masa wyrobu: ~0.04 kg / j.
  * Odpady: 0.005 j. biożeli odpadowych.
* **Triada Produkcyjna**:
  * **Ludzie**: `0 [R]`, `4 [M]`, `10 [E]`
  * **Energia**: **70.0 kWh / j.** (nanomontaż molekularny, enkapsulacja medyczna zapobiegająca odrzuceniu biologicznemu, trening sieci neuronowej)
  * **Licencja**: *Interfejsy Bezpośrednie Mózg-Maszyna i Przetwarzanie Neuromorficzne (Era 8)*
* **Urban Mining & Recykling**: Czyste złoto mikroelektrod (99.99%), biopolimery ulegające biodegradacji bez śladu mikroplastiku w środowisku.

---

## 5. Zbiorcza Macierz Bilansu Masowo-Energetycznego (20 Produktów)

Poniższa tabela stanowi bazę danych bezpośrednio zasilającą silnik gry (Game Engine) w zakresie kosztów energii, struktury zatrudnienia i zapotrzebowania na kluczowe komponenty:

| # | Nazwa Produktu Końcowego | Epoka | Główne Składniki Wsadowe (L2/L3) | Energia [kWh/j.] | Kadra [R / M / E] | Waga [kg] | Wartość Odzysku Urban Mining |
| :-: | :--- | :-: | :--- | :-: | :-: | :-: | :--- |
| **1** | Odbiorniki Radiowe Tranzystorowe | 4 | PCB + Elem. Pasywne + Obudowa Bakelitowa | 6.5 | 8 / 3 / 0 | 1.2 kg | Średnia (Miedź) |
| **2** | Telewizory Kineskopowe / OLED | 4 $\to$ 6 | Matryca OLED + Płyta Główna + Rama Aluminiowa | 32.0 | 5 / 6 / 2 | 14.0 kg | Wysoka (Alu, Miedź, Szkło) |
| **3** | Telefony Stacjonarne Tarczowe | 4 | Obudowa ABS + Płyta Tłumika + Dzwonek | 4.5 | 7 / 2 / 0 | 1.1 kg | Średnia (Plastik ABS, Mosiądz) |
| **4** | Magnetofony i Gramofony Hi-Fi / CD | 4 $\to$ 5 | Mechanizm Audio + Płyta DAC + Panel Alu | 14.5 | 4 / 6 / 1 | 5.5 kg | Wysoka (Alu, Miedź, Złocenia) |
| **5** | Kalkulatory Elektroniczne | 4 | Układ LSI + Wyświetlacz LED + Obudowa | 3.2 | 4 / 4 / 0 | 0.18 kg | Niska (Złoto mikronowe) |
| **6** | Aparaty Foto Analogowe / Cyfrowe | 4 $\to$ 6 | Sensor CMOS + Optyka Szkło + Korpus Stop | 21.0 | 2 / 7 / 4 | 0.85 kg | Wysoka (Magnez, Złoto, Optyka) |
| **7** | Komputery Osobiste PC | 5 $\to$ 7 | Płyta CPU + Pamięć RAM/SSD + Zasilacz/Obudowa| 26.0 | 3 / 7 / 3 | 8.0 kg | **Bardzo Wysoka (Złoto, Miedź)** |
| **8** | Laptopy i Notebooki | 5 $\to$ 7 | Płyta SoC + Ekran IPS/OLED + Bateria/Unibody | 22.5 | 3 / 8 / 3 | 1.6 kg | **Bardzo Wysoka (Lit, Złoto, Alu)** |
| **9** | Telefony Komórkowe / Smartfony | 5 $\to$ 6/7| Płyta SoC + Ekran AMOLED/Cam + Bateria/Rama | 28.0 | 2 / 9 / 5 | 0.21 kg | **Krytyczna (Złoto, Lit, Neodym)** |
| **10** | Drukarki Biurowe / Drukarki 3D | 5 $\to$ 7 | Silniki BLDC + Ekstruder/Głowica + Kontroler | 18.0 | 4 / 6 / 2 | 9.5 kg | Wysoka (Alu, Miedź, Stal) |
| **11** | Routery i Urządzenia Wi-Fi | 5 | Procesor NPU + Moduł RF/MIMO + Obudowa | 12.0 | 2 / 7 / 3 | 0.75 kg | Średnia (Alu, Złocenia) |
| **12** | Monitory Komputerowe | 5 | Panel Matrycy + Płyta Skalera + Podstawa Alu | 19.5 | 4 / 6 / 1 | 6.2 kg | Wysoka (Alu, Szkło, Złoto) |
| **13** | Tablety i Czytniki E-Booków | 6 | Ekran E-Ink/OLED + Płyta SoC + Bateria Slim | 16.0 | 2 / 7 / 3 | 0.42 kg | Wysoka (Lit, Alu, Złoto) |
| **14** | Słuchawki Bezprzewodowe / Smart | 6 | Przetwornik Neodym + DSP ANC + Bateria TWS | 11.0 | 2 / 8 / 3 | 0.15 kg | **Krytyczna (Neodym, Lit)** |
| **15** | Smartwatche i Opaski Zdrowotne | 6 | Sensor PPG/EKG + Ekran Micro-OLED + Bateria | 15.0 | 1 / 8 / 4 | 0.08 kg | Wysoka (Złoto, Ceramika, Lit) |
| **16** | Serwery i Macierze Chmury | 5 $\to$ 7 | 2x CPU/NVMe + Płyta 400G + Chłodzenie Cieczą | 75.0 | 1 / 7 / 8 | 18.5 kg | **Krytyczna (Złoto, Miedź, Neodym)**|
| **17** | Zestawy VR/AR i Okulary Smart | 6 $\to$ 7 | Micro-LED Falowody + Procesor SLAM + Oprawa | 34.0 | 1 / 6 / 8 | 0.12 kg | Wysoka (Tytan, Złoto, Ind) |
| **18** | Drony Użytkowe i Fotograficzne | 6 | Rama Kompozyt + Silniki BLDC + Bateria Li-Po | 25.0 | 3 / 7 / 4 | 1.4 kg | Wysoka (Neodym, Lit, Węgiel) |
| **19** | Komputery Kwantowe Terminale AI | 8 | Moduł QPU + Kontroler Fotonowy + Obudowa Mu | 160.0 | 0 / 3 / 12| 3.8 kg | **Krytyczna (Złoto, Itr, Ziemie Rz.)**|
| **20** | Komunikatory Neuro-Interfejsowe| 8 | Elektrody BCI + Układ Neuromorficzny + Opaska| 70.0 | 0 / 4 / 10| 0.04 kg | Wysoka (Złoto 99.99%, Biopolimery)|

---

## 6. Wnioski Procesowe dla Mechaniki Gry

1. **Rola Energetyki w Zaawansowanej Elektronice**:
   * Zapotrzebowanie energetyczne rośnie skokowo wraz z przechodzeniem na kolejne epoki (od 3–6 kWh dla prostej elektroniki analogowej do 75–160 kWh dla serwerów i komputerów kwantowych).
   * Produkcja podzespołów mikroelektronicznych (L2-WAF: 65 kWh, L2-CPU: 85 kWh) wymaga stabilnego przydziału mocy – zakłócenia w miejskiej sieci energetycznej powodują natychmiastowe straty wsadów w procesach krystalizacji i fotolitografii.

2. **Zapotrzebowanie na Kadrę Specjalistyczną i Naukową**:
   * Od Epoki 5 (narodziny ery mikroprocesorowej) udział robotników `[R]` dramatycznie maleje na rzecz specjalistów `[M]` i naukowców `[E]`.
   * Wytwarzanie produktów Epoki 8 (Komputery Kwantowe, Neuro-Interfejsy) całkowicie eliminuje pracę fizyczną `[R]` – procesy realizowane są w 100% przez roboty przemysłowe sterowane przez zespoły badawcze `[E]`. Miasta inwestujące w uniwersytety i edukację mają gigantyczną przewagę konkurencyjną w Branży 6.

3. **Gospodarka Cyrkularna i Urban Mining**:
   * Złoto, neodym, lit i miedź zużywane w produktach Branży 6 generują najwyższą stopę zwrotu w miejskich **Zakładach Recyklingu**.
   * Korporacje wdrażające modułowe standardy naprawy (Laptopy Fair-Tech, Modułowe Smartfony) w Epoce 7 uzyskują maksymalne oceny wskaźnika **Eko-Etyki** (do 100 pkt) oraz drastycznie obniżają progresywny podatek odpadowy (odciążając miejskie wysypiska).
