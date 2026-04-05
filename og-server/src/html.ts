import type { PublicInvoiceModel } from "./api.js";

const PUBLIC_URL = process.env.PUBLIC_URL ?? "";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function buildMetaHtml(invoice: PublicInvoiceModel): string {
  const pageUrl = `${PUBLIC_URL}/${invoice.id}`;
  const imageUrl = `${PUBLIC_URL}/og/${invoice.id}.png`;
  const title = `Invoice Payment — ${invoice.amount} ${invoice.token}`;
  const description = `Pay ${invoice.amount} ${invoice.token} on ${invoice.network} · Expires: ${fmtDate(invoice.expires_at)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:image" content="${esc(imageUrl)}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:url" content="${esc(pageUrl)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${esc(imageUrl)}"/>
</head>
<body></body>
</html>`;
}

export function buildNotFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Invoice Not Found</title>
<meta property="og:title" content="Invoice Not Found"/>
<meta property="og:description" content="The requested invoice does not exist or has been removed."/>
</head>
<body></body>
</html>`;
}
