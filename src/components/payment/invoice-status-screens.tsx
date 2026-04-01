import { CheckCircle2, XCircle, Clock, Ban } from "lucide-react";
import type { PublicInvoiceModel } from "@/types/invoice";

interface StatusScreenProps {
  invoice: PublicInvoiceModel;
}

export function InvoiceSuccess({ invoice }: StatusScreenProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-accent-green/30 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent-green/60">
        <CheckCircle2 className="size-8 text-warm-900" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">Payment Complete</h2>
        <p className="mt-1 text-sm text-warm-500">
          {invoice.paid} {invoice.token} received on {invoice.network}
        </p>
      </div>
      <p className="text-xs text-warm-500">
        Webhook has been sent to the merchant
      </p>
      <div className="mt-2 rounded-lg bg-white/60 px-3 py-1.5 font-mono text-xs text-warm-500">
        {invoice.id}
      </div>
    </div>
  );
}

export function InvoiceExpired({ invoice }: StatusScreenProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-warm-300/20 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-warm-300/40">
        <Clock className="size-8 text-warm-500" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">Invoice Expired</h2>
        <p className="mt-1 text-sm text-warm-500">
          This invoice has expired. Please create a new one.
        </p>
      </div>
      <div className="text-xs text-warm-500">
        Paid: {invoice.paid} / {invoice.amount} {invoice.token}
      </div>
      <div className="rounded-lg bg-white/60 px-3 py-1.5 font-mono text-xs text-warm-500">
        {invoice.id}
      </div>
    </div>
  );
}

export function InvoiceCancelled({ invoice }: StatusScreenProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-warm-300/20 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-warm-300/40">
        <Ban className="size-8 text-warm-500" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">Invoice Cancelled</h2>
        <p className="mt-1 text-sm text-warm-500">
          This invoice was cancelled by the administrator.
        </p>
      </div>
      <div className="rounded-lg bg-white/60 px-3 py-1.5 font-mono text-xs text-warm-500">
        {invoice.id}
      </div>
    </div>
  );
}

export function InvoiceError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-red-50/50 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
        <XCircle className="size-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">Error</h2>
        <p className="mt-1 text-sm text-warm-500">{message}</p>
      </div>
    </div>
  );
}
