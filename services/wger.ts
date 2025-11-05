export type WgerTranslation = {
  id: number;
  language: number;
  name: string;
  description: string;
};

export type WgerImage = {
  id: number;
  image: string;
  is_main: boolean;
};

export type WgerMuscle = {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
};

export type WgerCategory = {
  id: number;
  name: string;
};

export type WgerExerciseInfo = {
  id: number;
  category: WgerCategory;
  images: WgerImage[];
  muscles: WgerMuscle[];
  muscles_secondary: WgerMuscle[];
  translations: WgerTranslation[];
  last_update: string;
};

export type ExerciseCardData = {
  id: number;
  namePt: string;
  descPt: string;
  category?: string;
  focus: string[];
  images: string[];
};

const API = 'https://wger.de/api/v2';

function pickPt(ex: WgerExerciseInfo) {
  const t = ex.translations?.find(tr => tr.language === 7 && !!tr.name?.trim());
  if (!t) return null;
  return {
    name: t.name.trim(),
    desc: (t.description || '').trim(),
  };
}

// function normalizeDesc(html: string): string {
//   if (!html) return '';

//   let s = html
//     .replace(/<\s*br\s*\/?>/gi, '\n')
//     .replace(/<\/\s*(p|div|h[1-6])\s*>/gi, '\n\n')
//     .replace(/<\/\s*li\s*>/gi, '\n')
//     .replace(/<\s*li[^>]*>/gi, '• ');

//   s = s.replace(/<[^>]+>/g, '');

//   s = s
//     .replace(/&nbsp;/g, ' ')
//     .replace(/&amp;/g, '&')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .replace(/&#39;/g, "'")
//     .replace(/&quot;/g, '"');

//   s = s.replace(/[ \t]+\n/g, '\n');
//   s = s.replace(/\n{3,}/g, '\n\n');
//   s = s.trim();

//   return s;
// }

function musclesToFocus(muscles: WgerMuscle[], musclesSec: WgerMuscle[]) {
  const all = [...(muscles || []), ...(musclesSec || [])];
  const map: Record<string, string> = {
    Biceps: 'Bíceps',
    Triceps: 'Tríceps',
    Chest: 'Peito',
    Pectoralis: 'Peito',
    Abs: 'Abdômen',
    Abdominals: 'Abdômen',
    Back: 'Costas',
    Latissimus: 'Costas',
    Hamstrings: 'Posterior da coxa',
    Quadriceps: 'Quadríceps',
    Calves: 'Panturrilha',
    Shoulders: 'Ombros',
    Deltoid: 'Ombros',
    Forearms: 'Antebraço',
    Glutes: 'Glúteos',
  };
  const set = new Set<string>();
  for (const m of all) {
    const hit = Object.keys(map).find(k =>
      (m.name_en || '').toLowerCase().includes(k.toLowerCase()),
    );
    if (hit) set.add(map[hit]);
    else if (m.name) set.add(m.name);
  }
  return Array.from(set);
}

function mapResult(ex: WgerExerciseInfo): ExerciseCardData | null {
  const pt = pickPt(ex);
  if (!pt) return null;
  return {
    id: ex.id,
    namePt: pt.name,
    descPt: pt.desc,
    category: ex.category?.name,
    focus: musclesToFocus(ex.muscles || [], ex.muscles_secondary || []),
    images: (ex.images || [])
      .sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0))
      .map(i => i.image),
  };
}

function parseOffsetFromNext(next: string | null): number | null {
  if (!next) return null;
  try {
    const u = new URL(next);
    const off = u.searchParams.get('offset');
    return off ? Number(off) : null;
  } catch {
    return null;
  }
}

export async function fetchExercisePage(opts: {
  limit?: number;
  offset?: number;
  search?: string;
  categoryId?: number;
  focus?: string | null;
}) {
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  const pageSize = 50;

  let collected: ExerciseCardData[] = [];
  let nextUrl: string | null = (() => {
    const url = new URL(`${API}/exerciseinfo/`);
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('ordering', 'last_update');
    if (opts.categoryId) url.searchParams.set('category', String(opts.categoryId));
    return url.toString();
  })();

  let lastNext: string | null = null;

  while (nextUrl && collected.length < limit) {
    const res = await fetch(nextUrl);
    if (!res.ok) throw new Error(`Wger error ${res.status}`);
    const json = (await res.json()) as {
      results: WgerExerciseInfo[];
      next: string | null;
    };

    const mapped = json.results
      .map(mapResult)
      .filter((x): x is ExerciseCardData => !!x);

    collected = collected.concat(mapped);

    lastNext = json.next;
    nextUrl = json.next;
  }

  if ((opts.search || '').trim()) {
    const q = (opts.search || '').trim().toLowerCase();
    collected = collected.filter(
      i => i.namePt.toLowerCase().includes(q) || i.descPt.toLowerCase().includes(q),
    );
  }

  if (opts.focus) {
    const q = opts.focus.toLowerCase();
    collected = collected.filter(i => i.focus.some(f => f.toLowerCase().includes(q)));
  }

  const items = collected.slice(0, limit);

  const nextOffset = parseOffsetFromNext(lastNext);

  return { items, nextOffset };
}

export async function fetchCategories(): Promise<WgerCategory[]> {
  const url = `${API}/exercisecategory/?limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao listar categorias');
  const json = (await res.json()) as { results: WgerCategory[] };
  return json.results || [];
}
