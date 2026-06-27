export type InvoiceStatus = "Pending" | "Paid" | "Expired" | "Cancelled";
export type PaymentStatus = "Pending" | "Confirming" | "Confirmed" | "Failed";
export type ChainType = "EVM";

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
}

export interface ChainData {
  id: number;
  name: string;
  active: boolean;
  rpc_urls: string[];
  chain_type: ChainType;
  xpub: string;
  native_symbol: string;
  decimals: number;
  last_processed_block: number;
  block_lag: number;
  safe_lag: number;
  required_confirmations: number;
  watch_addresses: string[];
  logo_url: string | null;
}

export interface TokenData {
  id: number;
  chain_id: number;
  symbol: string;
  contract: string;
  decimals: number;
  logo_url: string | null;
}

export interface PublicPaymentModel {
  id: string;
  from: string;
  to: string;
  network: string;
  token: string;
  tx_hash: string;
  amount: string;
  block_number: number;
  block_hash: string;
  status: PaymentStatus;
  created_at: string;
}

export interface PaginatedPage<T> {
  items: T[];
  total: number;
  page_size: number;
  page: number;
}

export interface ErrorObject {
  err_type: string;
  message: string;
  code?: string | null;
  param?: string | null;
}

export interface ErrorResponse {
  error: ErrorObject;
}

export interface PaymentDetectedEvent {
  invoice_id: string;
  payment_id: string;
  tx_hash: string;
  amount: string;
  from: string;
  to: string;
  block_number: number;
}

export interface PaymentConfirmedEvent {
  invoice_id: string;
  payment_id: string;
  confirmed_after: number;
}

export interface PaymentReorgedEvent {
  invoice_id: string;
  payment_id: string;
  new_block_number: number;
  new_block_hash: string;
}

export interface PaymentFailedEvent {
  invoice_id: string;
  payment_id: string;
}

export interface PaymentLostEvent {
  invoice_id: string;
  payment_id: string;
}

export interface PaymentCancelledEvent {
  invoice_id: string;
  payment_id: string;
}

export interface InvoicePaidEvent {
  invoice_id: string;
}

export interface InvoiceExpiredEvent {
  invoice_id: string;
}

export interface InvoiceCancelledEvent {
  invoice_id: string;
}

export type WsEvent =
  | { PaymentDetected: PaymentDetectedEvent }
  | { PaymentConfirmed: PaymentConfirmedEvent }
  | { PaymentReorged: PaymentReorgedEvent }
  | { PaymentFailed: PaymentFailedEvent }
  | { PaymentLost: PaymentLostEvent }
  | { PaymentCancelled: PaymentCancelledEvent }
  | { InvoicePaid: InvoicePaidEvent }
  | { InvoiceExpired: InvoiceExpiredEvent }
  | { InvoiceCancelled: InvoiceCancelledEvent };
