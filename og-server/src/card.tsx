import type { PublicInvoiceModel } from "./api.js";
import React from "react";

const OUTER_BG = "#f5f5f5";
const CARD_BG = "#faf0e7";
const CARD_BORDER = "rgba(198,190,183,0.5)";
const QR_BG = "#f5f5f5";
const TEXT = "#40372e";
const MUTED = "#9b9089";
const PRIMARY = "#2a526a";
const PRIMARY_FG = "#ffffff";
const DIVIDER = "#c6beb7";

const SANS = "Inter, sans-serif";
const MONO =
  "ui-monospace, 'SF Mono', 'Cascadia Mono', 'Fira Code', Consolas, monospace";

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

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const side = Math.floor((max - 1) / 2);
  return `${value.slice(0, side)}\u2026${value.slice(-side)}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: MUTED,
          width: 80,
          flexShrink: 0,
          fontFamily: SANS,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 15,
          fontFamily: MONO,
          color: TEXT,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

interface CardProps {
  invoice: PublicInvoiceModel;
  qrDataUrl: string;
  publicUrl: string;
}

export function Card({ invoice, qrDataUrl, publicUrl }: CardProps) {
  const paymentLink = `${publicUrl}/${invoice.id}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 1200,
        height: 630,
        backgroundColor: OUTER_BG,
        fontFamily: SANS,
        color: TEXT,
      }}
    >
      {/* Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1120,
          height: 560,
          backgroundColor: CARD_BG,
          borderRadius: 24,
          border: `1px solid ${CARD_BORDER}`,
          padding: "36px 44px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 7,
              backgroundColor: PRIMARY,
              color: PRIMARY_FG,
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: SANS,
            }}
          >
            N3
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: TEXT,
            }}
          >
            necko3
          </span>
        </div>

        {/* Content row: QR left (centered) + details right */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 44,
          }}
        >
          {/* QR wrapper */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 320,
              height: 320,
              backgroundColor: QR_BG,
              borderRadius: 24,
              padding: 30,
            }}
          >
            <img src={qrDataUrl} width={260} height={260} />
          </div>

          {/* Invoice details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 14, color: MUTED, marginBottom: 8 }}>
              Scan to Pay
            </span>

            {/* Amount + Token */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: TEXT,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 420,
                }}
              >
                {invoice.amount}
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: TEXT,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 220,
                }}
              >
                {invoice.token}
              </span>
            </div>

            <span style={{ fontSize: 16, color: MUTED, marginTop: 4 }}>
              {invoice.network}
            </span>

            {/* Divider */}
            <div
              style={{
                width: "100%",
                height: 1,
                backgroundColor: DIVIDER,
                margin: "20px 0",
                opacity: 0.6,
              }}
            />

            {/* Info rows */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <InfoRow label="Invoice" value={truncate(invoice.id, 36)} />
              <InfoRow label="Created" value={fmtDate(invoice.created_at)} />
              <InfoRow label="Expires" value={fmtDate(invoice.expires_at)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontFamily: MONO,
              color: MUTED,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {paymentLink}
          </span>
        </div>
      </div>
    </div>
  );
}
