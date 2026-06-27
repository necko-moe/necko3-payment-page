export interface PublicInvoiceModel {
  id: string;
  address: string;
  amount: string;
  paid: string;
  token: string;
  network: string;
  created_at: string;
  expires_at: string;
  status: "Pending" | "Paid" | "Expired" | "Cancelled";
}

const BACKEND_URL = process.env.OG_API_URL ?? process.env.BACKEND_URL ?? "http://127.0.0.1";

export async function fetchInvoice(
  id: string,
): Promise<PublicInvoiceModel | null> {
  const url = `${BACKEND_URL.replace(/\/$/, "")}/v1/checkout/invoice/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("[og-server] invoice HTTP", res.status, url);
      return null;
    }
    return (await res.json()) as PublicInvoiceModel;
  } catch (e) {
    console.warn("[og-server] invoice fetch error", url, e);
    return null;
  }
}
