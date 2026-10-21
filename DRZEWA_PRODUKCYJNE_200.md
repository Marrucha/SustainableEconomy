# Drzewa Produkcyjne 200 Produktów Końcowych (Pełne Łańcuchy Dostaw)
**Załącznik Technologiczny do GDD v5.0 i Katalogu Danych**

> [!IMPORTANT]
> **Triada Wymogów Produkcyjnych dla każdego procesu w grze**:
> 1. **LUDZIE (Kadra Przemysłowa)**: Obsada stanowisk przez określoną klasę społeczną: `[R]` Robotnicy (praca fizyczna i manualna), `[M]` Specjaliści/Klasa Średnia (inżynierowie procesu, majstrowie, automatycy), `[E]` Naukowcy/Elita (biotechnolodzy, fizycy kwantowi, architekci AI).
> 2. **ENERGIA (Zasilanie i Bilans Ciepło-Siła)**: Dokładne zapotrzebowanie w `kWh` na partię produktu:
>    - **Opcja A (Miejska Sieć Energetyczna)**: Fabryka kupuje prąd od miejskiej spółki energetycznej (koszt za kWh zależy od miejskiego miksu paliwowego).
>    - **Opcja B (Autoprodukcja na Miejscu / Kogeneracja)**: Fabryka kupuje paliwo (np. 1 Węgiel, Drewno, Gaz Ziemny, Biogaz, Wodór) i spala je w maszynie parowej, kotle lub agregacie CHP, zastępując pobór prądu i generując lokalną emisję zanieczyszczeń.
> 3. **LICENCJA (Technologia i Patenty)**: Wymagana zbadana technologia w Drzewku Technologii lub zakupiona licencja/patent z Instytutu R&D.

---

## Metodologia Bilansu Masowo-Energetycznego (Wzorce Receptur)

Każdy proces produkcyjny w grze jest precyzyjnie zbilansowany chemicznie i fizycznie.
**Przykład wzorcowy – Płatki Śniadaniowe (Produkt #14)**:
```
Krok L1 (Młynarstwo):    2 Pszenica + 1 kWh                    = 1 Mąka Pszenna
Krok L1 (Cukrownia):     1 Burak Cukrowy + 2 kWh               = 1 Cukier
Krok L1 (Celulozownia):  1 Drewno Okrągłe + 5 kWh              = 1 Celuloza
Krok L2 (Papiernia):     1 Celuloza + 2 kWh                    = 1 Karton Opakowaniowy
Krok L2 (Słodownia):     1 Pszenica + 1 kWh                    = 1 Słód
Krok Końcowy (Fabryka):  2 Mąka + 1 Cukier + 1 Słód + 1 Karton + 4 kWh = 1 Płatki Śniadaniowe
Wymogi Fabryki Płatków:  8 [R] / 2 [M] / 0 [E] | Licencja: Ekstruzja Zbóż (Era 3) | Opcja OZE/Gaz
```

---

## 10 Branżowych Ksiąg Inżynierii Procesowej (Szczegółowe Receptury)

Dla każdego z 200 produktów oraz wszystkich powiązanych półproduktów L1 i L2/L3 opracowano dedykowaną księgę procesową z dokładnymi bilansami masowymi, zużyciem kWh, obsadą stanowiskową, licencjami i ścieżkami recyklingu w katalogu `receptury/`:

1. [Branża 1: Żywność i Napoje (Produkty 1–20)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_01_zywnosc.md) – 30 KB specyfikacji
2. [Branża 2: Odzież, Obuwie i Moda (Produkty 21–40)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_02_odziez.md) – 76 KB specyfikacji
3. [Branża 3: Dom, Meble i Budownictwo (Produkty 41–60)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_03_dom_i_meble.md) – 69 KB specyfikacji
4. [Branża 4: Transport i Pojazdy (Produkty 61–80)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_04_transport.md) – 60 KB specyfikacji
5. [Branża 5: Chemia Gospodarcza i Kosmetyki (Produkty 81–100)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_05_chemia_kosmetyki.md) – 51 KB specyfikacji
6. [Branża 6: Elektronika i Komunikacja (Produkty 101–120)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_06_elektronika.md) – 37 KB specyfikacji
7. [Branża 7: Kultura, Zabawki i Sport (Produkty 121–140)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_07_kultura_sport.md) – 44 KB specyfikacji
8. [Branża 8: Zdrowie, Farmacja i Biotechnologia (Produkty 141–160)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_08_farmacja_zdrowie.md) – 44 KB specyfikacji
9. [Branża 9: Energetyka Użytkowa i Eko-Technologie (Produkty 161–180)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_09_eko_energetyka.md) – 61 KB specyfikacji
10. [Branża 10: Bionika i Robotyka (Produkty 181–200)](file:///c:/Users/Budy3/Documents/antigravity/Sustainable%20Economy/receptury/branza_10_bionika_robotyka.md) – 46 KB specyfikacji

---

## SPIS TREŚCI BRANŻ (Katalog Skrócony 200 Produktów)
1. [Branża 1: Żywność i Napoje (Produkty 1–20)](#branża-1-żywność-i-napoje-produkty-120)
2. [Branża 2: Odzież, Obuwie i Moda (Produkty 21–40)](#branża-2-odzież-obuwie-i-moda-produkty-2140)
3. [Branża 3: Dom, Meble i Budownictwo (Produkty 41–60)](#branża-3-dom-meble-i-budownictwo-produkty-4160)
4. [Branża 4: Transport i Pojazdy (Produkty 61–80)](#branża-4-transport-i-pojazdy-produkty-6180)
5. [Branża 5: Chemia Gospodarcza i Kosmetyki (Produkty 81–100)](#branża-5-chemia-gospodarcza-i-kosmetyki-produkty-81100)
6. [Branża 6: Elektronika i Komunikacja (Produkty 101–120)](#branża-6-elektronika-i-komunikacja-produkty-101120)
7. [Branża 7: Kultura, Zabawki i Sport (Produkty 121–140)](#branża-7-kultura-zabawki-i-sport-produkty-121140)
8. [Branża 8: Zdrowie, Farmacja i Biotechnologia (Produkty 141–160)](#branża-8-zdrowie-farmacja-i-biotechnologia-produkty-141160)
9. [Branża 9: Energetyka Użytkowa i Eko-Technologie (Produkty 161–180)](#branża-9-energetyka-użytkowa-i-eko-technologie-produkty-161180)
10. [Branża 10: Bionika i Robotyka (Produkty 181–200)](#branża-10-bionika-i-robotyka-produkty-181200)

---

## Branża 1: Żywność i Napoje (Produkty 1–20)

### 1. Chleb i Pieczywo Tradycyjne (Epoka 1 -> E6: Pieczywo Funkcjonalne Bio)
* **Drzewo łańcucha**:
  * *Surowiec*: Pszenica (Farma)
  * *L1*: Mąka Pszenna (Młyn)
  * *L2*: Drożdże Przemysłowe (z Cukru i Mąki)
  * *Produkt końcowy*: Piekarnia $\to$ Mąka Pszenna + Drożdże Przemysłowe + Sól Oczyszczona
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska (Piec węglowy/elektryczny), Licencja: *Technologia Piekarnicza (Era 1)*
* **Recykling / Odpady**: Odpady organiczne $\to$ Kompost/Biomasa.

### 2. Mięso Solone i Wędliny (Epoka 1 -> E3: Wędliny Pakowane)
* **Drzewo łańcucha**:
  * *Surowiec*: Bydło (Farma)
  * *L1*: Mięso Surowe (Rzeźnia) + Sól Oczyszczona
  * *Produkt końcowy*: Zakład Przetwórstwa Mięsnego $\to$ Mięso Surowe + Sól Oczyszczona (E3: + Tektura Opakowaniowa L2)
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska/Średnia (Chłodzenie), Licencja: *Konserwacja Żywności (Era 1)*
* **Recykling / Odpady**: Bioodpady poubojowe $\to$ Żelatyna (L2) i Biomasa.

### 3. Konserwy Mięsne i Rybne (Epoka 1)
* **Drzewo łańcucha**:
  * *Surowce*: Bydło (lub Algi/Ryby) + Ruda Żelaza
  * *L1*: Mięso Surowe + Surówka Hutnicza
  * *L2*: Stal (L2) $\to$ Blacha Cynowana (L2)
  * *Produkt końcowy*: Fabryka Konserw $\to$ Mięso Surowe + Blacha Cynowana + Sól Oczyszczona
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Sterylizacja cieplna), Licencja: *Apertyzacja i Pasteryzacja (Era 1)*
* **Recykling / Odpady**: Puszka metalowa $\to$ Złom Stalowy (100% odzysku).

### 4. Nabiał (Masło, Sery, Mleko) (Epoka 1 -> E4: Nabiał UHT)
* **Drzewo łańcucha**:
  * *Surowiec*: Bydło (Farma Mleczna)
  * *L1*: Mleko Surowe (Mleczarnia)
  * *L2*: Masło i Tłuszcze Mleczne (L2)
  * *Produkt końcowy*: Zakład Mleczarski $\to$ Mleko Surowe + Masło (E4: + Karton Opakowaniowy L2)
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Pasteryzacja i chłodnictwo), Licencja: *Przetwórstwo Mleczarskie (Era 1)*
* **Recykling / Odpady**: Szkło butelkowe lub karton poużytkowy.

### 5. Cukierki i Wyroby Cukiernicze (Epoka 1)
* **Drzewo łańcucha**:
  * *Surowce*: Buraki Cukrowe + Jabłka
  * *L1*: Cukier (Cukrownia)
  * *L2*: Syrop Cukrowy (L2) + Koncentrat Owocowy (L2) + Żelatyna (L2)
  * *Produkt końcowy*: Manufaktura Cukiernicza $\to$ Syrop Cukrowy + Koncentrat Owocowy + Żelatyna
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Rafinacja Cukru (Era 1)*
* **Recykling / Odpady**: Odpady cukrowe biodegradowalne.

### 6. Piwo i Cydr (Epoka 1 -> E6: Piwo Rzemieślnicze Zero-Waste)
* **Drzewo łańcucha**:
  * *Surowce*: Pszenica (lub Jabłka na cydr) + Piasek Kwarcowy
  * *L1*: Słód Jęczmienny/Pszenny + Szkło Surowe
  * *L2*: Drożdże Przemysłowe + Szkło Butelkowe (L2)
  * *Produkt końcowy*: Browar $\to$ Słód + Drożdże + Szkło Butelkowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Warzelnia), Licencja: *Fermentacja Przemysłowa (Era 1)*
* **Recykling / Odpady**: Butelka szklana zwrotna (stłuczka do pieca), wysłodziny $\to$ pasza dla bydła.

### 7. Alkohole Wysokoprocentowe (Epoka 1)
* **Drzewo łańcucha**:
  * *Surowce*: Pszenica + Drewno Okrągłe + Piasek Kwarcowy
  * *L1*: Zacier Zbożowy + Tarcica Dębowa + Szkło Surowe
  * *L2*: Szkło Butelkowe (L2) + Beczki Drewniane (L2)
  * *Produkt końcowy*: Gorzelnia/Destylarnia $\to$ Zacier + Szkło Butelkowe + Beczki
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Destylacja), Licencja: *Destylacja Frakcyjna (Era 1)*
* **Recykling / Odpady**: Butelki szklane $\to$ stłuczka do huty szkła.

### 8. Kawa i Herbata Pakowana (Epoka 1 -> E6: Fair-Trade)
* **Drzewo łańcucha**:
  * *Surowce*: Ziarna Kawy/Herbaty (Import z Nowych Regionów/Plantacji) + Drewno Okrągłe
  * *L1*: Celuloza (L1)
  * *L2*: Papier i Karton (L2)
  * *Produkt końcowy*: Palarnia i Pakowalnia $\to$ Ziarna Surowe + Karton Opakowaniowy
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska (Palenie ziaren), Licencja: *Logistyka Towarów Kolonialnych (Era 1)*
* **Recykling / Odpady**: Fusy $\to$ nawóz organiczny, karton $\to$ makulatura.

### 9. Makarony Pszenne (Epoka 2)
* **Drzewo łańcucha**:
  * *Surowiec*: Pszenica
  * *L1*: Mąka Pszenna (Młyn)
  * *L2*: Karton Opakowaniowy (z Celulozy)
  * *Produkt końcowy*: Wytwórnia Makaronu $\to$ Mąka Pszenna + Woda + Karton Opakowaniowy
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Suszarnie przemysłowe), Licencja: *Przetwórstwo Spożywcze Epoki 2*
* **Recykling / Odpady**: Opakowanie kartonowe $\to$ recykling celulozy.

### 10. Soki i Napoje Butelkowane (Epoka 2: szkło -> E4: plastik -> E7: butelki rPET/bio)
* **Drzewo łańcucha**:
  * *Surowce*: Jabłka + Buraki Cukrowe + Piasek Kwarcowy (lub Ropa Naftowa w E4)
  * *L1*: Cukier + Szkło Surowe
  * *L2*: Koncentrat Owocowy + Szkło Butelkowe (w E4: Plastik PET L2; w E7: Bioplastik L2)
  * *Produkt końcowy*: Rozlewnia Napojów $\to$ Koncentrat Owocowy + Cukier + Butelki
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Pasteryzacja Płynów (Era 2)*
* **Recykling / Odpady**: Zbiórka butelek kaucjonowanych.

### 11. Margaryna i Tłuszcze Roślinne (Epoka 2)
* **Drzewo łańcucha**:
  * *Surowce*: Słoneczniki + Sól Kamienna
  * *L1*: Olej Słonecznikowy + Sól Oczyszczona
  * *L2*: Wodór Przemysłowy (do utwardzania) + Papier Woskowany
  * *Produkt końcowy*: Zakład Tłuszczowy $\to$ Olej Słonecznikowy + Wodór + Sól + Papier Woskowany
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Reaktory uwodornienia), Licencja: *Uwodornianie Tłuszczów (Era 2)*
* **Recykling / Odpady**: Odpady biodegradowalne.

### 12. Czekolada i Słodycze Masowe (Epoka 2)
* **Drzewo łańcucha**:
  * *Surowce*: Ziarno Kakaowe + Buraki Cukrowe + Bydło
  * *L1*: Cukier + Mleko Surowe
  * *L2*: Masło Kakaowe + Proszek Mleczny (L2) + Folia Aluminiowa (L2)
  * *Produkt końcowy*: Fabryka Czekolady $\to$ Cukier + Masło Kakaowe + Proszek Mleczny + Folia Aluminiowa
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Konszowanie), Licencja: *Technologia Cukiernicza (Era 2)*
* **Recykling / Odpady**: Folia aluminiowa $\to$ recykling aluminium.

### 13. Mrożonki Warzywne i Dania Gotowe (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Jabłka/Warzywa + Pszenica + Ropa Naftowa
  * *L1*: Mąka Pszenna + Frakcje Naftowe
  * *L2*: Plastik Ropopochodny (Folia L2)
  * *Produkt końcowy*: Chłodnia Przemysłowa $\to$ Warzywa Blanszowane + Mąka + Folia Opakowaniowa
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Wysoka (Głębokie mrożenie -18°C), Licencja: *Chłodnictwo Przemysłowe (Era 3)*
* **Recykling / Odpady**: Folia plastikowa $\to$ odpady zmieszane (lub recykling tworzyw).

### 14. Płatki Śniadaniowe (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Pszenica + Buraki Cukrowe + Drewno Okrągłe
  * *L1*: Mąka Pszenna + Cukier + Celuloza
  * *L2*: Słód Jęczmienny + Karton z Nadrukiem (L2)
  * *Produkt końcowy*: Wytwórnia Płatków $\to$ Mąka Pszenna + Cukier + Słód + Karton
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Ekstruzja i prażenie), Licencja: *Ekstruzja Zbóż (Era 3)*
* **Recykling / Odpady**: Karton $\to$ makulatura.

### 15. Napoje Gazowane (Soda/Cola) (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Buraki Cukrowe + Gaz Ziemny (CO2) + Boksyt
  * *L1*: Cukier + Aluminium Hutnicze
  * *L2*: Puszki Aluminiowe (L2) + Syrop Smakowy (L2)
  * *Produkt końcowy*: Rozlewnia Napojów Gazowanych $\to$ Woda Nasycona CO2 + Syrop Cukrowy + Puszka Aluminiowa
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Karbonizacja Przemysłowa (Era 3)*
* **Recykling / Odpady**: Puszka aluminiowa $\to$ 95% odzysku aluminium.

### 16. Fast-Food i Przekąski Słone (Chipsy) (Epoka 4)
* **Drzewo łańcucha**:
  * *Surowce*: Pszenica/Ziemniaki + Słoneczniki + Sól Kamienna + Ropa Naftowa
  * *L1*: Olej Słonecznikowy + Sól Oczyszczona
  * *L2*: Folia Metalizowana Wielowarstwowa (L2 - Plastik + Aluminium)
  * *Produkt końcowy*: Wytwórnia Przekąsek $\to$ Ziemniaki/Mąka + Olej Słonecznikowy + Sól + Torebka Foliowa
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Głębokie Smażenie Ciągłe (Era 4)*
* **Recykling / Odpady**: Trudne odpady wielowarstwowe $\to$ obciążenie opłatą ROP.

### 17. Odżywki dla Dzieci i Żywność Medyczna (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Bydło + Pszenica + Buraki Cukrowe
  * *L1*: Mleko Surowe + Mąka Pszenna + Cukier
  * *L2*: Kazeina i Proszek Mleczny (L2) + Błonnik (L2) + Witaminy Syntetyczne (L2)
  * *Produkt końcowy*: Laboratorium Dietetyczne $\to$ Proszek Mleczny + Błonnik + Witaminy + Szczelna Puszka Aluminiowa
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia (Sterylność klasy farmaceutycznej), Licencja: *Żywienie Kliniczne (Era 5)*
* **Recykling / Odpady**: Metalowe puszki $\to$ recykling metali.

### 18. Napoje Roślinne (Owsiane/Sojowe/Słonecznikowe) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Pszenica/Owies + Słoneczniki + Algi Morskie
  * *L1*: Białko Roślinne (L1) + Olej Słonecznikowy
  * *L2*: Karton Aseptyczny Biodegradowalny (L2)
  * *Produkt końcowy*: Eko-Mleczarnia Roślinna $\to$ Białko Roślinne + Olej Słonecznikowy + Woda + Karton Aseptyczny
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska (90% mniejszy ślad węglowy niż krowie mleko), Licencja: *Ekstrakcja Białek Roślinnych (Era 6)*
* **Recykling / Odpady**: Karton kompostowalny lub recykling celulozy.

### 19. Burgery i Alternatywy Roślinne Mięsa (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Pszenica + Słoneczniki + Algi Morskie
  * *L1*: Białko Roślinne (L1) + Olej Słonecznikowy
  * *L2*: Błonnik Roślinny Strukturyzowany (L2) + Bioplastik Opakowaniowy (L2)
  * *Produkt końcowy*: Zakład Bio-Żywności $\to$ Białko Roślinne + Olej Słonecznikowy + Błonnik + Eko-Tacka
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska/Średnia, Licencja: *Teksturyzacja Białek (Era 6)*
* **Recykling / Odpady**: Tacka z bioplastiku $\to$ kompost przemysłowy.

### 20. Mięso Hodowane Komórkowo i Żywność Personalizowana (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Pszenica + Sól Kamienna
  * *L1*: Białko Roślinne + Sól Oczyszczona
  * *L2*: Bio-Odżywki i Fermenty Bakteryjne (L2) + Biomatryce Tkankowe (L2)
  * *Produkt końcowy*: Bioreaktor Mięsny $\to$ Komórki Macierzyste + Pożywka z Alg + Biomatryce Kolagenowe
* **Triada produkcyjna**: Ludzie: `[E]` (Biotechnolodzy), Energia: Średnia (Czysta energia OZE), Licencja: *Rolnictwo Komórkowe (Era 7)*
* **Recykling / Odpady**: 0% cierpienia zwierząt, 99% mniejsze zużycie ziemi i wody, opakowania 100% zdatne do kompostowania.

---

## Branża 2: Odzież, Obuwie i Moda (Produkty 21–40)

### 21. Odzież Robocza z Drelichu/Denimu (Epoka 1 -> E4: Jeansy -> E7: Cyrkularne)
* **Drzewo łańcucha**:
  * *Surowce*: Bawełna + Ruda Żelaza
  * *L1*: Przędza Bawełniana + Surówka Hutnicza
  * *L2*: Płótno Techniczne i Drelich (L2) + Guziki i Nity Stalowe (L2)
  * *Produkt końcowy*: Szwalnia Przemysłowa $\to$ Drelich Bawełniany + Nity Stalowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Tkalnictwo Mechaniczne (Era 1)*
* **Recykling / Odpady**: Ścinki tekstylne $\to$ włókna szarpankowe / czyściwo.

### 22. Koszule Bawełniane i Bielizna (Epoka 1)
* **Drzewo łańcucha**:
  * *Surowiec*: Bawełna
  * *L1*: Przędza Bawełniana (Przędzalnia)
  * *L2*: Tkanina Bawełniana Wykończona (Tkalnia)
  * *Produkt końcowy*: Szwalnia $\to$ Tkanina Bawełniana + Nici Bawełniane
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Konfekcja Masowa (Era 1)*
* **Recykling / Odpady**: Zużyte koszule $\to$ recykling bawełny w Zakładzie Recyklingu.

### 23. Płaszcze i Garnitury Wełniane (Epoka 1)
* **Drzewo łańcucha**:
  * *Surowce*: Owce + Bawełna
  * *L1*: Przędza Wełniana + Przędza Bawełniana
  * *L2*: Tkanina Wełniana Wykończona (L2) + Podszewka Bawełniana (L2)
  * *Produkt końcowy*: Zakład Krawiecki $\to$ Tkanina Wełniana + Podszewka + Guziki
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Niska, Licencja: *Krawiectwo Garniturowe (Era 1)*
* **Recykling / Odpady**: Wełna z recyklingu $\to$ ocieplenia i filc.

### 24. Suknie Tradycyjne i Gorsety (Epoka 1 – [Wygasa w Epoce 2])
* **Drzewo łańcucha**:
  * *Surowce*: Bawełna + Ruda Żelaza (fiszbiny stalowe)
  * *L1*: Przędza Bawełniana + Stal
  * *L2*: Tkanina Bawełniana + Drut Stalowy Sprężynowy (L2)
  * *Produkt końcowy*: Pracownia Gorseciarska $\to$ Tkanina + Fiszbiny Stalowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Konstrukcja Odzieży Epoki Wiktoriańskiej*
* **Recykling / Odpady**: Produkt historyczny – wygasa wraz z emancypacją w Epoce 2.

### 25. Trzewiki i Buty Skórzane Rzemieślnicze (Epoka 1 -> E3: Obuwie Wizytowe)
* **Drzewo łańcucha**:
  * *Surowce*: Bydło + Kauczuk Naturalny (lub Drewno na obcas)
  * *L1*: Skóra Surowa Wyprawiona + Guma Surowa
  * *L2*: Skóra Obuwnicza (L2) + Podeszwa Gumowa Wulkanizowana (L2)
  * *Produkt końcowy*: Fabryka Obuwia $\to$ Skóra Obuwnicza + Podeszwa Gumowa + Nici Szewskie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Prasy szewskie), Licencja: *Szewstwo Przemysłowe (Era 1)*
* **Recykling / Odpady**: Odnawialne przez **Serwisantów** (wymiana zelówek wydłuża żywotność o 100%).

### 26. Kapelusze Filcowe i Nakrycia Głowy (Epoka 1 – [Wygasa w Epoce 4])
* **Drzewo łańcucha**:
  * *Surowiec*: Owce (Wełna)
  * *L1*: Przędza Wełniana
  * *L2*: Filc Wełniany Prasowany (L2) + Taśma Wykończeniowa
  * *Produkt końcowy*: Manufaktura Kapelusznicza $\to$ Filc Prasowany + Formowanie Parowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Filcowanie Przemysłowe (Era 1)*
* **Recykling / Odpady**: Wełna z recyklingu.

### 27. Zegarki Kieszonkowe (Epoka 1 -> E2: Naręczne Mechaniczne)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ruda Złota + Piasek Kwarcowy
  * *L1*: Stal + Złoto Czyste + Szkło Surowe
  * *L2*: Przekładnie Precyzyjne i Sprężyny (L2) + Szkiełko Zegarkowe (L2) + Koperta Złocona (L2)
  * *Produkt końcowy*: Warsztat Zegarmistrzowski $\to$ Mechanizm Zębaty + Koperta + Szkiełko
* **Triada produkcyjna**: Ludzie: `[M]` (Precyzyjni rzemieślnicy), Energia: Niska, Licencja: *Mechanika Precyzyjna (Era 1)*
* **Recykling / Odpady**: Bardzo wysoka trwałość (dekady), po zużyciu złoto i stal w 100% odzyskiwane.

### 28. Torby, Paski i Galanteria Skórzana (Epoka 1 -> E7: Eko-Skóra Grzybowa)
* **Drzewo łańcucha**:
  * *Surowce*: Bydło (w E7: Biomasa z Alg/Grzybni) + Ruda Miedzi
  * *L1*: Skóra Surowa Wyprawiona + Miedź Rafinowana
  * *L2*: Skóra Galanteryjna (w E7: Eko-Skóra Mycelium L2) + Klamry Mosiężne (L2)
  * *Produkt końcowy*: Zakład Rymarski $\to$ Skóra Galanteryjna + Klamry Metalowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Galanteria Skórzana (Era 1)*
* **Recykling / Odpady**: Naprawa u **Serwisantów** (wymiana okuć, zszywanie).

### 29. Sukienki i Odzież Codzienna Prêt-à-porter (Epoka 2)
* **Drzewo łańcucha**:
  * *Surowiec*: Bawełna
  * *L1*: Przędza Bawełniana
  * *L2*: Tkanina Bawełniana Barwiona (L2) + Guziki
  * *Produkt końcowy*: Szwalnia Konfekcyjna $\to$ Wykroje Tkaniny + Szycie Maszynowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Masowa Standaryzacja Rozmiarów (Era 2)*
* **Recykling / Odpady**: Zbiórka odzieży używanej.

### 30. Obuwie Gumowo-Tekstylne (Trampki) (Epoka 2 -> E5: Sneakersy)
* **Drzewo łańcucha**:
  * *Surowce*: Bawełna + Kauczuk Naturalny (w E5: Polimery Ropopochodne)
  * *L1*: Przędza Bawełniana + Guma Surowa
  * *L2*: Płótno Żaglowe (L2) + Podeszwa Gumowa Wulkanizowana (L2)
  * *Produkt końcowy*: Fabryka Trampków $\to$ Płótno + Podeszwa Wulkanizowana + Oczka Metalowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Autoklawy wulkanizacyjne), Licencja: *Wulkanizacja Ciągła (Era 2)*
* **Recykling / Odpady**: Zmielona guma $\to$ granulat na boiska i nawierzchnie.

### 31. Pończochy i Odzież Nylonowa/Syntetyczna (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowiec*: Ropa Naftowa
  * *L1*: Frakcje Naftowe
  * *L2*: Włókna Syntetyczne (Poliamid/Nylon L2)
  * *Produkt końcowy*: Dziewiarnia Syntetyczna $\to$ Cienkie Włókna Nylonowe + Maszyny Pończosznicze
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Polimeryzacja Nylonu (Era 3)*
* **Recykling / Odpady**: Plastik niebiodegradowalny $\to$ obciążenie miejskiego wysypiska.

### 32. Kurtki Przeciwdeszczowe i Puchowe (Epoka 3 -> E6: Membrany Outdoor)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Gęsi/Owce (lub w E6: Włókna z recyklingu rPET)
  * *L1*: Frakcje Naftowe + Wełna
  * *L2*: Tkanina Syntetyczna Nieprzemakalna (L2) + Ocieplina (L2) + Zamki Błyskawiczne (L2)
  * *Produkt końcowy*: Szwalnia Techniczna $\to$ Tkanina Membranowa + Ocieplina + Zamki
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Średnia, Licencja: *Laminowanie Tkanin (Era 3)*
* **Recykling / Odpady**: Wymiana zamków u **Serwisantów**; w E6 powrót do granulatu rPET.

### 33. Biżuteria Klasyczna (Epoka 2 -> E7: Eko-Diamenty i Urban Mining)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Złota + Piasek Kwarcowy/Węgiel
  * *L1*: Złoto Czyste (Huta)
  * *L2*: Kamienie Szlachetne (w E7: Diamenty Syntetyczne CVD z Węgla i Plazmy L2) + Stopy Złotnicze (L2)
  * *Produkt końcowy*: Pracownia Jubilerska $\to$ Złoto Szlachetne + Oprawa Kamieni
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska (w E7: Wysoka dla reaktorów plazmowych CVD), Licencja: *Złotnictwo i Synteza Diamentów*
* **Recykling / Odpady**: 100% recykling metalu – złoto nigdy nie trafia na śmietnik.

### 34. Okulary Korekcyjne i Przeciwsłoneczne (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ropa Naftowa (lub Miedź/Stal)
  * *L1*: Szkło Surowe + Frakcje Naftowe
  * *L2*: Soczewki Optyczne Szlifowane (L2) + Oprawki z Octanu Celulozy/Plastiku (L2)
  * *Produkt końcowy*: Zakład Optyczny $\to$ Soczewki Optyczne + Oprawki + Śrubki Stalowe
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Szlifowanie Soczewek Precyzyjnych (Era 3)*
* **Recykling / Odpady**: Wymiana szkieł u optyka/serwisanta.

### 35. Tanie Koszulki "Fast Fashion" (Poliester) (Epoka 4 – [Wypierane w Epoce 7])
* **Drzewo łańcucha**:
  * *Surowiec*: Ropa Naftowa
  * *L1*: Frakcje Naftowe
  * *L2*: Tkanina Syntetyczna (Poliester L2) + Barwniki Chemiczne (L2)
  * *Produkt końcowy*: Szwalnia Wielkoseryjna $\to$ Poliester + Szybki Druk
* **Triada produkcyjna**: Ludzie: `[R]` (Niskie płace, wysoki wyzysk), Energia: Średnia, Licencja: *Masowa Produkcja Szybkiej Mody (Era 4)*
* **Recykling / Odpady**: Katastrofalny ślad odpadowy; mikrowłókna w wodzie; w Epoce 6–7 obłożona drakońską opłatą ROP.

### 36. Odzież Sportowa i Termoaktywna (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Ruda Miedzi (jony antybakteryjne)
  * *L1*: Frakcje Naftowe + Miedź
  * *L2*: Mikrowłókna Poliestrowe Oddychające (L2) + Elastan (L2)
  * *Produkt końcowy*: Szwalnia Zaawansowana $\to$ Dzianina Termoaktywna + Płaskie Szwy
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Włókna Funkcjonalne (Era 5)*
* **Recykling / Odpady**: Odzysk włókien chemiczny.

### 37. Walizki i Plecaki Podróżne (Epoka 4)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ropa Naftowa
  * *L1*: Aluminium Hutnicze + Frakcje Naftowe
  * *L2*: Tkanina Cordura Poliamidowa (L2) + Zamki i Stelaż Aluminiowy (L2) + Kółka Gumowe (L2)
  * *Produkt końcowy*: Fabryka Bagażu $\to$ Skorupa/Tkanina + Stelaż + Kółka + Zamki
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Formowanie Termoplastyczne (Era 4)*
* **Recykling / Odpady**: Wymienne kółka i rączki u **Serwisantów**.

### 38. Odzież z Włókien Recyklingowanych (rPET/Bio-Bawełna) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Odpady Zmieszane (Butelki plastikowe z miasta) + Bawełna Organiczna
  * *L1*: Granulat Tworzyw z Recyklingu (Zakład Recyklingu) + Przędza Bawełniana
  * *L2*: Włóknina Recyklingowana rPET (L2) + Barwniki Naturalne Wodne (L2)
  * *Produkt końcowy*: Eko-Szwalnia $\to$ Tkanina rPET + Nici z Recyklingu
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska (OZE), Licencja: *Mechaniczny i Chemiczny Recykling Włókien (Era 6)*
* **Recykling / Odpady**: Bardzo wysoka ocena Eko-Etyki; pełny obieg zamknięty.

### 39. Odzież Modułowa i Samonaprawiająca z Biowłókien (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Drewno Okrągłe
  * *L1*: Biomasa Przetworzona + Celuloza
  * *L2*: Biopolimery Elastyczne (L2) + Przędza z Nanocelulozy (L2)
  * *Produkt końcowy*: Manufaktura Bio-Tekstyliów $\to$ Włókna Samoleczące + Magnetyczne Zapięcia Modułowe
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Ekoprojektowanie Biomimetyczne (Era 7)*
* **Recykling / Odpady**: 100% biodegradowalna w glebie w 90 dni; moduły można wymieniać u **Serwisantów**.

### 40. Inteligentna Odzież Klimatyzowana (Smart-Textiles) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Neodym + Piasek Kwarcowy
  * *L1*: Biomasa + Tlenki Neodymu + Wafle Krzemowe
  * *L2*: Włókna Węglowe (L2) + Mikroprocesory Elastyczne (L2) + Mikrobaterie Polimerowe (L2)
  * *Produkt końcowy*: Fabryka Smart-Textiles $\to$ Tkanina z Wplecioną Elektroniką + Moduł Termoelektryczny
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Elektronika Ubieralna i Mikroklimatyzacja Osobista (Era 8)*
* **Recykling / Odpady**: Demontaż na części pierwsze w Zakładzie Recyklingu Elektroniki.

---

## Branża 3: Dom, Meble i Budownictwo (Produkty 41–60)

### 41. Meble Drewniane Stołowe i Krzesła (Epoka 1 -> E7: Meble z Drewna Odzyskanego)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe + Ruda Żelaza
  * *L1*: Tarcica + Stal
  * *L2*: Kleje Naturalne + Wkręty i Okucia Stalowe (L2)
  * *Produkt końcowy*: Fabryka Mebli $\to$ Tarcica Sezonowana + Okucia + Kleje
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska (Obróbka skrawaniem), Licencja: *Stolarstwo Przemysłowe (Era 1)*
* **Recykling / Odpady**: Drewno z rozbiórek $\to$ tarcica odzyskana / płyty wiórowe.

### 42. Łóżka i Materace (Epoka 1)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe + Owce (Wełna) + Ruda Żelaza
  * *L1*: Tarcica + Przędza Wełniana + Stal
  * *L2*: Sprężyny Stalowe Bonell (L2) + Tkanina Obiciowa (L2) + Rama Łóżka
  * *Produkt końcowy*: Wytwórnia Materacy $\to$ Sprężyny + Wełna/Pianka + Tkanina Obiciowa + Rama
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Tapicerstwo Przemysłowe (Era 1)*
* **Recykling / Odpady**: Regeneracja u **Serwisantów** (wymiana poszycia i sprężyn).

### 43. Szafy i Komody (Epoka 1 -> E4: Meble Płaskie Do Montażu)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe + Ruda Żelaza
  * *L1*: Tarcica (w E4: Płyty Wiórowe z trocin L2) + Stal
  * *L2*: Płyta Wiórowa Laminowana (L2) + Zawiasy Puszkowe (L2) + Kołki i Złącza Mimośrodowe (L2)
  * *Produkt końcowy*: Fabryka Mebli Paczkowanych $\to$ Formatki Meblowe + Zestaw Montażowy + Karton
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Meble Płaskopaczkowane (Era 4)*
* **Recykling / Odpady**: Płyty z recyklingu trocin.

### 44. Piece Węglowe i Kominki Żeliwne (Epoka 1 – [Wygasa w Epoce 5])
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Węgiel Kamienny
  * *L1*: Surówka Hutnicza + Koks Przemysłowy
  * *L2*: Odlewy Żeliwne (L2) + Ruszty i Drzwiczki Żeliwne
  * *Produkt końcowy*: Odlewnia Pieców $\to$ Korpus Żeliwny + Cegła Szamotowa
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Wysoka (Wytop żeliwa), Licencja: *Odlewnictwo Żeliwa (Era 1)*
* **Recykling / Odpady**: Złom żeliwny w 100% zdatny do przetopu; produkt zakazany w Epoce 5 ze względu na smog.

### 45. Lampy Naftowe i Gazowe (Epoka 1 – [Wygasa w Epoce 2])
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Miedzi + Piasek Kwarcowy + Bawełna
  * *L1*: Miedź Rafinowana + Szkło Surowe + Przędza Bawełniana
  * *L2*: Klosz Szklany Prasowany (L2) + Palnik Mosiężny z Pokrętłem (L2) + Knot Bawełniany
  * *Produkt końcowy*: Manufaktura Oświetleniowa $\to$ Klosz + Zbiornik Mosiężny + Palnik
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Oświetlenie Płomieniowe (Era 1)*
* **Recykling / Odpady**: Wypierane przez żarówki elektryczne w Epoce 2.

### 46. Zastawa Stołowa (Porcelana i Szkło) (Epoka 1)
* **Drzewo łańcucha**:
  * *Surowce*: Glina Ceramiczna + Piasek Kwarcowy + Wapień
  * *L1*: Glina Oczyszczona + Szkło Surowe
  * *L2*: Masa Porcelanowa Kaolinowa (L2) + Szkliwo Szklane (L2)
  * *Produkt końcowy*: Fabryka Porcelany i Szkła $\to$ Formowanie Talerzy/Kieliszków + Wypał Piecowy
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Wysoka (Piec ceramiczny 1200°C), Licencja: *Ceramika Szlachetna (Era 1)*
* **Recykling / Odpady**: Gruz ceramiczny $\to$ kruszywo budowlane; stłuczka szklana $\to$ huta.

### 47. Narzędzia Ręczne i Warsztatowe (Epoka 1 -> E4: Elektronarzędzia)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Drewno Okrągłe (w E4: + Miedź i Silnik Elektryczny)
  * *L1*: Stal + Tarcica
  * *L2*: Odkuwki Stalowe Hartowane (L2) + Rękojeści Drewniane/Gumowe (L2) (w E4: Silnik Elektryczny L2)
  * *Produkt końcowy*: Fabryka Narzędzi $\to$ Obuch/Ostrze Stalowe + Rękojeść (lub Silnik w wiertarce)
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Średnia, Licencja: *Obróbka Cieplna Stali (Era 1)*
* **Recykling / Odpady**: Narzędzia służą dziesiątki lat; stal w 100% zdatna do przetopu.

### 48. Stolarka Okienna i Drzwiowa (Epoka 1 -> E6: Okna Pasywne Trzyszybowe)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe + Piasek Kwarcowy + Ruda Żelaza
  * *L1*: Tarcica + Szkło Surowe + Stal
  * *L2*: Szkło Budowlane Płaskie (L2) + Ramy Drewniane Klejone (L2) + Okucia Okienne Obwiedniowe (L2)
  * *Produkt końcowy*: Fabryka Okien $\to$ Pakiet Szybowy Zespolony + Rama + Uszczelki Gumowe
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Średnia, Licencja: *Stolarka Otworowa i Pakiety Szybowe*
* **Recykling / Odpady**: Odzysk szkła płaskiego i drewna.

### 49. Żarówki Tradycyjne (Epoka 2 -> E5: Świetlówki -> E6: LED)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Ruda Żelaza (Wolfram)
  * *L1*: Szkło Surowe + Miedź Rafinowana + Stal
  * *L2*: Bańka Szklana Próżniowa (L2) + Żarnik Wolframowy/Drut (w E6: Dioda LED na Krzemie L2) + Gwint Mosiężny
  * *Produkt końcowy*: Fabryka Źródeł Światła $\to$ Bańka + Żarnik/LED + Trzonek E27
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Oświetlenie Elektryczne (Era 2)*
* **Recykling / Odpady**: Żarówki LED zużywają 85% mniej energii i działają 10 lat dłużej.

### 50. Armatura Łazienkowa i Ceramika Sanitarna (Epoka 2 -> E7: Odzysk Szarej Wody)
* **Drzewo łańcucha**:
  * *Surowce*: Glina Ceramiczna + Ruda Miedzi (Mosiądz)
  * *L1*: Glina Oczyszczona + Miedź Rafinowana
  * *L2*: Szkliwiona Ceramika Sanitarna (Umywalki/Muszle L2) + Baterie Mosiężne Chromowane (L2) + Zawory Ceramiczne
  * *Produkt końcowy*: Fabryka Armatury $\to$ Korpus Sanitarny + Zawory + Uszczelnienia
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Wysoka (Wypał ceramiki), Licencja: *Instalacje Sanitarne Budynków (Era 2)*
* **Recykling / Odpady**: Regeneracja zaworów u **Serwisantów**; mosiądz ze złomu w 100% zdatny do przetopu.

### 51. Grzejniki i Kotły Gazowe/Olejowe (Epoka 3 – [Wygasa w Epoce 7])
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ruda Miedzi
  * *L1*: Stal + Miedź
  * *L2*: Blacha Stalowa Tłoczona (L2) + Wężownica Miedziana (L2) + Palnik Gazowy (L2)
  * *Produkt końcowy*: Fabryka Kotłów $\to$ Wymiennik Ciepła + Palnik + Pompa Obiegowa + Obudowa
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Ogrzewanie Centralne (Era 3)*
* **Recykling / Odpady**: Zastępowane w Epoce 7 przez domowe pompy ciepła; złom stalowy i miedź podlegają odzyskowi.

### 52. Lodówki i Chłodziarki Domowe (Epoka 3: freonowe -> E5: energooszczędne -> E7: A+++ modułowe)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ropa Naftowa + Ruda Miedzi
  * *L1*: Stal + Frakcje Naftowe + Miedź
  * *L2*: Agregat Kompresorowy (L2) + Rurki Miedziane Chłodnicze + Pianka Izolacyjna Poliuretanowa (L2) + Blacha Malowana
  * *Produkt końcowy*: Fabryka AGD $\to$ Korpus Izolowany + Kompresor + Układ Chłodniczy + Półki Szklane
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Średnia, Licencja: *Agregaty Chłodnicze Domowe (Era 3)*
* **Recykling / Odpady**: Niebezpieczne czynniki chłodnicze wymagają utylizacji; metal i kable podlegają odzyskowi.

### 53. Pralki Automatyczne (Epoka 3 -> E7: Ultradźwiękowe Niskowodowe)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ruda Miedzi + Ropa Naftowa
  * *L1*: Stal + Miedź + Tworzywa
  * *L2*: Bęben ze Stali Nierdzewnej (L2) + Silnik Elektryczny (L2) + Programator/Płytka PCB (L2) + Przeciwwaga Betonowa
  * *Produkt końcowy*: Fabryka AGD $\to$ Bęben + Silnik + Programator + Obudowa Blaszana
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Elektromechanika Domowa (Era 3)*
* **Recykling / Odpady**: Wymiana łożysk i pomp przez **Serwisantów** zapobiega wyrzucaniu całej pralki.

### 54. Odkurzacze i Małe AGD (Epoka 3 -> E7: Roboty Sprzątające)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Ruda Miedzi + Ruda Żelaza
  * *L1*: Tworzywa Sztuczne + Miedź + Stal
  * *L2*: Silnik Szybkoobrotowy (L2) + Turbina Ssąca (L2) + Obudowa Plastikowa (w E7: Sensory Lidar i Bateria Li-Ion L2)
  * *Produkt końcowy*: Zakład AGD $\to$ Silnik + Turbina + Filtr HEPA + Obudowa
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Niska, Licencja: *Silniki Komutatorowe Małej Mocy (Era 3)*
* **Recykling / Odpady**: Odzysk miedzi z silnika i plastiku z obudowy.

### 55. Kuchenki i Piekarniki (Gazowe -> E6: Indukcyjne Elektryczne)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Piasek Kwarcowy + Ruda Miedzi
  * *L1*: Stal + Szkło Surowe + Miedź
  * *L2*: Płyta Ceramiczna Szklana (L2) + Cewki Miedziane Indukcyjne (L2) + Moduł Zasilania Impulsowego (L2)
  * *Produkt końcowy*: Fabryka Kuchni $\to$ Korpus Stalowy Piekarnika + Płyta Indukcyjna + Sterowanie
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Ogrzewanie Indukcyjne (Era 6)*
* **Recykling / Odpady**: Stal nierdzewna i cewki miedziane w 100% do recyklingu.

### 56. Klimatyzatory Domowe (Epoka 4)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Miedzi + Ropa Naftowa
  * *L1*: Aluminium Hutnicze + Miedź + Tworzywa
  * *L2*: Lamele Aluminiowe Wymiennika (L2) + Sprężarka Inwerterowa (L2) + Płytka PCB Sterownika (L2)
  * *Produkt końcowy*: Fabryka Klimatyzacji $\to$ Jednostka Wewnętrzna + Agregat Zewnętrzny + Rury Miedziane
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Klimatyzacja Indywidualna (Era 4)*
* **Recykling / Odpady**: Odzysk drogich metali nieżelaznych (aluminium i miedź).

### 57. Prefabrykaty Budowlane (Wielka Płyta Betonowa -> E7: Moduły CLT i Eko-Beton)
* **Drzewo łańcucha**:
  * *Surowce*: Wapień + Piasek + Ruda Żelaza (w E7: Drewno Okrągłe i Zielony Beton)
  * *L1*: Wapno Palone + Kruszywo + Stal
  * *L2*: Cement Portlandzki (L2) + Pręty Zbrojeniowe Stalowe (L2) (w E7: Płyty CLT Drewniane Klejone L2)
  * *Produkt końcowy*: Zakład Prefabrykacji $\to$ Zbrojenie Stalowe + Zalewanie Betonem w Formach
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Uprzemysłowienie Budownictwa Mieszkaniowego (Era 4)*
* **Recykling / Odpady**: Gruz rozbiórkowy $\to$ kruszywo drogowe; złom zbrojeniowy $\to$ huta.

### 58. Materiały Termoizolacyjne (Epoka 5: Styropian -> E7: Bio-Izolacja z Grzybni i Celulozy)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa (w E7: Drewno/Celuloza + Algi/Grzybnia)
  * *L1*: Frakcje Naftowe (w E7: Celuloza)
  * *L2*: Polistyren Spieniany EPS (w E7: Panele z Mycelium i Włókien Celulozowych L2)
  * *Produkt końcowy*: Zakład Izolacji $\to$ Płyty Termoizolacyjne Styropianowe / Bio-Panele
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Fizyka Budowli i Termomodernizacja (Era 5)*
* **Recykling / Odpady**: W E7 materiał w 100% kompostowalny, redukujący zużycie energii w budynkach o 60%.

### 59. Zmywarki Wodooszczędne (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ropa Naftowa + Ruda Miedzi
  * *L1*: Stal + Tworzywa + Miedź
  * *L2*: Komora ze Stali Kwasoodpornej (L2) + Pompa Myjąca z Grzałką (L2) + Płytka Mikroprocesorowa (L2)
  * *Produkt końcowy*: Fabryka AGD $\to$ Komora + Ramiona Natryskowe + Kosze + Elektronika Sterująca
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Gospodarka Wodna AGD (Era 5)*
* **Recykling / Odpady**: Serwis wymiennych elektrozaworów i pomp.

### 60. Inteligentne Systemy Zarządzania Domem (Smart Home) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Ruda Złota
  * *L1*: Krzem + Miedź + Złoto
  * *L2*: Płytka PCB (L2) + Mikroprocesor IoT (L2) + Moduł Łączności Bezprzewodowej (L2) + Przekaźniki
  * *Produkt końcowy*: Zakład Inteligentnych Budynków $\to$ Centrala Smart Hub + Sensory Temperatury i Ruchu + Aplikacja
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Automatyka Budynkowa i IoT (Era 6)*
* **Recykling / Odpady**: Aktualizacje oprogramowania wydłużają cykl życia; cenny złom elektroniczny (złoto i miedź).

---

## Branża 4: Transport i Pojazdy (Produkty 61–80)

### 61. Rowery Klasyczne Miejskie (Epoka 2 -> E6: Ultralekkie)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Kauczuk Naturalny + Bydło (skórzane siodełko)
  * *L1*: Stal + Guma + Skóra
  * *L2*: Rury Stalowe Ramy (L2) + Przekładnia Łańcuchowa (L2) + Opony Rowerowe (L2)
  * *Produkt końcowy*: Fabryka Rowerów $\to$ Rama Spawana + Koła ze Szprychami + Siodełko + Napęd
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Geometria Ramy i Napęd Łańcuchowy (Era 2)*
* **Recykling / Odpady**: 0 emisji spalin; serwisant wymienia dętki i łańcuch; metal w 100% do odzysku.

### 62. Powóz / Wóz Dostawczy (Epoka 2 – [Wygasa w Epoce 3])
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe + Ruda Żelaza + Bydło/Konie
  * *L1*: Tarcica + Stal + Skóra
  * *L2*: Koła Drewniane z Obręczą Stalową (L2) + Resory Piórowe Stalowe (L2) + Uprząż Skórzana
  * *Produkt końcowy*: Wytwórnia Powozów $\to$ Drewniane Nadwozie + Oś Stalowa + Resory
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Kołodziejstwo i Pojazdy Konne*
* **Recykling / Odpady**: Relikt przeszłości – w Epoce 3 wyparty całkowicie przez samochody dostawcze.

### 63. Lokomotywy Parowe i Wagony (Epoka 2 – [Wygasa w Epoce 4])
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ruda Miedzi + Drewno Okrągłe
  * *L1*: Stal + Miedź + Tarcica
  * *L2*: Kocioł Parowy Wysokociśnieniowy (L2) + Koła Kolejowe i Osie (L2) + Tłokowy Silnik Parowy (L2)
  * *Produkt końcowy*: Zakłady Taboru Kolejowego $\to$ Kocioł + Ostoja Stalowa + Silnik Parowy + Tender Węglowy
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Bardzo Wysoka, Licencja: *Trakcja Parowa Dużej Mocy (Era 2)*
* **Recykling / Odpady**: Olbrzymia masa stali $\to$ w Epoce 4 trafia do hut jako wsad do pieców martenowskich.

### 64. Statki Parowe i Węglowce (Epoka 2 – [Wygasa w Epoce 4])
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Drewno Okrągłe + Ruda Miedzi
  * *L1*: Stal + Tarcica + Miedź
  * *L2*: Poszycie Kadłuba ze Stali Okrętowej (L2) + Maszyna Parowa Potrójnego Rozprężania (L2) + Śruba Brązowa (L2)
  * *Produkt końcowy*: Stocznia Morska $\to$ Kadłub Nitowany + Maszynownia + Wyposażenie Pokładowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Bardzo Wysoka, Licencja: *Okrętownictwo Nitowane (Era 2)*
* **Recykling / Odpady**: Złomowanie statków dostarcza setek ton stali dla gospodarki.

### 65. Samochody Osobowe Spalinowe (Benzyna/Diesel) (Epoka 2 -> [Wygasa w Epoce 7])
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ropa Naftowa + Kauczuk Naturalny
  * *L1*: Stal + Frakcje Naftowe + Guma
  * *L2*: Silnik Spalinowy ICE (L2) + Skrzynia Biegów (L2) + Opony Gumowe (L2) + Blacha Karoseryjna Tłoczona (L2)
  * *Produkt końcowy*: Fabryka Samochodów (Taśma Montażowa) $\to$ Podwozie + Silnik + Karoseria + Wnętrze
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Wysoka, Licencja: *Taśmowy Montaż Samochodów Fordyzm (Era 2)*
* **Recykling / Odpady**: Kasacja pojazdów: odzysk stali, ołowiu z akumulatora, opon; wysoka emisja spalin w mieście.

### 66. Ciężarówki Spalinowe (Epoka 2 -> [Wygasa w Epoce 7])
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ropa Naftowa + Kauczuk
  * *L1*: Stal + Frakcje Naftowe + Guma
  * *L2*: Wzmocniona Rama Nośna C-Section (L2) + Silnik Wysokoprężny Diesel (L2) + Mosty Napędowe (L2) + Zespół Bliźniaczych Opon
  * *Produkt końcowy*: Fabryka Pojazdów Ciężarowych $\to$ Podwozie Ciężarowe + Silnik + Kabina + Skrzynia Ładunkowa
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Wysoka, Licencja: *Pojazdy Użytkowe Dużej Ładowności (Era 2)*
* **Recykling / Odpady**: Zastępowane w Epoce 7 przez ciężarówki elektryczne i wodorowe.

### 67. Motocykle i Skutery Spalinowe (Epoka 2 -> E6: Elektryczne)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Kauczuk + Ropa Naftowa
  * *L1*: Stal + Guma + Frakcje Naftowe
  * *L2*: Lekki Silnik Jednocylindrowy (L2) + Rama Rurowa (L2) + Koła Motocyklowe (L2)
  * *Produkt końcowy*: Wytwórnia Motocykli $\to$ Rama + Silnik + Układ Wydechowy + Siedzenie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Jednoślady Silnikowe (Era 2)*
* **Recykling / Odpady**: Odzysk metali; w Epoce 6 konwersja na silniki bezszczotkowe BLDC.

### 68. Opony Komunikacyjne (Epoka 2 -> E7: Bezpowietrzne z Recyklingu)
* **Drzewo łańcucha**:
  * *Surowce*: Kauczuk Naturalny + Ropa Naftowa (Sadza i Polimery) + Ruda Żelaza
  * *L1*: Guma Surowa + Kord Stalowy + Chemikalia
  * *L2*: Mieszanka Bieżnika z Sadzą (L2) + Opasanie Stalowe (L2)
  * *Produkt końcowy*: Fabryka Opon $\to$ Kord Stalowy + Mieszanka Gumowa + Wulkanizacja w Formie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Opony Radialne Ciśnieniowe (Era 2)*
* **Recykling / Odpady**: Bieżnikowanie u **Serwisantów** wydłuża życie; zużyte opony $\to$ granulat gumowy L1.

### 69. Autobusy Miejskie Spalinowe (Epoka 3 -> E6: Elektryczne i Wodorowe)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Aluminium + Kauczuk
  * *L1*: Stal + Aluminium + Guma
  * *L2*: Silnik Diesla Autobusowy (L2) + Kratownica Niskopodłogowa (L2) + Fotele Pasażerskie (L2)
  * *Produkt końcowy*: Fabryka Autobusów $\to$ Podwozie + Nadwozie ze Stali i Aluminium + Układ Drzwi Pneumatycznych
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Wysoka, Licencja: *Komunikacja Zbiorowa Niskopodłogowa (Era 3)*
* **Recykling / Odpady**: E6: Wymiana napędu na wodorowe ogniwa paliwowe.

### 70. Pociągi Spalinowe i Elektryczne (Epoka 3 -> E5: Koleje Dużych Prędkości)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ruda Miedzi + Boksyt
  * *L1*: Stal + Miedź + Aluminium
  * *L2*: Wózki Wagonowe Skrętne (L2) + Silniki Trakcyjne Asynchroniczne (L2) + Pantograf i Transformator (L2)
  * *Produkt końcowy*: Zakłady Pojazdów Szynowych $\to$ Człon Napędowy + Wagony Aluminiowe + System Sterowania Ruchem
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Wysoka, Licencja: *Trakcja Elektryczna Kolejowa (Era 3)*
* **Recykling / Odpady**: Najbardziej ekologiczny transport lądowy; wagony eksploatowane przez 30–40 lat.

### 71. Samoloty Pasażerskie Tłokowe (Epoka 3 -> E4: Odrzutowce -> E7: Na Wodór/E-Paliwa)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Żelaza + Ruda Miedzi
  * *L1*: Aluminium Hutnicze + Stal
  * *L2*: Poszycie ze Stopów Duraluminium (L2) + Silniki Gwiazdowe / Turboodrzutowe (L2) + Awionika Pokładowa (L2)
  * *Produkt końcowy*: Zakład Lotniczy $\to$ Kadłub Aluminiowy + Skrzydła ze Zbiornikami + Silniki + Kabina Ciśnieniowa
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Bardzo Wysoka, Licencja: *Aerodynamika i Napędy Lotnicze (Era 3)*
* **Recykling / Odpady**: Certyfikowane stopy lotnicze $\to$ rygorystyczny recykling aluminium i tytanu.

### 72. Kontenerowce i Statki Motorowe (Epoka 4 -> E7: Wodorowo-Żaglowe)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ropa Naftowa + Miedź
  * *L1*: Stal + Frakcje Naftowe + Miedź
  * *L2*: Stalowe Sekcje Kadłubowe (L2) + Dwusuwowy Silnik Okrętowy Wielkiej Mocy (L2) + Dźwigi i Prowadnice Kontenerowe
  * *Produkt końcowy*: Stocznia Wielkich Jednostek $\to$ Zespolenie Bloków Kadłuba + Montaż Maszynowni + Mostek Nawigacyjny
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Ekstremalna, Licencja: *Architektura Okrętowa Kontenerowa (Era 4)*
* **Recykling / Odpady**: Złomowanie kadłuba zwraca tysiące ton stali do hutnictwa w Epoce 7.

### 73. Tramwaje i Pociągi Metra (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Ruda Miedzi + Piasek Kwarcowy
  * *L1*: Stal + Aluminium + Miedź + Szkło
  * *L2*: Silniki Trakcyjne (L2) + Falowniki Trakcyjne (L2) + Przeguby Członów (L2) + Okna Bezpieczne
  * *Produkt końcowy*: Fabryka Taboru Miejskiego $\to$ Moduły Tramwajowe + Wózki Biegowe + Zasilanie 600V DC
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Szynowy Transport Aglomeracyjny (Era 3)*
* **Recykling / Odpady**: Bezpośrednio podnosi wskaźnik zdrowia i czystości powietrza w miastach.

### 74. Samochody Hybrydowe (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Ruda Litu + Ruda Miedzi
  * *L1*: Stal + Aluminium + Lit + Miedź
  * *L2*: Silnik Spalinowy o Cyklu Atkinsona (L2) + Generator i Silnik Elektryczny (L2) + Pakiet Baterii Trakcyjnych (L2) + Przekładnia Planetarna
  * *Produkt końcowy*: Fabryka Aut Nowej Generacji $\to$ Platforma Hybrydowa + Falownik Sterujący + Bateria + Karoseria
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Napędy Spalinowo-Elektryczne (Era 6)*
* **Recykling / Odpady**: Pomost technologiczny redukujący zużycie paliwa o 40%.

### 75. Samochody Osobowe Elektryczne (EV) (Epoka 6 -> E7: Baterie Solid-State z Recyklingu)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Litu + Ruda Miedzi + Neodym i Ziemie Rzadkie
  * *L1*: Aluminium + Lit + Miedź + Neodym
  * *L2*: Pakiet Bateryjny Li-Ion NMC / Solid-State (L2) + Silnik Synchroniczny z Magnesami Trwałymi (L2) + Komputer Pokładowy Autonomii (L2)
  * *Produkt końcowy*: Gigafabryka Samochodów Elektrycznych $\to$ Podwozie Deskorolkowe (Skateboard) z Baterią + Silniki Osiowe + Nadwozie Aluminiowe
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Wysoka (Warunki Cleanroom dla ogniw), Licencja: *Architektura Pojazdów Bateryjnych EV (Era 6)*
* **Recykling / Odpady**: Odzysk 95% litu, kobaltu, niklu i miedzi w specjalistycznym Zakładzie Recyklingu Baterii.

### 76. Rowery Elektryczne (E-Bike) i Hulajnogi Miejskie (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Litu + Ruda Miedzi
  * *L1*: Aluminium + Lit + Miedź
  * *L2*: Rama ze Stopów Aluminium (L2) + Silnik w Piaście Koła BLDC (L2) + Bateria Bidonowa Li-Ion (L2) + Kontroler Momentu
  * *Produkt końcowy*: Fabryka Mikromobilności $\to$ Rama ze Zintegrowaną Baterią + Napęd Elektryczny + Osprzęt
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Lekkie Pojazdy Osobiste LEV (Era 6)*
* **Recykling / Odpady**: Redukuje korki i emisje transportowe w mieście o 30%.

### 77. Ciężarówki Elektryczne i Wodorowe (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Wodór + Neodym
  * *L1*: Stal Wysokowytrzymała + Aluminium + Wodór Bazowy + Neodym
  * *L2*: Ogniwa Paliwowe PEM (L2) + Zbiorniki Kompozytowe na Wodór 700 bar (L2) + Ciężkie Osie Elektryczne e-Axle (L2)
  * *Produkt końcowy*: Zakład Pojazdów Ciężkich Zero Emisji $\to$ Podwozie Ciężarowe + Stos Ogniw Paliwowych + Zbiorniki Wodoru + Kabina Aerodynamiczna
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Wysoka, Licencja: *Wodorowe Układy Napędowe Dużej Mocy (Era 7)*
* **Recykling / Odpady**: Jedynym produktem ubocznym pracy jest czysta para wodna ($H_2O$).

### 78. Samochody Wodorowe (Ogniwa Paliwowe FCEV) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Złota/Platyna + Włókna Polimerowe + Wodór
  * *L1*: Aluminium + Platyna Katalityczna + Wodór Bazowy
  * *L2*: Stos Ogniw Wodorowych (L2) + Zbiornik z Włókna Węglowego (L2) + Buforowa Bateria Trakcyjna (L2)
  * *Produkt końcowy*: Fabryka FCEV $\to$ Podwozie + Ogniwa Paliwowe + Silnik Elektryczny + Zbiornik
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Ogniwa Paliwowe dla Motoryzacji (Era 7)*
* **Recykling / Odpady**: Odzysk platyny z katalizatorów i włókien węglowych ze zbiorników.

### 79. Autonomiczne Kapsuły Miejskie (MaaS / Robo-Taxi) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Krzem + Neodym + Ruda Litu
  * *L1*: Aluminium + Krzem Monokrystaliczny + Ziemie Rzadkie + Lit
  * *L2*: Sensory Lidar i Kamery Solid-State (L2) + Komputer Pokładowy z Akceleratorem AI (L2) + Napęd Elektryczny 4-Kołowy Skrętny (L2) + Wnętrze Modułowe
  * *Produkt końcowy*: Fabryka Pojazdów Autonomicznych $\to$ Kapsuła Bez Kierownicy + Zespół Czujników 360° + Bateria Szybkiego Ładowania
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Sztuczna Inteligencja Sterowania Ruchem i Autonomia Lvl 5 (Era 7)*
* **Recykling / Odpady**: Model "Produkt jako Usługa" (PaaS) – pojazd współdzielony zastępuje 10 prywatnych aut na ulicach miast.

### 80. Pasażerskie Drony Pionowego Startu (eVTOL) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Włókna Polimerowe (Nanotuby) + Neodym + Ruda Litu + Złoto
  * *L1*: Włókna Węglowe + Ziemie Rzadkie + Lit Wysokoenergetyczny + Krzem
  * *L2*: Wielowirnikowy Układ Ciągu Wektorowanego (L2) + Baterie Solid-State o Wysokiej Gęstości (L2) + Awionika Autonomiczna AI (L2) + Lekki Kadłub Węglowy
  * *Produkt końcowy*: Zakłady Lotnictwa Miejskiego $\to$ Płatowiec Kompozytowy + Silniki Wielołopatowe + System Bezpieczeństwa Balistycznego
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Bardzo Wysoka, Licencja: *Pasażerska Mobilność Powietrzna UAM (Era 8)*
* **Recykling / Odpady**: Bezemisyjny transport omijający naziemną infrastrukturę drogową.

---

## Branża 5: Chemia Gospodarcza i Kosmetyki (Produkty 81–100)

### 81. Mydło Tradycyjne w Kostce (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Słoneczniki (lub Bydło) + Sól Kamienna
  * *L1*: Olej Słonecznikowy + Sól Oczyszczona
  * *L2*: Zasada Sodowa (Ług sodowy z elektrolizy soli L2) + Kwasy Tłuszczowe
  * *Produkt końcowy*: Mydlarnia Przemysłowa $\to$ Zmydlanie Tłuszczu Ługiem + Odlewanie Kostek + Papierowe Zawijki
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Zmydlanie Tłuszczów (Era 3)*
* **Recykling / Odpady**: Produkt 100% biodegradowalny; opakowanie papierowe z recyklingu.

### 82. Proszki do Prania (Epoka 3: Fosforanowe -> E6: Enzymatyczne Bio)
* **Drzewo łańcucha**:
  * *Surowce*: Sól Kamienna + Fosforyty (w E6: Algi i Fermenty) + Ropa Naftowa
  * *L1*: Chemia Nieorganiczna + Fosforany Oczyszczone
  * *L2*: Surfaktanty Syntetyczne (L2) + Zeolity/Fosforany Zmiękczające (w E6: Enzymy Proteolityczne Bio L2) + Karton
  * *Produkt końcowy*: Fabryka Chemii Gospodarczej $\to$ Mieszanie Granulatu Piorącego + Pakowanie w Pudła Kartonowe
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Wieże suszarnicze rozpyłowe), Licencja: *Detergenty Syntetyczne (Era 3)*
* **Recykling / Odpady**: Fosforany powodowały eutrofizację wód; w E6 formuła enzymatyczna chroni rzeki i jeziora.

### 83. Płyny do Mycia Naczyń (Epoka 3 -> E7: Koncentraty Wielorazowe)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Sól Kamienna (w E7: Słoneczniki i Algi)
  * *L1*: Frakcje Naftowe + Sól
  * *L2*: Anionowe Środki Powierzchniowo Czynne (L2) + Butelka Plastikowa (w E7: Aluminiowa Butelka Wieczna + Tabletki Koncentratu L2)
  * *Produkt końcowy*: Mieszalnia Detergentów $\to$ Surfaktanty + Kompozycja Zapachowa + Rozlewanie do Butelek
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Formulacje Odtłuszczające (Era 3)*
* **Recykling / Odpady**: W E7 model "Refill" eliminuje miliony plastikowych butelek.

### 84. Środki Czyszczące i Dezynfekujące (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Sól Kamienna + Wapień
  * *L1*: Kwas Solny i Siarkowy + Wapno Palone
  * *L2*: Podchloryn Sodu (Wybielacz chlorowy L2) + Butelka z Tworzywa
  * *Produkt końcowy*: Wytwórnia Środków Dezynfekcyjnych $\to$ Roztwór Chlorowy + Zagęszczacz + Butelka z Bezpiecznym Korkiem
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Dezynfekcja Sanitarzyjna (Era 3)*
* **Recykling / Odpady**: Drastycznie redukuje epidemie w miastach, podnosząc wskaźnik Zdrowia mieszkańców.

### 85. Pasta do Zębów i Higiena Jamy Ustnej (Epoka 3 -> E7: Tabletki Zero-Waste)
* **Drzewo łańcucha**:
  * *Surowce*: Wapień + Sól Kamienna + Boksyt (Tuba aluminiowa)
  * *L1*: Wapno (Węglan wapnia jako ścierniwo) + Związki Fluoru + Aluminium
  * *L2*: Pasta Bazowa Kredowa (L2) + Olejek Miętowy (L2) + Tuba Aluminiowa/Laminat
  * *Produkt końcowy*: Fabryka Kosmetyczna $\to$ Homogenizacja Pasty + Napełnianie Tubek
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Profilaktyka Stomatologiczna (Era 3)*
* **Recykling / Odpady**: W E7 tabletki do rozgryzania w słoiczkach eliminują nienadające się do recyklingu tubki.

### 86. Szampony i Odżywki do Włosów (Epoka 3 -> E6: Szampony w Kostce Bio)
* **Drzewo łańcucha**:
  * *Surowce*: Słoneczniki + Ropa Naftowa + Zioła
  * *L1*: Olej Słonecznikowy + Chemia Organiczna
  * *L2*: Środki Pieniące (L2) + Ekstrakty Roślinne Odżywcze (L2) + Butelka Plastikowa (w E6: Kostka bez wody w papierze)
  * *Produkt końcowy*: Zakład Kosmetyczny $\to$ Baza Myjąca + Kondycjoner + Aromat + Butelkowanie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Kosmetyka Pielęgnacyjna Włosów (Era 3)*
* **Recykling / Odpady**: Wersja w kostce w E6 redukuje transport wody i zużycie plastiku o 100%.

### 87. Perfumy i Wody Toaletowe (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Zioła i Kwiaty + Pszenica (Alkohol) + Piasek Kwarcowy
  * *L1*: Ekstrakty Roślinne Zapachowe + Spirytus Zbożowy + Szkło Surowe
  * *L2*: Olejki Eteryczne Destylowane (L2) + Flakon Szklany Ozdobny (L2) + Atomizer Metalowy (L2)
  * *Produkt końcowy*: Dom Perfumeryjny $\to$ Maceracja Zapachu w Alkoholu + Dojrzewanie + Nalewanie do Flakonów
* **Triada produkcyjna**: Ludzie: `[M]` (Kreatorzy zapachów "Nosy"), Energia: Niska, Licencja: *Komponowanie Zapachów Szlachetnych (Era 3)*
* **Recykling / Odpady**: Flakony szklane podlegają ponownemu napełnieniu lub recyklingowi.

### 88. Kosmetyki Kolorowe (Makijaż) (Epoka 3 -> E6: Mineralne i Wegańskie)
* **Drzewo łańcucha**:
  * *Surowce*: Glina/Minerały (Mika, Talk) + Słoneczniki + Tlenki Żelaza
  * *L1*: Minerały Oczyszczone + Olej Słonecznikowy + Pigmenty
  * *L2*: Baza Pudrowa Mikronizowana (L2) + Woski Roślinne (L2) + Kasetki Plastikowe/Metalowe
  * *Produkt końcowy*: Laboratorium Kosmetyków Kolorowych $\to$ Prasowanie Cieni/Pudrów + Formowanie Szminek + Pakowanie
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Mikronizacja Minerałów Kosmetycznych (Era 3)*
* **Recykling / Odpady**: E6: Zastąpienie testów na zwierzętach hodowlami komórkowymi podnosi ocenę Eko-Etyki.

### 89. Kremy do Skóry i Dermokosmetyki (Epoka 3)
* **Drzewo łańcucha**:
  * *Surowce*: Słoneczniki + Bydło (Lanolina) + Piasek Kwarcowy
  * *L1*: Olej Słonecznikowy + Tłuszcze Zwierzęce/Roślinne + Szkło
  * *L2*: Baza Emulsyjna (L2) + Składniki Aktywne Nawilżające (L2) + Słoiczek Szklany (L2)
  * *Produkt końcowy*: Wytwórnia Dermokosmetyków $\to$ Emulgacja w Próżni + Wtłaczanie Witamin + Dozowanie do Słoiczków
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Farmakopea Kosmetyczna i Emulsje (Era 3)*
* **Recykling / Odpady**: Słoiczki szklane $\to$ odzysk szkła.

### 90. Środki Ochrony Roślin (Pestycydy Chemiczne) (Epoka 3 – [Wygasają w Epoce 7])
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Sól Kamienna + Fosforyty
  * *L1*: Frakcje Naftowe + Związki Chloru i Fosforu
  * *L2*: Związki Fosforoorganiczne Toksyczne (L2) + Kanistry HDPE Chemioodporne (L2)
  * *Produkt końcowy*: Zakłady Chemiczne Agro $\to$ Synteza Toksyny + Stabilizatory + Butelkowanie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia (Wysokie ryzyko BHP), Licencja: *Synteza Chemiczna Pestycydów (Era 3)*
* **Recykling / Odpady**: Zwiększa plony w Epoce 3–5, ale drastycznie obniża Globalny Licznik Bioróżnorodności; w E7 delegalizowana.

### 91. Worki i Opakowania Foliowe Jednorazowe (Epoka 4 – [Wygasają w Epoce 6])
* **Drzewo łańcucha**:
  * *Surowiec*: Ropa Naftowa
  * *L1*: Frakcje Naftowe
  * *L2*: Polietylen Cienkościenny LDPE (L2)
  * *Produkt końcowy*: Wytwórnia Folii $\to$ Ekstruzja z Rozdmuchen Rękawów Foliowych + Zgrzewanie Torebek
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Ekstruzja Polimerów Cienkich (Era 4)*
* **Recykling / Odpady**: Główny winowajca zatykania miejskich wysypisk i skażenia oceanów; w E6 wyparty przez biopolimery.

### 92. Dezodoranty w Aerozolu (Freonowe -> E5: Bezpieczne Gazowo)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ropa Naftowa + Chemikalia
  * *L1*: Aluminium Hutnicze + Rozpuszczalniki
  * *L2*: Puszka Aluminiowa Monoblok (L2) + Zawór Aerozolowy (L2) + Gaz Nośny (CFC -> Propan-Butan w E5)
  * *Produkt końcowy*: Linia Aerozoli $\to$ Napełnianie Koncentratem + Wtłaczanie Gazu Nośnego + Kapslowanie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Technologia Gazów Nośnych i Aerozoli (Era 4)*
* **Recykling / Odpady**: Puszka aluminiowa w 100% zdatna do przetopu; eliminacja freonów ratuje warstwę ozonową.

### 93. Pieluchy Jednorazowe (Epoka 4 -> E6: Biodegradowalne z Celulozy)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe + Ropa Naftowa (w E6: Biopolimery ze Skrobi)
  * *L1*: Celuloza Bielona + Frakcje Naftowe
  * *L2*: Pulpa Celulozowa Chłonna (L2) + Poliakrylan Sodu Superabsorbent (L2) + Włóknina Polipropylenowa (L2)
  * *Produkt końcowy*: Fabryka Artykułów Higienicznych $\to$ Formowanie Wkładu Chłonnego + Klejenie Rzepów i Falbanek
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Średnia, Licencja: *Superabsorbenty Polimerowe SAP (Era 4)*
* **Recykling / Odpady**: Olbrzymia frakcja śmieci miejskich; w E6 wariant z celulozy i alg ulega biodegradacji w kompoście.

### 94. Odświeżacze Powietrza i Świece Zapachowe (Epoka 4)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa (Parafina) lub Soja/Słonecznik + Piasek Kwarcowy
  * *L1*: Frakcje Parafinowe + Szkło
  * *L2*: Wosk Parafinowy/Sojowy (L2) + Kompozycje Zapachowe Syntetyczne (L2) + Knot Bawełniany
  * *Produkt końcowy*: Wytwórnia Świec i Dyfuzorów $\to$ Odlewanie Wosku w Szkle + Knotowanie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Aromatyzacja Przestrzeni Zamkniętych (Era 4)*
* **Recykling / Odpady**: Słoiczki szklane do ponownego wykorzystania.

### 95. Kapsułki Piorące Rozpuszczalne (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Słoneczniki + Sól Kamienna + Algi Morskie
  * *L1*: Olej Słonecznikowy + Chemia Organiczna
  * *L2*: Skoncentrowany Żel Piorący Enzymatyczny (L2) + Folia Wodorozpuszczalna PVOH (L2)
  * *Produkt końcowy*: Zakład Chemii Precyzyjnej $\to$ Zgrzewanie Wielokomorowych Kapsułek Żelowych
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Polimery Wodorozpuszczalne PVOH (Era 6)*
* **Recykling / Odpady**: Folia rozpuszcza się całkowicie w praniu, nie generując mikroplastiku; opakowanie zbiorcze z tektury.

### 96. Filtry i Wkłady do Oczyszczania Wody Kranowej (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Węgiel Kamienny (lub Łupiny Orzechów) + Ropa Naftowa + Sól
  * *L1*: Węgiel + Tworzywa
  * *L2*: Węgiel Aktywny o Wysokiej Powierzchni (L2) + Żywica Jonowymienna (L2) + Obudowa Plastikowa z Tworzywa z Recyklingu
  * *Produkt końcowy*: Fabryka Filtrów Wody $\to$ Napełnianie Wkładu Złożem Węglowo-Żywicznym + Zgrzewanie Ultradźwiękowe
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Filtracja Węglowa i Dejonizacja (Era 5)*
* **Recykling / Odpady**: Zużyte złoże węglowe wraca do rekonstytucji termicznej; redukuje zużycie butelek plastikowych o 90%.

### 97. Kremy z Filtrem UV Bezpieczne dla Raf Koralowych (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Wapień/Cynk + Słoneczniki + Algi Morskie
  * *L1*: Tlenek Cynku Niemikronizowany + Olej Słonecznikowy + Biomasa z Alg
  * *L2*: Mineralne Filtry UV (L2) + Emulsja Roślinna Wodoodporna (L2) + Tuba z Bioplastiku Trzcinowego
  * *Produkt końcowy*: Eko-Laboratorium Kosmetyczne $\to$ Homogenizacja Tlenku Cynku z Bazą Roślinną
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Mineralna Fotoprotekcja Biozgodna (Era 6)*
* **Recykling / Odpady**: 0% szkodliwych chemikaliów (oksybenzonu) niszczących biomy morskie na Mapie Świata.

### 98. Opakowania Biodegradowalne z Alg i Grzybni (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Odpady Rolne (Słoma/Łuski)
  * *L1*: Biomasa Morska + Odpady Celulozowe
  * *L2*: Grzybnia Mycelium w Formach Rozrostowych (L2) + Żel Alginianowy Powłokowy (L2)
  * *Produkt końcowy*: Bio-Fabryka Opakowań $\to$ Rozrost Grzybni w Matrycach + Termiczne Suszenie Blokujące Wzrost
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska (Proces biologicznego wzrostu w 25°C), Licencja: *Materiały Grzybniowe i Alginianowe (Era 6)*
* **Recykling / Odpady**: Zastępuje styropian i plastik; po użyciu rozkłada się w ogródku w 30 dni jako nawóz.

### 99. Bio-Środki Ochrony Roślin i Biostymulatory (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Zioła i Czosnek
  * *L1*: Ekstrakty Roślinne + Biomasa z Alg
  * *L2*: Fermenty Bakteryjne Bacillus Thuringiensis (L2) + Wyciągi z Pancerzyków Skorupiaków Chitozan (L2)
  * *Produkt końcowy*: Zakład Biologicznej Ochrony Roślin $\to$ Namnażanie Kultur Mikrobiologicznych + Koncentrat w Kanistrach
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Biokontrola i Indukcja Odporności Roślin (Era 6)*
* **Recykling / Odpady**: Zastępuje toksyczne pestycydy; przywraca populacje owadów zapylających i bioróżnorodność.

### 100. Kosmetyki Personalizowane DNA i Probiotyki Czystości (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Słoneczniki + Sól Kamienna
  * *L1*: Biomasa + Olej Słonecznikowy + Odczynniki Chemiczne
  * *L2*: Żywe Kultury Dobroczynnych Bakterii Skórnych (L2) + Peptydy Sygnałowe z Syntezy Bio (L2) + Dozownik Szklany z Kodem QR
  * *Produkt końcowy*: Zautomatyzowane Laboratorium Genokosmetyki $\to$ Mieszanie Składników pod Profil Mikrobiomu Klienta
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Kosmetyka Epigenetyczna i Mikrobiomowa (Era 7)*
* **Recykling / Odpady**: Ekologiczne czyszczenie oparte na enzymach i probiotykach zamiast agresywnego chloru.

---

## Branża 6: Elektronika i Komunikacja (Produkty 101–120)

### 101. Odbiorniki Radiowe Tranzystorowe (Epoka 4 -> [Wygasa w Epoce 6])
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy (German/Krzem) + Ruda Miedzi + Ropa Naftowa
  * *L1*: Miedź Rafinowana + Tworzywa
  * *L2*: Tranzystory Dyskretne (L2) + Płytka Drukowana PCB (L2) + Głośnik z Magnesem (L2) + Obudowa Bakelitowa/Plastikowa
  * *Produkt końcowy*: Fabryka Radioodbiorników $\to$ Montaż Przewlekany THT + Lutowanie na Fali + Strojenie Obwodów LC
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Średnia, Licencja: *Fizyka Ciała Stałego i Tranzystory Bipolarne (Era 4)*
* **Recykling / Odpady**: Początek elektrośmieci; cenna miedź w transformatorach i cewkach.

### 102. Telewizory Kineskopowe (CRT) (Epoka 4 -> E6: Ekrany Płaskie OLED -> E8: Holografia)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Ruda Żelaza
  * *L1*: Szkło Surowe + Miedź + Stal
  * *L2*: Szklana Bańka Kineskopowa z Działem Elektronowym (L2) + Cewki Odchylania Miedziane (L2) + Płyta Główna Wysokiego Napięcia (L2)
  * *Produkt końcowy*: Zakłady Telewizyjne $\to$ Montaż Kineskopu w Obudowie Drewnianej/Plastikowej + Zestrojenie
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Wysoka, Licencja: *Telewizja Kineskopowa Kolorowa (Era 4)*
* **Recykling / Odpady**: Kineskopy zawierały ołów i luminofory; w E6 panele OLED są 5-krotnie lżejsze i energooszczędne.

### 103. Telefony Stacjonarne (Epoka 4 – [Wygasa w Epoce 6])
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Ruda Miedzi + Ruda Żelaza
  * *L1*: Tworzywa + Miedź + Stal
  * *L2*: Tarcza Numerowa / Klawiatura Stykowa (L2) + Dzwonek Elektromechaniczny (L2) + Wkładka Mikrofonowa Węglowa (L2) + Przewód Skręcany
  * *Produkt końcowy*: Fabryka Teletechniczna $\to$ Złożenie Aparatu w Obudowie z Tworzywa ABS
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Telefonia Analogowa Komutowana (Era 4)*
* **Recykling / Odpady**: Wyparte przez telefonię komórkową GSM w Epoce 5–6.

### 104. Magnetofony i Gramofony Hi-Fi (Epoka 4 -> E5: CD/MP3)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Ropa Naftowa (Taśma magnetyczna)
  * *L1*: Stal + Aluminium + Tworzywa
  * *L2*: Mechanizm Magnetofonowy z Kołem Zamachowym (L2) + Głowica Magnetyczna Permalojowa (L2) + Wzmacniacz Audio Stereo (L2)
  * *Produkt końcowy*: Zakłady Radiowo-Magnetofonowe $\to$ Montaż Mechaniki + Elektronika + Płyta Czołowa ze Szczotkowanego Aluminium
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Magnetyczny Zapis Dźwięku (Era 4)*
* **Recykling / Odpady**: Zastąpione przez cyfrowy zapis danych w Epoce 5.

### 105. Kalkulatory Elektroniczne (Epoka 4 – [Wygasa w Epoce 6])
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ropa Naftowa
  * *L1*: Krzem + Tworzywa
  * *L2*: Układ Scalony Kalkulatora LSI (L2) + Wyświetlacz Siedmiosegmentowy LED/VFD (L2) + Klawiatura Gumowa Przewodząca
  * *Produkt końcowy*: Montownia Elektroniki $\to$ Płytka z Układem Scalonym + Wyświetlacz + Obudowa Kieszonkowa
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Integracja Układów Scalonych LSI (Era 4)*
* **Recykling / Odpady**: Zintegrowane jako aplikacja w telefonach w Epoce 6.

### 106. Aparaty Fotograficzne Analogowe (Epoka 4 -> E6: Cyfrowe)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Piasek Kwarcowy + Ruda Żelaza
  * *L1*: Aluminium + Szkło Optyczne + Stal
  * *L2*: Zespół Soczewek Obiektywu (L2) + Migawka Szczelinowa Precyzyjna (L2) + Korpus z Odlewu Stopów Lekkich (L2)
  * *Produkt końcowy*: Fabryka Optyczno-Mechaniczna $\to$ Montaż Optyki + Mechanizm Naciągu Filmu + Kalibracja Czasów
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Fotografia Chemiczna i Lustrzanki Jednoobiektywowe (Era 4)*
* **Recykling / Odpady**: W E6 zastąpione matrycami światłoczułymi CMOS.

### 107. Komputery Osobiste Stacjonarne (PC) (Epoka 5 -> E7: Modułowe Stacje Robocze)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Ruda Złota + Ruda Żelaza
  * *L1*: Krzem Monokrystaliczny + Miedź + Złoto + Stal
  * *L2*: Płyta Główna Wielowarstwowa (L2) + Mikroprocesor CPU x86 (L2) + Kości Pamięci RAM (L2) + Zasilacz Impulsowy (L2) + Dysk Magnetyczny HDD
  * *Produkt końcowy*: Fabryka Komputerów $\to$ Montaż Komponentów w Obudowie Tower + Testy POST + Instalacja Systemu
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia, Licencja: *Architektura Komputerowa Mikroprocesorowa (Era 5)*
* **Recykling / Odpady**: Kluczowy obiekt **Urban Miningu** (odzysk złota z pinów procesora, miedzi z radiatorów i metali ziem rzadkich z dysków).

### 108. Laptopy i Notebooki (Epoka 5 -> E7: Laptopy Modułowe W 100% Naprawialne)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Litu + Krzem + Złoto
  * *L1*: Aluminium + Lit + Krzem + Złoto
  * *L2*: Matryca Wyświetlacza LCD/OLED (L2) + Płyta Główna Niskonapięciowa (L2) + Bateria Li-Ion (L2) + Klawiatura Membranowa
  * *Produkt końcowy*: Precyzyjna Linia Montażu Laptopów $\to$ Obudowa Aluminiowa Unibody + Matryca + Chłodzenie Heatpipe + Płyta
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia, Licencja: *Komputery Przenośne i Zarządzanie Energią ACPI (Era 5)*
* **Recykling / Odpady**: Prawo do Naprawy w Epoce 6–7 wymusza standard modułowych podzespołów bez klejenia.

### 109. Telefony Komórkowe i Smartfony (Epoka 5: GSM -> E6: Smartfon -> E7: Modułowy Fair-Tech)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Litu + Neodym i Ziemie Rzadkie + Ruda Złota
  * *L1*: Krzem + Lit + Neodym + Złoto
  * *L2*: Płyta Główna z Procesorem SoC (L2) + Ekran Dotykowy AMOLED (L2) + Zespół Kamer z Optyką (L2) + Akumulator Li-Po (L2)
  * *Produkt końcowy*: Zautomatyzowana Fabryka Smartfonów $\to$ Zespolenie Ekranu z Ramką Aluminiową + Wklejenie Płyty + Hermetyzacja IP68
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Wysoka (Warunki Cleanroom ISO 5), Licencja: *Telefonia Komórkowa Cyfrowa i Ekrany Dotykowe (Era 5/6)*
* **Recykling / Odpady**: Masowy strumień elektroodpadów; w E7 wymóg łatwo wymiennej baterii i modułowych kamer bez śrub klejonych.

### 110. Drukarki Biurowe i Domowe (Epoka 5 -> E7: Drukarki 3D)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ropa Naftowa + Ruda Miedzi
  * *L1*: Stal + Tworzywa + Miedź
  * *L2*: Precyzyjny Silnik Krokowy (L2) + Głowica Drukująca Piezoelektryczna (w E7: Ekstruder 3D L2) + Wałki Gumowe Pobierania Papieru + Płytka Sterująca
  * *Produkt końcowy*: Fabryka Urządzeń Peryferyjnych $\to$ Mechanizm Posuwu Głowicy + Skaner Optyczny + Obudowa
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Druk Atramentowy i Laserowy (Era 5)*
* **Recykling / Odpady**: Kartridże i tonery objęte programem zwrotu do regeneracji u **Serwisantów**.

### 111. Routery i Urządzenia Sieciowe (Wi-Fi / Światłowód) (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi
  * *L1*: Krzem + Miedź Rafinowana
  * *L2*: Procesor Sieciowy NPU (L2) + Moduły Radiowe RF MIMO (L2) + Złącza Światłowodowe ze Szkła Kwarcowego (L2) + Anteny Zewnętrzne
  * *Produkt końcowy*: Zakład Urządzeń Telekomunikacyjnych $\to$ Płyta PCB z Radiatorami + Porty Gigabit Ethernet + Obudowa
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Protokoły Sieciowe IP i Transmisja Bezprzewodowa (Era 5)*
* **Recykling / Odpady**: Kluczowy element infrastruktury IT w miastach; długi czas eksploatacji.

### 112. Monitory Komputerowe (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Boksyt + Ruda Miedzi
  * *L1*: Szkło Płaskie + Aluminium + Miedź
  * *L2*: Panel Wyświetlacza IPS/OLED (L2) + Skaler Wideo i Płyta Sygnałowa (L2) + Podstawa z Odlewu Aluminium + Podświetlenie LED
  * *Produkt końcowy*: Fabryka Monitorów $\to$ Połączenie Matrycy z Ramką + Zasilacz Wbudowany + Kalibracja Barwna
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Ciekłokrystaliczne Panele Wyświetlaczy (Era 5)*
* **Recykling / Odpady**: Szklana matryca i podstawa aluminiowa podlegają odzyskowi.

### 113. Tablety i Czytniki E-Booków (E-Papier) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Litu + Boksyt
  * *L1*: Krzem + Lit + Aluminium
  * *L2*: Ekran E-Ink Elektroforetyczny (lub OLED) (L2) + Bateria Li-Ion Cienka (L2) + Płyta SoC (L2)
  * *Produkt końcowy*: Linia Montażu Tabletów $\to$ Laminowanie Ekranu z Digitizerem + Bateria + Płaska Obudowa
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Atrament Elektroniczny E-Ink (Era 6)*
* **Recykling / Odpady**: Bardzo niskie zużycie energii podczas czytania (bateria wystarcza na miesiąc).

### 114. Słuchawki Bezprzewodowe i Głośniki Smart (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Neodym i Ziemie Rzadkie + Ruda Miedzi + Ruda Litu
  * *L1*: Tlenki Neodymu + Miedź + Lit
  * *L2*: Przetworniki Akustyczne z Silnymi Magnesami Neodymowymi (L2) + Miniaturowy Akumulator Pastylkowy (L2) + Moduł Bluetooth DSP (L2)
  * *Produkt końcowy*: Wytwórnia Audio $\to$ Precyzyjny Montaż Przetwornika w Kapsułce Dokanałowej + Mikrofony ANC
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Cyfrowa Redukcja Szumów ANC i Łączność TWS (Era 6)*
* **Recykling / Odpady**: Miniaturyzacja utrudnia wymianę baterii – prawo wymusza konstrukcje rozbieralne.

### 115. Smartwatche i Opaski Zdrowotne (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Złota + Kauczuk / Eko-Skóra
  * *L1*: Krzem + Złoto + Guma/Bioplastik
  * *L2*: Optyczny Sensor Tętna i Natlenienia SpO2 (L2) + Mini-Wyświetlacz Micro-LED (L2) + Procesor Ultraniskonapięciowy (L2)
  * *Produkt końcowy*: Fabryka Zegarków Cyfrowych $\to$ Wodoszczelna Koperta Ceramiczna/Stalowa + Sensory Biometryczne + Pasek
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Czujniki Biometryczne i Telemetria Zdrowia (Era 6)*
* **Recykling / Odpady**: Bezpośrednio podnosi wskaźnik Zdrowia obywateli poprzez wczesne wykrywanie chorób.

### 116. Serwery i Macierze Danych dla Chmury (Epoka 5 -> E7: Chłodzone Cieczą Eko-Serwery)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Ruda Złota + Boksyt
  * *L1*: Krzem Monokrystaliczny + Miedź + Złoto + Aluminium
  * *L2*: Wielordzeniowe Procesory Serwerowe (L2) + Pamięci ECC z Rejestrem (L2) + Dyski SSD NVMe (L2) + Miedziane Bloki Chłodzenia Wodnego (L2)
  * *Produkt końcowy*: Zakłady Infrastruktury IT $\to$ Płyta Serwerowa w Standardzie Rack 19" + Nadmiarowe Zasilacze Titanium
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Bardzo Wysoka, Licencja: *Przetwarzanie Danych Wielkiej Skali i Wirtualizacja (Era 5/7)*
* **Recykling / Odpady**: Ciepło odpadowe z serwerowni w E7 zasila miejskie sieci ciepłownicze, redukując emisje CO2.

### 117. Zestawy Wirtualnej i Rozszerzonej Rzeczywistości (VR/AR) (Epoka 6 -> E7: Okulary AR)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Neodym + Boksyt
  * *L1*: Krzem + Neodym + Aluminium
  * *L2*: Wyświetlacze Micro-OLED o Zagęszczeniu 4K (L2) + Soczewki Optyczne Typu Pancake (L2) + Kamery Śledzenia Wzroku i Przestrzeni (L2)
  * *Produkt końcowy*: Fabryka Urządzeń Imersyjnych $\to$ Wyważony Korpus Nagłowny + Zintegrowane Audio Przestrzenne + Sensory
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Renderowanie Przestrzenne 6DoF i Fotonika (Era 6)*
* **Recykling / Odpady**: Używane w przemyśle do zdalnego serwisu i szkoleń bez emisji podróży służbowych.

### 118. Drony Użytkowe i Fotograficzne (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Włókna Polimerowe + Neodym + Ruda Litu + Boksyt
  * *L1*: Tworzywa + Neodym + Lit + Aluminium
  * *L2*: Ramiona z Włókna Węglowego (L2) + Szybkie Silniki Bezszczotkowe BLDC (L2) + Gimbal Stabilizowany 3-Osiowo (L2) + Akumulator Wysokoprądowy (L2)
  * *Produkt końcowy*: Fabryka Dronów $\to$ Montaż Ramy Kompozytowej + Śmigła Węglowe + Kontroler Lotu GPS/AI
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia, Licencja: *Bezzałogowe Statki Powietrzne i Nawigacja Autonomiczna (Era 6)*
* **Recykling / Odpady**: Modułowa wymiana wirników i baterii u **Serwisantów**.

### 119. Komputery Kwantowe Osobiste / Terminale AI (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Złota + Neodym + Gaz Ziemny (Hel)
  * *L1*: Krzem Beznaprężeniowy + Złoto + Ziemie Rzadkie
  * *L2*: Procesor QPU z Nadprzewodzącymi Kubitami (L2) + Laserowa Pętelka Kontrolna (L2) + Mikro-Chłodziarka Kriogeniczna (L2)
  * *Produkt końcowy*: Instytut Cybernetyki Stosowanej $\to$ Ekranowanie Magnetyczne + QPU + Moduł Interfejsu Hybrydowego
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Wysoka, Licencja: *Algorytmy Kwantowe i Koherencja Kubitów w Temperaturze Pokojowej (Era 8)*
* **Recykling / Odpady**: Niezwykle cenne surowce strategiczne (złoto, itr, neodym) odzyskiwane w 100%.

### 120. Komunikatory Neuro-Interfejsowe (Bezdotykowe) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Złoto + Algi Morskie + Piasek Kwarcowy
  * *L1*: Złoto Czyste + Biopolimery + Krzem
  * *L2*: Elektrody Biokompatybilne z Grafenu i Złota (L2) + Układ Przetwarzania Sygnałów EEG i Fal Mózgowych (L2) + Hydrożel Biozgodny
  * *Produkt końcowy*: Zakład Neurotechnologii $\to$ Dysk Zaubzny / Opaska Skroniowa z Odczytem Myśli
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Interfejsy Mózg-Komputer BCI (Era 8)*
* **Recykling / Odpady**: Całkowita eliminacja ekranów i plastiku – bezpośrednia komunikacja neuronalna.

---

## Branża 7: Kultura, Zabawki i Sport (Produkty 121–140)

### 121. Książki Drukowane i Albumy (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe (lub Makulatura) + Słoneczniki (Oleje do farb)
  * *L1*: Celuloza + Olej Słonecznikowy
  * *L2*: Papier Drukarski Bezdrzewny (L2) + Farby Drukarskie Roślinne (L2) + Tektura Introligatorska na Okładki (L2)
  * *Produkt końcowy*: Drukarnia Przemysłowa $\to$ Druk Offsetowy Arkuszowy + Składanie Zszywek + Oprawa Twarda
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Druk Wysokonakładowy i Typografia (Era 5)*
* **Recykling / Odpady**: 100% recykling papieru (do 7 cykli powtórnego przetwórstwa w celulozę).

### 122. Prasa i Czasopisma (Epoka 5 – [Wygasa w Epoce 7])
* **Drzewo łańcucha**:
  * *Surowiec*: Drewno Okrągłe / Makulatura
  * *L1*: Celuloza
  * *L2*: Papier Gazetowy Rolowy (L2) + Farby Szybkoschnące (L2)
  * *Produkt końcowy*: Zakład Prasowy $\to$ Druk Rotacyjny Gazetowy + Falcowanie w Egzemplarze
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Średnia, Licencja: *Szybki Druk Gazetowy (Era 5)*
* **Recykling / Odpady**: Krótki cykl życia (1 dzień); w Epoce 7 zastąpione w 100% przez media cyfrowe i e-czytniki.

### 123. Gry Planszowe i Puzzle (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe + Drewno do Toczenia
  * *L1*: Celuloza + Tarcica
  * *L2*: Gruba Tektura Introligatorska Kaszerowana (L2) + Pionki Drewniane Toczone (L2) + Kostki i Karty
  * *Produkt końcowy*: Wytwórnia Gier $\to$ Sztancowanie Puzzli i Plansz + Konfekcjonowanie w Pudełka
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Niska, Licencja: *Projektowanie Gier i Mechanik Rozrywki (Era 5)*
* **Recykling / Odpady**: W pełni ekologiczny produkt z materiałów odnawialnych i certyfikowanego drewna FSC.

### 124. Zabawki Drewniane i Ekologiczne (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe (Buk/Lipa) + Słoneczniki (Olej do impregnacji)
  * *L1*: Tarcica + Olej Słonecznikowy
  * *L2*: Klocki Drewniane Szlifowane (L2) + Bezpieczne Barwniki Wodne Eko (L2)
  * *Produkt końcowy*: Fabryka Zabawek Tradycyjnych $\to$ Frezowanie Klocków i Figurek + Malowanie Bębnowe + Pakowanie w Płótno
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Bezpieczeństwo Zabawek Naturalnych (Era 5)*
* **Recykling / Odpady**: Bardzo wysoka trwałość (przekazywane z pokolenia na pokolenie); 100% biodegradowalne.

### 125. Zabawki Plastikowe i Klocki Konstrukcyjne (Epoka 5 -> E7: Z Bioplastiku)
* **Drzewo łańcucha**:
  * *Surowiec*: Ropa Naftowa (w E7: Biomasa ze Skrobi/Kukurydzy)
  * *L1*: Frakcje Naftowe (w E7: Bioplastik PLA L1)
  * *L2*: Granulat Tworzywa ABS Barwiony (L2)
  * *Produkt końcowy*: Wtryskownia Precyzyjna $\to$ Formowanie Wtryskowe z Tolerancją Mikrometryczną + Konfekcjonowanie
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Średnia, Licencja: *Formowanie Wtryskowe Wysokociśnieniowe (Era 5)*
* **Recykling / Odpady**: Trwały plastik, który w E7 zostaje zastąpiony bezpiecznym dla dzieci bioplastikiem roślinnym.

### 126. Lalki i Figurki Kolekcjonerskie (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Bawełna
  * *L1*: Tworzywa + Przędza Bawełniana
  * *L2*: Korpus z Miękkiego Winylu (L2) + Włosy Syntetyczne (L2) + Miniaturowe Ubranka Tkaninowe (L2)
  * *Produkt końcowy*: Fabryka Zabawek $\to$ Odlewanie Rotacyjne Główek + Wszywanie Włosów + Malowanie Twarzy + Ubieranie
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Wzornictwo Zabawek Dziecięcych (Era 5)*
* **Recykling / Odpady**: Odpady tworzywowe podlegają selektywnej zbiórce.

### 127. Instrumenty Muzyczne (Gitary, Pianina Cyfrowe) (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe (Świerk Rezonansowy) + Ruda Miedzi + Ruda Żelaza
  * *L1*: Tarcica Sezonowana + Miedź + Stal
  * *L2*: Płyta Rezonansowa Szlifowana (L2) + Struny Stalowo-Miedziane (L2) + Klucze i Mostek Mosiężny (L2)
  * *Produkt końcowy*: Manufaktura Instrumentów Lutniczych $\to$ Wyginanie Boczków + Klejenie Gryfu + Progowanie + Lakierowanie
* **Triada produkcyjna**: Ludzie: `[M]` (Rzemieślnicy lutnicy), Energia: Niska, Licencja: *Akustyka Drewna i Strojenie Instrumentów (Era 5)*
* **Recykling / Odpady**: Serwis lutniczy i naprawa instrumentów wydłuża ich życie na dziesięciolecia.

### 128. Konsole do Gier Wideo (Epoka 5 -> E7: Modułowe / Chmurowe)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Ruda Złota + Ropa Naftowa
  * *L1*: Krzem + Miedź + Złoto + Tworzywa
  * *L2*: Płyta PCB z Procesorem Graficznym GPU (L2) + Napęd Płyt Optycznych / SSD (L2) + Kontrolery Bezprzewodowe (L2)
  * *Produkt końcowy*: Fabryka Elektroniki Rozrywkowej $\to$ Montaż Płyty w Kompaktowej Obudowie + Chłodzenie Ciche
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia, Licencja: *Grafika Komputerowa Czasu Rzeczywistego 3D (Era 5)*
* **Recykling / Odpady**: Odzysk metali szlachetnych z uszkodzonych konsol w miejskim punkcie elektroodpadów.

### 129. Gry Wideo i Oprogramowanie Rozrywkowe (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Usługa Edukacji / Uniwersytety (Ludzie) + Usługa IT (Infrastruktura Serwerowa)
  * *L1*: Licencja Oprogramowania (Wytwór Intelektualny R&D)
  * *L2*: Nośnik CD-ROM / Dystrybucja Cyfrowa w Chmurze (L2)
  * *Produkt końcowy*: Studio Deweloperskie $\to$ Kod Gry + Grafika 3D + Dźwięk + Dystrybucja Sieciowa
* **Triada produkcyjna**: Ludzie: `[E]` (Programiści i Artyści), Energia: Średnia (Stacje robocze i render-farmy), Licencja: *Silniki Gier i Prawa Autorskie (Era 5)*
* **Recykling / Odpady**: 0 odpadów fizycznych przy dystrybucji cyfrowej; bardzo wysoka marża i rentowność.

### 130. Piłki i Sprzęt do Gier Zespołowych (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Kauczuk Naturalny + Ropa Naftowa + Bydło
  * *L1*: Guma + Tworzywa + Skóra
  * *L2*: Pęcherz Lateksowy Butylowy (L2) + Panele Skórzane / Syntetyczne Poliuretanowe (L2) + Oplot Włókienniczy
  * *Produkt końcowy*: Zakład Sprzętu Sportowego $\to$ Zszywanie Ręczne/Maszynowe Paneli + Termozgrzewanie + Test Ciśnienia
* **Triada produkcyjna**: Ludzie: `[R]`, Energia: Niska, Licencja: *Aerodynamika Piłek Sportowych (Era 5)*
* **Recykling / Odpady**: Wymiana dętek u serwisanta sportowego.

### 131. Rakiety Tenisowe i Sprzęt z Kompozytów (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa (Włókna Węglowe) + Ruda Żelaza
  * *L1*: Tworzywa + Żywice Epoksydowe
  * *L2*: Włókna Grafitowe Węglowe (L2) + Struny Poliamidowe Naciągu (L2) + Owijka Poliuretanowa
  * *Produkt końcowy*: Fabryka Kompozytów Sportowych $\to$ Formowanie Ramy w Autoklawie + Wiercenie Otworów + Naciąganie Strun
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Kompozyty Węglowo-Żywiczne (Era 5)*
* **Recykling / Odpady**: Wymiana naciągów i owijek; odzysk włókien węglowych metodą pirolizy.

### 132. Narty, Snowboard i Sprzęt Zimowy (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Drewno Okrągłe (Jesion) + Ruda Żelaza + Boksyt
  * *L1*: Tarcica + Stal + Aluminium
  * *L2*: Rdzeń Drewniany Klejony (L2) + Krawędzie Stalowe Hartowane (L2) + Ślizg Polietylenowy UHMWPE (L2) + Laminat Włókna Szklanego
  * *Produkt końcowy*: Fabryka Nart $\to$ Konstrukcja Warstwowa Typu Sandwich + Prasa Termiczna + Szlifowanie Kamieniem Ślizgu
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Konstrukcje Sandwichowe Nart (Era 5)*
* **Recykling / Odpady**: Serwis zimowy (ostrzenie krawędzi, regeneracja ślizgu u **Serwisantów**).

### 133. Namioty i Sprzęt Turystyczny (Epoka 5)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Boksyt
  * *L1*: Tworzywa + Aluminium Hutnicze
  * *L2*: Tkanina Ripstop Nylonowa z Powłoką PU (L2) + Maszti Aluminiowe Anodowane (L2) + Szpilki Stalowe + Klejone Szwy
  * *Produkt końcowy*: Szwalnia Turystyczna $\to$ Wykrawanie Tropiku i Sypialni + Wszywanie Zamków + Zestaw w Pokrowcu
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Niska, Licencja: *Tkaniny Wodoodporne i Konstrukcje Geodezyjne (Era 5)*
* **Recykling / Odpady**: Łatwa naprawa rozdarć taśmami naprawczymi u serwisanta.

### 134. Domowy Sprzęt Fitness (Bieżnie, Orbitreki) (Epoka 5 -> E7: Generujące Prąd)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ruda Miedzi + Kauczuk
  * *L1*: Stal + Miedź + Guma
  * *L2*: Spawana Rama Stalowa (L2) + Silnik Elektryczny Napędu (w E7: Prądnica Odzyskowa L2) + Pas Biegowy Gumowy (L2) + Komputer Treningowy
  * *Produkt końcowy*: Fabryka Sprzętu Treningowego $\to$ Złożenie Mechaniki + Pas + Monitor z Programami Kardio
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Biomechanika Treningowa i Prądnice Kinetyczne (Era 5/7)*
* **Recykling / Odpady**: W E7 sprzęt zasila domową sieć energetyczną energią z mięśni ćwiczącego.

### 135. Wędki i Sprzęt Wodniacki (Kajaki, Deski SUP) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Ruda Żelaza (lub Algi/Biopolimery)
  * *L1*: Żywice + Stal
  * *L2*: Blank Węglowy (L2) + Przelotki z Wkładkami SiC (L2) + Pianka EVA na Rękojeści (L2)
  * *Produkt końcowy*: Zakład Wędkarski i Sportów Wodnych $\to$ Nawijanie Włókien Węglowych na Trzpienie + Lakierowanie + Przelotki
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Włókna Węglowe Wysokomodułowe (Era 6)*
* **Recykling / Odpady**: Naprawa uszkodzonych przelotek i wklejanie szczytówek.

### 136. Zestawy Edukacyjne STEM i Robotyka dla Dzieci (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Ropa Naftowa
  * *L1*: Krzem + Miedź + Tworzywa
  * *L2*: Mikrokontroler Programowalny (np. Arduino/ESP L2) + Serwomechanizmy (L2) + Czujniki Odległości i Koloru (L2) + Modułowe Elementy Konstrukcyjne
  * *Produkt końcowy*: Wytwórnia Zabawek Edukacyjnych $\to$ Płytka Edukacyjna + Silniczki + Kable + Oprogramowanie Wizualne (Scratch)
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Dydaktyka Robotyki i Kodowania (Era 6)*
* **Recykling / Odpady**: Zwiększa wskaźnik Edukacji w miastach i przyspiesza generowanie Punktów Nauki.

### 137. Fotele Gamingowe i Ergonomiczne (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Ropa Naftowa (w E7: Eko-Skóra Grzybowa)
  * *L1*: Stal + Aluminium + Tworzywa
  * *L2*: Siłownik Gazowy Klasy 4 (L2) + Mechanizm Multiblock ze Stali (L2) + Pianka Odlewana na Zimno (L2) + Tapicerka z Siatki Oddychającej
  * *Produkt końcowy*: Fabryka Mebli Biurowych i Gamingowych $\to$ Rama Stalowa z Pasami + Pianka + Mechanizm Kółek + Tapicerowanie
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Ergonomia Stanowisk Siedzących (Era 6)*
* **Recykling / Odpady**: Wymienne podłokietniki i kółka u **Serwisantów**.

### 138. Symulatory Sportowe i Komory Imersyjne VR (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Piasek Kwarcowy + Neodym
  * *L1*: Aluminium + Krzem + Ziemie Rzadkie
  * *L2*: Siłowniki Liniowe Platformy Ruchomej Stewart (L2) + Panoramiczne Ekrany Sferyczne Micro-LED (L2) + Pedały z Siłowym Sprzężeniem Zwrotnym Force Feedback (L2)
  * *Produkt końcowy*: Zakłady Symulatorów $\to$ Podwozie Ruchome 6DoF + Kabina Imersyjna + Jednostka Obliczeniowa
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Wysoka, Licencja: *Kinematyka Odwrócona i Rzeczywistość Wirtualna (Era 7)*
* **Recykling / Odpady**: Zastępuje konieczność podróżowania na stoki narciarskie i tory wyścigowe, oszczędzając paliwo.

### 139. Instrumenty Holograficzne i Syntezatory AI (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Neodym + Ruda Złota
  * *L1*: Krzem + Ziemie Rzadkie + Złoto
  * *L2*: Projektory Fotonowe Holograficzne (L2) + Ultradźwiękowe Głośniki Rezonansu Haptycznego (L2) + Procesor Syntezy Dźwięku AI (L2)
  * *Produkt końcowy*: Laboratorium Dźwięku Przyszłości $\to$ Konsola Laserowa generująca wirtualne struny/klawiaturę w powietrzu
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Fotonika Akustyczna i Generatywna Muzyka AI (Era 8)*
* **Recykling / Odpady**: Brak zużycia drewna ani metali na pudła rezonansowe; niematerialna forma instrumentu.

### 140. Komplety Rekreacyjne ze Skrzydełkami Antygrawitacyjnymi / Jet-Boardy (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Włókna Węglowe + Wodór + Neodym
  * *L1*: Włókna Węglowe + Wodór Bazowy + Ziemie Rzadkie
  * *L2*: Mini-Turbiny Jonowe Ciągu Plazmowego (L2) + Żyroskopowe Układy Równowagi Neurologicznej (L2) + Bateria Wodorowa Solid-State (L2)
  * *Produkt końcowy*: Fabryka Zaawansowanego Sprzętu Sportowego $\to$ Deska Lewitująca z Wiązaniami Magnetycznymi
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Bardzo Wysoka, Licencja: *Elektro-Aerodynamika Plazmowa (Era 8)*
* **Recykling / Odpady**: Czysty napęd jonowy; 0 emisji dwutlenku węgla.

---

## Branża 8: Zdrowie, Farmacja i Biotechnologia (Produkty 141–160)

### 141. Leki Przeciwbólowe i Przeciwgorączkowe (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa (lub Zioła Wierzbowe) + Sól Kamienna
  * *L1*: Chemikalia Organiczne
  * *L2*: Kwas Acetylosalicylowy / Paracetamol API (L2) + Skrobia Kukurydziana jako Wypełniacz (L2) + Blistry Aluminiowo-Foliowe (L2)
  * *Produkt końcowy*: Zakłady Farmaceutyczne $\to$ Tabletkarstwo Przemysłowe + Powlekanie Tabletek + Blistrowanie
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia (Rygorystyczna czystość GMP), Licencja: *Farmakologia Syntetyczna (Era 6)*
* **Recykling / Odpady**: Zbiórka przeterminowanych leków w aptekach chroni glebę i wody gruntowe.

### 142. Antybiotyki Nowej Generacji i Leki Przeciwwirusowe (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Pszenica + Buraki Cukrowe (Pożywki) + Sól
  * *L1*: Cukier + Mąka
  * *L2*: Fermentacja Grzybowa Penicillium / Szczepy Bakteryjne (L2) + Oczyszczona Cząsteczka Antybiotyku (L2) + Kapsułki Żelatynowe/Celulozowe
  * *Produkt końcowy*: Fabryka Leków Sterylnych $\to$ Kapsułkowanie / Fiolki do Iniekcji + Liofilizacja
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia, Licencja: *Bioprocesy Fermentacyjne i Krystalizacja Leków (Era 6)*
* **Recykling / Odpady**: Zmniejsza śmiertelność w miastach; podnosi wskaźnik Zdrowia publicznego o 20%.

### 143. Witaminy i Suplementy Diety (Roślinne/Algi) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Jabłka + Słoneczniki
  * *L1*: Biomasa z Alg + Olej Słonecznikowy
  * *L2*: Ekstrakty Witaminowe A, C, D3, Omega-3 (L2) + Otoczki Roślinne z Celulozy (L2) + Słoiczki Szklane ze Szkła Ciemnego
  * *Produkt końcowy*: Wytwórnia Nutraceutyków $\to$ Kapsułkowanie Miękkich Kapsułek + Butelkowanie
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Ekstrakcja Nadkrytyczna CO2 Nutraceutyków (Era 6)*
* **Recykling / Odpady**: Słoiczki szklane podlegają recyklingowi.

### 144. Szczepionki (Tradycyjne i mRNA) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Sól Kamienna + Algi + Cukier
  * *L1*: Odczynniki Chemiczne + Cukier
  * *L2*: Syntetyczna Matryca mRNA (L2) + Nanocząstki Lipidowe LNP (L2) + Szklane Fiolki Boro-Krzemowe (L2)
  * *Produkt końcowy*: Laboratorium Biologiczne Wysokiej Czystości $\to$ Enkapsulacja mRNA w Lipidach + Rozlew Aseptyczny + Zamrażanie -80°C
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Inżynieria Genetyczna i Terapie mRNA (Era 6)*
* **Recykling / Odpady**: Zapobiega pandemiom na Mapie Świata, które wstrzymują pracę fabryk.

### 145. Leki Kardiologiczne i Metaboliczne (Insulina) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Buraki Cukrowe (Pożywka) + Sól Kamienna
  * *L1*: Cukier Rafinowany + Odczynniki
  * *L2*: Rekombinowana Insulina Ludzka z Drożdży/Bakterii (L2) + Wstrzykiwacze Piórowe ze Stopów Plastiku (Pen L2)
  * *Produkt końcowy*: Zakład Biotechnologiczny $\to$ Oczyszczanie Chromatograficzne Białka + Montaż Aplikatora Pen
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Rekombinowane Białka Lecznicze (Era 6)*
* **Recykling / Odpady**: Ratuje życie milionów mieszkańców Klasy Średniej i Robotników.

### 146. Środki Opatrunkowe i Hydrożele Medyczne (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Bawełna + Algi Morskie + Ruda Złota/Srebro
  * *L1*: Przędza Bawełniana + Biomasa z Alg + Srebro Antybakteryjne
  * *L2*: Gaza Bawełniana Sterylna (L2) + Hydrożel Alginianowy Opatrunkowy (L2) + Siatka Ze Srebrem Koloidalnym
  * *Produkt końcowy*: Fabryka Materiałów Medycznych $\to$ Zespalanie Warstw Opatrunku + Sterylizacja Radiacyjna + Zgrzewanie Papierowe
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Niska, Licencja: *Opatrunki Aktywne i Alginianowe (Era 6)*
* **Recykling / Odpady**: Odpady medyczne podlegają bezpiecznej utylizacji termicznej.

### 147. Soczewki Kontaktowe i Implanty Okulistyczne (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ropa Naftowa + Sól Kamienna
  * *L1*: Chemikalia Organiczne + Sól
  * *L2*: Polimer Silikonowo-Hydrożelowy Tlenoprzepuszczalny (L2) + Płyn Fizjologiczny Sterylny (L2) + Blisterki Jednorazowe
  * *Produkt końcowy*: Zakład Optyki Medycznej $\to$ Odlewanie Soczewek w Formach z Nanotolerancją + Hydratacja
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Polimery Hydrożelowe Biozgodne (Era 6)*
* **Recykling / Odpady**: Odzysk plastiku z blistrów.

### 148. Aparaty Słuchowe Cyfrowe (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Litu + Ruda Miedzi
  * *L1*: Krzem + Lit + Miedź
  * *L2*: Mikroprocesor Sygnałowy DSP Audio (L2) + Mikrofon MEMS (L2) + Akumulator Cynkowo-Powietrzny/Li-Ion (L2) + Obudowa Medyczna
  * *Produkt końcowy*: Manufaktura Protetyki Słuchu $\to$ Indywidualny Druk 3D Obudowy Ucha + Montaż Miniaturowej Elektroniki
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Cyfrowa Obróbka Sygnałów Akustycznych (Era 6)*
* **Recykling / Odpady**: Długi czas użytkowania; naprawy u **Serwisantów**.

### 149. Domowe Testery Diagnostyczne i Glukometry (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Złota + Piasek Kwarcowy + Ropa Naftowa
  * *L1*: Złoto + Krzem + Tworzywa
  * *L2*: Paski Testowe z Enzymem Glukozowym i Ścieżką Złotą (L2) + Czytnik Elektroniczny z Wyświetlaczem (L2)
  * *Produkt końcowy*: Fabryka Diagnostyki Domowej $\to$ Produkcja Pasków Biosensorycznych + Złożenie Miernika
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Biosensory Elektrochemiczne (Era 6)*
* **Recykling / Odpady**: Zapobiega hospitalizacjom, odciążając miejskie szpitale.

### 150. Wózki Inwalidzkie Elektryczne (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Litu + Ruda Miedzi + Kauczuk
  * *L1*: Aluminium + Lit + Miedź + Guma
  * *L2*: Lekka Rama Aluminiowa Składana (L2) + Silniki Bezszczotkowe w Kołach (L2) + Bateria Li-Ion (L2) + Joystick Sterujący
  * *Produkt końcowy*: Zakłady Sprzętu Rehabilitacyjnego $\to$ Spawanie Ramy + Montaż Układu Napędowego + Tapicerka Ortopedyczna
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Robotyka Rehabilitacyjna i Mobilność Osób Niepełnosprawnych (Era 6)*
* **Recykling / Odpady**: Serwisowanie silników i akumulatorów wydłuża eksploatację do 15 lat.

### 151. Sprzęt Szpitalny (Respiratory, Kardiomonitory) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Piasek Kwarcowy + Ruda Miedzi
  * *L1*: Stal Nierdzewna + Aluminium + Krzem + Miedź
  * *L2*: Pompy i Turbiny Tlenowe Medyczne (L2) + Ekran Monitora Medycznego (L2) + Płytka Mikroprocesorowa z Alarmami Życiowymi (L2)
  * *Produkt końcowy*: Zakład Aparatury Medycznej $\to$ Integracja Systemu Podtrzymywania Życia + Certyfikacja Kalibracyjna
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Aparatura Podtrzymywania Funkcji Życiowych (Era 6)*
* **Recykling / Odpady**: Sprzęt budowany modułowo z myślą o modernizacji zamiast wymiany.

### 152. Skanery Obrazowania Medycznego (MRI / Tomografy) (Epoka 6)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Miedzi + Neodym i Ziemie Rzadkie + Ruda Żelaza + Gaz Ziemny (Hel)
  * *L1*: Miedź + Neodym + Stal
  * *L2*: Magnes Nadprzewodzący o Polu 3T (L2) + Cewki Gradientowe Wysokiej Mocy (L2) + Detektory Scyntylacyjne Promieniowania (L2) + Stacja Rekonstrukcji Obrazu
  * *Produkt końcowy*: Fabryka Zaawansowanej Diagnostyki Obrazowej $\to$ Montaż Gantry + Kriogenika Helowa + Tunel Pacjenta
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Bardzo Wysoka, Licencja: *Magnetyczny Rezonans Jądrowy i Tomografia Komputerowa (Era 6)*
* **Recykling / Odpady**: Inwestycja miejska drastycznie podnosząca długość życia w mieście.

### 153. Terapie Celowane Onkologiczne i Immunoterapia (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Sól Kamienna + Buraki Cukrowe
  * *L1*: Biomasa + Cukier
  * *L2*: Przeciwciała Monoklonalne mAb (L2) + Koniugaty Lek-Przeciwciało (L2) + Fiolki Nanofiltracyjne
  * *Produkt końcowy*: Instytut Onkologii Molekularnej $\to$ Bioreaktory z Komórkami Ssącymi + Oczyszczanie Affinity Chromatography
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Przeciwciała Monoklonalne i Terapia CAR-T (Era 7)*
* **Recykling / Odpady**: Eliminacja śmiertelności z powodu chorób nowotworowych u starszych grup wiekowych.

### 154. Terapie Genowe CRISPR (Leczenie Chorób Rzadkich) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Odczynniki Chemiczne
  * *L1*: Biomasa Przetworzona
  * *L2*: Enzymy Cas9 Nukleazy (L2) + Przewodniki RNA gRNA (L2) + Wektory AAV Adenowirusowe Bezpieczne (L2)
  * *Produkt końcowy*: Laboratorium Edycji Genomu $\to$ Synteza Cząsteczki Terapeutycznej pod Indywidualną Mutację Pacjenta
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Precyzyjna Edycja Genomu CRISPR-Cas (Era 7)*
* **Recykling / Odpady**: Całkowite wyleczenie chorób dziedzicznych jednym zabiegiem.

### 155. Bio-Implanty Stomatologiczne i Kostne 3D (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Wapień/Fosforyty + Piasek Kwarcowy + Boksyt/Tytan
  * *L1*: Hydroksyapatyt Wapniowy + Tytan Hutniczy
  * *L2*: Proszek Tytanowy Medyczny (L2) + Rusztowania Hydroksyapatytowe Porowate (L2)
  * *Produkt końcowy*: Drukarnia Implantów 3D $\to$ Druk Laserowy SLM z Skanu Tomograficznego Pacjenta + Powłoka Bioaktywna
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Biodruk Struktur Kostnych i Osteointegracja (Era 7)*
* **Recykling / Odpady**: 100% biozgodność – implant integruje się z żywą kością.

### 156. Sztuczna Krew i Płyny Krwiozastępcze (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Sól Kamienna
  * *L1*: Biomasa z Alg + Sól
  * *L2*: Syntetyczne Nośniki Tlenu Oparte na Hemoglobinie HBOC (L2) + Elektrolityczny Płyn Plazmatyczny (L2) + Worki Infuzyjne
  * *Produkt końcowy*: Zakład Hematologii Syntetycznej $\to$ Polimeryzacja Cząsteczek Hemoglobiny + Stabilizacja Termiczna
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Substytuty Krwi Przechowywane w Temperaturze Pokojowej (Era 7)*
* **Recykling / Odpady**: Likwiduje deficyt krwi w szpitalach miejskich, ratując ofiary wypadków.

### 157. Zestawy Mikrobiomu i Medycyny Prewencyjnej (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Algi Morskie
  * *L1*: Krzem + Biomasa
  * *L2*: Chip Sekwencjonowania DNA NGS Nanoporowy (L2) + Szczepy Bakterii Probiotycznych Autologicznych (L2)
  * *Produkt końcowy*: Centrum Medycyny Spersonalizowanej $\to$ Zestaw Pobraniowy + Sekwencer + Raport Profilaktyczny AI
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Analiza Mikrobiomu Jelitowego i Sekwencjonowanie Jednocząsteczkowe (Era 7)*
* **Recykling / Odpady**: Zapobiega chorobom przewlekłym zanim wystąpią objawy.

### 158. Organy Drukowane Biologicznie (Biodruk 3D z Biomatryc) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Bydło (Kolagen) + Odczynniki Bio
  * *L1*: Biomasa + Kolagen Oczyszczony
  * *L2*: Biotusz z Komórkami Pacjenta (L2) + Biomatryce Tkankowe Naczyniowe (L2) + Czynniki Wzrostu Tkanek (L2)
  * *Produkt końcowy*: Klinika Regeneracji Narządowej $\to$ Druk 3D Nerki/Wątroby/Serca w Komorze Bioreaktora + Vaskularyzacja
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Biodruk Narządów Miaższowych 3D (Era 8)*
* **Recykling / Odpady**: Koniec list oczekujących na przeszczepy; zero odrzutów immunologicznych.

### 159. Nanoboty Medyczne Czyszczące Naczynia Krwionośne (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Złoto + Piasek Kwarcowy + Węgiel (Grafen)
  * *L1*: Złoto Czyste + Krzem + Nanotuby Węglowe
  * *L2*: Mikrosilniki Molekularne (L2) + Sensory Biochemiczne Złote (L2) + Obudowa Diamentopodobna DLC (L2)
  * *Produkt końcowy*: Laboratorium Nanomedycyny $\to$ Zawiesina Nanorobotów Sterowanych Zewnętrznym Polem Magnetycznym
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Nanorobotyka Dożylna i Usuwanie Blaszek Miażdżycowych (Era 8)*
* **Recykling / Odpady**: Wydłuża średnią długość życia w mieście do ponad 100 lat.

### 160. Terapie Regeneracji Komórkowej i Długowieczności (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Odczynniki Chemiczne
  * *L1*: Biomasa
  * *L2*: Czynniki Yamanaka Odmładzania Komórek (L2) + Inhibitory Telomerazy i Senolityki (L2) + Fiolki Infuzyjne
  * *Produkt końcowy*: Centrum Długowieczności $\to$ Koktajl Senolityczny usuwający starzejące się komórki z organizmu
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Reprogramowanie Epigenetyczne i Senolityka (Era 8)*
* **Recykling / Odpady**: Odwraca proces biologicznego starzenia populacji miejskiej.

---

## Branża 9: Energetyka Użytkowa i Eko-Technologie (Produkty 161–180)

### 161. Domowe Panele Fotowoltaiczne (PV) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Boksyt + Ruda Miedzi + Srebro
  * *L1*: Krzem + Aluminium + Miedź + Srebro
  * *L2*: Ogniwa Krzemowe Monokrystaliczne (L2) + Rama Aluminiowa Anodowana (L2) + Szyba Hartowana Solarna (L2) + Folia EVA
  * *Produkt końcowy*: Fabryka Modułów PV $\to$ Laminowanie Ogniw w Próżni + Okablowanie z Puszką Przyłączeniową
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Wysoka (Produkcja krzemu solarnego), Licencja: *Fotowoltaika Krzemowa Wysokosprawna (Era 7)*
* **Recykling / Odpady**: Po 30 latach pracy odzysk 95% szkła, aluminium i srebra w Zakładzie Recyklingu PV.

### 162. Szyby Perowskitowe Generujące Prąd (BIPV) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Sól Kamienna + Ołów/Tytan
  * *L1*: Szkło Płaskie + Chemikalia
  * *L2*: Nanowarstwa Soli Perowskitowej Półprzezroczystej (L2) + Elektrody Przezroczyste ITO (L2) + Szyba Zespolona
  * *Produkt końcowy*: Huta Szkła Aktywnego $\to$ Nadruk Inkjet Perowskitów na Szybę Okienną + Hermetyzacja
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska (Niskotemperaturowy druk), Licencja: *Perowskity i Fotowoltaika Zintegrowana z Budynkiem BIPV (Era 7)*
* **Recykling / Odpady**: Zamienia całe fasady wieżowców w miastach w elektrownie słoneczne.

### 163. Domowe Pompy Ciepła (Powietrzne i Gruntowe) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Ruda Miedzi + Boksyt
  * *L1*: Stal + Miedź + Aluminium
  * *L2*: Sprężarka Inwerterowa Scroll (L2) + Wymiennik Płytowy ze Stali Nierdzewnej (L2) + Ekologiczny Czynnik Chłodniczy R290 Propan (L2)
  * *Produkt końcowy*: Fabryka Systemów Grzewczych $\to$ Jednostka Zewnętrzna z Cichym Wentylatorem + Moduł Hydrauliczny Wewnętrzny
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Termodynamika Pomp Ciepła i Czynniki Naturalne (Era 7)*
* **Recykling / Odpady**: Daje 4 kWh ciepła z 1 kWh prądu; eliminuje piece gazowe i węglowe z miast.

### 164. Domowe Magazyny Energii (Powerwall z Recyklingu) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Litu (lub Baterie Samochodowe z Recyklingu) + Ruda Żelaza + Miedź
  * *L1*: Lit + Stal + Miedź
  * *L2*: Ogniwa Bateryjne LFP z Odzysku (Second-Life L2) + Układ Zarządzania Baterią BMS (L2) + Obudowa Ognioodporna
  * *Produkt końcowy*: Fabryka Magazynów Energii $\to$ Pakietyzacja Ogniw + Falownik Hybrydowy All-in-One
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Średnia, Licencja: *Magazynowanie Energii i Baterie Second-Life (Era 7)*
* **Recykling / Odpady**: Daje drugie życie bateriom z aut elektrycznych, stabilizując miejską sieć energetyczną.

### 165. Przydomowe Mikroturbiny Wiatrowe Bezwibracyjne (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Neodym + Ruda Żelaza
  * *L1*: Aluminium + Tlenki Neodymu + Stal
  * *L2*: Pionowa Turbina VAWT z Aluminium (L2) + Generator Wolnoobrotowy z Magnesami Trwałymi (L2) + Maszt Dachowy
  * *Produkt końcowy*: Zakład Małej Energetyki Wiatrowej $\to$ Wirnik Ślimakowy Cichobieżny + Prądnica + Kontroler Ładowania
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Pionowe Turbiny Wiatrowe dla Obszarów Zurbanizowanych (Era 7)*
* **Recykling / Odpady**: Pracuje przy słabym wietrze; bezpieczna dla ptaków miejskich.

### 166. Stacje Ładowania Pojazdów (Wallbox V2G) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Miedzi + Piasek Kwarcowy + Ruda Żelaza
  * *L1*: Miedź + Krzem + Stal
  * *L2*: Grube Kable Miedziane z Wtykiem CCS (L2) + Falownik Dwukierunkowy V2G (L2) + Płytka Komunikacji RFID/OCPP (L2)
  * *Produkt końcowy*: Wytwórnia Ładowarek EV $\to$ Montaż Podzespołów w Obudowie Odpornej na Warunki Zewnętrzne
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Dwukierunkowy Transfer Energii Vehicle-to-Grid V2G (Era 7)*
* **Recykling / Odpady**: Pozwala mieszkańcom oddawać prąd z samochodów do sieci w godzinach szczytu.

### 167. Domowe Rekuperatory z Filtracją Antysmogową HEPA (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Drewno Okrągłe (Celuloza) + Ruda Miedzi
  * *L1*: Aluminium + Celuloza + Miedź
  * *L2*: Entalpiczny Wymiennik Przeciwprądowy z Tworzywa/Alu (L2) + Energooszczędne Wentylatory EC (L2) + Zestaw Filtrów Węglowych i HEPA (L2)
  * *Produkt końcowy*: Fabryka Wentylacji Mechanicznej $\to$ Izolowana Obudowa + Wymiennik Ciepła + Automatyka Wilgotnościowa
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Rekuperacja Ciepła i Filtracja Cząstek PM2.5 (Era 7)*
* **Recykling / Odpady**: Odzyskuje 90% ciepła z powietrza wywiewanego; czyści powietrze ze smogu w domach.

### 168. Domowe Kompostowniki Bio-Enzymatyczne (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Granulat z Recyklingu (Tworzywa z miasta) + Ruda Żelaza
  * *L1*: Plastik z Recyklingu + Stal
  * *L2*: Izolowany Bęben Obrotowy z Tworzywa (L2) + Grzałka Mikromocy z Termostatem (L2) + Starter Enzymatyczno-Bakteryjny
  * *Produkt końcowy*: Zakład Eko-Urządzeń Domowych $\to$ Złożenie Kompostownika Termicznego
* **Triada produkcyjna**: Ludzie: `[R]`/`[M]`, Energia: Niska, Licencja: *Przyspieszone Kompostowanie Tlenowe (Era 7)*
* **Recykling / Odpady**: **Kluczowy element gry**: redukuje powstawanie Odpadów Zmieszanych w mieście u źródła o 40%.

### 169. Systemy Odzysku Wody Deszczowej i Szarej (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Granulat z Recyklingu + Piasek Kwarcowy + Ruda Miedzi
  * *L1*: Tworzywa z Recyklingu + Piasek + Miedź
  * *L2*: Zbiornik Podziemny Polietylenowy z Ożebrowaniem (L2) + Złoże Filtracyjne Piaskowo-Węglowe (L2) + Pompa Hydroforowa Niskoszumowa
  * *Produkt końcowy*: Wytwórnia Systemów Hydrotechnicznych $\to$ Zbiornik Retencyjny + Zespół Płukania Wstecznego + Sterownik
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Recykling Wody Szarej w Budynkach (Era 7)*
* **Recykling / Odpady**: Zmniejsza zużycie wody pitnej w miastach o 50%.

### 170. Generatory Wody Pitnej z Wilgoci Powietrza (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Miedzi + Sól Kamienna
  * *L1*: Aluminium + Miedź + Minerały
  * *L2*: Agregat Kondensacyjny z Powłoką Superhydrofobową (L2) + Lampa Sterylizacyjna UV-C (L2) + Mineralizator Dolomitowy (L2)
  * *Produkt końcowy*: Zakład Urządzeń Atmosferycznych $\to$ Obudowa z Wentylatorem + Moduł Skraplania + Zespół Filtrów
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia (Zasilana z domowego panelu PV), Licencja: *Pozyskiwanie Wody z Wilgoci Powietrza AWG (Era 7)*
* **Recykling / Odpady**: Zapewnia czystą wodę w suchych i pustynnych regionach Mapy Świata bez studni.

### 171. Wertykalne Ogrody Domowe (Aeroponika Domowa) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Granulat z Recyklingu + Piasek Kwarcowy
  * *L1*: Tworzywa z Recyklingu + Krzem
  * *L2*: Kolumna Uprawna z Dyszami Zamgławiającymi (L2) + Oświetlenie LED o Pełnym Widmie Fotosyntezy (L2) + Pompa Wysokociśnieniowa
  * *Produkt końcowy*: Fabryka Eko-Mebli Uprawnych $\to$ Wieża Aeroponiczna + Automatyka Dozowania Pożywek
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Uprawy Wertykalne i Aeroponika Domowa (Era 7)*
* **Recykling / Odpady**: 95% oszczędności wody; świeże zioła i warzywa produkowane bezpośrednio w mieszkaniach.

### 172. Domowe Elektrolizery i Magazyny Zielonego Wodoru (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt/Tytan + Platyna/Iryd
  * *L1*: Stal Nierdzewna + Tytan + Katalizator Szlachetny
  * *L2*: Stos Elektrolizera PEM (L2) + Sprężarka Membranowa 300 bar (L2) + Zbiornik na Wodór z Hydrytków Metali (L2)
  * *Produkt końcowy*: Zakład Technologii Wodorowych $\to$ Moduł Generowania Wodoru z Nadwyżek PV + Bezpieczny Magazyn Gazowy
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Wysoka (Konwertuje darmowy prąd ze słońca w gaz), Licencja: *Elektroliza PEM i Magazynowanie w Hydrytkach (Era 7)*
* **Recykling / Odpady**: Sezonowy magazyn energii (prąd z lata magazynowany na zimę w wodorze).

### 173. Kolektory Słoneczne Próżniowe (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Miedzi + Boksyt
  * *L1*: Szkło Surowe + Miedź + Aluminium
  * *L2*: Rury Próżniowe ze Szkła Borokrzemowego z Powłoką Absorbera (L2) + Rurki Ciepła Heat-Pipe z Miedzi (L2) + Kolektor Zbiorczy
  * *Produkt końcowy*: Fabryka Kolektorów Słonecznych $\to$ Zestaw Rur Próżniowych w Ramie Aluminiowej
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Konwersja Fototermiczna Próżniowa (Era 7)*
* **Recykling / Odpady**: Działa nawet przy ujemnych temperaturach zimą; darmowe podgrzewanie wody.

### 174. Miejski Meble Antysmogowe i Pochłaniacze CO2 (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Drewno Okrągłe + Boksyt
  * *L1*: Biomasa z Alg + Tarcica + Aluminium
  * *L2*: Fotobioreaktor ze Szkła i Alg (L2) + Ławka Miejska z CLT (L2) + Panel Słoneczny z Pompą Powietrza
  * *Produkt końcowy*: Zakład Małej Architektury Ekologicznej $\to$ Ławka z Wbudowanym Panelem Mchów i Fotobioreaktorem
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska (Samowystarczalna solarnie), Licencja: *Pochłanianie Zanieczyszczeń Miejskie (Era 7)*
* **Recykling / Odpady**: Jedna ławka pochłania tyle CO2 i pyłów co 250 drzew w centrum zanieczyszczonego miasta.

### 175. Mikro-Bioreaktory z Algami (Domowe Wytwarzanie Tlenu i Biomasy) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Piasek Kwarcowy + Ziemie Rzadkie
  * *L1*: Algi + Szkło Płaskie + Krzem
  * *L2*: Cylindryczny Zbiornik ze Szkła Kwarcowego (L2) + Napowietrzacz Ceramiczny (L2) + Oświetlenie LED Sterowane Cyfrowo (L2)
  * *Produkt końcowy*: Wytwórnia Sprzętu Biofilnego $\to$ Domowa Kolumna Bioreaktorowa produkująca tlen i białko
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Kultury Glonowe Zamknięte (Era 8)*
* **Recykling / Odpady**: Zmniejsza poziom CO2 w pomieszczeniach, podnosząc wydajność umysłową Naukowców.

### 176. Domowe Recyklery Molekularne 3D (Własny Filament z Odpadów) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Piasek Kwarcowy
  * *L1*: Stal + Aluminium + Krzem
  * *L2*: Rozdrabniacz Nożowy ze Stali Narzędziowej (L2) + Głowica Topiąca z Precyzyjną Śrubą Wytłaczarki (L2) + Czujnik Średnicy Lasera (L2)
  * *Produkt końcowy*: Fabryka Urządzeń Cyrkularnych $\to$ Niewielki Robot Domowy zamieniający plastikowe śmieci na szpulę do druku 3D
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Ekstruzja Tworzyw w Skali Mikro (Era 8)*
* **Recykling / Odpady**: **100% zamknięcie obiegu materiałów wewnątrz gospodarstwa domowego**.

### 177. Powłoki Dachowe Chłodzące Radiacyjnie (Pasywna Klimatyzacja) (Epoka 7)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Wapień + Odczynniki Chemiczne
  * *L1*: Krzemionka Nanocząsteczkowa + Polimery
  * *L2*: Farba z Nanocząstkami Odbijającymi 98% Promieniowania Słonecznego (L2)
  * *Produkt końcowy*: Zakłady Chemiczne $\to$ Wiadra z Płynną Membraną Dachową Radiacyjną
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Chłodzenie Radiacyjne do Przestrzeni Kosmicznej (Era 7)*
* **Recykling / Odpady**: Obniża temperaturę budynku o 6°C bez zużycia ani jednej kilowatogodziny prądu.

### 178. Baterie Biodegradowalne Organiczne (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Drewno Okrągłe (Lignina) + Sól Kamienna
  * *L1*: Biomasa z Alg + Celuloza + Sól
  * *L2*: Elektrody Ligninowe z Drewna (L2) + Elektrolit Wodny Bezpieczny (L2) + Obudowa Celulozowa
  * *Produkt końcowy*: Zakład Zrównoważonych Baterii $\to$ Płaskie Ogniwa Organiczne bez Metali Ciężkich
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Baterie Ligninowo-Wodne bez Metali Ziem Rzadkich (Era 8)*
* **Recykling / Odpady**: Bateria po zużyciu może być bezpiecznie zakopana w ziemi jako nawóz organiczny.

### 179. Modułowe Mikro-Ogniwa Fuzyjne dla Osiedli (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Neodym i Ziemie Rzadkie + Ruda Miedzi + Gaz Ziemny/Woda (Deuter)
  * *L1*: Ziemie Rzadkie + Miedź + Wodór/Deuter
  * *L2*: Magnesy Wysokotemperaturowe Nadprzewodzące HTS (L2) + Komora Plazmowa Tokamaka w Skali Mikro (L2) + Wymiennik Ciepła
  * *Produkt końcowy*: Zakłady Zaawansowanej Energetyki Jądrowej $\to$ Kontenerowe Ogniwo Czystej Fuzji Termojądrowej
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Bardzo Wysoka (Rozruch), Licencja: *Kontrolowana Fuzja Termojądrowa w Skali Kompaktowej (Era 8)*
* **Recykling / Odpady**: 0 odpadów radioaktywnych długożyciowych; nieskończona, czysta energia dla całych dzielnic miejskich.

### 180. Autonomiczne Boje i Filtry Oczyszczające Akweny (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Algi Morskie + Piasek Kwarcowy
  * *L1*: Aluminium z Recyklingu + Biomasa + Krzem
  * *L2*: Pływak z Tworzywa Odzyskanego z Oceanów (L2) + Wirówka Hydrocyklonowa Mikroplastiku (L2) + Zasilanie Słoneczne (L2)
  * *Produkt końcowy*: Stocznia Eko-Robotów $\to$ Pływająca Boja z Autonomicznym Napędem i Filtracją Wody
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska (100% zasilana z słońca i fal), Licencja: *Autonomiczne Oczyszczanie Ekosystemów Wodnych (Era 8)*
* **Recykling / Odpady**: Oczyszcza rzeki i wybrzeża na Mapie Świata, podnosząc Globalny Wskaźnik Bioróżnorodności.

---

## Branża 10: Bionika i Robotyka (Produkty 181–200)

### 181. Bioniczne Protezy Kończyn Sterowane Myślą (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt/Tytan + Ruda Złota + Piasek Kwarcowy
  * *L1*: Tytan + Złoto + Krzem
  * *L2*: Siłowniki Bioniczne (L2) + Mikroprocesory Neuronalne (L2) + Gniazdo z Włókien Węglowych (L2) + Elektrody Mioelektryczne
  * *Produkt końcowy*: Klinika Bioniki Stosowanej $\to$ Indywidualne Skanowanie Kikuta + Integracja Siłowników z Nerwami
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Biomechatronika i Mioelektryczne Sprzężenie Nerwowe (Era 8)*
* **Recykling / Odpady**: Całkowicie przywraca sprawność fizyczną poszkodowanym pracownikom.

### 182. Bioniczne Implanty Wzroku (Sztuczna Siatkówka HD) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Złota + Piasek Kwarcowy + Algi Morskie
  * *L1*: Złoto + Krzem Monokrystaliczny + Biopolimery
  * *L2*: Mikromacierze Fotodiodowe Siatkówkowe (L2) + Bezprzewodowy Odbiornik Indukcyjny (L2) + Procesor Wizyjny AI w Okularach
  * *Produkt końcowy*: Laboratorium Neuro-Okulistyki $\to$ Elastyczny Chip Siatkówkowy do Wszczepienia Chirurgicznego
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Protezowanie Wzroku i Fotonika Siatkówkowa (Era 8)*
* **Recykling / Odpady**: Przywraca wzrok niewidomym obywatelom.

### 183. Bioniczne Implanty Słuchu i Mowy (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt/Tytan + Ruda Złota + Piasek Kwarcowy
  * *L1*: Tytan + Złoto + Krzem
  * *L2*: Elektrody Ślimakowe Precyzyjne (L2) + Procesor Mowy z Redukcją Szumów AI (L2) + Mikro-Magnes Neodymowy Podskórny
  * *Produkt końcowy*: Zakład Neuroprotetyki Słuchu $\to$ Wszczep Wewnętrzny + Procesor Dźwięku
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Bezpośrednia Stymulacja Nerwu Słuchowego (Era 8)*
* **Recykling / Odpady**: Niezwykle wysoka trwałość na całe życie pacjenta.

### 184. Egzoszkielety Medyczne i Rehabilitacyjne (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt/Tytan + Neodym + Ruda Litu
  * *L1*: Tytan Hutniczy + Ziemie Rzadkie + Lit
  * *L2*: Siłowniki Bioniczne Obrotowe (L2) + Bateria Li-Ion Plecakowa (L2) + Sensory Siły Nacisku Stóp (L2) + Rama Węglowa
  * *Produkt końcowy*: Fabryka Robotów Medycznych $\to$ Montaż Egzoszkieletu Chodzącego z Kalibracją Wagi
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Wspomagana Lokomocja i Robotyka Ubieralna (Era 8)*
* **Recykling / Odpady**: Pozwala osobom sparaliżowanym wstać z wózka i powrócić do aktywności zawodowej.

### 185. Egzoszkielety Przemysłowe i Budowlane (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Neodym
  * *L1*: Stal Wysokowytrzymała + Aluminium + Ziemie Rzadkie
  * *L2*: Siłowniki Pneumatyczno-Elektryczne (L2) + Pancerz Odciążający Kręgosłup (L2) + Chwytaki Wzmacniające Dłonie (L2)
  * *Produkt końcowy*: Zakład Maszyn Przemysłowych $\to$ Egzoszkielet Robotnika Fabrycznego
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia, Licencja: *Ergonomia Siłowa i Egzoszkielety Pracy Ciężkiej (Era 8)*
* **Recykling / Odpady**: Zmniejsza wypadkowość w fabrykach o 80% i podnosi wydajność pracy Robotników o 150%.

### 186. Roboty Opiekuńcze dla Seniorów i Szpitali (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Piasek Kwarcowy + Neodym + Kauczuk
  * *L1*: Aluminium + Krzem + Ziemie Rzadkie + Silikon
  * *L2*: Ramiona Manipulacyjne o Delikatnym Chwycie (L2) + Podstawa Kołowa Balansująca (L2) + Procesor Empatyczny AI (L2) + Miękkie Poszycie Silikonowe
  * *Produkt końcowy*: Fabryka Robotów Socjalnych $\to$ Humanoidalny Robot Asystujący ze Skanerem Zdrowia
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Robotyka Usługowa i Empatyczna Sztuczna Inteligencja (Era 8)*
* **Recykling / Odpady**: Rozwiązuje kryzys starzejącego się społeczeństwa w miastach.

### 187. Humanoidy Domowe (Asystenci Gospodarstwa Domowego) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Włókna Polimerowe + Neodym + Krzem
  * *L1*: Aluminium + Włókna Węglowe + Ziemie Rzadkie + Krzem
  * *L2*: Dwunożny Układ Równowagi Dynamicznej (L2) + Dłonie o 20 Stopniach Swobody (L2) + Bateria Solid-State (L2) + Moduł Widzenia Komputerowego 3D
  * *Produkt końcowy*: Zakłady Maszyn Inteligentnych $\to$ Uniwersalny Robot Domowy wykonujący pranie, gotowanie i sprzątanie
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Autonomia Humanoidalna Ogólnego Przeznaczenia (Era 8)*
* **Recykling / Odpady**: Modułowa naprawa w punktach serwisowych; odciąża ludzi z rutynowych prac domowych.

### 188. Roboty Kucharskie i Gastronomiczne (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza (Stal Nierdzewna) + Boksyt + Piasek Kwarcowy
  * *L1*: Stal Kwasoodporna + Aluminium + Krzem
  * *L2*: Dwa Ramiona Kulinarne z Precyzyjnymi Nożami i Chwytakami (L2) + Zintegrowana Płyta Grzewcza z Wagą (L2) + Optyczny Sensor Świeżości Potraw
  * *Produkt końcowy*: Fabryka Gastronomii Zautomatyzowanej $\to$ Kompaktowa Kuchnia Robotyczna
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia, Licencja: *Automatyzacja Przetwórstwa Kulinarnego (Era 8)*
* **Recykling / Odpady**: 0 marnowania żywności – precyzyjne odmierzanie gramatury porcji.

### 189. Autonomiczne Roboty Rolnicze (Precyzyjne Pielenie bez Chemii) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Ruda Żelaza + Piasek Kwarcowy
  * *L1*: Aluminium + Stal + Krzem
  * *L2*: Kamery Hiperspektralne Rozpoznające Chwasty (L2) + Laser Diodowy Dużej Mocy Wypalający Chwasty (L2) + Napęd Gąsienicowy Solarny
  * *Produkt końcowy*: Fabryka Agro-Robotyki $\to$ Robot Polowy z Zadaszeniem z Paneli PV
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska (Samowystarczalny solarnie), Licencja: *Agro-Fotonika i Precyzyjne Rolnictwo Laserowe (Era 8)*
* **Recykling / Odpady**: Całkowicie eliminuje potrzebę stosowania chemicznych herbicydów na farmach Mapy Świata.

### 190. Rój Dronów Zapylających (Wsparcie Bioróżnorodności) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Włókna Polimerowe + Neodym + Ruda Złota
  * *L1*: Nanotuby Węglowe + Ziemie Rzadkie + Złoto
  * *L2*: Skrzydełka Piezoelektryczne Biomimetyczne (L2) + Mikroskopijny Sensor Pyłku (L2) + Płytka Roju AI o Masie 500mg
  * *Produkt końcowy*: Instytut Bioniki Środowiskowej $\to$ Rój 1000 Mikrobotów Zapylających z Bazą Matką
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Inteligencja Roju i Mikrorobotyka Owadzia (Era 8)*
* **Recykling / Odpady**: Ratuje uprawy owoców i lasy w przypadku kryzysu populacji pszczół.

### 191. Autonomiczne Roboty Leśne (Sadzenie Lasów i Ochrona Ppoż.) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Kauczuk + Neodym
  * *L1*: Stal Pancerna + Guma + Ziemie Rzadkie
  * *L2*: Pneumatyczna Sadzarka Sadzonek Drzew (L2) + Kamera Termowizyjna Wczesnego Wykrywania Ognia (L2) + Ciężkie Podwozie Kroczące
  * *Produkt końcowy*: Zakłady Maszyn Leśnych $\to$ Robot Leśny Sadzący 5000 Drzew Dziennie
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Średnia (Biometan/Wodór), Licencja: *Automatyzacja Rewitalizacji Lasów (Era 8)*
* **Recykling / Odpady**: Drastycznie przyspiesza naturalne pochłanianie CO2 na kafelkach leśnych Mapy Świata.

### 192. Roboty Sortujące do Zakładów Recyklingu (100% Odzysku) (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Ruda Żelaza + Boksyt + Piasek Kwarcowy
  * *L1*: Stal + Aluminium + Krzem
  * *L2*: Skaner Spektroskopii Rentgenowskiej XRF i NIR (L2) + Szybkie Ramiona Delta o Przyspieszeniu 10G (L2) + Dysze Sprężonego Powietrza
  * *Produkt końcowy*: Fabryka Urządzeń Recyklingowych $\to$ Brama Sortownicza Rozpoznająca 200 Typów Materiałów
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Wysoka, Licencja: *Spektroskopia Optyczna Odpadów i Szybka Segregacja AI (Era 8)*
* **Recykling / Odpady**: **Podnosi sprawność Zakładów Recyklingu w grze do maksymalnych 95–100%**.

### 193. Roboty Chirurgiczne Precyzyjne (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt/Tytan + Ruda Złota + Piasek Kwarcowy
  * *L1*: Tytan Medyczny + Złoto + Krzem
  * *L2*: Ramiona Mikro-Manipulacyjne o Sub-Milimetrowej Precyzji (L2) + Kamera Stereo 3D 8K (L2) + Konsola Sterująca Chirurga z Haptyką
  * *Produkt końcowy*: Zakład Robotyki Medycznej $\to$ Zestaw Operacyjny z Ramionami Wymiennymi
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia, Licencja: *Telechirurgia i Precyzyjne Wspomaganie Operacji (Era 8)*
* **Recykling / Odpady**: Redukuje powikłania pooperacyjne o 95%, skracając pobyt pacjenta w szpitalu do 24 godzin.

### 194. Autonomiczne Kurierzy Kroczący i Dostawczy (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Włókna Węglowe + Neodym + Ruda Litu
  * *L1*: Aluminium + Polimery + Ziemie Rzadkie + Lit
  * *L2*: Czteronożne Podwozie Kroczące (L2) + Bateria Szybkiej Wymiany (L2) + Zamykana Skrytka Towarowa z Kodem NFC (L2) + Lidar Nawigacyjny
  * *Produkt końcowy*: Fabryka Robotów Logistycznych $\to$ Robot Dostawczy Poruszający się po Chodnikach i Schodach
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Autonomia Ostatniej Mili i Dynamika Krocząca (Era 8)*
* **Recykling / Odpady**: Zastępuje spalinowe furgonetki kurierskie w centrach miast, eliminując korki i smog.

### 195. Bioniczne Sztuczne Serce i Płuca (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt/Tytan + Algi Morskie + Piasek Kwarcowy
  * *L1*: Tytan + Biopolimery + Krzem
  * *L2*: Pompa Wirowa z Lewitacją Magnetyczną Maglev (L2) + Membrana Natleniająca z Nanowłókien (L2) + Bezprzewodowe Zasilanie Przezskórne TETS
  * *Produkt końcowy*: Instytut Inżynierii Krążeniowej $\to$ Sterylne Sztuczne Serce Gotowe do Wszczepienia
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska (Brak zużycia mechanicznego dzięki lewitacji Maglev), Licencja: *Sztuczne Narządy Hydrauliczne Bezstykowego Przepływu (Era 8)*
* **Recykling / Odpady**: Działa bezawaryjnie przez 25 lat w ciele pacjenta.

### 196. Roboty Inspekcyjne Sieci Energetycznych i Wodociągowych (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Kauczuk + Piasek Kwarcowy
  * *L1*: Aluminium + Guma + Krzem
  * *L2*: Robot Pełzający do Wnętrza Rur z Ultradźwiękami (L2) + Dron Liniowy Przesuwający się po Liniach Wysokiego Napięcia (L2) + Bateria Indukcyjna
  * *Produkt końcowy*: Wytwórnia Robotów Infrastruktury $\to$ Zestaw Diagnostyczny Miejskich Sieci Przesyłowych
* **Triada produkcyjna**: Ludzie: `[M]`/`[E]`, Energia: Niska, Licencja: *Nieniszczące Testy Ultrasonograficzne NDT (Era 8)*
* **Recykling / Odpady**: Zapobiega awariom sieci energetycznej i wyciekom wody w miastach.

### 197. Syntetyczni Towarzysze / Zwierzęta Bioniczne (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Boksyt + Algi Morskie (Eko-Skóra/Futerko) + Neodym
  * *L1*: Aluminium + Biopolimery + Ziemie Rzadkie
  * *L2*: Szkielet z Siłownikami Cichobieżnymi (L2) + Sztuczne Futro z Polimerów Recyklingowanych (L2) + Model Osobowości Zwierzęcej AI (L2)
  * *Produkt końcowy*: Manufaktura Towarzyszy Bionicznych $\to$ Bioniczny Pies/Kot Reagujący na Głos i Dotyk
* **Triada produkcyjna**: Ludzie: `[M]`, Energia: Niska, Licencja: *Behawioralna Robotyka Zoologiczna (Era 8)*
* **Recykling / Odpady**: Zaspokaja potrzeby emocjonalne samotnych mieszkańców miast bez emisji z hodowli mięsa dla zwierząt.

### 198. Kombinezony Haptowe Pełnej Imersji (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Algi Morskie + Ruda Miedzi + Neodym
  * *L1*: Bioplastik Elastyczny + Miedź + Ziemie Rzadkie
  * *L2*: Tkanina z Siatką Mikro-Siłowników Elektromagnetycznych (L2) + Układ Termoelektryczny Ciepło/Zimno (L2) + Moduł Czujników Ruchu IMU
  * *Produkt końcowy*: Zakłady Technologii Imersyjnych $\to$ Kombinezon Całościowy z Odczuwaniem Dotyku, Oporu i Temperatury
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Dotyk Cyfrowy i Haptyka Całopowierzchniowa (Era 8)*
* **Recykling / Odpady**: Umożliwia w 100% realistyczną telepracę z domu bez konieczności fizycznych podróży.

### 199. Koprocesory Pamięci i Wspomagania Poznawczego (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Złota + Algi Morskie
  * *L1*: Krzem + Złoto + Biopolimery
  * *L2*: Macierz Pamięci Synaptycznej Memrystorowej (L2) + Nanodruty Złote Bioaktywne (L2) + Bezprzewodowa Ładowarka Czaszkowa
  * *Produkt końcowy*: Instytut Rozwoju Kognitywnego $\to$ Bio-Implant Zwiększający Pojemność Pamięci Roboczej Mózgu
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Niska, Licencja: *Neuromorficzne Pamięci Memrystorowe (Era 8)*
* **Recykling / Odpady**: Pozwala pracownikom uczyć się nowych technologii w kilka godzin, drastycznie przyspieszając badania R&D.

### 200. Samoreplikujące Mikro-Roboty Rekultywacyjne (Epoka 8)
* **Drzewo łańcucha**:
  * *Surowce*: Piasek Kwarcowy + Ruda Żelaza + Węgiel (Grafen) + Neodym
  * *L1*: Krzem Monokrystaliczny + Stal + Ziemie Rzadkie
  * *L2*: Mikrosilniki Plazmowe (L2) + Katalizatory Rozkładu Toksyn Chemicznych (L2) + Autonomiczna Pętla Replikacji Surowcowej
  * *Produkt końcowy*: Narodowe Laboratorium Regeneracji Biosfery $\to$ Rój Mikro-Robotów Rozpylany nad Zdegradowanymi Terenami
* **Triada produkcyjna**: Ludzie: `[E]`, Energia: Średnia (Pobierają energię z utleniania zanieczyszczeń), Licencja: *Nanotechnologia Molekularna i Rekultywacja Biosfery (Era 8)*
* **Recykling / Odpady**: **Szczytowe osiągnięcie gry**: rozkłada pozostałości plastiku, metali ciężkich i skażeń w glebie, przywracając stan dziewiczy Ziemi.
