import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchInvoicePayments } from "@/lib/api";
import type { InvoiceStatus, PublicPaymentModel } from "@/types/invoice";

const POLL_INTERVAL = 1000;
const PAGE_SIZE = 4;
const TERMINAL_STATUSES = new Set(["Paid", "Expired", "Cancelled"]);

interface UsePaymentsReturn {
  payments: PublicPaymentModel[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
}

export function usePayments(
  invoiceId: string,
  invoiceStatus: InvoiceStatus | null,
): UsePaymentsReturn {
  const [payments, setPayments] = useState<PublicPaymentModel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pageRef = useRef(page);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const poll = useCallback(
    async (signal: AbortSignal) => {
      try {
        const res = await fetchInvoicePayments(
          invoiceId,
          pageRef.current,
          PAGE_SIZE,
          signal,
        );
        if (res.status === "success" && res.data) {
          setPayments(res.data.items);
          setTotal(res.data.total);
        } else if (res.status === "error" && res.message) {
          toast.error(res.message);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof Error) toast.error(err.message);
      }
    },
    [invoiceId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const isTerminal = invoiceStatus !== null && TERMINAL_STATUSES.has(invoiceStatus);

    poll(controller.signal);

    if (!isTerminal) {
      intervalRef.current = setInterval(() => {
        poll(controller.signal);
      }, POLL_INTERVAL);
    }

    return () => {
      controller.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [poll, invoiceStatus, page]);

  return { payments, total, page, pageSize: PAGE_SIZE, setPage };
}
