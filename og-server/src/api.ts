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

const BACKEND_URL = process.env.BACKEND_URL ?? "";

export async function fetchInvoice(
  id: string,
): Promise<PublicInvoiceModel | null> {
  const url = `${BACKEND_URL}/public/invoice/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<PublicInvoiceModel>;
    if (json.status !== "success" || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}
