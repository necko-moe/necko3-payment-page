import { Progress } from "@/components/ui/progress";

interface PaymentProgressProps {
  paid: string;
  amount: string;
  token: string;
  formatAmount?: (raw: string) => string;
}

export function PaymentProgress({
  paid,
  amount,
  token,
  formatAmount = (raw) => raw,
}: PaymentProgressProps) {
  const paidNum = parseFloat(paid) || 0;
  const amountNum = parseFloat(amount) || 1;
  const percent = Math.min(100, (paidNum / amountNum) * 100);
  const paidLabel = formatAmount(paid);
  const amountLabel = formatAmount(amount);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm text-warm-500">Paid</div>
        <div className="text-right">
          <span className="text-lg font-semibold text-warm-900">
            {paidLabel}
          </span>
          <span className="text-warm-500"> / {amountLabel}</span>
          <span className="ml-1.5 text-sm font-medium text-accent-deep">
            {token}
          </span>
        </div>
      </div>

      <Progress value={percent} className="h-2.5 rounded-full bg-warm-300/40 [&>div]:rounded-full [&>div]:bg-accent-main" />

      <div className="flex items-center text-xs text-warm-500">
        <span className="ml-auto">{percent.toFixed(1)}%</span>
      </div>
    </div>
  );
}
