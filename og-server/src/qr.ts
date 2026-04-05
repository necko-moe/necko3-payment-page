import QRCode from "qrcode";

const QR_DARK = "#2a526a";
const QR_LIGHT = "#faf0e7";

export async function generateQrDataUrl(data: string): Promise<string> {
  const svg = await QRCode.toString(data, {
    type: "svg",
    margin: 2,
    width: 280,
    color: { dark: QR_DARK, light: QR_LIGHT },
    errorCorrectionLevel: "M",
  });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
