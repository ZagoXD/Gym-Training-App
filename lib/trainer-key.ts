export function generateTrainerKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  const raw = Array.from({ length: 8 }, pick).join('');
  return `${raw.slice(0,4)}-${raw.slice(4)}`;
}

export function normalizeKey(input: string) {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(.{4})(.+)$/, '$1-$2');
}
