export type MineDepositType =
  | 'coal'
  | 'iron_ore'
  | 'copper_ore'
  | 'limestone'
  | 'clay'
  | 'quartz_sand'
  | 'rock_salt'
  | 'gold_ore';

export interface MineDepositInfo {
  id: MineDepositType;
  name: string;
  icon: string;
  unit: string;
  category: 'Energetyczne' | 'Rudy Metali' | 'Mineralne';
  description: string;
  baseYieldPerCycle: number; // tony na cykl wydobywczy
  basePricePerTon: number; // cena rynkowa za tonę w £ (1880 r.)
  requiredWorkers: number; // Robotnicy Klasy R
  requiredEngineers: number; // Majstrowie Klasy M
  energyKwh: number; // Zużycie prądu / pary na cykl
  color: string;
  badgeBg: string;
}

export const MINE_DEPOSITS: Record<MineDepositType, MineDepositInfo> = {
  coal: {
    id: 'coal',
    name: 'Węgiel Kamienny',
    icon: '🪨',
    unit: 't',
    category: 'Energetyczne',
    description: 'Czarne złoto rewolucji przemysłowej. Zasilanie kotłów, elektrociepłowni i pieców hutniczych.',
    baseYieldPerCycle: 180,
    basePricePerTon: 8,
    requiredWorkers: 25,
    requiredEngineers: 2,
    energyKwh: 50,
    color: 'text-stone-300',
    badgeBg: 'bg-stone-800 text-stone-200 border-stone-600',
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Ruda Żelaza (Hematyt/Magnetyt)',
    icon: '⛏️',
    unit: 't',
    category: 'Rudy Metali',
    description: 'Podstawa hutnictwa, walcowni szyn kolejowych, okuć budowlanych i kadłubów statków parowych.',
    baseYieldPerCycle: 90,
    basePricePerTon: 16,
    requiredWorkers: 30,
    requiredEngineers: 3,
    energyKwh: 60,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Ruda Miedzi (Chalkopiryt)',
    icon: '🥉',
    unit: 't',
    category: 'Rudy Metali',
    description: 'Niezbędna do przewodnictwa elektrycznego, armatury ciśnieniowej silników parowych i blach ratusza.',
    baseYieldPerCycle: 60,
    basePricePerTon: 28,
    requiredWorkers: 28,
    requiredEngineers: 3,
    energyKwh: 65,
    color: 'text-orange-400',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
  },
  limestone: {
    id: 'limestone',
    name: 'Wapień i Kruszywo Kamienne',
    icon: '🧱',
    unit: 't',
    category: 'Mineralne',
    description: 'Kamień ciosany na fundamenty, kruszywo drogowe, zaprawa murarska oraz mleko wapienne do sadów.',
    baseYieldPerCycle: 120,
    basePricePerTon: 10,
    requiredWorkers: 20,
    requiredEngineers: 1,
    energyKwh: 40,
    color: 'text-stone-200',
    badgeBg: 'bg-stone-700 text-stone-100 border-stone-500',
  },
  clay: {
    id: 'clay',
    name: 'Glina Ceramiczna',
    icon: '🏺',
    unit: 't',
    category: 'Mineralne',
    description: 'Surowiec dla wiktoriańskich cegielni, dachówek ceramicznych, garncarstwa i rur drenażowych.',
    baseYieldPerCycle: 140,
    basePricePerTon: 9,
    requiredWorkers: 22,
    requiredEngineers: 1,
    energyKwh: 35,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-900/80 text-amber-200 border-amber-700',
  },
  quartz_sand: {
    id: 'quartz_sand',
    name: 'Piasek Kwarcowy',
    icon: '🏖️',
    unit: 't',
    category: 'Mineralne',
    description: 'Czysty piasek szklarski do wytopu tafli okiennych, lamp naftowych i form odlewniczych.',
    baseYieldPerCycle: 110,
    basePricePerTon: 11,
    requiredWorkers: 18,
    requiredEngineers: 1,
    energyKwh: 30,
    color: 'text-yellow-300',
    badgeBg: 'bg-yellow-950/80 text-yellow-200 border-yellow-700/60',
  },
  rock_salt: {
    id: 'rock_salt',
    name: 'Sól Kamienna (Halit)',
    icon: '🧂',
    unit: 't',
    category: 'Mineralne',
    description: 'Konserwacja mięsa i skór, solenie ryb, garbarstwo i przemysł chemiczny XIX wieku.',
    baseYieldPerCycle: 80,
    basePricePerTon: 18,
    requiredWorkers: 24,
    requiredEngineers: 2,
    energyKwh: 45,
    color: 'text-cyan-200',
    badgeBg: 'bg-cyan-950/80 text-cyan-200 border-cyan-700/60',
  },
  gold_ore: {
    id: 'gold_ore',
    name: 'Ruda Złota (Żyły Kwarcu)',
    icon: '🪙',
    unit: 't',
    category: 'Rudy Metali',
    description: 'Bardzo rzadka ruda szlachetna. Kruszec menniczy, rezerwy bankowe Imperium i luksusowe zegarmistrzostwo.',
    baseYieldPerCycle: 25,
    basePricePerTon: 95,
    requiredWorkers: 35,
    requiredEngineers: 4,
    energyKwh: 80,
    color: 'text-yellow-400',
    badgeBg: 'bg-yellow-900/90 text-yellow-300 border-yellow-500 shadow-sm',
  },
};

export interface MineWorkflowStep {
  stepIndex: number;
  daysRange: string;
  name: string;
  assignedRole: string;
  assignedIcon: string;
  desc: string;
}

export const MINE_WORKFLOW_STEPS: MineWorkflowStep[] = [
  {
    stepIndex: 1,
    daysRange: 'Dni 1–7',
    name: 'Urabianie przodka',
    assignedRole: 'Górnik dołowy',
    assignedIcon: '👷',
    desc: 'Urabianie calizny kilofami, wiercenie i odstrzał w przodku wydobywczym.',
  },
  {
    stepIndex: 2,
    daysRange: 'Dni 8–15',
    name: 'Trakcja dołowa',
    assignedRole: 'Górnik dołowy',
    assignedIcon: '👷',
    desc: 'Załadunek urobku do wózków i przetaczanie torami chodnikowymi do podszybia.',
  },
  {
    stepIndex: 3,
    daysRange: 'Dni 16–23',
    name: 'Wyciąg nadszybia',
    assignedRole: 'Konie (Kierat konny)',
    assignedIcon: '🐎',
    desc: 'Konie pociągowe napędzają kierat wyciągowy, podnosząc kubły i klatki na powierzchnię.',
  },
  {
    stepIndex: 4,
    daysRange: 'Dni 24–30',
    name: 'Sortowanie i zwałowanie',
    assignedRole: 'Pracownik naziemny',
    assignedIcon: '🛠️',
    desc: 'Praca na nadszybiu: ręczne sortowanie skały na rusztach, kruszenie i zwałowanie na hałdę.',
  },
];

export interface MineStaffState {
  minersCount: number;         // Górnicy dołowi (Urabianie przodka + Trakcja dołowa)
  horsesCount: number;         // Konie robocze (Wyciąg nadszybia)
  surfaceWorkersCount: number; // Pracownicy naziemni (Sortowanie i zwałowanie)
  tradersCount: number;        // Kupiec (Zakup koni i Sprzedaż urobku)
}

export const DEFAULT_MINE_STAFF: MineStaffState = {
  minersCount: 8,
  horsesCount: 4,
  surfaceWorkersCount: 4,
  tradersCount: 1,
};
