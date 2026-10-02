export class WrappedError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function parseInput(username: string | null | undefined, yearValue: string | number | null | undefined, now = new Date()) {
  const login = (username ?? "").trim();
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(login) || login.includes("--")) {
    throw new WrappedError("Enter a valid GitHub username (not a profile URL).");
  }
  const text = String(yearValue ?? now.getUTCFullYear());
  const year = /^\d{4}$/.test(text) ? Number(text) : NaN;
  if (!Number.isInteger(year) || year < 2008 || year > now.getUTCFullYear()) {
    throw new WrappedError(`Choose a year between 2008 and ${now.getUTCFullYear()}.`);
  }
  const from = `${year}-01-01T00:00:00Z`;
  const to = year === now.getUTCFullYear() ? now.toISOString() : `${year}-12-31T23:59:59Z`;
  return { username: login, year, from, to };
}
