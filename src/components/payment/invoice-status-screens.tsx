import { CheckCircle2, XCircle, Clock, Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PublicInvoiceModel } from "@/types/invoice";

interface StatusScreenProps {
  invoice: PublicInvoiceModel;
  formatAmount?: (raw: string) => string;
}

export function InvoiceSuccess({
  invoice,
  formatAmount = (raw) => raw,
}: StatusScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-accent-green/30 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent-green/60">
        <CheckCircle2 className="size-8 text-warm-900" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">{t("paymentComplete")}</h2>
        <p className="mt-1 text-sm text-warm-500">
          {t("receivedOn", { amount: formatAmount(invoice.paid), token: invoice.token, network: invoice.network })}
        </p>
      </div>
      <p className="text-xs text-warm-500">
        {t("webhookSent")}
      </p>
      <div className="mt-2 rounded-lg bg-warm-50/60 px-3 py-1.5 font-mono text-xs text-warm-500">
        {invoice.id}
      </div>
    </div>
  );
}

export function InvoiceExpired({
  invoice,
  formatAmount = (raw) => raw,
}: StatusScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-warm-300/20 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-warm-300/40">
        <Clock className="size-8 text-warm-500" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">{t("invoiceExpired")}</h2>
        <p className="mt-1 text-sm text-warm-500">
          {t("invoiceExpiredDesc")}
        </p>
      </div>
      <div className="text-xs text-warm-500">
        {t("paidOf", { paid: formatAmount(invoice.paid), total: formatAmount(invoice.amount), token: invoice.token })}
      </div>
      <div className="rounded-lg bg-warm-50/60 px-3 py-1.5 font-mono text-xs text-warm-500">
        {invoice.id}
      </div>
    </div>
  );
}

export function InvoiceCancelled({ invoice }: StatusScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-warm-300/20 px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-warm-300/40">
        <Ban className="size-8 text-warm-500" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">{t("invoiceCancelled")}</h2>
        <p className="mt-1 text-sm text-warm-500">
          {t("invoiceCancelledDesc")}
        </p>
      </div>
      <div className="rounded-lg bg-warm-50/60 px-3 py-1.5 font-mono text-xs text-warm-500">
        {invoice.id}
      </div>
    </div>
  );
}

export function InvoiceError({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-red-50/50 px-6 py-10 text-center dark:bg-red-950/30">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
        <XCircle className="size-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-warm-900">{t("error")}</h2>
        <p className="mt-1 text-sm text-warm-500">{message}</p>
      </div>
    </div>
  );
}
