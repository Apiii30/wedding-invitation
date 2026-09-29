export function slugify(text: string): string {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "tamu"
  );
}

/** Buat slug unik terhadap slug yang sudah terpakai (menambah -2, -3, ...). */
export function uniqueSlug(name: string, taken: Set<string>): string {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  taken.add(slug);
  return slug;
}
