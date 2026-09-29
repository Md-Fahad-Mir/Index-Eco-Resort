/**
 * The live event filter sends dates as `d-m-Y` (flatpickr's format), and the
 * contract keeps that exactly — see docs/API-CONTRACT.md. Parsing lives here so
 * both adapters and the route handler agree on it.
 */
export function parseDmY(value: string | undefined | null): Date | null {
  if (!value) return null;
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a date back into the `d-m-Y` string the API expects. */
export function formatDmY(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}
