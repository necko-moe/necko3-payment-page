import { getApiKey, getApiUrl } from "@/lib/config";
import type {
  ChainData,
  ErrorResponse,
  PaginatedPage,
  PublicInvoiceModel,
  PublicPaymentModel,
  TokenData,
} from "@/types/invoice";

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const apiKey = getApiKey();
  const headers: HeadersInit = {};
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const res = await fetch(`${getApiUrl()}${path}`, { signal, headers });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ErrorResponse;
      if (body?.error?.message) message = body.error.message;
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchInvoice(
  id: string,
  signal?: AbortSignal,
): Promise<PublicInvoiceModel> {
  return request(`/v1/checkout/invoice/${encodeURIComponent(id)}`, signal);
}

export async function fetchInvoicePayments(
  id: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<PaginatedPage<PublicPaymentModel>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return request(
    `/v1/checkout/invoice/${encodeURIComponent(id)}/payments?${params}`,
    signal,
  );
}

export async function fetchChain(
  name: string,
  signal?: AbortSignal,
): Promise<ChainData | null> {
  try {
    return await request(
      `/v1/chains/${encodeURIComponent(name)}`,
      signal,
    );
  } catch {
    return null;
  }
}

export function getImageProxyUrl(imageUrl: string): string {
  const params = new URLSearchParams({ url: imageUrl });
  return `${getApiUrl()}/v1/proxy/image?${params}`;
}

export async function fetchToken(
  chainName: string,
  symbol: string,
  signal?: AbortSignal,
): Promise<TokenData | null> {
  try {
    return await request(
      `/v1/chains/${encodeURIComponent(chainName)}/tokens/${encodeURIComponent(symbol)}`,
      signal,
    );
  } catch {
    return null;
  }
}
