import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useInvoice } from "@/hooks/use-invoice";
import { formatTokenAmount } from "@/lib/format-token-amount";
import { usePayments } from "@/hooks/use-payments";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { QrCode } from "./qr-code";
import { AddressDisplay } from "./address-display";
import { PaymentProgress } from "./payment-progress";
import { CountdownTimer } from "./countdown-timer";
import { InvoiceInfo } from "./invoice-info";
import { PaymentsList } from "./payments-list";
import {
  InvoiceSuccess,
  InvoiceExpired,
  InvoiceCancelled,
  InvoiceError,
} from "./invoice-status-screens";

const THEME_COMFORT_HINT_KEY = "necko3_theme_comfort_hint_dismissed";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [comfortHintOpen, setComfortHintOpen] = useState(() => {
    try {
      return sessionStorage.getItem(THEME_COMFORT_HINT_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const dismissComfortHint = useCallback(() => {
    try {
      sessionStorage.setItem(THEME_COMFORT_HINT_KEY, "1");
    } catch {
      /* private mode */
    }
    setComfortHintOpen(false);
  }, []);

  useEffect(() => {
    if (!comfortHintOpen || theme !== "light") return;
    const id = window.setTimeout(dismissComfortHint, 10_000);
    return () => clearTimeout(id);
  }, [comfortHintOpen, theme, dismissComfortHint]);

  const hintVisible = comfortHintOpen && theme === "light";

  const handleToggle = () => {
    if (hintVisible) dismissComfortHint();
    toggle();
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      {hintVisible ? (
        <div
          className="animate-in fade-in slide-in-from-bottom-1 zoom-in-95 absolute bottom-[calc(100%+0.5rem)] left-1/2 z-10 w-[min(calc(100vw-2rem),15rem)] -translate-x-1/2 duration-300 fill-mode-both"
          role="status"
        >
          <div className="relative rounded-lg border border-warm-300/60 bg-warm-100 px-2.5 py-2 text-center text-[11px] leading-snug text-warm-900 shadow-md">
            <p>
              Got a full bright-theme flashbang to the face? Don&apos;t
              worry — I&apos;m right here.{" "}
              <br />
              <span className="font-semibold text-accent-deep">Click me</span>{" "}
              :)
            </p>
            <div
              className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border border-warm-300/60 border-t-0 border-l-0 bg-warm-100"
              aria-hidden
            />
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleToggle}
        className="rounded-md p-0.5 text-warm-500 transition-colors hover:text-warm-900"
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        {theme === "dark" ? (
          <Sun className="size-3.5" />
        ) : (
          <Moon className="size-3.5" />
        )}
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Skeleton className="size-[280px] rounded-3xl bg-warm-300/30" />
        </div>
        <Skeleton className="mx-auto h-10 w-64 rounded-xl bg-warm-300/30" />
        <Skeleton className="h-16 w-full rounded-xl bg-warm-300/30" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl bg-warm-300/30" />
        <Skeleton className="h-48 w-full rounded-xl bg-warm-300/30" />
      </div>
    </div>
  );
}

export function InvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { invoice, loading, error, chain, token, metaLoading } = useInvoice(
    invoiceId ?? "",
  );
  const { payments, total, page, pageSize, setPage } = usePayments(
    invoiceId ?? "",
    invoice?.status ?? null,
    !!invoice,
  );

  const effectiveDecimals = token?.decimals ?? chain?.decimals ?? null;

  const formatAmount = useMemo(
    () => (raw: string) =>
      effectiveDecimals != null
        ? formatTokenAmount(raw, effectiveDecimals)
        : raw,
    [effectiveDecimals],
  );

  return (
    <div className="flex min-h-screen items-start justify-center bg-warm-50 px-4 py-8 sm:items-center sm:py-12">
      <div className="w-full max-w-3xl">
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 rounded-3xl border border-warm-300/50 bg-warm-100 shadow-sm duration-500 fill-mode-both">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="p-6">
              <InvoiceError message={error} />
            </div>
          ) : invoice ? (
            <div className="p-6">
              {invoice.status === "Paid" ? (
                <InvoiceSuccess
                  invoice={invoice}
                  formatAmount={formatAmount}
                />
              ) : invoice.status === "Expired" ? (
                <InvoiceExpired
                  invoice={invoice}
                  formatAmount={formatAmount}
                />
              ) : invoice.status === "Cancelled" ? (
                <InvoiceCancelled invoice={invoice} />
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Left column: QR, address, info */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-semibold text-warm-900">
                        Payment
                      </h1>
                      <CountdownTimer expiresAt={invoice.expires_at} />
                    </div>

                    <Separator className="bg-warm-300/40" />

                    <QrCode
                      address={invoice.address}
                      networkName={invoice.network}
                      metaLoading={metaLoading}
                      chain={chain}
                      token={token}
                    />

                    <div className="flex justify-center">
                      <AddressDisplay address={invoice.address} />
                    </div>

                    <Separator className="bg-warm-300/40" />

                    <InvoiceInfo
                      id={invoice.id}
                      status={invoice.status}
                      token={invoice.token}
                      network={invoice.network}
                      createdAt={invoice.created_at}
                      chain={chain}
                      tokenMeta={token}
                      metaLoading={metaLoading}
                    />
                  </div>

                  {/* Right column: progress + transactions */}
                  <div className="space-y-5">
                    <PaymentProgress
                      paid={invoice.paid}
                      amount={invoice.amount}
                      token={invoice.token}
                      formatAmount={formatAmount}
                    />

                    <Separator className="bg-warm-300/40" />

                    <PaymentsList
                      payments={payments}
                      total={total}
                      page={page}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      formatAmount={formatAmount}
                    />
                  </div>
                </div>
              )}

              {/* Transactions visible on terminal states if any exist */}
              {invoice.status !== "Pending" && total > 0 && (
                <div className="mt-5">
                  <Separator className="mb-5 bg-warm-300/40" />
                  <PaymentsList
                    payments={payments}
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    formatAmount={formatAmount}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-warm-500">
          <span>Powered by necko3</span>
          <span className="text-warm-300">·</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
