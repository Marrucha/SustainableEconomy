# Katalog Danych Gry: Surowce, 200 Produktów, Usługi i Drzewka Rozwoju
**Załącznik do Game Design Document v3.0 (8 Epok: 1880–2080)**

> [!NOTE]
> Niniejszy katalog definiuje kompletną bazę ekonomiczną i technologiczną gry: **24 Surowce Bazowe**, **36 Półproduktów Przemysłowych**, **200 Produktów Końcowych (10 branż × 20 produktów)**, **8 gałęzi Sektora Usług** oraz węzły **Drzewka Technologii** i **Drzewka Idei** na przestrzeni 8 Epok.

---

## 1. Baza Zaplecza: 25 Surowców Bazowych i 36 Półproduktów

### 1.1. Surowce Bazowe (25 pozycji – Mapa Świata oraz Zakłady Recyklingu)
Surowce pozyskiwane są ze złóż na Mapie Świata (farmy, lasy, kopalnie, szyby) lub odzyskiwane w miejskich **Zakładach Recyklingu** z puli Odpadów Zmieszanych:

| Kategoria | # | Nazwa Surowca | Źródło pierwotne (Mapa Świata) | Czy możliwy odzysk z Recyklingu / Kompostowania? |
| :--- | :---: | :--- | :--- | :--- |
| **Rolne i Biologiczne (9)** | 1 | Pszenica | Wielkie Farmy | Tak (Biomasa/Nawozy) |
| | 2 | Jabłka | Wielkie Farmy / Sady | Tak (Biomasa/Kompost) |
| | 3 | Buraki Cukrowe | Plantacje | Tak (Biomasa/Biopaliwa) |
| | 4 | Słoneczniki | Wielkie Farmy / Plantacje | Tak (Biomasa/Biopaliwa) |
| | 5 | Bawełna | Plantacje | Tak (Włókna z recyklingu) |
| | 6 | Bydło | Farmy Hodowlane | Częściowo (Bioodpady) |
| | 7 | Owce | Farmy Hodowlane | Tak (Odzysk tekstylny) |
| | 8 | Kauczuk Naturalny | Plantacje Leśne | Tak (Granulat gumowy) |
| | 9 | Algi Morskie *(od Epoki 6)* | Farmy Morskie / Wybrzeża | Tak (Obieg biologiczny) |
| **Leśne i Mineralne Niemetaliczne (6)** | 10 | Drewno Okrągłe (Sosna/Dąb) | Lasy / Leśnictwa | Tak (Drewno poużytkowe / Celuloza) |
| | 11 | Wapień i Kruszywo | Kamieniołomy | Tak (Kruszywo budowlane z rozbiórek) |
| | 12 | Piasek Kwarcowy | Kopalnie Odkrywkowe | Tak (Stłuczka szklana i krzem) |
| | 13 | Glina Ceramiczna | Kopalnie Odkrywkowe | Tak (Gruz ceramiczny) |
| | 14 | Sól Kamienna | Kopalnie Soli | Częściowo |
| | 15 | Fosforyty | Kopalnie Fosforytów | Tak (Odzysk fosforu ze ścieków/odpadów) |
| **Metale i Rudy (6)** | 16 | Ruda Żelaza | Kopalnie Głębinowe | **Tak – wysoki (Złom stalowy)** |
| | 17 | Ruda Miedzi | Kopalnie Miedzi | **Tak – wysoki (Złom miedziany)** |
| | 18 | Boksyt | Kopalnie Odkrywkowe | **Tak – bardzo wysoki (Puszki/Aluminium)** |
| | 19 | Ruda Złota | Kopalnie Głębinowe | **Tak – Urban Mining z elektroniki** |
| | 20 | Ruda Litu *(od Epoki 4)* | Kopalnie Specjalistyczne | **Tak – Recykling baterii i akumulatorów** |
| | 21 | Neodym i Ziemie Rzadkie *(od Epoki 5)* | Kopalnie Specjalistyczne | **Tak – Urban Mining z zaawansowanej elektroniki** |
| **Surowce Energetyczne i Chemiczne (4)** | 22 | Węgiel Kamienny | Kopalnie Węgla | Nie (Surowiec spalany / koksowniczy) |
| | 23 | Ropa Naftowa *(od Epoki 2)* | Szyby Naftowe (Ląd/Morze) | Tak – pośrednio (Recykling chemiczny plastiku) |
| | 24 | Gaz Ziemny *(od Epoki 3)* | Odwierty Gazowe | Zastępowany przez Biogaz z odpadów |
| | 25 | Ruda Uranu *(od Epoki 4)* | Kopalnie Uranu | Tak (Reprocesing paliwa jądrowego) |

---

### 1.2. Półprodukty Poziomu 1 (36 pozycji – Podstawowe Materiały z 25 Surowców)
Wytwarzane bezpośrednio z surowców w miejskich zakładach przetwórczych (młyny, cukrownie, tartaki, huty, rafinerie, zakłady chemiczne):

1. **Mąka Pszenna** *(z Pszenicy)*
2. **Słód Jęczmienny/Pszenny** *(z Pszenicy)*
3. **Cukier** *(z Buraków Cukrowych)*
4. **Olej Słonecznikowy** *(ze Słoneczników)*
5. **Mleko Surowe** *(z Bydła)*
6. **Mięso Surowe** *(z Bydła i Owiec)*
7. **Białko Roślinne** *(od Epoki 6 – z Alg i Pszenicy)*
8. **Przędza Bawełniana** *(z Bawełny)*
9. **Przędza Wełniana** *(z Owiec)*
10. **Skóra Surowa Wyprawiona** *(z Bydła)*
11. **Guma Surowa** *(z Kauczuku Naturalnego)*
12. **Celuloza** *(z Drewna Okrągłego)*
13. **Tarcica** *(z Drewna Okrągłego)*
14. **Kruszywo i Piasek** *(z Wapienia i Piasku Kwarcowego)*
15. **Wapno Palone** *(z Wapienia)*
16. **Glina Oczyszczona** *(z Gliny Ceramicznej)*
17. **Szkło Surowe (Surówka)** *(z Piasku Kwarcowego)*
18. **Surówka Hutnicza (Żelazo)** *(z Rudy Żelaza i Węgla)*
19. **Miedź Rafinowana** *(z Rudy Miedzi)*
20. **Aluminium Hutnicze** *(z Boksytu)*
21. **Złoto Czyste** *(z Rudy Złota)*
22. **Koncentrat Litu** *(z Rudy Litu – od Epoki 4)*
23. **Tlenki Neodymu** *(z Neodymu i Ziem Rzadkich – od Epoki 5)*
24. **Koks Przemysłowy** *(z Węgla Kamiennego)*
25. **Frakcje Naftowe (Paliwa)** *(z Ropy Naftowej – od Epoki 2)*
26. **Gaz Płynny / Metan** *(z Gazu Ziemnego – od Epoki 3)*
27. **Uran Wzbogacony** *(z Rudy Uranu – od Epoki 4)*
28. **Sól Oczyszczona** *(z Soli Kamiennej)*
29. **Kwas Siarkowy i Chemia Nieorganiczna** *(z Soli i Minerałów)*
30. **Fosforany Oczyszczone** *(z Fosforytów)*
31. **Biomasa Przetworzona** *(z Alg i Odpadów Bio – od Epoki 6)*
32. **Złom Stalowy Przygotowany** *(z Zakładów Recyklingu)*
33. **Stłuczka Szklana** *(z Zakładów Recyklingu)*
34. **Granulat Tworzyw z Recyklingu** *(z Zakładów Recyklingu)*
35. **Wodór Bazowy** *(od Epoki 7 – z Elektrolizy OZE)*
36. **Ekstrakty Roślinne Medyczne** *(z Ziół i Roślin)*

---

### 1.3. Półprodukty Poziomu 2 i Złożone (72 pozycje – Zaawansowane Komponenty i Podzespoły)
Powstają w zaawansowanych zakładach przemysłowych, odlewniach, fabrykach komponentów i laboratoriach. Łańcuch produkcyjny jest wielopoziomowy:
* Komponenty L2 mogą powstawać z połączenia półproduktów **Poziomu 1 (L1)**,
* Półprodukty bardziej złożone (np. moduły L3) mogą być produkowane z połączenia **komponentów L2 oraz L1** (np. *Płytka PCB (L2)* + *Kondensatory (L2)* + *Mikroprocesor (L2)* $\to$ *Komputer Pokładowy / Sterownik*), co daje głęboki, realistyczny łańcuch dostaw jak w *Capitalism Lab*:

#### Grupa A: Półprodukty Spożywcze i Biologiczne (8)
1. **Syrop Cukrowy i Melasa** *(z Cukru i Wody)*
2. **Drożdże Przemysłowe** *(z Melasy i Mąki)*
3. **Koncentrat Owocowy** *(z Jabłek i Cukru)*
4. **Masło i Tłuszcze Mleczne** *(z Mleka Surowego)*
5. **Kazeina i Proszek Mleczny** *(z Mleka Surowego)*
6. **Żelatyna i Kolagen** *(ze Skóry i Kości)*
7. **Błonnik i Skrobia Modyfikowana** *(z Pszenicy i Kwasów)*
8. **Bio-Odżywki i Fermenty Bakteryjne** *(z Białka Roślinnego i Alg – od Epoki 6)*

#### Grupa B: Tekstylia, Skóry i Tworzywa Elastyczne (8)
9. **Tkanina Bawełniana Wykończona** *(z Przędzy Bawełnianej)*
10. **Tkanina Wełniana Wykończona** *(z Przędzy Wełnianej)*
11. **Tkanina Syntetyczna (Poliester)** *(z Plastiku Ropopochodnego – od Epoki 4)*
12. **Włóknina Recyklingowana (rPET)** *(z Granulatu Tworzyw z Recyklingu – od Epoki 6)*
13. **Płótno Techniczne i Drelich** *(z Przędzy Bawełnianej i Lnu)*
14. **Skóra Galanteryjna i Obuwnicza** *(ze Skóry Surowej i Kwasów Garbarskich)*
15. **Eko-Skóra Grzybowa (Mycelium)** *(z Biomasy Przetworzonej – od Epoki 6)*
16. **Wulkanizowana Guma Przemysłowa** *(z Gumy Surowej i Chemikaliów)*

#### Grupa C: Drewno, Papier i Opakowania (6)
17. **Sklejka i Płyty Wiórowe** *(z Tarcicy i Żywic)*
18. **Papier Gazetowy i Książkowy** *(z Celulozy)*
19. **Tektura Falista i Karton Opakowaniowy** *(z Celulozy i Makulatury)*
20. **Fornir Szlachetny** *(z Tarcicy)*
21. **Drewno Konstrukcyjne Klejone (CLT)** *(z Tarcicy i Eko-Klejów – od Epoki 6)*
22. **Folia Celulozowa Biodegradowalna** *(z Celulozy – od Epoki 7)*

#### Grupa D: Budownictwo i Ceramika (8)
23. **Cement Portlandzki** *(z Wapna Palonego i Gliny)*
24. **Niskoemisyjny Eko-Beton** *(z Cementu, Kruszywa i Złomu)*
25. **Cegła Palona i Klinkier** *(z Gliny Oczyszczonej)*
26. **Płytki Ceramiczne i Terakota** *(z Gliny i Minerałów)*
27. **Szkło Budowlane Płaskie** *(ze Szkła Surowego / Stłuczki)*
28. **Szkło Butelkowe i Laboratoryjne** *(ze Szkła Surowego)*
29. **Wełna Mineralna Termoizolacyjna** *(ze Skał Bazaltowych i Wapna)*
30. **Papa i Asfalt Drogowy** *(z Frakcji Naftowych i Kruszywa – od Epoki 2)*

#### Grupa E: Metalurgia, Stopy i Wyroby Hutnicze (10)
31. **Stal** *(z Surówki Hutniczej i Koksu LUB Złomu i Wodoru)*
32. **Stal Stopowa i Nierdzewna** *(ze Stali i Metali Stopowych)*
33. **Drut i Kable Miedziane w Izolacji** *(z Miedzi Rafinowanej i Gumy/Plastiku)*
34. **Blacha i Profile Aluminiowe** *(z Aluminium Hutniczego)*
35. **Profile Stalowe Konstrukcyjne** *(ze Stali)*
36. **Rury Przemysłowe** *(ze Stali i Tworzyw)*
37. **Odlewy Żeliwne** *(z Surówki Hutniczej)*
38. **Folie i Taśmy Aluminiowe** *(z Aluminium)*
39. **Blacha Ocynkowana** *(ze Stali i Cynku)*
40. **Stopy Magnezu i Tytanu** *(z Metali Lekkich – od Epoki 5)*

#### Grupa F: Chemia, Petrochemia i Eko-Polimery (10)
41. **Plastik Ropopochodny (Granulat)** *(z Frakcji Naftowych – od Epoki 3)*
42. **Bioplastik (PLA/PHA)** *(ze Skrobi i Biomasy – od Epoki 6)*
43. **Rozpuszczalniki i Zmywacze** *(z Chemikaliów)*
44. **Farby, Barwniki i Pigmenty** *(z Chemikaliów i Minerałów)*
45. **Żywice Syntetyczne i Kleje Przemysłowe** *(z Frakcji Naftowych)*
46. **Paliwo Silnikowe (Benzyna/Diesel)** *(z Frakcji Naftowych)*
47. **Biopaliwo Rafinowane (Biodiesel/Bioetanol)** *(ze Słoneczników i Alg)*
48. **E-Paliwa Syntetyczne** *(z Wodoru i Wychwyconego CO2 – od Epoki 7)*
49. **Nawozy Azotowe i NPK** *(z Gazu, Fosforanów i Kwasów)*
50. **Środki Pieniace i Detergenty Bazowe** *(z Oleju Słonecznikowego i Związków Siarki)*

#### Grupa G: Farmacja i Biotechnologia (6)
51. **Substancje Aktywne Farmaceutyczne (API)** *(z Ekstraktów Roślinnych i Chemikaliów)*
52. **Syntetyczne Nośniki Leków** *(z Polimerów i API)*
53. **Baza Maściowa i Kosmetyczna** *(z Tłuszczów, Olejów i Wosków)*
54. **Enzymy i Kultury Starterowe** *(z Fermentów Bakteryjnych – od Epoki 6)*
55. **Wektory Genowe i Nukleotydy** *(z Biomasy – od Epoki 7)*
56. **Biomatryce Kolagenowe** *(z Kolagenu i Bioplastiku – od Epoki 7)*

#### Grupa H: Mechanika i Półprodukty Maszynowe (6)
57. **Przekładnie i Łożyska** *(ze Stali i Odlewów)*
58. **Sprężyny i Elementy Złączne (Śruby, Nity)** *(ze Stali i Drutu)*
59. **Zawory i Pompy Przemysłowe** *(ze Stali, Miedzi i Gumy)*
60. **Silniki Parowe** *(ze Stali i Odlewów Żeliwnych – Epoka 1)*
61. **Silniki Spalinowe** *(ze Stali, Odlewów i Przekładni – od Epoki 2)*
62. **Silniki Elektryczne** *(ze Stali, Miedzi i Neodymu – od Epoki 4/6)*

#### Grupa I: Elektronika, Optyka i Nowe Technologie (10)
63. **Lampy Elektronowe** *(ze Szkła i Drutu Miedzianego – Epoka 2/3)*
64. **Płytki Obwodów Drukowanych (PCB)** *(z Żywic i Folii Miedzianej – od Epoki 4)*
65. **Elementy Pasywne (Kondensatory, Oporniki)** *(z Miedzi, Ceramiki i Folii – od Epoki 4)*
66. **Krzem Monokrystaliczny (Wafle)** *(z Piasku Kwarcowego i Kwasów – od Epoki 5)*
67. **Mikroprocesory i Pamięci** *(z Wafla Krzemowego i Złota – od Epoki 5)*
68. **Ekrany Wyświetlaczy (LCD/OLED)** *(ze Szkła Płaskiego, Krzemu i Neodymu – od Epoki 5)*
69. **Ogniwa Bateryjne Li-Ion** *(z Litu, Miedzi i Aluminium – od Epoki 5)*
70. **Ogniwa Fotowoltaiczne** *(z Krzemu i Szkła – od Epoki 6)*
71. **Włókna Węglowe i Nanomateriały** *(z Żywic i Polimerów – od Epoki 7)*
72. **Siłowniki Bioniczne** *(ze Stopów Tytanu, Mikroprocesorów i Neodymu – od Epoki 8)*

---

## 2. Katalog 200 Produktów Końcowych (10 Branż × 20 Produktów)

W każdej branży znajduje się **20 produktów końcowych**. Zgodnie z mechaniką 8 Epok:
* **Ewolucja (Zmiana nazwy/generacji `->`)**: Produkt przechodzi modernizację technologiczną w nowszej epoce.
* **[Wygasa w Epoce X]**: Produkt staje się przestarzały (obsolete), a jego miejsce na rynku zajmują nowsze rozwiązania.

### Branża 1: Żywność i Napoje *(Dostępna od Epoki 1: 1880–1905)*
1. **Chleb i Pieczywo Tradycyjne** *(Epoka 1 -> w Epoce 6: Pieczywo Funkcjonalne Bio)*
2. **Mięso Solone i Wędliny** *(Epoka 1 -> w Epoce 3: Wędliny Pakowane)*
3. **Konserwy Mięsne i Rybne** *(Epoka 1)*
4. **Nabiał (Masło, Sery, Mleko)** *(Epoka 1 -> w Epoce 4: Nabiał Pasteryzowany UHT)*
5. **Cukierki i Wyroby Cukiernicze** *(Epoka 1)*
6. **Piwo i Cydr** *(Epoka 1 -> w Epoce 6: Piwo Rzemieślnicze Zero-Waste)*
7. **Alkohole Wysokoprocentowe** *(Epoka 1)*
8. **Kawa i Herbata Pakowana** *(Epoka 1 -> w Epoce 6: Kawa Fair-Trade)*
9. **Makarony Pszenne** *(Epoka 2)*
10. **Soki i Napoje Butelkowane** *(Epoka 2: w szkle -> Epoka 4: w plastiku -> Epoka 7: w opakowaniach cyrkularnych)*
11. **Margaryna i Tłuszcze Roślinne** *(Epoka 2)*
12. **Czekolada i Słodycze Masowe** *(Epoka 2)*
13. **Mrożonki Warzywne i Dania Gotowe** *(Epoka 3)*
14. **Płatki Śniadaniowe** *(Epoka 3)*
15. **Napoje Gazowane (Soda/Cola)** *(Epoka 3)*
16. **Fast-Food i Przekąski Słone (Chipsy)** *(Epoka 4 – niska cena, ale obniża zdrowie w mieście)*
17. **Odżywki dla Dzieci i Żywność Medyczna** *(Epoka 5)*
18. **Napoje Roślinne (Owsiane/Sojowe)** *(Epoka 6 – niskoemisyjny zamiennik nabiału)*
19. **Burgery iAlternatywy Roślinne Mięsa** *(Epoka 6)*
20. **Mięso Hodowane Komórkowo i Żywność Personalizowana** *(Epoka 7 – zerowe zużycie gruntów i bardzo wysoka Eko-Etyka)*

---

### Branża 2: Odzież, Obuwie i Moda *(Dostępna od Epoki 1: 1880–1905)*
1. **Odzież Robocza z Drelichu/Denimu** *(Epoka 1 -> w Epoce 4: Jeansy Klasyczne -> w Epoce 7: Jeansy Cyrkularne)*
2. **Koszule Bawełniane i Bielizna** *(Epoka 1)*
3. **Płaszcze i Garnitury Wełniane** *(Epoka 1)*
4. **Suknie Tradycyjne i Gorsety** *(Epoka 1 – **[Wygasa w Epoce 2]**)*
5. **Trzewiki i Buty Skórzane Rzemieślnicze** *(Epoka 1 -> w Epoce 3: Obuwie Wizytowe)*
6. **Kapelusze Filcowe i Nakrycia Głowy** *(Epoka 1 – **[Wygasa w Epoce 4]**)*
7. **Zegarki Kieszonkowe** *(Epoka 1 -> w Epoce 2: Zegarki Naręczne Mechaniczne)*
8. **Torby, Paski i Galanteria Skórzana** *(Epoka 1 -> w Epoce 7: Galanteria z Eko-Skóry Grzybowej)*
9. **Sukienki i Odzież Codzienna Prêt-à-porter** *(Epoka 2)*
10. **Obuwie Gumowo-Tekstylne (Trampki)** *(Epoka 2 -> w Epoce 5: Sneakersy i Obuwie Sportowe)*
11. **Pończochy i Odzież Nylonowa/Syntetyczna** *(Epoka 3)*
12. **Kurtki Przeciwdeszczowe i Puchowe** *(Epoka 3 -> w Epoce 6: Kurtki Membranowe Outdoor)*
13. **Biżuteria Klasyczna** *(Epoka 2 -> w Epoce 7: Biżuteria z Diamentów Laboratoryjnych i Złota z Urban Miningu)*
14. **Okulary Korekcyjne i Przeciwsłoneczne** *(Epoka 3)*
15. **Tanie Koszulki "Fast Fashion" (Poliester)** *(Epoka 4 – niska trwałość, ogromna ilość odpadów, **[Wypierane w Epoce 7]**)*
16. **Odzież Sportowa i Termoaktywna** *(Epoka 5)*
17. **Walizki i Plecaki Podróżne** *(Epoka 4)*
18. **Odzież z Włókien Recyklingowanych (rPET/Bio-Bawełna)** *(Epoka 6 – wysoka Eko-Etyka)*
19. **Odzież Modułowa i Samonaprawiająca z Biowłókien** *(Epoka 7)*
20. **Inteligentna Odzież Klimatyzowana (Smart-Textiles)** *(Epoka 8)*

---

### Branża 3: Dom, Meble i Budownictwo *(Dostępna od Epoki 1: 1880–1905)*
1. **Meble Drewniane Stołowe i Krzesła** *(Epoka 1 -> w Epoce 7: Meble z Certyfikowanego Drewna Odzyskanego)*
2. **Łóżka i Materace** *(Epoka 1)*
3. **Szafy i Komody** *(Epoka 1 -> w Epoce 4: Meble Modułowe Do Samodzielnego Montażu)*
4. **Piece Węglowe i Kominki Żeliwne** *(Epoka 1 – wysoka emisja, **[Wygasa w Epoce 5]**)*
5. **Lampy Naftowe i Gazowe** *(Epoka 1 – **[Wygasa w Epoce 2]**)*
6. **Zastawa Stołowa (Porcelana i Szkło)** *(Epoka 1)*
7. **Narzędzia Ręczne i Warsztatowe** *(Epoka 1 -> w Epoce 4: Elektronarzędzia)*
8. **Stolarka Okienna i Drzwiowa** *(Epoka 1 -> w Epoce 6: Okna Termoizolacyjne Pasywne)*
9. **Żarówki Tradycyjne** *(Epoka 2 -> w Epoce 5: Świetlówki -> w Epoce 6: Oświetlenie LED)*
10. **Armatura Łazienkowa i Ceramika Sanitarna** *(Epoka 2 -> w Epoce 7: Systemy Odzysku Szarej Wody)*
11. **Grzejniki i Kotły Gazowe/Olejowe** *(Epoka 3 – **[Wygasa w Epoce 7]**)*
12. **Lodówki i Chłodziarki Domowe** *(Epoka 3: freonowe -> w Epoce 5: energooszczędne -> w Epoce 7: modułowe A+++)*
13. **Pralki Automatyczne** *(Epoka 3 -> w Epoce 7: Pralki Ultradźwiękowe Niskowodowe)*
14. **Odkurzacze i Małe AGD** *(Epoka 3 -> w Epoce 7: Roboty Sprzątające)*
15. **Kuchenki i Piekarniki (Gazowe -> Indukcyjne)** *(Epoka 3 -> Epoka 6)*
16. **Klimatyzatory Domowe** *(Epoka 4)*
17. **Prefabrykaty Budowlane (Wielka Płyta Betonowa)** *(Epoka 4 -> w Epoce 7: Prefabrykaty z Drewna Klejonego CLT i Zielonego Betonu)*
18. **Materiały Termoizolacyjne** *(Epoka 5: Styropian/Wełna -> Epoka 7: Bio-Izolacja z Grzybni i Celulozy)*
19. **Zmywarki Wodooszczędne** *(Epoka 5)*
20. **Inteligentne Systemy Zarządzania Domem (Smart Home)** *(Epoka 6)*

---

### Branża 4: Transport i Pojazdy *(Wchodzi w Epoce 2: 1905–1930)*
1. **Rowery Klasyczne Miejskie** *(Epoka 2 -> w Epoce 6: Rowery Ultralekkie)*
2. **Powóz / Wóz Dostawczy** *(Epoka 2 – **[Wygasa w Epoce 3]**)*
3. **Lokomotywy Parowe i Wagony** *(Epoka 2 – **[Wygasa w Epoce 4]**)*
4. **Statki Parowe i Węglowce** *(Epoka 2 – **[Wygasa w Epoce 4]**)*
5. **Samochody Osobowe Spalinowe (Benzyna/Diesel)** *(Epoka 2 -> rozwija się przez Epoki 3–6, **[Wygasa w Epoce 7]**)*
6. **Ciężarówki Spalinowe** *(Epoka 2 -> **[Wygasa w Epoce 7]**)*
7. **Motocykle i Skutery Spalinowe** *(Epoka 2 -> w Epoce 6: Skutery Elektryczne)*
8. **Opony Komunikacyjne** *(Epoka 2 -> w Epoce 7: Opony Bezpowietrzne z Recyklingu)*
9. **Autobusy Miejskie Spalinowe** *(Epoka 3 -> w Epoce 6: Autobusy Elektryczne i Wodorowe)*
10. **Pociągi Spalinowe i Elektryczne** *(Epoka 3 -> w Epoce 5: Koleje Dużych Prędkości TGV/Maglev)*
11. **Samoloty Pasażerskie Tłokowe** *(Epoka 3 -> w Epoce 4: Odrzutowce -> w Epoce 7: Samoloty na E-Paliwa/Wodór)*
12. **Kontenerowce i Statki Motorowe** *(Epoka 4 -> w Epoce 7: Kontenerowce Wodorowo-Żaglowe)*
13. **Tramwaje iPociągi Metra** *(Epoka 3)*
14. **Samochody Hybrydowe** *(Epoka 6 – pomost transformacyjny)*
15. **Samochody Osobowe Elektryczne (EV)** *(Epoka 6 -> w Epoce 7: EV na Bateriach Stałych z Recyklingu)*
16. **Rowery Elektryczne (E-Bike) i Hulajnogi Miejskie** *(Epoka 6)*
17. **Ciężarówki Elektryczne i Wodorowe** *(Epoka 7)*
18. **Samochody Wodorowe (Ogniwa Paliwowe)** *(Epoka 7)*
19. **Autonomiczne Kapsuły Miejskie (MaaS / Robo-Taxi)** *(Epoka 7)*
20. **Pasażerskie Drony Pionowego Startu (eVTOL)** *(Epoka 8)*

---

### Branża 5: Chemia Gospodarcza i Kosmetyki *(Wchodzi w Epoce 3: 1930–1955)*
1. **Mydło Tradycyjne w Kostce** *(Epoka 3)*
2. **Proszki do Prania (Fosforanowe -> Enzymatyczne Bio)** *(Epoka 3 -> Epoka 6)*
3. **Płyny do Mycia Naczyń** *(Epoka 3 -> w Epoce 7: Koncentraty w Opakowaniach Wielorazowych)*
4. **Środki Czyszczące i Dezynfekujące** *(Epoka 3)*
5. **Pasta do Zębów i Higiena Jamy Ustnej** *(Epoka 3 -> w Epoce 7: Tabletki do Mycia Zębów Zero-Waste)*
6. **Szampony i Odżywki do Włosów** *(Epoka 3 -> w Epoce 6: Szampony w Kostce i Bio-Kosmetyki)*
7. **Perfumy i Wody Toaletowe** *(Epoka 3)*
8. **Kosmetyki Kolorowe (Makijaż)** *(Epoka 3 -> w Epoce 6: Kosmetyki Wegańskie i Mineralne)*
9. **Kremy do Skóry i Dermokosmetyki** *(Epoka 3)*
10. **Środki Ochrony Roślin (Pestycydy Chemiczne)** *(Epoka 3 – szkodzą bioróżnorodności, **[Wygasają w Epoce 7]**)*
11. **Worki i Opakowania Foliowe Jednorazowe** *(Epoka 4 – generują ogrom odpadów, **[Wygasają w Epoce 6]**)*
12. **Dezodoranty w Aerozolu (Freonowe -> Bezpieczne)** *(Epoka 4 -> Epoka 5)*
13. **Pieluchy Jednorazowe** *(Epoka 4 -> w Epoce 6: Pieluchy Biodegradowalne z Celulozy)*
14. **Odświeżacze Powietrza i Świece Zapachowe** *(Epoka 4)*
15. **Kapsułki Piorące Rozpuszczalne** *(Epoka 6)*
16. **Filtry i Wkłady do Oczyszczania Wody Kranowej** *(Epoka 5)*
17. **Kremy z Filtrem UV Bezpieczne dla Raf Koralowych** *(Epoka 6)*
18. **Opakowania Biodegradowalne z Alg i Grzybni** *(Epoka 6 – zastępują jednorazowy plastik)*
19. **Bio-Środki Ochrony Roślin i Biostymulatory** *(Epoka 6 – zastępują pestycydy)*
20. **Kosmetyki Personalizowane DNA i Probiotyczne Środki Czystości** *(Epoka 7)*

---

### Branża 6: Elektronika i Komunikacja *(Wchodzi w Epoce 4: 1955–1980)*
1. **Odbiorniki Radiowe Tranzystorowe** *(Epoka 4 -> **[Wygasa w Epoce 6]**)*
2. **Telewizory Kineskopowe (CRT)** *(Epoka 4 -> w Epoce 6: Telewizory Płaskie OLED -> w Epoce 8: Projektory Holograficzne)*
3. **Telefony Stacjonarne Tarczowe/Przyciskowe** *(Epoka 4 – **[Wygasa w Epoce 6]**)*
4. **Magnetofony i Gramofony (Audio Hi-Fi)** *(Epoka 4 -> w Epoce 5: Odtwarzacze CD/MP3)*
5. **Kalkulatory Elektroniczne** *(Epoka 4 – **[Wygasa w Epoce 6]**)*
6. **Aparaty Fotograficzne Analogowe** *(Epoka 4 -> w Epoce 6: Aparaty i Kamery Cyfrowe)*
7. **Komputery Osobiste Stacjonarne (PC)** *(Epoka 5 -> w Epoce 7: Modułowe Stacje Robocze)*
8. **Laptopy i Notebooki** *(Epoka 5 -> w Epoce 7: Laptopy Naprawialne w 100%)*
9. **Telefony Komórkowe (GSM)** *(Epoka 5 -> w Epoce 6: Smartfony -> w Epoce 7: Smartfony Modułowe Fair-Tech)*
10. **Drukarki Biurowe i Domowe** *(Epoka 5 -> w Epoce 7: Drukarki 3D Domowe)*
11. **Routery i Urządzenia Sieciowe (Wi-Fi / Światłowód)** *(Epoka 5)*
12. **Monitory Komputerowe** *(Epoka 5)*
13. **Tablety i Czytniki E-Booków (E-Papier)** *(Epoka 6)*
14. **Słuchawki Bezprzewodowe i Głośniki Smart** *(Epoka 6)*
15. **Smartwatche i Opaski Monitorujące Zdrowie** *(Epoka 6)*
16. **Serwery i Macierze Danych (Dla centrów IT)** *(Epoka 5 -> w Epoce 7: Zielone Serwery Chłodzone Cieczą)*
17. **Zestawy Rzeczywistości Wirtualnej i Rozszerzonej (VR/AR)** *(Epoka 6 -> w Epoce 7: Okulary AR)*
18. **Drony Użytkowe i Fotograficzne** *(Epoka 6)*
19. **Komputery Kwantowe Osobiste / Terminale AI** *(Epoka 8)*
20. **Komunikatory Neuro-Interfejsowe (Bezdotykowe)** *(Epoka 8)*

---

### Branża 7: Kultura, Zabawki i Sport *(Wchodzi w Epoce 5: 1980–2005)*
1. **Książki Drukowane i Albumy** *(Epoka 5 – z papieru makulaturowego)*
2. **Prasa i Czasopisma** *(Epoka 5 – **[Wygasa w Epoce 7]**)*
3. **Gry Planszowe i Puzzle** *(Epoka 5)*
4. **Zabawki Drewniane i Ekologiczne** *(Epoka 5 – wysoka trwałość i Eko-Etyka)*
5. **Zabawki Plastikowe i Klocki Konstrukcyjne** *(Epoka 5 -> w Epoce 7: Klocki z Bioplastiku Roślinnego)*
6. **Lalki i Figurki Kolekcjonerskie** *(Epoka 5)*
7. **Instrumenty Muzyczne (Gitary, Pianina Cyfrowe)** *(Epoka 5)*
8. **Konsole do Gier Wideo** *(Epoka 5 -> w Epoce 7: Konsole Modułowe / Chmurowe)*
9. **Gry Wideo i Oprogramowanie Rozrywkowe** *(Epoka 5)*
10. **Piłki i Sprzęt do Gier Zespołowych** *(Epoka 5)*
11. **Rakiety Tenisowe i Sprzęt z Kompozytów** *(Epoka 5)*
12. **Narty, Snowboard i Sprzęt Zimowy** *(Epoka 5)*
13. **Namioty i Sprzęt Kempingowy/Turystyczny** *(Epoka 5)*
14. **Domowy Sprzęt Fitness (Bieżnie, Orbitreki, Hantle)** *(Epoka 5 -> w Epoce 7: Sprzęt Fitness Generujący Prąd)*
15. **Wędki i Sprzęt Wodniacki (Kajaki, Deski SUP)** *(Epoka 6)*
16. **Zestawy Edukacyjne STEM i Robotyka dla Dzieci** *(Epoka 6)*
17. **Fotele Gamingowe i Ergonomiczne** *(Epoka 6)*
18. **Symulatory Sportowe i Komory Imersyjne VR** *(Epoka 7)*
19. **Instrumenty Holograficzne i Syntezatory AI** *(Epoka 8)*
20. **Komplety Rekreacyjne ze Skrzydełkami Antygrawitacyjnymi / Jet-Boardy** *(Epoka 8)*

---

### Branża 8: Zdrowie, Farmacja i Biotechnologia *(Wchodzi w Epoce 6: 2005–2030)*
1. **Leki Przeciwbólowe i Przeciwgorączkowe** *(Epoka 6)*
2. **Antybiotyki Nowej Generacji i Leki Przeciwwirusowe** *(Epoka 6)*
3. **Witaminy i Suplementy Diety (Roślinne/Algi)** *(Epoka 6)*
4. **Szczepionki (Tradycyjne i mRNA)** *(Epoka 6)*
5. **Leki Kardiologiczne i Metaboliczne (Insulina)** *(Epoka 6)*
6. **Środki Opatrunkowe i Hydrożele Medyczne** *(Epoka 6)*
7. **Soczewki Kontaktowe i Implanty Okulistyczne** *(Epoka 6)*
8. **Aparaty Słuchowe Cyfrowe** *(Epoka 6)*
9. **Domowe Testery Diagnostyczne i Glukometry** *(Epoka 6)*
10. **Wózki Inwalidzkie Elektryczne** *(Epoka 6)*
11. **Sprzęt Szpitalny (Respiratory, Kardiomonitory)** *(Epoka 6)*
12. **Skanery Obrazowania Medycznego (MRI / Tomografy)** *(Epoka 6)*
13. **Terapie Celowane Onkologiczne i Immunoterapia** *(Epoka 7)*
14. **Terapie Genowe CRISPR (Leczenie Chorób Rzadkich)** *(Epoka 7)*
15. **Bio-Implanty Stomatologiczne i Kostne 3D** *(Epoka 7)*
16. **Sztuczna Krew i Płyny Krwiozastępcze** *(Epoka 7)*
17. **Zestawy Mikrobiomu i Medycyny Prewencyjnej** *(Epoka 7)*
18. **Organy Drukowane Biologicznie (Biodruk 3D z Biomatryc)** *(Epoka 8)*
19. **Nanoboty Medyczne Czyszczące Naczynia Krwionośne** *(Epoka 8)*
20. **Terapie Regeneracji Komórkowej i Długowieczności** *(Epoka 8)*

---

### Branża 9: Energetyka Użytkowa i Eko-Technologie *(Wchodzi w Epoce 7: 2030–2055)*
1. **Domowe Panele Fotowoltaiczne (PV)** *(Epoka 7)*
2. **Szyby Perowskitowe Generujące Prąd (BIPV)** *(Epoka 7)*
3. **Domowe Pompy Ciepła (Powietrzne i Gruntowe)** *(Epoka 7)*
4. **Domowe Magazyny Energii (Powerwall z Recyklingu)** *(Epoka 7)*
5. **Przydomowe Mikroturbiny Wiatrowe Bezwibracyjne** *(Epoka 7)*
6. **Stacje Ładowania Pojazdów (Wallbox V2G)** *(Epoka 7)*
7. **Domowe Rekuperatory z Filtracją Antysmogową HEPA** *(Epoka 7)*
8. **Domowe Kompostowniki Bio-Enzymatyczne** *(Epoka 7 – zmniejszają odpady w mieście u źródła)*
9. **Systemy Odzysku Wody Deszczowej i Szarej** *(Epoka 7)*
10. **Generatory Wody Pitnej z Wilgoci Powietrza** *(Epoka 7)*
11. **Wertykalne Ogrody Domowe (Aeroponika Domowa)** *(Epoka 7)*
12. **Domowe Elektrolizery i Magazyny Zielonego Wodoru** *(Epoka 7)*
13. **Kolektory Słoneczne Próżniowe** *(Epoka 7)*
14. **Miejski Meble Antysmogowe i Pochłaniacze CO2** *(Epoka 7)*
15. **Mikro-Bioreaktory z Algami (Domowe Produkowanie Tlenu i Biomasy)** *(Epoka 8)*
16. **Domowe Recyklery Molekularne 3D (Przetwarzanie domowych odpadów na filament)** *(Epoka 8)*
17. **Powłoki Dachowe Chłodzące Radiacyjnie (Pasywna Klimatyzacja)** *(Epoka 7)*
18. **Baterie Biodegradowalne Organiczne** *(Epoka 8)*
19. **Modułowe Mikro-Ogniwa Fuzyjne dla Osiedli** *(Epoka 8)*
20. **Autonomiczne Boje i Filtry Oczyszczające Akweny** *(Epoka 8)*

---

### Branża 10: Bionika i Robotyka *(Wchodzi w Epoce 8: 2055–2080)*
1. **Bioniczne Protezy Kończyn Sterowane Myślą** *(Epoka 8)*
2. **Bioniczne Implanty Wzroku (Sztuczna Siatkówka HD)** *(Epoka 8)*
3. **Bioniczne Implanty Słuchu i Mowy** *(Epoka 8)*
4. **Egzoszkielety Medyczne i Rehabilitacyjne** *(Epoka 8)*
5. **Egzoszkielety Przemysłowe i Budowlane (Odciążające Robotników)** *(Epoka 8)*
6. **Roboty Opiekuńcze dla Seniorów i Szpitali** *(Epoka 8)*
7. **Humanoidy Domowe (Asystenci Gospodarstwa Domowego)** *(Epoka 8)*
8. **Roboty Kucharskie i Gastronomiczne** *(Epoka 8)*
9. **Autonomiczne Roboty Rolnicze (Precyzyjne Pielenie bez Pestycydów)** *(Epoka 8)*
10. **Rój Dronów Zapylających (Wsparcie Bioróżnorodności)** *(Epoka 8)*
11. **Autonomiczne Roboty Leśne (Sadzenie Lasów i Ochrona ppoż.)** *(Epoka 8)*
12. **Roboty Sortujące do Zakładów Recyklingu (100% Odzysku)** *(Epoka 8)*
13. **Roboty Chirurgiczne Precyzyjne** *(Epoka 8)*
14. **Autonomiczne Kurierzy Kroczący i Dostawczy** *(Epoka 8)*
15. **Bioniczne Sztuczne Serce i Płuca** *(Epoka 8)*
16. **Roboty Inspekcyjne Sieci Energetycznych i Wodociągowych** *(Epoka 8)*
17. **Syntetyczni Towarzysze / Zwierzęta Bioniczne** *(Epoka 8)*
18. **Kombinezony Haptowe Pełnej Imersji** *(Epoka 8)*
19. **Koprocesory Pamięci i Wspomagania Poznawczego** *(Epoka 8)*
20. **Samoreplikujące Mikro-Roboty Rekultywacyjne** *(Epoka 8)*

---

## 3. Kategoria 11: Sektor Usług (10 Gałęzi Miejskich i Regionalnych)

Budynki usługowe stawia się na siatce ulic w miastach (oraz elektrownie/sieci na Mapie Świata). Generują one przychody od mieszkańców i przedsiębiorstw oraz dostarczają kluczowych mediów i infrastruktury systemowej:

> [!IMPORTANT]
> **Zasada Trzech Warunków Produkcji (Triada Wymogów Produkcyjnych)**:
> Aby jakakolwiek fabryka, przetwórnia lub zakład w grze mógł wyprodukować choćby 1 sztukę towaru, oprócz surowców fizycznych **MUSI** spełnić 3 bezwzględne warunki:
> 1. **LUDZIE (Pracownicy)** – odpowiednia liczba obsadzonych etatów z danej klasy społecznej (Robotnicy / Inżynierowie / Naukowcy) z godnymi płacami i warunkami pracy.
> 2. **ENERGIA (Prąd i Paliwa)** – stałe zasilanie z miejskiej sieci energetycznej (usługa Energetyki) o odpowiedniej mocy i miksie węglowo-odnawialnym.
> 3. **LICENCJA (Technologia i Zezwolenie)** – zbadana i aktywna technologia/patent w Drzewku Technologii korporacji (lub licencja badawcza z R&D/Uniwersytetu).

| # | Gałąź Usług | Od kiedy? | Klienci | Kluczowy efekt systemowy w mieście i korporacji |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **Handel** *(Sklepy, Domy Towarowe -> E-Commerce)* | Epoka 1 | Mieszkańcy (3 klasy) | Umożliwia sprzedaż 200 produktów końcowych; rozwinięty handel zwiększa zasięg i marżę detaliczną. |
| 2 | **Bankowość** *(Oddziały Bankowe -> Zielona Bankowość)* | Epoka 1 | Mieszkańcy + Firmy | Obniża oprocentowanie kredytów inwestycyjnych korporacji oraz zwiększa siłę nabywczą Klasy Średniej. |
| 3 | **Księgowość** *(Biura Rachunkowe -> Audyt ESG)* | Epoka 1 | Firmy w mieście | Obniża koszty operacyjne i administracyjne wszystkich fabryk oraz sklepów w mieście o określony procent. |
| 4 | **Ubezpieczenia** *(Towarzystwa Ubezpieczeniowe)* | Epoka 1 | Mieszkańcy + Firmy | Chroni przed stratami finansowymi (wypadki, przestoje) i zwiększa poczucie bezpieczeństwa mieszkańców. |
| 5 | **Uniwersytety** *(Uczelnie Wyższe i Politechniki)* | Epoka 1 | Mieszkańcy | Przekształcają Robotników w **Klasę Średnią** oraz **Elitę/Naukowców** i generują **Punkty Nauki** do licencji. |
| 6 | **R&D (Centra Badawcze)** | Epoka 1 | Korporacja + Licencje | Generują **Licencje Produktowe** i Punkty Nauki oraz podnoszą **Jakość, Trwałość i Eko-Etykę** produktów. |
| 7 | **Serwisanci (Warsztaty i Centra Napraw)** | Epoka 1 | Mieszkańcy | **Klucz Gospodarki Cyrkularnej**: wydłużają żywotność produktów u mieszkańców i **zmniejszają ilość Odpadów**. |
| 8 | **Usługi IT** *(Centra Danych, Software, Chmura, AI)* | **Epoka 4** | Mieszkańcy + Firmy | Zwiększają wydajność automatyzacji fabryk, optymalizują logistykę i podnoszą zyski z nowoczesnych gałęzi gospodarki. |
| 9 | **Energetyka i Dystrybucja Mocy** *(Elektrownie i Sieć)* | Epoka 1 | Wszystkie fabryki i miasta | **Warunek produkcji #2**: Zapewnia dostawy prądu dla zakładów. Czystość miksu wyznacza ślad węglowy towarów. |
| 10 | **Transport i Spedycja** *(Kolej, Tabor, Flota, Doki)* | Epoka 1 | Przemysł i Handel | Fizycznie przemieszcza surowce i półprodukty między miastami i kopalniami; redukuje koszty i czas dostaw. |

---

## 4. Drzewko Technologii (Punkty Nauki – 5 Ścieżek × 8 Epok = 40 Węzłów)

| Epoka | Ścieżka 1: Nowe Branże i Produkty | Ścieżka 2: Przemysł i Materiały | Ścieżka 3: Energetyka i Sieci | Ścieżka 4: Logistyka i Transport | Ścieżka 5: Recykling i Eko-Technika |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. (1880–1905)** | **Przemysł Spożywczy, Tekstylny i Drzewny** *(Branże 1–3)* | **Maszyna Parowa i Hutnictwo Żelaza** | **Kotły Węglowe i Pierwsze Elektrownie** | **Kolej Parowa i Żegluga Parowa** | **Kanalizacja Miejska i Gospodarka Złomem** |
| **2. (1905–1930)** | **Inżynieria Motoryzacyjna** *(Otwiera Branżę 4: Transport)* | **Taśma Produkcyjna (Fordyzm) i Stal Stopowa** | **Sieci Elektryczne Prądu Zmiennego i Elektrownie Wodne** | **Transport Samochodowy i Drogi Utwardzone** | **Filtry Kominowe Dymowe i Oczyszczalnie Ścieków** |
| **3. (1930–1955)** | **Synteza Chemiczna i Kosmetologia** *(Otwiera Branżę 5: Chemia)* | **Petrochemia, Tworzywa Sztuczne i Aluminium** | **Elektrownie Gazowe i Rafinerie Ropy** | **Lotnictwo Towarowe i Kolej Elektryczna** | **Miejskie Sortownie Odpadów i Recykling Szkła/Papieru** |
| **4. (1955–1980)** | **Tranzystory i Telekomunikacja** *(Otwiera Branżę 6 + Usługi IT)* | **Automatyzacja Przemysłowa (PLC) i Polimery** | **Energetyka Jądrowa (Generacja II/III)** | **Konteneryzacja Globalna i Autostrady** | **Odsiarczanie Spalin i Recykling Tworzyw** |
| **5. (1980–2005)** | **Cyfryzacja, Multimedia i Rekreacja** *(Otwiera Branżę 7)* | **Mikroprocesory, Krzem i Inżynieria Precyzyjna** | **Pierwsze Farmy Wiatrowe i Słoneczne** | **Logistyka Just-in-Time i Koleje Dużych Prędkości** | **Zaawansowany Recykling Elektroniki (Urban Mining)** |
| **6. (2005–2030)** | **Biotechnologia i Nowoczesna Farmacja** *(Otwiera Branżę 8)* | **Bioplastiki, Ogniwa Li-Ion i Ekoprojektowanie** | **Inteligentne Sieci (Smart Grid) i Morska Energetyka Wiatrowa** | **Floty Elektryczne i Niskoemisyjna Żegluga** | **Recykling Chemiczny i Odzysk Litu/Kobaltu** |
| **7. (2030–2055)** | **Eko-Technologie Użytkowe i Prosumenckie** *(Otwiera Branżę 9)* | **Zielona Stal Wodorowa, Perowskity i Kompozyty** | **Gospodarka Wodorowa i Magazyny Energii Wielkiej Skali** | **Transport Wodorowy i Autonomiczna Logistyka** | **Wychwytywanie CO2 (DAC/CCS) i Zamknięty Obieg Wody** |
| **8. (2055–2080)** | **Cybernetyka, Bionika i Robotyka** *(Otwiera Branżę 10)* | **Nanotechnologia, Biodruk 3D i Fabryki Bezodpadowe** | **Komercyjna Fuzja Jądrowa (Czysta Energia)** | **Zautomatyzowana Sieć BezEmisyjna (Zero-Carbon Freight)** | **Recykling Molekularny (100% Odzysku z Odpadów)** |

---

## 5. Drzewko Idei Społeczno-Ekonomicznych (Kapitał Społeczny – 4 Ścieżki × 8 Epok = 32 Węzły)

| Epoka | Ścieżka 1: Prawa Pracy i Organizacja | Ścieżka 2: Model Cyrkularny i Produkt | Ścieżka 3: Społeczeństwo i Miasta | Ścieżka 4: Lobbing i Regulacje Klimatyczne |
| :--- | :--- | :--- | :--- | :--- |
| **1. (1880–1905)** | **Zakaz Pracy Dzieci i Pierwsze Przepisy BHP** | **Rzemieślnicza Gwarancja Jakości** | **Powszechna Edukacja Podstawowa i Szpitale Miejskie** | **Prawa Sanitarne i Wodociągowe w Miastach** |
| **2. (1905–1930)** | **8-Godzinny Dzień Pracy i Dialog ze Związkami** | **Standaryzacja Części Zamiennych** | **Budownictwo Społeczne i Parki Miejskie** | **Normy Zadymienia i Ochrona Lasów Państwowych** |
| **3. (1930–1955)** | **Płatne Urlopy i Ubezpieczenia Pracownicze** | **Sieci Autoryzowanych Serwisów Naprawczych** | **Szkolnictwo Zawodowe i Rozwój Klasy Średniej** | **Pierwsze Normy Czystości Wód i Powietrza** |
| **4. (1955–1980)** | **Równość Płac i Ergonomia Pracy** | **Oznakowanie Energetyczne i Ekologiczne Produktów** | **Kampusy Uniwersyteckie i Transport Publiczny** | **Zasada „Zanieczyszczający Płaci” (Opłaty Emisyjne)** |
| **5. (1980–2005)** | **Elastyczny Czas Pracy i Szkolenia Cyfrowe** | **Rozszerzona Odpowiedzialność Producenta (ROP)** | **Zielone Dzielnice i Świadomość Konsumencka** | **Handel Uprawnieniami do Emisji i Dotacje na OZE** |
| **6. (2005–2030)** | **Raportowanie ESG i Partycypacja Pracownicza** | **Prawo do Naprawy (Right to Repair) i Zakaz Postarzania** | **Miasta 15-Minutowe i Zdrowie Publiczne** | **Progresywny Podatek Węglowy (Carbon Tax)** |
| **7. (2030–2055)** | **4-Dniowy Tydzień Pracy i Automatyzacja Humanocentryczna** | **Produkt jako Usługa (PaaS) i Ekoprojektowanie Modułowe** | **Ekonomia Obwarzanka (Doughnut Economics)** | **Zakaz Składowania Odpadów i Wymóg Min. 70% Recyklingu** |
| **8. (2055–2080)** | **Spółdzielczość Wiedzy i Dywidenda Robotyczna dla Pracowników** | **100% Gospodarka Obiegu Zamkniętego (Zero-Waste)** | **Społeczeństwo Regeneratywne i Nauka Powszechna** | **Globalny Pakt Klimatyczny Net-Negative** |
