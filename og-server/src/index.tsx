import { Hono } from "hono";
import { serve } from "@hono/node-server";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import React from "react";

import { fetchInvoice } from "./api.js";
import { generateQrDataUrl } from "./qr.js";
import { buildMetaHtml, buildNotFoundHtml } from "./html.js";
import { Card } from "./card.js";
import { FONTS } from "./font.js";
import { TtlCache } from "./cache.js";

const PORT = Number(process.env.OG_PORT ?? 3000);
const PUBLIC_URL = process.env.PUBLIC_URL ?? "";

const imageCache = new TtlCache<Buffer>(5 * 60 * 1000);

async function renderImage(invoiceId: string): Promise<Buffer | null> {
  const cached = imageCache.get(invoiceId);
  if (cached) return cached;

  const invoice = await fetchInvoice(invoiceId);
  if (!invoice) return null;

  const qrDataUrl = await generateQrDataUrl(`${PUBLIC_URL}/${invoice.id}`);

  const svg = await satori(
    <Card invoice={invoice} qrDataUrl={qrDataUrl} publicUrl={PUBLIC_URL} />,
    { width: 1200, height: 630, fonts: FONTS },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const png = resvg.render().asPng();

  imageCache.set(invoiceId, png);
  return png;
}

const app = new Hono();

function normalizeOgInvoiceId(raw: string): string {
  const id = raw.trim();
  if (id.toLowerCase().endsWith(".png")) return id.slice(0, -4);
  return id;
}

// OG image: /og/{invoiceId}.png or /og/{invoiceId} (both work)
app.get("/og/:id", async (c) => {
  const id = normalizeOgInvoiceId(c.req.param("id") ?? "");
  try {
    const png = await renderImage(id);
    if (!png) return c.text("Invoice not found", 404);
    return c.body(png, 200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
    });
  } catch (err) {
    console.error("OG image render error:", err);
    return c.text("Internal server error", 500);
  }
});

// Bot meta-HTML endpoint (nginx proxies bot UAs here)
app.get("/:id", async (c) => {
  const id = c.req.param("id") ?? "";
  try {
    const invoice = await fetchInvoice(id);
    if (!invoice) {
      return c.html(buildNotFoundHtml(), 404);
    }
    return c.html(buildMetaHtml(invoice));
  } catch (err) {
    console.error("OG meta error:", err);
    return c.text("Internal server error", 500);
  }
});

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`OG server listening on :${info.port}`);
});
