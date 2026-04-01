import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchInvoice } from "@/lib/api";
import type { PublicInvoiceModel } from "@/types/invoice";

const POLL_INTERVAL = 1000;
const TERMINAL_STATUSES = new Set(["Paid", "Expired", "Cancelled"]);

interface UseInvoiceReturn {
  invoice: PublicInvoiceModel | null;
  loading: boolean;
  error: string | null;
}

export function useInvoice(invoiceId: string): UseInvoiceReturn {
  const [invoice, setInvoice] = useState<PublicInvoiceModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLoadedOnce = useRef(false);

  const poll = useCallback(
    async (signal: AbortSignal) => {
      try {
        const res = await fetchInvoice(invoiceId, signal);
        if (res.status === "error") {
          const msg = res.message ?? "Failed to load invoice";
          if (!hasLoadedOnce.current) {
            setError(msg);
          } else {
            toast.error(msg);
          }
          return true;
        }
        if (res.data) {
          hasLoadedOnce.current = true;
          setInvoice(res.data);
          setError(null);
          return TERMINAL_STATUSES.has(res.data.status);
        }
        return false;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return true;
        if (hasLoadedOnce.current && err instanceof Error) {
          toast.error(err.message);
        }
        return false;
      }
    },
    [invoiceId],
  );

  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;

    (async () => {
      const terminal = await poll(controller.signal);
      setLoading(false);
      if (terminal || stopped) return;

      intervalRef.current = setInterval(async () => {
        const done = await poll(controller.signal);
        if (done && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, POLL_INTERVAL);
    })();

    return () => {
      stopped = true;
      controller.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [poll]);

  return { invoice, loading, error };
}
