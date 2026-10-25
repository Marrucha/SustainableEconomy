export interface IndustryProfileOption {
  id: string;
  label: string;
  sub: string;
}

export interface IndustryConfig {
  title: string;
  icon: string;
  options: IndustryProfileOption[];
  inputLabel: string;
  inputValue: string;
  outputLabel: string;
  outputValue: string;
  description: string;
}

export const INDUSTRY_PROFILES: Record<string, IndustryConfig> = {
  mill: {
    icon: '⚙️',
    title: 'Profil produkcji młyna',
    options: [
      { id: 'maka_pszenna', label: 'Mąka Pszenna', sub: 'Do piekarni i cukierni' },
      { id: 'maka_zytnia', label: 'Mąka Żytnia', sub: 'Chleb ciemny i zakwasy' },
      { id: 'kasza', label: 'Kasza i Otręby', sub: 'Trwały prowiant' },
    ],
    inputLabel: 'Zużycie zbóż:',
    inputValue: '-200 kg pszenicy / żyta na cykl',
    outputLabel: 'Przemiał mąki:',
    outputValue: '+180 kg mąki + 20 kg otrąb',
    description: 'Tradycyjny parowy młyn przemysłowy mieli ziarno z okolicznych gospodarstw na potrzeby miejskich piekarni.',
  },
  sawmill: {
    icon: '🪚',
    title: 'Profil przetarcia tarcicy w tartaku',
    options: [
      { id: 'tarcica_budowlana', label: 'Tarcica Budowlana', sub: 'Krokwie, belki i kantówki' },
      { id: 'deski_stolarskie', label: 'Deski Stolarskie', sub: 'Drewno meblowe i podłogi' },
      { id: 'podklady_kolejowe', label: 'Podkłady Kolejowe', sub: 'Impregnowana dłużyca pod tory' },
    ],
    inputLabel: 'Zużycie dłużycy z wyrębu:',
    inputValue: '-8 kłód dębowych / sosnowych na cykl',
    outputLabel: 'Produkcja przetartego drewna:',
    outputValue: '+60 m³ tarcicy użytkowej / cykl',
    description: 'Pionowy trak ramowy napędzany maszyną parową przeciera surowe kłody na deski budowlane i materiał meblarski.',
  },
  spinning_mill: {
    icon: '🧵',
    title: 'Profil przędzalni mechanicznej',
    options: [
      { id: 'przedza_lniana', label: 'Przędza Lniana', sub: 'Z włókna lnu ze scutching shed' },
      { id: 'welna_czesankowa', label: 'Wełna Czesankowa', sub: 'Z runa owczego z pastwisk' },
      { id: 'nici_krawieckie', label: 'Nici Krawieckie', sub: 'Mocne nici maszynowe' },
    ],
    inputLabel: 'Zużycie surowca włókienniczego:',
    inputValue: '-120 kg surowego lnu / wełny na cykl',
    outputLabel: 'Produkcja przędzy i nici:',
    outputValue: '+100 szpul przędzy / cykl',
    description: 'Mechaniczne wrzeciona przędzalni parowej z 1880 r. przetwarzają surowe włókno na trwałą przędzę.',
  },
  sewing_factory: {
    icon: '👔',
    title: 'Profil konfekcji w szwalni',
    options: [
      { id: 'ubrania_robocze', label: 'Ubrania Robocze', sub: 'Kombinezony i fartuchy fabryczne' },
      { id: 'stroje_mieszczanskie', label: 'Stroje Mieszczańskie', sub: 'Garnitury i suknie z sukna' },
      { id: 'mundury_i_palta', label: 'Mundury i Płaszcze', sub: 'Ciężka wełniana odzież wierzchnia' },
    ],
    inputLabel: 'Zużycie tkanin i nici:',
    inputValue: '-80 m² sukna / płótna + przędza na cykl',
    outputLabel: 'Gotowa konfekcja odzieżowa:',
    outputValue: '+45 kompletów ubrań / cykl',
    description: 'Manufaktura krawiecka z zębatym świetlikiem dachowym szyje odzież dla mieszkańców kamienic.',
  },
  brewery: {
    icon: '🍺',
    title: 'Profil warzenia w browarze',
    options: [
      { id: 'pale_ale', label: 'English Pale Ale', sub: 'Chmiel Golding i słód jasny' },
      { id: 'porter_stout', label: 'London Porter & Stout', sub: 'Palony słód i chmiel Fuggle' },
      { id: 'green_hop', label: 'Green Hop Ale', sub: 'Świeże zielone szyszki' },
    ],
    inputLabel: 'Zużycie chmielu i słodu:',
    inputValue: '-30 kg szyszek + 150 kg słodu / cykl',
    outputLabel: 'Produkcja piwa beczkowego:',
    outputValue: '+60 beczek Ale / cykl',
    description: 'Miedziane kadzie warzelne z 1880 r. zacierają słód jęczmienny z szyszkami chmielu z Farmy Chmielu.',
  },
  tannery: {
    icon: '👞',
    title: 'Profil wyprawy skór w garbarni',
    options: [
      { id: 'skora_juchtowa', label: 'Skóra Juchtowa', sub: 'Mocna skóra na buty i uprzęże' },
      { id: 'skora_blankowa', label: 'Skóra Blankowa', sub: 'Pasy pędne i kaletnictwo' },
      { id: 'zamsz_cielęcy', label: 'Miękki Zamsz', sub: 'Rękawiczki i galanteria' },
    ],
    inputLabel: 'Zużycie skór surowych i taniny:',
    inputValue: '-40 surowych skór + 80 kg kory dębowej / cykl',
    outputLabel: 'Wyprawiona skóra galanteryjna:',
    outputValue: '+40 płatów skóry juchtowej / cykl',
    description: 'Garbarnia parowa moczy skóry w głębokich kadziach dębowych i suszy je pod zadaszonymi żerdziami.',
  },
  shoemaker: {
    icon: '🥾',
    title: 'Profil manufaktury szewskiej',
    options: [
      { id: 'trzewiki_robocze', label: 'Trzewiki Robocze', sub: 'Kute gwoździami buty dla robotników' },
      { id: 'oficerki_skorzane', label: 'Oficerki Mieszczańskie', sub: 'Wysokie skórzane buty polerowane' },
      { id: 'polbuty_miejskie', label: 'Półbuty Miejskie', sub: 'Lekkie obuwie wizytowe' },
    ],
    inputLabel: 'Zużycie skóry z garbarni:',
    inputValue: '-20 płatów skóry + nici szewskie / cykl',
    outputLabel: 'Produkcja obuwia:',
    outputValue: '+50 par trzewików / cykl',
    description: 'Wiktoriański warsztat obuwniczy na ręcznych kopytach montuje solidne skórzane obuwie miejskie.',
  },
  dairy: {
    icon: '🥛',
    title: 'Profil przetwórstwa mleczarskiego',
    options: [
      { id: 'maslo_oselkowe', label: 'Masło Osełkowe', sub: 'Świeże masło ze śmietanki' },
      { id: 'ser_cheddar', label: 'Ser Cheddar', sub: 'Twardy żółty ser dojrzewający' },
      { id: 'mleko_butelkowe', label: 'Mleko Miejskie', sub: 'Pasteryzowane mleko codzienne' },
    ],
    inputLabel: 'Zużycie surowego mleka:',
    inputValue: '-300 l mleka z fermy hodowlanej / cykl',
    outputLabel: 'Gotowy nabiał:',
    outputValue: '+90 osełek masła i kręgów sera / cykl',
    description: 'Miejska mleczarnia odbiera codzienne dostawy baniek z mlekiem i zaopatruje mieszkańców w świeży nabiał.',
  },
  slaughterhouse: {
    icon: '🥩',
    title: 'Profil rzeźni miejskiej',
    options: [
      { id: 'uboj_wolowy', label: 'Wołowina i Tusze Bydlęce', sub: 'Główny surowiec mięsny i skórzany' },
      { id: 'uboj_wieprzowy', label: 'Wieprzowina i Jagnięcina', sub: 'Mięso kulinarne i słonina' },
      { id: 'peklowanie_miesa', label: 'Peklowanie i Solenie', sub: 'Zapas strategiczny mięsa w solance' },
    ],
    inputLabel: 'Dostawy żywca z pastwisk:',
    inputValue: '-15 sztuk żywca + sól kamienna / cykl',
    outputLabel: 'Tusze mięsne i skóry:',
    outputValue: '+400 kg mięsa + 25 skór surowych / cykl',
    description: 'Miejska rzeźnia z kolejką podwieszaną dostarcza surowe mięso do masarni oraz skóry do garbarni.',
  },
  butcher: {
    icon: '🍖',
    title: 'Profil masarni i wędliniarni',
    options: [
      { id: 'kielbasy_wedzone', label: 'Kiełbasy Wędzone', sub: 'Tradycyjne pęta z wędzarni' },
      { id: 'szynki_dojrzewajace', label: 'Szynki z Wędzarni', sub: 'Dymione szynki na drewnie bukowym' },
      { id: 'wyroby_podrobowe', label: 'Pasztety i Pieczenie', sub: 'Prowiant dla dzielnic robotniczych' },
    ],
    inputLabel: 'Zużycie mięsa z rzeźni:',
    inputValue: '-180 kg mięsa + zioła i sól / cykl',
    outputLabel: 'Produkcja wyrobów mięsnych:',
    outputValue: '+140 kg wędlin i kiełbas / cykl',
    description: 'Tradycyjna masarnia z kominem wędzarniczym i markizą w pasy zaopatruje całą okolicę w wędliny.',
  },
  furniture_factory: {
    icon: '🪑',
    title: 'Profil stolarni i fabryki mebli',
    options: [
      { id: 'meble_debowe', label: 'Meble Dębowe', sub: 'Ciężkie szafy, stoły i kredensy' },
      { id: 'krzesla_i_lawy', label: 'Krzesła i Ławy', sub: 'Meble użytkowe dla kamienic i tawern' },
      { id: 'boazerie_i_podlogi', label: 'Parkiety i Boazerie', sub: 'Elementy stolarki budowlanej' },
    ],
    inputLabel: 'Zużycie tarcicy z tartaku:',
    inputValue: '-40 m³ desek stolarskich + klej / cykl',
    outputLabel: 'Produkcja meblarska:',
    outputValue: '+35 kompletów mebli / cykl',
    description: 'Parowa fabryka mebli hebluje deski z tartaku i montuje wykwintne wiktoriańskie wyposażenie wnętrz.',
  },
};
