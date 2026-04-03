/**
 * Format a decimal amount string using up to `decimals` fractional digits,
 * trimming trailing zeros. Falls back to the trimmed input if not parseable.
 *
 * Uses decimal string / BigInt rounding so we never hit IEEE-754 display
 * artifacts (e.g. 0.0354 turning into 0.03540000000000001).
 */

const DECIMAL_RE = /^-?(\d+(\.\d*)?|\.\d+)$/;

function normalizeIntPart(raw: string): string {
  if (raw === "" || /^0+$/.test(raw)) return "0";
  return raw.replace(/^0+(?=\d)/, "") || "0";
}

function splitUnsignedDecimal(unsigned: string): { int: string; frac: string } {
  if (unsigned.startsWith(".")) {
    return { int: "0", frac: unsigned.slice(1) };
  }
  const dot = unsigned.indexOf(".");
  if (dot === -1) {
    return { int: unsigned, frac: "" };
  }
  return { int: unsigned.slice(0, dot), frac: unsigned.slice(dot + 1) };
}

/** `int` + `frac` / 10^L as a single scaled integer N = int * 10^L + fracValue */
function scaledFromParts(intPart: string, fracPart: string): {
  N: bigint;
  L: number;
} {
  const L = fracPart.length;
  const fracVal = BigInt(fracPart.replace(/^0+/, "") || "0");
  const intVal = BigInt(normalizeIntPart(intPart));
  const N = intVal * 10n ** BigInt(L) + fracVal;
  return { N, L };
}

function roundToMaxFracDigits(
  intPart: string,
  fracPart: string,
  maxFracDigits: number,
): { int: string; frac: string } {
  const intNorm = normalizeIntPart(intPart);

  if (maxFracDigits === 0) {
    if (fracPart === "") {
      return { int: intNorm, frac: "" };
    }
    const { N, L } = scaledFromParts(intPart, fracPart);
    const tenL = 10n ** BigInt(L);
    const half = tenL / 2n;
    const rounded = (N + half) / tenL;
    return { int: rounded.toString(), frac: "" };
  }

  if (fracPart === "") {
    return { int: intNorm, frac: "" };
  }

  const L = fracPart.length;
  if (L <= maxFracDigits) {
    return { int: intNorm, frac: fracPart };
  }

  const { N } = scaledFromParts(intPart, fracPart);
  const drop = L - maxFracDigits;
  const ten = 10n ** BigInt(drop);
  const half = ten / 2n;
  const roundedScaled = (N + half) / ten;
  const scale = 10n ** BigInt(maxFracDigits);
  const newInt = roundedScaled / scale;
  const newFrac = roundedScaled % scale;
  const fracOut = newFrac.toString().padStart(maxFracDigits, "0");
  return { int: newInt.toString(), frac: fracOut };
}

export function formatTokenAmount(value: string, decimals: number): string {
  const trimmed = value.trim();
  if (!DECIMAL_RE.test(trimmed)) return trimmed;

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const { int: intRaw, frac: fracRaw } = splitUnsignedDecimal(unsigned);

  const d = Math.min(20, Math.max(0, Math.floor(decimals)));
  const { int: ri, frac: rf } = roundToMaxFracDigits(intRaw, fracRaw, d);

  const fracTrimmed = rf.replace(/0+$/, "");
  let out = normalizeIntPart(ri);
  if (fracTrimmed) out += "." + fracTrimmed;

  if (out === "0" || /^0\.0*$/.test(out)) return "0";
  return negative ? "-" + out : out;
}
