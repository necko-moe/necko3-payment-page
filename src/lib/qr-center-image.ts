import { colors } from "@/lib/colors";

const CANVAS = 256;
/** Token logo in center (~204px in 256 canvas). */
const TOKEN_DRAW_SIZE = 212;
/** Chain badge in bottom-right when token is shown (drawn into same bitmap as QR center). */
const BADGE = 68;
/** Smallest circle covering the BADGE square (+1px so edges don’t fringe on token). */
function badgeCutoutRadius(): number {
  return (BADGE * Math.SQRT2) / 2 + 1;
}

/** Clear a circular hole in whatever is already drawn (token), then the badge reads on QR/background. */
function punchCircularHoleForBadge(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
) {
  const cx = bx + BADGE / 2;
  const cy = by + BADGE / 2;
  const r = badgeCutoutRadius();
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export type QrCenterBuildInput =
  | {
      mode: "token";
      tokenLogoUrl: string;
      chainLogoUrl: string | null;
      networkName: string;
    }
  | {
      mode: "chain_only";
      chainLogoUrl: string;
    };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}

function networkInitial(networkName: string): string {
  const t = networkName.trim();
  return t.length > 0 ? t[0]!.toUpperCase() : "?";
}

function drawLetterBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  letter: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = colors.accent.light;
  ctx.fill();
  ctx.strokeStyle = colors.accent.deep;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = colors.accent.deep;
  ctx.font = `bold ${Math.floor(size * 0.42)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, cx, cy);
  ctx.restore();
}

async function drawChainBadge(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  chainLogoUrl: string | null,
  networkName: string,
) {
  const cx = bx + BADGE / 2;
  const cy = by + BADGE / 2;
  if (chainLogoUrl) {
    try {
      const img = await loadImage(chainLogoUrl);
      ctx.drawImage(img, bx, by, BADGE, BADGE);
      return;
    } catch {
      /* letter fallback */
    }
  }
  drawLetterBadge(ctx, cx, cy, BADGE, networkInitial(networkName));
}

/**
 * Single PNG for QR center: token + optional chain badge, or chain logo only (no letter overlay).
 */
export async function buildQrCenterImageDataUrl(
  input: QrCenterBuildInput,
): Promise<string | null> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS;
    canvas.height = CANVAS;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (input.mode === "token") {
      const mainImg = await loadImage(input.tokenLogoUrl);
      const mainSize = TOKEN_DRAW_SIZE;
      const mx = (CANVAS - mainSize) / 2;
      const my = (CANVAS - mainSize) / 2;
      ctx.drawImage(mainImg, mx, my, mainSize, mainSize);

      const bx = CANVAS - BADGE - 18;
      const by = CANVAS - BADGE - 18;
      punchCircularHoleForBadge(ctx, bx, by);
      await drawChainBadge(
        ctx,
        bx,
        by,
        input.chainLogoUrl,
        input.networkName,
      );
    } else {
      const mainImg = await loadImage(input.chainLogoUrl);
      const mainSize = 192;
      const mx = (CANVAS - mainSize) / 2;
      const my = (CANVAS - mainSize) / 2;
      ctx.drawImage(mainImg, mx, my, mainSize, mainSize);
    }

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
