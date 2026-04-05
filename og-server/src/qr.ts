import { QRCodeCanvas } from "@loskir/styled-qr-code-node";

const ACCENT_DEEP = "#2a526a";

export async function generateQrDataUrl(data: string): Promise<string> {
  const qr = new QRCodeCanvas({
    width: 260,
    height: 260,
    margin: 0,
    data,
    dotsOptions: { type: "extra-rounded", color: ACCENT_DEEP },
    cornersSquareOptions: { type: "extra-rounded", color: ACCENT_DEEP },
    cornersDotOptions: { type: "dot", color: ACCENT_DEEP },
    backgroundOptions: { color: "transparent" },
    qrOptions: { errorCorrectionLevel: "M" },
  });

  const buf = await qr.toBuffer("png");
  return `data:image/png;base64,${buf.toString("base64")}`;
}
