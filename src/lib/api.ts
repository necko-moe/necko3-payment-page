import type {
  ApiResponse,
  PaginatedPage,
  PublicInvoiceModel,
  PublicPaymentModel,
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
