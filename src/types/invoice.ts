export type InvoiceStatus = "Pending" | "Paid" | "Expired" | "Cancelled";
export type PaymentStatus = "Confirming" | "Confirmed" | "Cancelled";

export interface PublicInvoiceModel {
  id: string;
  address: string;
  amount: string;
  paid: string;
  token: string;
  network: string;
  created_at: string;
  expires_at: string;
  status: InvoiceStatus;
  required_confirmations: number;
}

export interface PublicPaymentModel {
  id: string;
  invoice_id: string;
  from: string;
  to: string;
  network: string;
  token: string;
  tx_hash: string;
  amount: string;
  status: PaymentStatus;
  created_at: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string | null;
}

export interface PaginatedPage<T> {
  items: T[];
  total: number;
  page_size: number;
  page: number;
}
