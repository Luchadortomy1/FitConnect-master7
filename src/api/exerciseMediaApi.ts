import Constants from 'expo-constants';

const PEXELS_HOST = 'api.pexels.com';

const normalizeName = (name: string): string => {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return base.trim();
};

const detectContext = (norm: string) => {
  const equipment = new Set<string>();
  const muscles = new Set<string>();

  const add = (set: Set<string>, vals: string[]) => vals.forEach(v => set.add(v));

  if (/mancuern/.test(norm)) add(equipment, ['dumbbell']);
  if (/barra/.test(norm)) add(equipment, ['barbell']);
  if (/maquina|máquina|machine/.test(norm)) add(equipment, ['machine']);
  if (/polea|cable/.test(norm)) add(equipment, ['cable', 'cable machine']);
  if (/kettlebell/.test(norm)) add(equipment, ['kettlebell']);
  if (/peso corporal|bodyweight|sin peso/.test(norm)) add(equipment, ['bodyweight']);
  if (/banco/.test(norm)) add(equipment, ['bench']);
  if (/cajon/.test(norm)) add(equipment, ['box', 'plyo box']);
  if (/cuerda/.test(norm)) add(equipment, ['rope', 'jump rope']);
  if (/caminadora|trote|trote ligero|trote facil/.test(norm)) add(equipment, ['treadmill', 'running']);
  if (/bicicleta|ciclismo|bike/.test(norm)) add(equipment, ['bike', 'cycling', 'stationary bike']);
  if (/remo maquina|remo máquina|row machine/.test(norm)) add(equipment, ['rowing machine']);

  if (/pecho|chest/.test(norm)) add(muscles, ['chest']);
  if (/espalda|back/.test(norm)) add(muscles, ['back']);
  if (/hombro/.test(norm)) add(muscles, ['shoulder', 'delts']);
  if (/bicep|biceps/.test(norm)) add(muscles, ['biceps']);
  if (/tricep|triceps/.test(norm)) add(muscles, ['triceps']);
  if (/cuadricep|cuadriceps/.test(norm)) add(muscles, ['quads']);
  if (/femoral|isquio/.test(norm)) add(muscles, ['hamstrings']);
  if (/pantorrilla|pantorrillas|calf/.test(norm)) add(muscles, ['calves']);
  if (/gluteo|gluteo|gluteos|glúteos/.test(norm)) add(muscles, ['glutes']);
  if (/pierna/.test(norm)) add(muscles, ['legs']);
  if (/cadera/.test(norm)) add(muscles, ['hips']);
  if (/core/.test(norm)) add(muscles, ['core']);
  if (/abdo|min|abs/.test(norm)) add(muscles, ['abs']);
  if (/cardio/.test(norm)) add(muscles, ['cardio']);
  if (/full body/.test(norm)) add(muscles, ['full body']);
  if (/trapecio|trampecio|shrug/.test(norm)) add(muscles, ['traps']);
  if (/flexibilidad|movilidad|mobility/.test(norm)) add(muscles, ['mobility']);

  return {
    equipment: Array.from(equipment),
    muscles: Array.from(muscles),
  };
};

const canonicalQueries: Record<string, string> = {
  'sentadilla': 'squat exercise gym',
  'sentadillas': 'squat exercise gym',
  'sentadilla back squat': 'back squat exercise barbell',
  'sentadilla frontal': 'front squat exercise barbell',
  'sentadilla bulgara': 'bulgarian split squat dumbbell',
  'sentadillas divididas': 'split squat dumbbell exercise',
  'sentadillas rapidas': 'bodyweight squat fast exercise',
  'sentadillas pesadas': 'back squat barbell strength gym',
  'sentadillas corporales': 'bodyweight squat exercise',
  'sentadillas cuerpo': 'bodyweight squat exercise',
  'sentadilla + salto': 'jump squat bodyweight exercise',
  'sentadillas + salto': 'jump squat bodyweight exercise',
  'sentadillas profundas': 'deep squat barbell exercise',
  'peso muerto': 'deadlift exercise barbell',
  'peso muerto rumano': 'romanian deadlift exercise barbell',
  'peso muerto convencional': 'deadlift exercise barbell',
  'peso muerto de pierna': 'stiff leg deadlift barbell exercise',
  'press militar': 'shoulder press exercise barbell',
  'press hombros': 'shoulder press exercise barbell',
  'press hombros maquina': 'shoulder press machine exercise gym',
  'press de hombros': 'shoulder press exercise dumbbell',
  'press de hombros maquina': 'shoulder press machine exercise gym',
  'press de banca': 'bench press exercise barbell',
  'press de pecho': 'bench press exercise barbell chest gym',
  'press inclinado': 'incline bench press exercise',
  'press inclinado con mancuernas': 'incline dumbbell press exercise',
  'incline dumbbell press': 'incline dumbbell press exercise gym',
  'remo con barra': 'barbell row exercise',
  'remo barra': 'barbell row exercise',
  'remo mancuerna': 'single arm dumbbell row exercise',
  'remo invertido': 'inverted row bodyweight',
  'remo maquina': 'seated cable row exercise',
  'remo en maquina': 'seated cable row exercise',
  'remo maquina 20min': 'rowing machine cardio gym',
  'remo maquina 20 min': 'rowing machine cardio gym',
  'jalon frontal': 'lat pulldown cable machine',
  'jalon lateral': 'lat pulldown cable machine',
  'dominadas': 'pull up exercise',
  'flexiones': 'push up exercise',
  'elevaciones laterales': 'lateral raise dumbbell shoulder exercise gym',
  'elevaciones frontales': 'front raise dumbbell shoulder exercise gym',
  'aperturas en pectorales': 'cable chest fly gym exercise',
  'aperturas en pecho': 'dumbbell chest fly gym exercise',
  'chest fly': 'dumbbell chest fly gym exercise',
  'curl biceps': 'bicep curl dumbbell exercise',
  'curl de biceps': 'bicep curl dumbbell exercise',
  'curls con barra': 'barbell curl exercise',
  'curls martillo': 'hammer curl exercise',
  'curl martillo': 'hammer curl exercise',
  'curl biceps rapido': 'bicep curl dumbbell fast exercise',
  'curl isquiotibiales': 'lying leg curl machine hamstring exercise',
  'curl femoral': 'lying leg curl machine hamstring exercise',
  'curl femorales': 'lying leg curl machine hamstring exercise',
  'curl de piernas': 'lying leg curl machine hamstring exercise',
  'curl piernas': 'lying leg curl machine hamstring exercise',
  'curl isquios': 'lying leg curl machine hamstring exercise',
  'leg curl': 'lying leg curl machine hamstring exercise',
  'triceps extension cabeza': 'overhead tricep extension dumbbell exercise gym',
  'triceps extension tras nuca': 'overhead tricep extension dumbbell exercise gym',
  'triceps extension encima de la cabeza': 'overhead tricep extension dumbbell exercise gym',
  'shrugs': 'dumbbell shrug traps exercise gym',
  'shrug': 'dumbbell shrug traps exercise gym',
  'encogimientos': 'dumbbell shrug traps exercise gym',
  'encogimientos con mancuernas': 'dumbbell shrug traps exercise gym',
  'encogimientos con barra': 'barbell shrug traps exercise gym',
  'encogimientos de hombros': 'dumbbell shrug traps exercise gym',
  'encogimiento de hombros': 'dumbbell shrug traps exercise gym',
  'encogimientos trapecio': 'dumbbell shrug traps exercise gym',
  'trapecio': 'dumbbell shrug traps exercise gym',
  'triceps extension': 'triceps extension cable rope',
  'flexiones de triceps en cuerda': 'triceps rope pushdown exercise',
  'hip thrust': 'hip thrust barbell exercise glutes',
  'plancha': 'plank core exercise',
  'planchas': 'plank core exercise',
  'burpees': 'burpee exercise',
  'leg press': 'leg press machine exercise gym',
  'prensa de piernas': 'leg press machine exercise gym',
  'sentadilla bulgara': 'bulgarian split squat dumbbell',
  'front squat': 'front squat exercise barbell',
  'extension de cuadriceps': 'leg extension machine quadriceps exercise gym',
  'extensiones de cuadriceps': 'leg extension machine quadriceps exercise gym',
  'extension cuadriceps': 'leg extension machine quadriceps exercise gym',
  'extension de pierna': 'leg extension machine quadriceps exercise gym',
  'extensiones de pierna': 'leg extension machine quadriceps exercise gym',
  'extensiones de piernas': 'leg extension machine quadriceps exercise gym',
  'pantorrilla maquina': 'standing calf raise machine exercise gym',
  'elevaciones de pantorrillas': 'calf raise machine standing',
  'estiramiento de pantorrillas': 'calf stretch standing gym',
};

const nameAliases: Record<string, string[]> = {
  'sentadilla': ['squat'],
  'sentadillas': ['squat'],
  'sentadilla back squat': ['back squat'],
  'sentadilla frontal': ['front squat'],
  'sentadilla bulgara': ['bulgarian split squat'],
  'sentadillas divididas': ['split squat'],
  'sentadillas rapidas': ['bodyweight squat'],
  'sentadillas pesadas': ['back squat'],
  'sentadillas corporales': ['bodyweight squat'],
  'sentadillas cuerpo': ['bodyweight squat'],
  'sentadilla + salto': ['jump squat'],
  'sentadillas + salto': ['jump squat'],
  'sentadillas profundas': ['deep squat'],
  'peso muerto': ['deadlift'],
  'peso muerto rumano': ['romanian deadlift'],
  'peso muerto convencional': ['deadlift'],
  'peso muerto de pierna': ['stiff leg deadlift'],
  'press militar': ['shoulder press', 'overhead press'],
  'press hombros': ['shoulder press', 'overhead press'],
  'press hombros maquina': ['machine shoulder press'],
  'press de hombros': ['shoulder press'],
  'press de hombros maquina': ['shoulder press machine'],
  'press de banca': ['bench press'],
  'press de pecho': ['bench press'],
  'press inclinado': ['incline bench press'],
  'press inclinado con mancuernas': ['incline dumbbell press'],
  'incline dumbbell press': ['incline dumbbell press'],
  'remo con barra': ['barbell row'],
  'remo barra': ['barbell row'],
  'remo mancuerna': ['single arm dumbbell row'],
  'remo maquina': ['seated row machine'],
  'remo en maquina': ['seated row machine'],
  'remo invertido': ['inverted row'],
  'remo maquina 20min': ['rowing machine'],
  'remo maquina 20 min': ['rowing machine'],
  'jalon frontal': ['lat pulldown'],
  'jalon lateral': ['lat pulldown'],
  'dominadas': ['pull up'],
  'flexiones': ['push up'],
  'elevaciones laterales': ['lateral raise'],
  'elevaciones frontales': ['front raise'],
  'aperturas en pectorales': ['chest fly', 'cable fly'],
  'aperturas en pecho': ['chest fly', 'dumbbell fly'],
  'chest fly': ['chest fly'],
  'curl biceps': ['bicep curl'],
  'curl de biceps': ['bicep curl'],
  'curls con barra': ['barbell curl'],
  'curls martillo': ['hammer curl'],
  'curl martillo': ['hammer curl'],
  'curl biceps rapido': ['bicep curl'],
  'curl isquiotibiales': ['hamstring curl', 'leg curl'],
  'curl femoral': ['hamstring curl', 'leg curl'],
  'curl femorales': ['hamstring curl', 'leg curl'],
  'curl de piernas': ['hamstring curl', 'leg curl'],
  'curl piernas': ['hamstring curl', 'leg curl'],
  'curl isquios': ['hamstring curl', 'leg curl'],
  'leg curl': ['hamstring curl', 'leg curl'],
  'triceps extension cabeza': ['overhead tricep extension'],
  'triceps extension tras nuca': ['overhead tricep extension'],
  'triceps extension encima de la cabeza': ['overhead tricep extension'],
  'shrugs': ['dumbbell shrug'],
  'shrug': ['dumbbell shrug'],
  'encogimientos': ['dumbbell shrug'],
  'encogimientos con mancuernas': ['dumbbell shrug'],
  'encogimientos con barra': ['barbell shrug'],
  'encogimientos de hombros': ['dumbbell shrug'],
  'encogimiento de hombros': ['dumbbell shrug'],
  'encogimientos trapecio': ['dumbbell shrug'],
  'trapecio': ['dumbbell shrug'],
  'triceps extension': ['triceps extension'],
  'flexiones de triceps en cuerda': ['triceps rope pushdown'],
  'hip thrust': ['hip thrust'],
  'plancha': ['plank'],
  'planchas': ['plank'],
  'burpees': ['burpee'],
  'leg press': ['leg press'],
  'prensa de piernas': ['leg press'],
  'front squat': ['front squat'],
  'extension de cuadriceps': ['leg extension'],
  'extensiones de cuadriceps': ['leg extension'],
  'extension cuadriceps': ['leg extension'],
  'extension de pierna': ['leg extension'],
  'extensiones de pierna': ['leg extension'],
  'extensiones de piernas': ['leg extension'],
  'pantorrilla maquina': ['calf raise machine', 'standing calf raise'],
  'elevaciones de pantorrillas': ['calf raise machine'],
  'estiramiento de pantorrillas': ['calf stretch'],
};

const buildCandidates = (name: string): string[] => {
  const norm = normalizeName(name);
  const slug = norm.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const baseForms = [norm, norm.replace(/-/g, ' '), slug.replace(/-/g, ' '), slug];
  const aliasForms = nameAliases[norm] || [];
  const canonical = canonicalQueries[norm];
  const { equipment, muscles } = detectContext(norm);

  const expanded: string[] = [];
  if (canonical) {
    expanded.push(canonical);
  }

  baseForms.concat(aliasForms).forEach(val => {
    if (!val) return;
    expanded.push(val);
    expanded.push(`${val} exercise`);
    expanded.push(`${val} workout`);
    expanded.push(`${val} gym`);
    expanded.push(`${val} ejercicio`);
    expanded.push(`${val} machine exercise`);
    expanded.push(`${val} fitness training`);
    equipment.forEach(eq => {
      expanded.push(`${val} ${eq}`);
      expanded.push(`${val} ${eq} exercise`);
      expanded.push(`${val} ${eq} gym`);
    });
    muscles.forEach(m => {
      expanded.push(`${val} ${m}`);
      expanded.push(`${val} ${m} exercise`);
    });
    equipment.forEach(eq => {
      muscles.forEach(m => {
        expanded.push(`${val} ${eq} ${m} exercise`);
      });
    });
  });

  return Array.from(new Set(expanded)).filter(Boolean);
};
const getPexelsApiKey = (): string | undefined => {
  const extraKey = (Constants.expoConfig as any)?.extra?.PEXELS_API_KEY
    || (Constants.manifest as any)?.extra?.PEXELS_API_KEY;
  const envKey = process.env.PEXELS_API_KEY as string | undefined;
  return extraKey || envKey;
};

export const fetchExerciseImage = async (name: string): Promise<string | null> => {
  const apiKey = getPexelsApiKey();
  if (!apiKey) {
    console.warn('Pexels API key missing. Set PEXELS_API_KEY in expo extra or env.');
    return null;
  }

  const norm = normalizeName(name);
  const { equipment, muscles } = detectContext(norm);
  const candidates = buildCandidates(name);

  for (const candidate of candidates) {
    const query = encodeURIComponent(candidate);
    const url = `https://${PEXELS_HOST}/v1/search?query=${query}&orientation=landscape&per_page=5`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: apiKey,
        },
      });

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      if (Array.isArray(data?.photos) && data.photos.length > 0) {
        const photos = data.photos as any[];
        const keywords = Array.from(new Set([
          'gym',
          'fitness',
          'exercise',
          'workout',
          'training',
          'muscle',
          'athlete',
          'bodybuilding',
          ...equipment,
          ...muscles,
          ...norm.split(/\s+/).filter(Boolean),
        ]));
        const pick = photos.find(p => {
          const alt = (p?.alt || '').toLowerCase();
          return keywords.some(k => alt.includes(k));
        });

        if (!pick) {
          continue;
        }

        const src = pick?.src;
        const best = src?.medium || src?.large || src?.original;
        if (best) return best as string;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
};
