import type {
  ApiResponse,
  PaginatedPage,
  PublicChainModel,
  PublicInvoiceModel,
  PublicPaymentModel,
  PublicTokenModel,
} from "@/types/invoice";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { signal });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch { /* use default message */ }
    throw new Error(message);
  }
  return res.json();
}

export async function fetchInvoice(
  id: string,
  signal?: AbortSignal,
): Promise<ApiResponse<PublicInvoiceModel>> {
  return request(`/public/invoice/${id}`, signal);
}

export async function fetchInvoicePayments(
  id: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<ApiResponse<PaginatedPage<PublicPaymentModel>>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return request(`/public/invoice/${id}/payments?${params}`, signal);
}

export async function fetchPublicChain(
  name: string,
  signal?: AbortSignal,
): Promise<PublicChainModel | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/public/chain/${encodeURIComponent(name)}`,
      { signal },
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<PublicChainModel>;
    if (json.status !== "success" || json.data == null) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchPublicToken(
  chainName: string,
  symbol: string,
  signal?: AbortSignal,
): Promise<PublicTokenModel | null> {
  try {
    const path = `/public/chain/${encodeURIComponent(chainName)}/token/${encodeURIComponent(symbol)}`;
    const res = await fetch(`${BASE_URL}${path}`, { signal });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<PublicTokenModel>;
    if (json.status !== "success" || json.data == null) return null;
    return json.data;
  } catch {
    return null;
  }
}
