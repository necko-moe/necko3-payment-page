import { getApiKey, getApiUrl } from "@/lib/config";
import type { WsEvent } from "@/types/invoice";

const INITIAL_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30_000;

export interface InvoiceWsCallbacks {
  onEvent: (event: WsEvent) => void;
  onReconnect: () => void;
}

export interface InvoiceWsHandle {
  close: () => void;
}

function buildWsUrl(invoiceId: string): string {
  const base = getApiUrl();
  const apiKey = getApiKey();
  const path = `/v1/checkout/invoice/${encodeURIComponent(invoiceId)}/ws`;
  const query = apiKey
    ? `?api_key=${encodeURIComponent(apiKey)}`
    : "";

  if (base.startsWith("http://") || base.startsWith("https://")) {
    const url = new URL(base);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const basePath = url.pathname.replace(/\/$/, "");
    url.pathname = `${basePath}${path}`;
    url.search = query ? query.slice(1) : "";
    return url.toString();
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const basePath = base.replace(/\/$/, "");
  return `${wsProtocol}//${window.location.host}${basePath}${path}${query}`;
}

export function createInvoiceWs(
  invoiceId: string,
  callbacks: InvoiceWsCallbacks,
): InvoiceWsHandle {
  let ws: WebSocket | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectDelay = INITIAL_RECONNECT_MS;
  let hasConnectedOnce = false;

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (closed) return;
    clearReconnectTimer();
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_MS);
  };

  const connect = () => {
    if (closed) return;

    ws = new WebSocket(buildWsUrl(invoiceId));

    ws.onopen = () => {
      reconnectDelay = INITIAL_RECONNECT_MS;
      if (hasConnectedOnce) {
        callbacks.onReconnect();
      }
      hasConnectedOnce = true;
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as WsEvent;
        callbacks.onEvent(data);
      } catch {
        /* ignore malformed messages */
      }
    };

    ws.onclose = () => {
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      ws?.close();
    };
  };

  connect();

  return {
    close: () => {
      closed = true;
      clearReconnectTimer();
      ws?.close();
      ws = null;
    },
  };
}
