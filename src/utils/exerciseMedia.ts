// Map exercise slug -> require('path/to/image.png') once images exist.
// Example:
// export const exerciseImages: Record<string, any> = {
//   'press-de-banca': require('@/assets/exercises/press-de-banca.png'),
// };
export const exerciseImages: Record<string, any> = {
  // Usa ruta relativa para que Metro resuelva el asset estático
  'press-militar': require('../../assets/exercises/press-militar.jpg'),
};

export const slugifyExercise = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const getExerciseImageSource = (name: string) => {
  const slug = slugifyExercise(name);
  return exerciseImages[slug] ?? null;
};

export const buildYoutubeSearchUrl = (name: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`;
