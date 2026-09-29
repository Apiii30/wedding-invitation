const TZ = "Asia/Jakarta";

export function formatLongDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

export function dateParts(iso: string) {
  const d = new Date(iso);
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...o }).format(d);
  return { weekday: fmt({ weekday: "long" }), day: fmt({ day: "2-digit" }), monthYear: fmt({ month: "long", year: "numeric" }) };
}

export function formatShortDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

const toCalendarStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl({ title, start, hours = 4, details, location }: {
  title: string; start: string; hours?: number; details?: string; location?: string;
}) {
  const s = new Date(start);
  const e = new Date(s.getTime() + hours * 3600_000);
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${toCalendarStamp(s)}/${toCalendarStamp(e)}` });
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params}`;
}
