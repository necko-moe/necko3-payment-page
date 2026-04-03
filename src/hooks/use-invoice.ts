import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { fetchInvoice, fetchPublicChain, fetchPublicToken } from "@/lib/api";
import type {
  PublicChainModel,
  PublicInvoiceModel,
  PublicTokenModel,
} from "@/types/invoice";

const POLL_INTERVAL = 1000;
const TERMINAL_STATUSES = new Set(["Paid", "Expired", "Cancelled"]);

interface UseInvoiceReturn {
  invoice: PublicInvoiceModel | null;
  chain: PublicChainModel | null;
  token: PublicTokenModel | null;
  metaLoading: boolean;
  loading: boolean;
  error: string | null;
}

type InvoiceMetaState = {
  chain: PublicChainModel | null;
  token: PublicTokenModel | null;
  loading: boolean;
};

const initialMeta: InvoiceMetaState = {
  chain: null,
  token: null,
  loading: false,
};

type MetaAction =
  | { type: "reset" }
  | { type: "start" }
  | {
      type: "done";
      chain: PublicChainModel | null;
      token: PublicTokenModel | null;
    };

function metaReducer(state: InvoiceMetaState, action: MetaAction): InvoiceMetaState {
  switch (action.type) {
    case "reset":
      return initialMeta;
    case "start":
      return { chain: null, token: null, loading: true };
    case "done":
      return {
        chain: action.chain,
        token: action.token,
        loading: false,
      };
    default:
      return state;
  }
}

export function useInvoice(invoiceId: string): UseInvoiceReturn {
  const [invoice, setInvoice] = useState<PublicInvoiceModel | null>(null);
  const [meta, dispatchMeta] = useReducer(metaReducer, initialMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLoadedOnce = useRef(false);

  const poll = useCallback(
    async (signal: AbortSignal) => {
      try {
        const res = await fetchInvoice(invoiceId, signal);
        if (res.status === "error") {
          const msg = res.message ?? "Could not load invoice";
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

  const invoiceIdKey = invoice?.id;
  const networkKey = invoice?.network;
  const tokenKey = invoice?.token;

  useEffect(() => {
    if (!invoiceIdKey || !networkKey || !tokenKey) {
      dispatchMeta({ type: "reset" });
      return;
    }

    const ac = new AbortController();
    let active = true;
    dispatchMeta({ type: "start" });

    (async () => {
      const settled = await Promise.allSettled([
        fetchPublicChain(networkKey, ac.signal),
        fetchPublicToken(networkKey, tokenKey, ac.signal),
      ]);
      if (!active || ac.signal.aborted) return;
      const c =
        settled[0].status === "fulfilled" ? settled[0].value : null;
      const t =
        settled[1].status === "fulfilled" ? settled[1].value : null;
      dispatchMeta({ type: "done", chain: c, token: t });
    })();

    return () => {
      active = false;
      ac.abort();
    };
  }, [invoiceIdKey, networkKey, tokenKey]);

  return {
    invoice,
    chain: meta.chain,
    token: meta.token,
    metaLoading: meta.loading,
    loading,
    error,
  };
}
