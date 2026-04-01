import { useParams } from "react-router-dom";
import { useInvoice } from "@/hooks/use-invoice";
import { usePayments } from "@/hooks/use-payments";
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
  const { invoice, loading, error } = useInvoice(invoiceId ?? "");
  const { payments, total, page, pageSize, setPage } = usePayments(
    invoiceId ?? "",
    invoice?.status ?? null,
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
                <InvoiceSuccess invoice={invoice} />
              ) : invoice.status === "Expired" ? (
                <InvoiceExpired invoice={invoice} />
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

                    <QrCode address={invoice.address} />

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
                      requiredConfirmations={invoice.required_confirmations}
                    />
                  </div>

                  {/* Right column: progress + transactions */}
                  <div className="space-y-5">
                    <PaymentProgress
                      paid={invoice.paid}
                      amount={invoice.amount}
                      token={invoice.token}
                    />

                    <Separator className="bg-warm-300/40" />

                    <PaymentsList
                      payments={payments}
                      total={total}
                      page={page}
                      pageSize={pageSize}
                      onPageChange={setPage}
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
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-center text-xs text-warm-500">
          Powered by necko3
        </p>
      </div>
    </div>
  );
}
