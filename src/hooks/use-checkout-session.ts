import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import i18n from "@/i18n";
import {
  fetchChain,
  fetchInvoice,
  fetchInvoicePayments,
  fetchToken,
} from "@/lib/api";
import { createInvoiceWs } from "@/lib/checkout-ws";
import type {
  ChainData,
  InvoiceStatus,
  PublicInvoiceModel,
  PublicPaymentModel,
  TokenData,
  WsEvent,
} from "@/types/invoice";

/**
 * Precision-safe addition for decimal strings returned by the API
 * (e.g. "1.5" + "0.25" = "1.75").
 * Avoids IEEE-754 rounding by working in scaled integers.
 */
function addDecimalStrings(a: string, b: string): string {
  const toScaled = (s: string): { n: bigint; scale: number } => {
    const [int = "0", frac = ""] = s.split(".");
    const scale = frac.length;
    return { n: BigInt(int) * 10n ** BigInt(scale) + BigInt(frac || "0"), scale };
  };
  const sa = toScaled(a);
  const sb = toScaled(b);
  const scale = Math.max(sa.scale, sb.scale);
  const na = sa.n * 10n ** BigInt(scale - sa.scale);
  const nb = sb.n * 10n ** BigInt(scale - sb.scale);
  const sum = na + nb;
  if (scale === 0) return sum.toString();
  const divisor = 10n ** BigInt(scale);
  const intPart = (sum / divisor).toString();
  const fracPart = (sum % divisor).toString().padStart(scale, "0").replace(/0+$/, "");
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}

const PAGE_SIZE = 5;
const TERMINAL_STATUSES = new Set<InvoiceStatus>([
  "Paid",
  "Expired",
  "Cancelled",
]);

export interface UseCheckoutSessionReturn {
  invoice: PublicInvoiceModel | null;
  chain: ChainData | null;
  token: TokenData | null;
  metaLoading: boolean;
  loading: boolean;
  error: string | null;
  payments: PublicPaymentModel[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  /** Raw bigint string — sum of all Confirming payments on the current page */
  confirmingAmount: string;
}

type MetaState = { chain: ChainData | null; token: TokenData | null; loading: boolean };
const initialMeta: MetaState = { chain: null, token: null, loading: false };

type MetaAction =
  | { type: "reset" }
  | { type: "start" }
  | { type: "done"; chain: ChainData | null; token: TokenData | null };

function metaReducer(state: MetaState, action: MetaAction): MetaState {
  switch (action.type) {
    case "reset": return initialMeta;
    case "start": return { chain: null, token: null, loading: true };
    case "done":  return { chain: action.chain, token: action.token, loading: false };
    default:      return state;
  }
}

export function useCheckoutSession(invoiceId: string): UseCheckoutSessionReturn {
  const [invoice, setInvoice] = useState<PublicInvoiceModel | null>(null);
  const [meta, dispatchMeta] = useReducer(metaReducer, initialMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PublicPaymentModel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const hasLoadedOnce = useRef(false);
  const pageRef = useRef(page);
  const loadAllRef = useRef<(signal: AbortSignal, opts?: { silent?: boolean }) => Promise<void>>(
    () => Promise.resolve(),
  );
  const invoiceRef = useRef<PublicInvoiceModel | null>(null);

  /**
   * Global cache of ALL known payments by id.
   * Needed so PaymentConfirmed can always find the payment.amount
   * regardless of which page is currently displayed.
   */
  const allPaymentsCacheRef = useRef<Map<string, PublicPaymentModel>>(new Map());

  useEffect(() => { invoiceRef.current = invoice; }, [invoice]);
  useEffect(() => { pageRef.current = page; }, [page]);

  /**
   * confirmingAmount is derived directly from the payments state so it is
   * always in sync — no separate cache-based state update needed.
   */
  const confirmingAmount = useMemo(() => {
    let sum = "0";
    for (const p of payments) {
      if (p.status === "Confirming") {
        try { sum = addDecimalStrings(sum, p.amount); } catch { /* skip */ }
      }
    }
    return sum;
  }, [payments]);

  // ─── data loading ──────────────────────────────────────────────────────────

  const loadAll = useCallback(
    async (signal: AbortSignal, opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      try {
        const inv = await fetchInvoice(invoiceId, signal);
        setInvoice(inv);
        setError(null);
        hasLoadedOnce.current = true;

        dispatchMeta({ type: "start" });
        const [chainR, tokenR, paymentsR] = await Promise.allSettled([
          fetchChain(inv.network, signal),
          fetchToken(inv.network, inv.token, signal),
          fetchInvoicePayments(invoiceId, pageRef.current, PAGE_SIZE, signal),
        ]);
        if (signal.aborted) return;

        dispatchMeta({
          type: "done",
          chain: chainR.status === "fulfilled" ? chainR.value : null,
          token: tokenR.status === "fulfilled" ? tokenR.value : null,
        });

        if (paymentsR.status === "fulfilled") {
          // Merge into global cache first
          for (const p of paymentsR.value.items) {
            allPaymentsCacheRef.current.set(p.id, p);
          }
          setPayments(paymentsR.value.items);
          setTotal(paymentsR.value.total);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : i18n.t("couldNotLoad");
        if (!hasLoadedOnce.current) setError(msg);
        else if (!silent) toast.error(msg);
      }
    },
    [invoiceId],
  );

  useEffect(() => { loadAllRef.current = loadAll; }, [loadAll]);

  // ─── websocket event handler ────────────────────────────────────────────────

  const handleWsEvent = useCallback((ev: WsEvent) => {
    // ── PaymentDetected ───────────────────────────────────────────────────────
    if ("PaymentDetected" in ev) {
      const e = ev.PaymentDetected;

      // Check the cache (and current payments) for tx_hash or id collision
      const cachedById = allPaymentsCacheRef.current.get(e.payment_id);
      const cachedByHash = cachedById
        ? null
        : Array.from(allPaymentsCacheRef.current.values()).find(
            (p) => p.tx_hash === e.tx_hash,
          );
      const isReplacement = Boolean(cachedById || cachedByHash);

      // Build the updated/new payment object
      const base = cachedById ?? cachedByHash;
      const payment: PublicPaymentModel = base
        ? {
            ...base,
            id: e.payment_id,
            from: e.from,
            to: e.to,
            tx_hash: e.tx_hash,
            amount: e.amount,
            block_number: e.block_number,
            status: "Confirming",
          }
        : {
            id: e.payment_id,
            from: e.from,
            to: e.to,
            network: invoiceRef.current?.network ?? "",
            token: invoiceRef.current?.token ?? "",
            tx_hash: e.tx_hash,
            amount: e.amount,
            block_number: e.block_number,
            block_hash: "",
            status: "Confirming",
            created_at: new Date().toISOString(),
          };

      // Update global cache (pure side-effect on ref, safe here)
      if (base && base.id !== e.payment_id) {
        // Remove the old entry if the id changed (was matched by tx_hash)
        allPaymentsCacheRef.current.delete(base.id);
      }
      allPaymentsCacheRef.current.set(payment.id, payment);

      // Update displayed list — updater is pure (no setState calls inside)
      setPayments((prev) => {
        const idx = prev.findIndex(
          (p) => p.id === e.payment_id || p.tx_hash === e.tx_hash,
        );
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = payment;
          return next;
        }
        return [payment, ...prev].slice(0, PAGE_SIZE);
      });

      if (!isReplacement) {
        setTotal((t) => t + 1);
      }

    // ── PaymentConfirmed ──────────────────────────────────────────────────────
    } else if ("PaymentConfirmed" in ev) {
      const e = ev.PaymentConfirmed;

      // Look up amount from global cache — works regardless of current page
      const cached = allPaymentsCacheRef.current.get(e.payment_id);
      if (cached) {
        const updated = { ...cached, status: "Confirmed" as const };
        allPaymentsCacheRef.current.set(e.payment_id, updated);

        // Add confirmed amount to invoice.paid
        setInvoice((prev) => {
          if (!prev) return prev;
          try {
            return {
              ...prev,
              paid: addDecimalStrings(prev.paid, cached.amount),
            };
          } catch {
            return prev;
          }
        });
      }

      setPayments((prev) =>
        prev.map((p) =>
          p.id === e.payment_id ? { ...p, status: "Confirmed" } : p,
        ),
      );

    // ── PaymentReorged ────────────────────────────────────────────────────────
    } else if ("PaymentReorged" in ev) {
      const e = ev.PaymentReorged;
      const cached = allPaymentsCacheRef.current.get(e.payment_id);
      if (cached) {
        allPaymentsCacheRef.current.set(e.payment_id, {
          ...cached,
          block_number: e.new_block_number,
          block_hash: e.new_block_hash,
        });
      }
      setPayments((prev) =>
        prev.map((p) =>
          p.id === e.payment_id
            ? { ...p, block_number: e.new_block_number, block_hash: e.new_block_hash }
            : p,
        ),
      );

    // ── PaymentFailed ─────────────────────────────────────────────────────────
    } else if ("PaymentFailed" in ev) {
      const e = ev.PaymentFailed;
      const cached = allPaymentsCacheRef.current.get(e.payment_id);
      if (cached) allPaymentsCacheRef.current.set(e.payment_id, { ...cached, status: "Failed" });
      setPayments((prev) =>
        prev.map((p) => (p.id === e.payment_id ? { ...p, status: "Failed" } : p)),
      );

    // ── PaymentLost ───────────────────────────────────────────────────────────
    } else if ("PaymentLost" in ev) {
      const e = ev.PaymentLost;
      allPaymentsCacheRef.current.delete(e.payment_id);
      setPayments((prev) => prev.filter((p) => p.id !== e.payment_id));
      setTotal((t) => Math.max(0, t - 1));

    // ── PaymentCancelled ──────────────────────────────────────────────────────
    } else if ("PaymentCancelled" in ev) {
      const e = ev.PaymentCancelled;
      const cached = allPaymentsCacheRef.current.get(e.payment_id);
      if (cached) allPaymentsCacheRef.current.set(e.payment_id, { ...cached, status: "Failed" });
      setPayments((prev) =>
        prev.map((p) => (p.id === e.payment_id ? { ...p, status: "Failed" } : p)),
      );

    // ── Invoice events ────────────────────────────────────────────────────────
    } else if ("InvoicePaid" in ev) {
      setInvoice((prev) => (prev ? { ...prev, status: "Paid", paid: prev.amount } : prev));
    } else if ("InvoiceExpired" in ev) {
      setInvoice((prev) => (prev ? { ...prev, status: "Expired" } : prev));
    } else if ("InvoiceCancelled" in ev) {
      setInvoice((prev) => (prev ? { ...prev, status: "Cancelled" } : prev));
    }
  }, []);

  // ─── effects ───────────────────────────────────────────────────────────────

  // Initial load
  useEffect(() => {
    if (!invoiceId) { setLoading(false); return; }

    const controller = new AbortController();
    setLoading(true);
    setPage(1);
    pageRef.current = 1;
    hasLoadedOnce.current = false;
    allPaymentsCacheRef.current = new Map();
    dispatchMeta({ type: "reset" });

    void (async () => {
      await loadAll(controller.signal);
      if (!controller.signal.aborted) setLoading(false);
    })();

    return () => controller.abort();
  }, [invoiceId, loadAll]);

  // Page change
  useEffect(() => {
    if (!invoiceId || !hasLoadedOnce.current) return;

    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetchInvoicePayments(invoiceId, page, PAGE_SIZE, controller.signal);
        if (controller.signal.aborted) return;
        for (const p of res.items) allPaymentsCacheRef.current.set(p.id, p);
        setPayments(res.items);
        setTotal(res.total);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof Error) toast.error(err.message);
      }
    })();

    return () => controller.abort();
  }, [invoiceId, page]);

  // WebSocket
  useEffect(() => {
    if (!invoiceId || !invoice) return undefined;
    if (TERMINAL_STATUSES.has(invoice.status)) return undefined;

    const ws = createInvoiceWs(invoiceId, {
      onEvent: handleWsEvent,
      onReconnect: () => {
        const ac = new AbortController();
        void loadAllRef.current(ac.signal, { silent: false });
      },
    });

    return () => ws.close();
  }, [invoiceId, invoice?.status, handleWsEvent]);

  return {
    invoice,
    chain: meta.chain,
    token: meta.token,
    metaLoading: meta.loading,
    loading,
    error,
    payments,
    total,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    confirmingAmount,
  };
}
