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

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string | null;
}

const BACKEND_URL = process.env.OG_API_URL ?? "http://127.0.0.1/api";

export async function fetchInvoice(
  id: string,
): Promise<PublicInvoiceModel | null> {
  const url = `${BACKEND_URL}/public/invoice/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("[og-server] invoice HTTP", res.status, url);
      return null;
    }
    const json = (await res.json()) as ApiResponse<PublicInvoiceModel>;
    if (json.status !== "success" || !json.data) {
      console.warn("[og-server] invoice API", json.status, json.message ?? "", url);
      return null;
    }
    return json.data;
  } catch (e) {
    console.warn("[og-server] invoice fetch error", url, e);
    return null;
  }
}
