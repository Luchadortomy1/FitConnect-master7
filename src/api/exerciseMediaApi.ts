import Constants from 'expo-constants';

const API_HOST = 'exercisedb.p.rapidapi.com';

const getApiKey = (): string | undefined => {
  // Prefer expo extra
  const extraKey = (Constants.expoConfig as any)?.extra?.EXERCISEDB_API_KEY
    || (Constants.manifest as any)?.extra?.EXERCISEDB_API_KEY;
  // Fallback to env-injected at build time if configured
  const envKey = process.env.EXERCISEDB_API_KEY as string | undefined;
  return extraKey || envKey;
};

export const fetchExerciseGif = async (name: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('ExerciseDB API key missing. Set EXERCISEDB_API_KEY in expo extra or env.');
    return null;
  }

  const query = encodeURIComponent(name);
  const url = `https://${API_HOST}/exercises/name/${query}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': API_HOST,
      },
    });

    if (!res.ok) {
      console.warn('ExerciseDB fetch failed', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      if (first?.gifUrl) {
        return first.gifUrl as string;
      }
    }
  } catch (err) {
    console.warn('ExerciseDB fetch error', err);
  }
  return null;
};
