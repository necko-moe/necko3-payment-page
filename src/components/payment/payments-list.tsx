import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useClipboard } from "@/hooks/use-clipboard";
import { useTranslation } from "react-i18next";
import { ArrowDownLeft, Check, Copy, Inbox } from "lucide-react";
import type { PaymentStatus, PublicPaymentModel } from "@/types/invoice";

interface PaymentsListProps {
  payments: PublicPaymentModel[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  formatAmount?: (raw: string) => string;
}

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  Confirming: "bg-accent-light/50 text-accent-deep border-accent-main/30",
  Confirmed: "bg-accent-green/60 text-warm-900 border-accent-green",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

function truncateHash(hash: string) {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function truncateAddr(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(iso: string, locale?: string): string {
  return new Date(iso).toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentRow({
  payment,
  formatAmount,
}: {
  payment: PublicPaymentModel;
  formatAmount: (raw: string) => string;
}) {
  const { t, i18n } = useTranslation();
  const { copied, copy } = useClipboard();

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-light/30">
            <ArrowDownLeft className="size-4 text-accent-deep" />
          </div>
          <div>
            <div className="text-sm font-medium text-warm-900">
              +{formatAmount(payment.amount)} {payment.token}
            </div>
            <div className="text-xs text-warm-500">
              {t("from", { address: truncateAddr(payment.from) })}
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${PAYMENT_STATUS_STYLES[payment.status]}`}
        >
          {t(`status.${payment.status}`)}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-warm-500">
        <button
          type="button"
          onClick={() => copy(payment.tx_hash)}
          className="flex items-center gap-1 font-mono transition-colors hover:text-accent-deep"
        >
          {t("txHash", { hash: truncateHash(payment.tx_hash) })}
          {copied ? (
            <Check className="size-3 text-accent-deep" />
          ) : (
            <Copy className="size-3" />
          )}
        </button>
        <span>{formatDate(payment.created_at, i18n.language)}</span>
      </div>
    </div>
  );
}

export function PaymentsList({
  payments,
  total,
  page,
  pageSize,
  onPageChange,
  formatAmount = (raw) => raw,
}: PaymentsListProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-2xl bg-warm-100/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-warm-900">
        {t("transactions")}
        {total > 0 && (
          <span className="ml-1.5 text-xs font-normal text-warm-500">
            ({total})
          </span>
        )}
      </h3>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-warm-500">
          <Inbox className="size-8 text-warm-300" />
          <span className="text-sm">{t("noTransactions")}</span>
        </div>
      ) : (
        <>
          <div className="divide-y divide-warm-300/30">
            {payments.map((p, i) => (
              <div
                key={p.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDuration: "300ms", animationDelay: `${i * 60}ms` }}
              >
                <PaymentRow payment={p} formatAmount={formatAmount} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <>
              <Separator className="my-2 bg-warm-300/30" />
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text=""
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) onPageChange(page - 1);
                      }}
                      className={
                        page <= 1 ? "pointer-events-none opacity-40" : ""
                      }
                      href="#"
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      text=""
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) onPageChange(page + 1);
                      }}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                      href="#"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </>
      )}
    </div>
  );
}
