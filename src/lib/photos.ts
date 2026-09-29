import manifest from "@/data/photos.json";

export type Photo = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
};

const photos = manifest as Record<string, Photo>;

export function photo(id: string): Photo {
  const p = photos[id];
  if (!p) throw new Error(`Foto "${id}" tidak ada. Jalankan \`npm run images\` setelah menambah foto.`);
  return p;
}
