export function labelCategoriaPt(name: string): string {
  const map: Record<string, string> = {
    Abs: 'Abdômen',
    Arms: 'Braços',
    Back: 'Costas',
    Chest: 'Peito',
    Legs: 'Pernas',
    Calves: 'Panturrilhas',
    Shoulders: 'Ombros',
    Cardio: 'Cardio',
    Neck: 'Pescoço',
    Glutes: 'Glúteos',
  };
  return map[name] ?? name;
}
