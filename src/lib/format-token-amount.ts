/**
 * Format a decimal amount string using up to `decimals` fractional digits,
 * trimming trailing zeros. Falls back to the trimmed input if not parseable.
 */
export function formatTokenAmount(value: string, decimals: number): string {
  const trimmed = value.trim();
  if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(trimmed)) return trimmed;

  const n = Number(trimmed);
  if (!Number.isFinite(n)) return trimmed;

  const d = Math.min(20, Math.max(0, Math.floor(decimals)));
  let out = n.toFixed(d);
  if (out.includes(".")) {
    out = out.replace(/\.?0+$/, "");
  }
  if (out === "-0") return "0";
  return out;
}
