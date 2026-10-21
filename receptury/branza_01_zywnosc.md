# Branża 1: Żywność i Napoje – Receptury i Bilans Masowo-Energetyczny

> **Dokumentacja Inżynierii Procesowej dla 20 Produktów Końcowych i Komponentów L1/L2/L3**  
> *Zgodna ze standardami GDD v5.0, Katalogu Danych Gry oraz Załącznika Technologicznego Drzew Produkcyjnych.*

---

## 1. Założenia i Metodologia Inżynieryjna

Każdy proces produkcyjny w grze opiera się na **Triadzie Produkcyjnej**:
1. **Bilans Masowo-Energetyczny**: Wsad surowcowy/półproduktowy + Nakład energii w `kWh` $\to$ Produkt wyjściowy + Ewentualne produkty uboczne/odpady.
2. **Kadra Pracownicza**: Obsada stanowiskowa z podziałem na klasy: `[R]` Robotnicy (manualna/maszynowa praca), `[M]` Specjaliści/Klasa Średnia (technolodzy, automatycy, kontrola jakości), `[E]` Naukowcy/Elita (biotechnolodzy, biochemicy, inżynierowie genetyczni).
3. **Wymóg Technologiczny**: Licencja lub węzeł w Drzewku Technologii odblokowywany w odpowiedniej Epoce.
4. **Wielowariantowość Energetyczna**: Każdy zakład może pracować na:
   - **Zasilaniu w 100% z Miejskiej Sieci Elektroenergetycznej** (zakup kWh),
   - **Kogeneracji / Spalaniu na miejscu**: Zastąpienie części energii cieplnej (suszenie, pasteryzacja, sterylizacja, warzenie, wypiek) bezpośrednim spalaniem paliw pierwotnych (Węgiel, Drewno, Gaz Ziemny, Biogaz, Wodór).

---

## 2. Receptury Produkcyjne dla 20 Produktów Branży 1

---

### 1. Chleb i Pieczywo Tradycyjne (Epoka 1)
*Podstawowy produkt węglowodanowy zapewniający zaspokojenie głodu robotników i mieszkańców.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Pszenica + 1 kWh = 1 Mąka Pszenna
  - **Krok L1**: 1 Burak Cukrowy + 2 kWh = 1 Melasa Cukrowa
  - **Krok L1**: 1 Sól Kamienna + 1 kWh = 1 Sól Oczyszczona
  - **Krok L2**: 1 Melasa Cukrowa + 1 Mąka Pszenna + 2 kWh = 1 Drożdże Przemysłowe
  - **Krok Końcowy**: 2 Mąka Pszenna + 1 Drożdże Przemysłowe + 1 Sól Oczyszczona + 3 kWh = 1 Chleb Tradycyjny (partia produkcyjna)
* **Obsada pracownicza**: `6 [R]` (piekarze, ciastowi, obsługa pieca), `1 [M]` (mistrz piekarski / kontrola partii).
* **Wymagana technologia/licencja**: *Technologia Piekarnicza (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh energii elektrycznej na krok pieczenia (piece oporowe/ceramiczne).
  - *Opcja termiczna na miejscu*: Spalenie **0.5 kg Węgla Kamiennego** lub **1.2 kg Drewna Opałowego** w piecu wsadowym (zastępuje 2 kWh prądu cieplnego; 1 kWh pozostaje na mieszałki mechaniczne). W Erze 6: piec na **0.3 m³ Biogazu**.
* **Odpady i cyrkularność**: Resztki ciasta i pieczywo czerstwe $\to$ Kompost / Pasza dla Bydła.

---

### 2. Mięso Solone i Wędliny (Epoka 1)
*Klasyczne wyroby mięsne peklowane i wędzone, odporne na zepsucie bez użycia lodówek elektrycznych.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 1 Bydło + 4 kWh = 2 Mięso Surowe (+ 1 Odpady Rzeźne/Skóra)
  - **Krok L1**: 1 Sól Kamienna + 1 kWh = 1 Sól Oczyszczona
  - **Krok L1/L2**: 1 Drewno Okrągłe + 2 kWh = 2 Zrębki Wędzarnicze i Tektura
  - **Krok Końcowy**: 2 Mięso Surowe + 1 Sól Oczyszczona + 1 Zrębki Wędzarnicze i Tektura + 3 kWh = 1 Mięso Solone i Wędliny
* **Obsada pracownicza**: `8 [R]` (rzeźnicy, wędzarze, pakowacze), `2 [M]` (lekarz weterynarii, kierownik masarni).
* **Wymagana technologia/licencja**: *Konserwacja Żywności (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh energii elektrycznej (komory klimatyzacyjne, wędzarnie elektryczne).
  - *Opcja termiczna na miejscu*: Tradycyjne wędzenie dymem z **1.0 kg Drewna Liściastego / Zrębków** (dostarcza dym i ciepło suszenia, redukując pobór prądu do 1 kWh na rozdrabniarki).
* **Odpady i cyrkularność**: Kości i skóry poubojowe $\to$ surowiec do produkcji *Żelatyny (L2)*; resztki organiczne $\to$ Biomasa.

---

### 3. Konserwy Mięsne i Rybne (Epoka 1)
*Długoterminowa żywność apertyzowana w metalowych puszkach, niezbędna dla wojska, transportu dalekomorskiego i rezerw miejskich.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 1 Bydło + 4 kWh = 2 Mięso Surowe
  - **Krok L1**: 1 Sól Kamienna + 1 kWh = 1 Sól Oczyszczona
  - **Krok L1**: 1 Ruda Żelaza + 1 Węgiel Kamienny + 6 kWh = 1 Surówka Hutnicza
  - **Krok L2**: 1 Surówka Hutnicza + 3 kWh = 1 Blacha Cynowana -> 1 Blacha Cynowana + 1 kWh = 2 Puszka Metalowa
  - **Krok Końcowy**: 2 Mięso Surowe + 1 Sól Oczyszczona + 1 Puszka Metalowa + 4 kWh = 1 Konserwy Mięsne
* **Obsada pracownicza**: `10 [R]` (operatorzy krajalnic, zamykarek puszek i autoklawów), `2 [M]` (inspektor sterylizacji i jakości).
* **Wymagana technologia/licencja**: *Apertyzacja i Pasteryzacja (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 4 kWh na partię (autoklaw parowy ciśnieniowy 121°C + zamykarki).
  - *Opcja termiczna na miejscu*: Wytworzenie pary technologicznej przez kocioł parowy spalający **0.8 kg Węgla Kamiennego** (lub **0.5 m³ Gazu Ziemnego** w Erze 3, **0.5 m³ Biogazu** w Erze 6).
* **Odpady i cyrkularność**: Puszka z blachy stalowej $\to$ 100% odzysku jako *Złom Stalowy Przygotowany* w hucie.

---

### 4. Nabiał (Masło, Sery, Mleko) (Epoka 1)
*Kompleksowy strumień produktów mleczarskich dostarczający pełnowartościowego białka i tłuszczów zwierzęcych.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 1 Bydło (stado mleczne) + 3 kWh = 3 Mleko Surowe
  - **Krok L1/L2**: 1 Drewno Okrągłe + 5 kWh = 1 Celuloza -> 1 Celuloza + 2 kWh = 2 Karton Opakowaniowy (lub 1 Piasek Kwarcowy + 4 kWh = 2 Butelka Szklana)
  - **Krok L2**: 2 Mleko Surowe + 2 kWh = 1 Masło i Tłuszcze Mleczne (+ serwatka odpadowa)
  - **Krok Końcowy**: 2 Mleko Surowe + 1 Masło i Tłuszcze Mleczne + 1 Karton Opakowaniowy + 3 kWh = 1 Nabiał (Mleko UHT / Ser / Masło)
* **Obsada pracownicza**: `8 [R]` (dojarze mechaniczni, operatorzy wirówek i pasteryzatorów), `2 [M]` (mikrobiolog mleczarski, technolog przetwórstwa).
* **Wymagana technologia/licencja**: *Przetwórstwo Mleczarskie (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh (chłodzenie zbiorników do 4°C, pasteryzacja płytowa 72°C).
  - *Opcja termiczna na miejscu*: Zasilanie wymienników pasteryzatora z kotła na **0.4 kg Węgla** lub **0.35 m³ Gazu/Biogazu**. Chłodnictwo zasilane elektrycznie.
* **Odpady i cyrkularność**: Serwatka odpadowa $\to$ surowiec do kazeiny i bio-odżywek; karton $\to$ Makulatura.

---

### 5. Cukierki i Wyroby Cukiernicze (Epoka 1)
*Tradycyjne słodycze, landrynki i karmelki podnoszące zadowolenie i morale społeczne.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Buraki Cukrowe + 3 kWh = 2 Cukier
  - **Krok L1**: 1 Bydło (odpady kolagenowe) + 2 kWh = 1 Żelatyna i Kolagen
  - **Krok L2**: 1 Cukier + 1 kWh = 1 Syrop Cukrowy i Melasa
  - **Krok L2**: 2 Jabłka + 1 Cukier + 2 kWh = 1 Koncentrat Owocowy
  - **Krok L2**: 1 Drewno Okrągłe + 4 kWh = 2 Papier Woskowany i Owijki
  - **Krok Końcowy**: 1 Syrop Cukrowy + 1 Koncentrat Owocowy + 1 Żelatyna + 1 Papier Woskowany + 3 kWh = 1 Cukierki i Wyroby Cukiernicze
* **Obsada pracownicza**: `6 [R]` (obsługa kotłów karmelarskich, matryc formujących), `1 [M]` (mistrz cukiernik).
* **Wymagana technologia/licencja**: *Rafinacja Cukru (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh na partię (elektryczne warniki próżniowe).
  - *Opcja termiczna na miejscu*: Gotowanie masy karmelowej parą z kotła na **0.6 kg Węgla Kamiennego** lub **0.4 m³ Gazu Ziemnego**.
* **Odpady i cyrkularność**: Odpady cukrowe rozpuszczalne $\to$ fermentacja na bioetanol lub dodatek do pasz.

---

### 6. Piwo i Cydr (Epoka 1)
*Niskoalkoholowe napoje fermentowane będące fundamentem kultury pubowej i regeneracji klasy robotniczej.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Pszenica + 2 kWh = 2 Słód Jęczmienny/Pszenny (Słodownia)
  - **Krok L1**: 1 Burak Cukrowy + 2 kWh = 1 Cukier -> + 1 Mąka Pszenna + 2 kWh = 1 Drożdże Przemysłowe
  - **Krok L1/L2**: 1 Piasek Kwarcowy + 5 kWh = 2 Szkło Butelkowe (Huta Szkła)
  - **Krok Końcowy**: 2 Słód + 1 Drożdże Przemysłowe + 2 Szkło Butelkowe + 4 kWh = 1 Piwo i Cydr (Warka w Browarze)
* **Obsada pracownicza**: `8 [R]` (warzelnicy, filtracja, obsługa linii rozlewniczej), `2 [M]` (piwowar główny, analityk laboratoryjny).
* **Wymagana technologia/licencja**: *Fermentacja Przemysłowa (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 4 kWh na warkę (gotowanie brzeczki, chłodzenie fermentorów, myjka butelek).
  - *Opcja termiczna na miejscu*: Kotłownia browarna opalana **0.8 kg Węgla** (Era 1) lub **0.6 m³ Biogazu z wysłodzin browarnianych** (zamknięty obieg w Erze 6).
* **Odpady i cyrkularność**: Wysłodziny (młóto browarne) $\to$ wysokobiałkowa pasza dla bydła lub wsad do biogazowni; butelki szklane zwrotne $\to$ stłuczka szklana (100% recyklingu).

---

### 7. Alkohole Wysokoprocentowe (Epoka 1)
*Destylaty zbożowe (wódka, whisky, spirytus techniczny) o wysokiej wartości handlowej i podatkowej.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 3 Pszenica + 2 kWh = 2 Zacier Zbożowy (Gorzelnia rolnicza)
  - **Krok L1/L2**: 1 Drewno Okrągłe + 3 kWh = 1 Beczki Dębowe / Skrzynie
  - **Krok L1/L2**: 1 Piasek Kwarcowy + 5 kWh = 2 Szkło Butelkowe
  - **Krok Końcowy**: 2 Zacier Zbożowy + 1 Szkło Butelkowe + 1 Beczki Dębowe + 6 kWh = 1 Alkohole Wysokoprocentowe (Destylarnia)
* **Obsada pracownicza**: `6 [R]` (obsługa kotłów zaciernych, logistyka beczek), `2 [M]` (mistrz destylacji, kontroler akcyzowo-chemiczny).
* **Wymagana technologia/licencja**: *Destylacja Frakcyjna (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 6 kWh (energochłonne odparowanie w kolumnie rektyfikacyjnej).
  - *Opcja termiczna na miejscu*: Spalenie **1.2 kg Węgla Kamiennego** lub **0.8 m³ Gazu Ziemnego / Biometanu** do zasilania deflegmatorów i kotłów parowych.
* **Odpady i cyrkularność**: Wywar gorzelniany $\to$ suszony na paszę (DDGS) lub substrat biogazowy o wysokim uzysku metanu.

---

### 8. Kawa i Herbata Pakowana (Epoka 1)
*Ekskluzywne używki kolonialne stymulujące produktywność i zadowolenie klas średnich i elity.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Importowane Surowe Ziarna Kawy/Herbaty + 2 kWh = 1 Ziarna Palone / Susz Herbaciany
  - **Krok L1/L2**: 1 Drewno Okrągłe + 5 kWh = 1 Celuloza -> 1 Celuloza + 2 kWh = 2 Karton Opakowaniowy i Saszetki Papierowe
  - **Krok Końcowy**: 1 Ziarna Palone / Susz Herbaciany + 1 Karton Opakowaniowy + 2 kWh = 1 Kawa i Herbata Pakowana (Palarnia i Pakowalnia)
* **Obsada pracownicza**: `4 [R]` (operatorzy pieców bębnowych, pakowaczki), `1 [M]` (roaster / kiper kawowy).
* **Wymagana technologia/licencja**: *Logistyka Towarów Kolonialnych (Era 1)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 2 kWh (piece bębnowe konwekcyjne, wagi wielogłowicowe).
  - *Opcja termiczna na miejscu*: Palniki pieca prażalniczego na **0.3 m³ Gazu Ziemnego** lub spalanie odpadów łusek kawowych (biomasa własna).
* **Odpady i cyrkularność**: Łuski kawowe $\to$ kompostowanie; opakowania kartonowe $\to$ recykling celulozy.

---

### 9. Makarony Pszenne (Epoka 2)
*Trwała sucha żywność mączna o długiej dacie przydatności, masowo produkowana w zurbanizowanych miastach.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Pszenica (Semolina/Durum) + 1 kWh = 1 Mąka Pszenna
  - **Krok L1/L2**: 1 Drewno Okrągłe + 5 kWh = 1 Celuloza -> 1 Celuloza + 2 kWh = 2 Karton Opakowaniowy
  - **Krok Końcowy**: 2 Mąka Pszenna + 1 Karton Opakowaniowy + 3 kWh = 1 Makarony Pszenne (Tłocznia matrycowa i tunele suszarnicze)
* **Obsada pracownicza**: `6 [R]` (obsługa ekstruderów makaronowych, układarki na sita), `1 [M]` (technolog wilgotności i suszenia).
* **Wymagana technologia/licencja**: *Przetwórstwo Spożywcze Epoki 2*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh (wysokociśnieniowe prasy ślimakowe, suszenie konwekcyjne 60-80°C).
  - *Opcja termiczna na miejscu*: Nadmuch ciepłego powietrza z nagrzewnicy na **0.4 m³ Gazu Ziemnego** lub ciepła sieciowego z elektrociepłowni CHP.
* **Odpady i cyrkularność**: Ścinki makaronowe zawracane w 100% do powtórnego zagniecenia ciasta. Karton $\to$ recykling.

---

### 10. Soki i Napoje Butelkowane (Epoka 2)
*Pasteryzowane soki owocowe i nektary, dostarczające witamin dla mieszkańców rozwijających się metropolii.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 3 Jabłka + 2 kWh = 2 Koncentrat Owocowy
  - **Krok L1**: 1 Burak Cukrowy + 2 kWh = 1 Cukier
  - **Krok L1/L2 (Era 2)**: 1 Piasek Kwarcowy + 5 kWh = 2 Szkło Butelkowe *(W Erze 4: 1 Ropa Naftowa + 3 kWh = 2 Plastikowe Butelki PET)*
  - **Krok Końcowy**: 2 Koncentrat Owocowy + 1 Cukier + 2 Szkło Butelkowe (lub PET) + 2 kWh = 1 Soki i Napoje Butelkowane
* **Obsada pracownicza**: `6 [R]` (płuczki, prasy taśmowe, obsługa monobloku rozlewniczego), `2 [M]` (laborant mikrobiologiczny, automatyk linii).
* **Wymagana technologia/licencja**: *Pasteryzacja Płynów (Era 2)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 2 kWh (pasteryzator przepływowy rurowy, napełniarki aseptyczne).
  - *Opcja termiczna na miejscu*: Kocioł parowy na **0.35 m³ Gazu Ziemnego** lub **0.5 kg Węgla** (w Epoce 2).
* **Odpady i cyrkularność**: Wytłoki jabłkowe $\to$ produkcja pektyn spożywczych lub kompost; butelki $\to$ mycie i ponowny rozlew lub huta szkła.

---

### 11. Margaryna i Tłuszcze Roślinne (Epoka 2)
*Tani, stabilny termicznie tłuszcz spożywczy otrzymywany drogą chemicznego uwodornienia olejów roślinnych.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 3 Słoneczniki + 2 kWh = 2 Olej Słonecznikowy (Tłocznia i rafinacja)
  - **Krok L1**: 1 Sól Kamienna + 1 kWh = 1 Sól Oczyszczona
  - **Krok L1/L2**: 1 Gaz Ziemny + 3 kWh = 1 Wodór Przemysłowy (Reforming parowy)
  - **Krok L1/L2**: 1 Drewno Okrągłe + 3 kWh = 2 Papier Woskowany / Kubki
  - **Krok Końcowy**: 2 Olej Słonecznikowy + 1 Wodór Przemysłowy + 1 Sól Oczyszczona + 1 Papier Woskowany + 3 kWh = 1 Margaryna i Tłuszcze Roślinne
* **Obsada pracownicza**: `8 [R]` (operatorzy reaktorów uwodornienia, pakowaczki kostkujące), `2 [M]` (inżynier chemik procesowy, kierownik BHP).
* **Wymagana technologia/licencja**: *Uwodornianie Tłuszczów (Era 2)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh (kompresory gazowe, agregaty krystalizatorów ze schładzaniem do 10°C).
  - *Opcja termiczna na miejscu*: Gaz procesowy spalany w nagrzewnicy reaktora (**0.4 m³ Gazu Ziemnego**).
* **Odpady i cyrkularność**: Wytłoki słonecznikowe (makuchy) $\to$ cenna pasza białkowa dla bydła.

---

### 12. Czekolada i Słodycze Masowe (Epoka 2)
*Zaawansowany wyrób cukierniczy na bazie kakao i tłuszczów, będący towarem luksusowym i konsumpcyjnym.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Importowane Ziarno Kakaowe + 3 kWh = 1 Masło Kakaowe + 1 Miazga Kakaowa
  - **Krok L1**: 1 Burak Cukrowy + 2 kWh = 1 Cukier
  - **Krok L1**: 2 Bydło (Mleko) + 3 kWh = 1 Proszek Mleczny
  - **Krok L1/L2**: 1 Boksyt + 8 kWh = 1 Aluminium Hutnicze -> 1 Aluminium + 2 kWh = 2 Folia Aluminiowa
  - **Krok Końcowy**: 1 Masło Kakaowe + 1 Miazga Kakaowa + 1 Cukier + 1 Proszek Mleczny + 1 Folia Aluminiowa + 4 kWh = 1 Czekolada i Słodycze Masowe
* **Obsada pracownicza**: `8 [R]` (młynarze walcowi, obsługa linii temperowania i zawijarek), `2 [M]` (mistrz czekoladziarstwa, technolog reologii).
* **Wymagana technologia/licencja**: *Technologia Cukiernicza (Era 2)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 4 kWh (długotrwałe konszowanie mechaniczne 24h w 60°C, chłodzenie tunelowe).
  - *Opcja termiczna na miejscu*: Ogrzewanie płaszcza wodnego konszy parą z kotła gazowego (**0.5 m³ Gazu**).
* **Odpady i cyrkularność**: Folia aluminiowa $\to$ odzysk w hucie aluminium (95% oszczędności energii względem boksytu).

---

### 13. Mrożonki Warzywne i Dania Gotowe (Epoka 3)
*Głęboko mrożone kompozycje warzywne i posiłki semi-gotowe, oszczędzające czas pracujących rodzin w Epoce 3.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 3 Jabłka / Warzywa Polowe + 1 kWh = 2 Warzywa Oczyszczone i Blanszowane
  - **Krok L1**: 1 Pszenica + 1 kWh = 1 Mąka Pszenna
  - **Krok L1/L2**: 1 Ropa Naftowa + 4 kWh = 1 Granulat Polimerowy -> 1 Granulat + 1 kWh = 2 Folia Mrozoodporna LDPE
  - **Krok Końcowy**: 2 Warzywa Blanszowane + 1 Mąka Pszenna + 1 Folia Mrozoodporna + 6 kWh = 1 Mrożonki Warzywne i Dania Gotowe
* **Obsada pracownicza**: `10 [R]` (blanszowanie, inspekcja taśmowa, pakowanie próżniowe), `2 [M]` (inżynier instalacji chłodniczych amoniakalnych, kontrola fitosanitarna).
* **Wymagana technologia/licencja**: *Chłodnictwo Przemysłowe (Era 3)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 6 kWh (energochłonne tunele zamrażalnicze IQF -35°C i mroźnia składowa -18°C).
  - *Opcja kogeneracyjna*: Gazowy agregat CHP produkujący prąd na kompresory chłodnicze + odzysk ciepła ze spalin na parę do blanszownika warzyw.
* **Odpady i cyrkularność**: Obierki i odpady warzywne $\to$ miejska biogazownia fermentacyjna.

---

### 14. Płatki Śniadaniowe (Epoka 3)
*Ekstrudowane, chrupkie płatki zbożowe wzbogacane witaminami, symbol nowoczesnego, szybkiego śniadania.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Pszenica + 1 kWh = 1 Mąka Pszenna
  - **Krok L1**: 1 Burak Cukrowy + 2 kWh = 1 Cukier
  - **Krok L1/L2**: 1 Drewno Okrągłe + 5 kWh = 1 Celuloza -> 1 Celuloza + 2 kWh = 1 Karton z Nadrukiem
  - **Krok L2**: 1 Pszenica + 1 kWh = 1 Słód
  - **Krok Końcowy**: 2 Mąka Pszenna + 1 Cukier + 1 Słód + 1 Karton + 4 kWh = 1 Płatki Śniadaniowe
* **Obsada pracownicza**: `8 [R]` (operatorzy ekstrudera, bębnów drażujących i kartoniarek), `2 [M]` (dietetyk przemysłowy, kierownik automatyki).
* **Wymagana technologia/licencja**: *Ekstruzja Zbóż (Era 3)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 4 kWh (wysokociśnieniowy silnik wytłaczarki HTST, piec prażący elektryczny).
  - *Opcja termiczna na miejscu*: Palnik gazowy w piecu prażalniczym i suszarni (**0.45 m³ Gazu Ziemnego** lub **Biogazu**).
* **Odpady i cyrkularność**: Pył mączny i skrobiowy $\to$ wychwyt cyklonowy i recykling do wsadu; karton zewnętrzny $\to$ makulatura.

---

### 15. Napoje Gazowane (Soda / Cola) (Epoka 3)
*Orzeźwiające, nasycone CO2 słodkie napoje w puszkach aluminiowych, generujące ogromny obrót handlowy.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Buraki Cukrowe + 3 kWh = 2 Cukier
  - **Krok L1**: 1 Gaz Ziemny (lub spaliny bio) + 1 kWh = 1 Dwutlenek Węgla Spożywczy (CO2)
  - **Krok L1/L2**: 1 Boksyt + 8 kWh = 1 Aluminium Hutnicze -> 1 Aluminium + 2 kWh = 2 Puszka Aluminiowa
  - **Krok L2**: 1 Cukier + 1 kWh = 1 Syrop Karmelowo-Smakowy
  - **Krok Końcowy**: 1 Syrop Karmelowo-Smakowy + 1 Dwutlenek Węgla Spożywczy + 2 Puszka Aluminiowa + 3 kWh = 1 Napoje Gazowane
* **Obsada pracownicza**: `8 [R]` (operatorzy saturatorów, karuzeli puszkujących i paletyzatorów), `2 [M]` (automatyk przemysłowy, kontroler jakości chemicznej).
* **Wymagana technologia/licencja**: *Karbonizacja Przemysłowa (Era 3)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh (karbonizatory ciśnieniowe, schładzanie wody do 4°C przed saturacją, napełniarki izobaryczne).
  - *Opcja termiczna na miejscu*: Odzysk CO2 z lokalnych spalin biogazowni lub browaru (zero-net emissions) + gazowy kocioł myjek puszek (**0.3 m³ Gazu**).
* **Odpady i cyrkularność**: Puszka aluminiowa $\to$ 95% oszczędności surowca w zamkniętym obiegu recyklingu.

---

### 16. Fast-Food i Przekąski Słone (Chipsy) (Epoka 4)
*Przekąski smażone na głębokim tłuszczu, pakowane w atmosferze azotu w zaawansowane folie barierowe.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 3 Pszenica / Ziemniaki + 1 kWh = 2 Plastry Skrobiowe
  - **Krok L1**: 2 Słoneczniki + 2 kWh = 1 Olej Słonecznikowy Rafinowany
  - **Krok L1**: 1 Sól Kamienna + 1 kWh = 1 Sól Oczyszczona
  - **Krok L2**: 1 Ropa Naftowa + 1 Boksyt + 4 kWh = 2 Folia Metalizowana Wielowarstwowa
  - **Krok Końcowy**: 2 Plastry Skrobiowe + 1 Olej Słonecznikowy + 1 Sól Oczyszczona + 1 Folia Metalizowana + 4 kWh = 1 Fast-Food i Przekąski Słone
* **Obsada pracownicza**: `10 [R]` (obsługa ciągłych frytownic przelotowych, bębnów solących, zgrzewarek), `2 [M]` (technolog tłuszczów, audytor bezpieczeństwa żywności).
* **Wymagana technologia/licencja**: *Głębokie Smażenie Ciągłe (Era 4)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 4 kWh (grzałki zanurzeniowe frytownicy, pompy obiegowe oleju, pakowarki pionowe).
  - *Opcja termiczna na miejscu*: Palnik na **0.5 m³ Gazu Ziemnego** podgrzewający bezpośrednio wymiennik oleju termalnego.
* **Odpady i cyrkularność**: Zużyty przepracowany olej posmażalniczy (UCO) $\to$ surowiec do produkcji *Biodiesla (L2)*; folia wielowarstwowa $\to$ opłata ROP (trudny recykling).

---

### 17. Odżywki dla Dzieci i Żywność Medyczna (Epoka 5)
*Sterylne, zbilansowane pod kątem mikroelementów preparaty żywieniowe dla niemowląt i pacjentów szpitalnych.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 3 Bydło (Mleko) + 3 kWh = 2 Mleko Zdemineralizowane
  - **Krok L1**: 1 Burak Cukrowy + 2 kWh = 1 Laktoza Farmaceutyczna
  - **Krok L2**: 2 Mleko Zdemineralizowane + 3 kWh = 1 Kazeina i Proszek Mleczny Aseptyczny
  - **Krok L2**: 1 Pszenica + 2 kWh = 1 Błonnik Prebiotyczny (FOS/GOS)
  - **Krok L2**: 1 Boksyt + 5 kWh = 1 Szczelna Puszka Aluminiowa z Membraną
  - **Krok Końcowy**: 1 Kazeina i Proszek Mleczny + 1 Błonnik Prebiotyczny + 1 Laktoza Farmaceutyczna + 1 Szczelna Puszka + 5 kWh = 1 Odżywki dla Dzieci i Żywność Medyczna
* **Obsada pracownicza**: `4 [R]` (operatorzy strefy pakowania aseptycznego), `6 [M]` (analitycy farmaceutyczni, technolodzy żywienia klinicznego), `2 [E]` (biochemicy, specjaliści immunologii żywienia).
* **Wymagana technologia/licencja**: *Żywienie Kliniczne (Era 5)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 5 kWh (wieża suszarnicza rozpyłowa, filtry absolutne HEPA H14, sterylizacja gazowa komory).
  - *Opcja termiczna na miejscu*: Kocioł czystej pary farmaceutycznej zasilany gazem ziemnym (**0.6 m³ Gazu**) lub energią elektryczną.
* **Odpady i cyrkularność**: Odrzucone partie proszku z rozruchu instalacji $\to$ pasza dla zwierząt; puszki $\to$ metal recyklingowany.

---

### 18. Napoje Roślinne (Owsiane / Słonecznikowe) (Epoka 6)
*Wegańskie substytuty mleka krowiego o niskim śladzie wodnym i węglowym, wzbogacane minerałami z alg morskich.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Pszenica (lub Owies) + 2 kWh = 1 Hydrolizowana Baza Zbożowa
  - **Krok L1**: 1 Słoneczniki + 1 kWh = 1 Olej Słonecznikowy Tłoczony na Zimno
  - **Krok L1**: 1 Algi Morskie + 2 kWh = 1 Kompleks Wapnia i Mikroelementów z Alg
  - **Krok L1/L2**: 1 Drewno Okrągłe + 4 kWh = 2 Karton Aseptyczny Biodegradowalny
  - **Krok Końcowy**: 1 Hydrolizowana Baza Zbożowa + 1 Olej Słonecznikowy + 1 Kompleks z Alg + 1 Karton Aseptyczny + 2 kWh = 1 Napoje Roślinne
* **Obsada pracownicza**: `4 [R]` (rozładunek, linia aseptyczna Tetra-Pak), `5 [M]` (enzymolodzy, specjaliści UHT, kontrola jakości), `1 [E]` (biotechnolog enzymów skrobiowych).
* **Wymagana technologia/licencja**: *Ekstrakcja Białek Roślinnych (Era 6)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 2 kWh (wysoka efektywność energetyczna, homogenizatory ciśnieniowe 200 bar, sterylizacja błyskawiczna UHT).
  - *Opcja termiczna na miejscu*: **0.25 m³ Biometanu** z fermentacji pulpy owsianej w lokalnej biogazowni zakładowej.
* **Odpady i cyrkularność**: Pozostałości błonnikowe po filtracji enzymatycznej $\to$ batony proteinowe lub biomasa; karton bio $\to$ 100% biodegradacji lub kompostu.

---

### 19. Burgery i Alternatywy Roślinne Mięsa (Epoka 6)
*Nowoczesne analogi mięsa o włóknistej strukturze tkanki mięśniowej, produkowane bez uboju zwierząt.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Pszenica + 3 kWh = 1 Izolat Białka Roślinnego (Gluten/Białko pszenne)
  - **Krok L1**: 1 Słoneczniki + 1 kWh = 1 Emulsja Tłuszczowa Roślinna
  - **Krok L1**: 1 Algi Morskie + 2 kWh = 1 Barwnik Hemowy i Aromat Mięsny
  - **Krok L2**: 1 Izolat Białka Roślinnego + 2 kWh = 1 Błonnik i Teksturat Białkowy HMEC
  - **Krok L2**: 1 Biomasa Przetworzona + 2 kWh = 2 Tacka z Bioplastiku (PLA/skrobia)
  - **Krok Końcowy**: 1 Teksturat Białkowy + 1 Emulsja Tłuszczowa + 1 Barwnik Hemowy + 1 Tacka z Bioplastiku + 3 kWh = 1 Burgery Roślinne
* **Obsada pracownicza**: `4 [R]` (formierki kotletów, szokowe mrożenie kriogeniczne), `6 [M]` (inżynierowie reologii żywności, aromatyzacji i sensoryki), `1 [E]` (biotechnolog białek rekombinowanych).
* **Wymagana technologia/licencja**: *Teksturyzacja Białek (Era 6)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 3 kWh (ekstrudery wysokowilgotnościowe High Moisture Extrusion Cooking, chłodzone dysze formujące).
  - *Opcja termiczna na miejscu*: Zielony Wodór (**0.08 kg H2**) lub **0.3 m³ Biogazu** do zasilania kotła grzewczego ekstrudera.
* **Odpady i cyrkularność**: Ścinki tekstruratu natychmiast recyklingowane do miksera; opakowanie bioplastikowe $\to$ przemysłowy kompostownik miejski.

---

### 20. Mięso Hodowane Komórkowo i Żywność Personalizowana (Epoka 7)
*Czyste mięso hodowane w bioreaktorach z namnażanych komórek satelitarnych, eliminujące fermy hodowlane i emisje metanu.*

* **Łańcuch receptury i bilans masowo-energetyczny**:
  - **Krok L1**: 2 Algi Morskie + 4 kWh = 1 Pożywka Komórkowa i Czynniki Wzrostu (bezzwierzęca pożywka bogata w peptydy i lipidy)
  - **Krok L1**: 1 Pszenica + 2 kWh = 1 Czysta Glukoza i Skrobia
  - **Krok L2**: 1 Algi Morskie + 1 Sól Kamienna + 3 kWh = 1 Biomatryce Tkankowe i Rusztowania 3D
  - **Krok L2**: 1 Biomasa Przetworzona + 2 kWh = 2 Opakowanie Aktywne Kompostowalne
  - **Krok Końcowy**: 2 Pożywka Komórkowa + 1 Czysta Glukoza + 1 Biomatryce Tkankowe + 1 Opakowanie Aktywne + 6 kWh = 1 Mięso Hodowane Komórkowo
* **Obsada pracownicza**: `2 [R]` (technicy logistyki bioreaktorów), `4 [M]` (operatorzy bioprocesów, kontrolerzy parametrów hodowli), `6 [E]` (genetycy komórkowi, inżynierowie inżynierii tkankowej, bioinformatycy).
* **Wymagana technologia/licencja**: *Rolnictwo Komórkowe (Era 7)*.
* **Opcje energetyczne**:
  - *Standard sieciowy*: 6 kWh (nieprzerwane zasilanie bioreaktorów perfuzyjnych, mieszadła lewitujące magnetycznie, precyzyjne utrzymanie 37.0°C i saturacji tlenowej).
  - *Opcja mikrosieci OZE / Wodorowa*: Zasilanie z dedykowanych ogniw paliwowych na Czysty Wodór Bazowy (**0.18 kg H2**) z odzyskiem ciepła odpadowego z chłodzenia reaktorów do ogrzewania cleanroomu.
* **Odpady i cyrkularność**: 0% cierpienia zwierząt, 99% mniejsze zużycie terenu i wody. Zużyta przefiltrowana pożywka $\to$ recykling substancji odżywczych w pętli zamkniętej; opakowanie 100% bio-kompostowalne w glebie w 90 dni.

---

## 3. Tabela Porównawcza i Bilans Energetyczno-Kadrowy Branży 1

| # | Produkt Końcowy | Epoka | Kadra `[R/M/E]` | Suma Energii (Krok Końcowy) | Alternatywne Źródło Termiczne | Główne Surowce Bazowe |
| :-: | :--- | :-: | :-: | :-: | :--- | :--- |
| **1** | Chleb i Pieczywo Tradycyjne | E1 | 6 / 1 / 0 | 3 kWh | Węgiel / Drewno / Biogaz | Pszenica, Buraki Cukrowe, Sól |
| **2** | Mięso Solone i Wędliny | E1 | 8 / 2 / 0 | 3 kWh | Drewno / Zrębki dębowe | Bydło, Sól, Drewno Okrągłe |
| **3** | Konserwy Mięsne i Rybne | E1 | 10 / 2 / 0 | 4 kWh | Węgiel / Gaz / Para | Bydło, Sól, Ruda Żelaza |
| **4** | Nabiał (Masło, Sery, Mleko) | E1 | 8 / 2 / 0 | 3 kWh | Kocioł parowy węgiel/gaz | Bydło, Drewno Okrągłe |
| **5** | Cukierki i Słodycze | E1 | 6 / 1 / 0 | 3 kWh | Węgiel / Gaz / Para | Buraki Cukrowe, Jabłka, Bydło |
| **6** | Piwo i Cydr | E1 | 8 / 2 / 0 | 4 kWh | Biogaz z wysłodzin / Węgiel | Pszenica, Buraki, Piasek Kwarcowy |
| **7** | Alkohole Wysokoprocentowe | E1 | 6 / 2 / 0 | 6 kWh | Węgiel / Gaz / Wodór | Pszenica, Drewno, Piasek Kwarcowy |
| **8** | Kawa i Herbata Pakowana | E1 | 4 / 1 / 0 | 2 kWh | Spalanie łusek / Gaz | Ziarna Kawy/Herbaty, Drewno |
| **9** | Makarony Pszenne | E2 | 6 / 1 / 0 | 3 kWh | Gaz Ziemny / Elektrociepłownia | Pszenica, Drewno Okrągłe |
| **10** | Soki i Napoje Butelkowane | E2 | 6 / 2 / 0 | 2 kWh | Gaz Ziemny / Biogaz | Jabłka, Buraki Cukrowe, Piasek / Ropa |
| **11** | Margaryna i Tłuszcze Roślinne | E2 | 8 / 2 / 0 | 3 kWh | Gaz Ziemny (reforming) | Słoneczniki, Gaz Ziemny, Sól |
| **12** | Czekolada i Słodycze Masowe | E2 | 8 / 2 / 0 | 4 kWh | Gaz Ziemny / Para miejska | Kakao, Buraki Cukrowe, Bydło, Boksyt |
| **13** | Mrożonki Warzywne i Dania | E3 | 10 / 2 / 0 | 6 kWh | Kogeneracja CHP (Gaz) | Jabłka/Warzywa, Pszenica, Ropa |
| **14** | Płatki Śniadaniowe | E3 | 8 / 2 / 0 | 4 kWh | Gaz Ziemny / Biogaz | Pszenica, Buraki Cukrowe, Drewno |
| **15** | Napoje Gazowane | E3 | 8 / 2 / 0 | 3 kWh | Gaz Ziemny / Odzysk CO2 | Buraki Cukrowe, Gaz, Boksyt |
| **16** | Fast-Food i Przekąski Słone | E4 | 10 / 2 / 0 | 4 kWh | Palnik gazowy oleju | Pszenica, Słoneczniki, Sól, Ropa, Boksyt |
| **17** | Odżywki dla Dzieci i Medyczne | E5 | 4 / 6 / 2 | 5 kWh | Czysta para farmaceutyczna | Bydło, Buraki Cukrowe, Pszenica, Boksyt |
| **18** | Napoje Roślinne | E6 | 4 / 5 / 1 | 2 kWh | Biometan z młóta owsa | Pszenica/Owies, Słoneczniki, Algi, Drewno |
| **19** | Burgery Roślinne | E6 | 4 / 6 / 1 | 3 kWh | Biogaz / Zielony Wodór | Pszenica, Słoneczniki, Algi, Biomasa |
| **20** | Mięso Hodowane Komórkowo | E7 | 2 / 4 / 6 | 6 kWh | Czysty Wodór OZE / Mikrosieć | Algi Morskie, Pszenica, Biomasa, Sól |
