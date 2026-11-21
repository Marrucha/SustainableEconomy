export const ENGLISH_FIRST_NAMES = [
  'Arthur', 'Albert', 'Alfred', 'Charles', 'Edward', 'Frederick', 'George', 'Henry',
  'James', 'John', 'Oliver', 'Richard', 'Robert', 'Samuel', 'Thomas', 'Walter',
  'William', 'Benjamin', 'Edmund', 'Harold', 'Leonard', 'Percy', 'Reginald', 'Victor',
  'Alice', 'Beatrice', 'Charlotte', 'Clara', 'Edith', 'Eleanor', 'Emily', 'Florence',
  'Harriet', 'Margaret', 'Mary', 'Violet',
];

export const ENGLISH_LAST_NAMES = [
  'Ashworth', 'Aldridge', 'Baker', 'Beaumont', 'Blackwood', 'Bramwell', 'Carrington',
  'Cavendish', 'Chadwick', 'Cooper', 'Crompton', 'Finch', 'Fletcher', 'Hargreaves',
  'Hastings', 'Hawthorne', 'Holloway', 'Kensington', 'Kingsley', 'Lancaster', 'Palmer',
  'Pemberton', 'Pendelton', 'Prescott', 'Radcliffe', 'Sterling', 'Thornton', 'Whitaker',
  'Whitmore', 'Worthington',
];

export function generateRandomEnglishName(existingNames: string[] = []): string {
  const used = new Set(existingNames);
  for (let i = 0; i < 20; i++) {
    const first = ENGLISH_FIRST_NAMES[Math.floor(Math.random() * ENGLISH_FIRST_NAMES.length)];
    const last = ENGLISH_LAST_NAMES[Math.floor(Math.random() * ENGLISH_LAST_NAMES.length)];
    const full = `${first} ${last}`;
    if (!used.has(full)) return full;
  }
  const first = ENGLISH_FIRST_NAMES[Math.floor(Math.random() * ENGLISH_FIRST_NAMES.length)];
  const last = ENGLISH_LAST_NAMES[Math.floor(Math.random() * ENGLISH_LAST_NAMES.length)];
  return `${first} ${last}`;
}

export function syncRosterCount(
  roster: Array<{ id: string; name: string; role: string }>,
  role: 'worker' | 'manager' | 'warehouseman' | 'merchant' | 'seller',
  targetCount: number
): Array<{ id: string; name: string; role: string }> {
  const currentForRole = roster.filter((r) => r.role === role);
  const others = roster.filter((r) => r.role !== role);
  if (currentForRole.length === targetCount) return roster;

  if (currentForRole.length > targetCount) {
    return [...others, ...currentForRole.slice(0, targetCount)];
  }

  const next = [...currentForRole];
  const allNames = roster.map((r) => r.name);
  while (next.length < targetCount) {
    const name = generateRandomEnglishName([...allNames, ...next.map((n) => n.name)]);
    next.push({
      id: `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      role,
    });
  }
  return [...others, ...next];
}
