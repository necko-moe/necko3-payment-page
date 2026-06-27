import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface PaymentProgressProps {
  paid: string;
  amount: string;
  /** Raw bigint string sum of all Confirming payments */
  confirmingAmount?: string;
  token: string;
  formatAmount?: (raw: string) => string;
}

/** Animate a value from its previous state to the new target using cubic-out easing */
function useCubicAnimatedValue(target: number, duration = 700): number {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) return;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      // Cubic-out: starts fast, slows to a stop
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  // On first render sync immediately
  useEffect(() => {
    fromRef.current = target;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return display;
}

export function PaymentProgress({
  paid,
  amount,
  confirmingAmount = "0",
  token,
  formatAmount = (raw) => raw,
}: PaymentProgressProps) {
  const { t } = useTranslation();

  const amountNum = parseFloat(amount) || 1;

  const paidNum = parseFloat(paid) || 0;
  const paidPercent = Math.min(100, (paidNum / amountNum) * 100);

  const confirmingNum = parseFloat(confirmingAmount) || 0;
  const confirmingPercent = Math.min(100 - paidPercent, (confirmingNum / amountNum) * 100);

  const animatedPaid = useCubicAnimatedValue(paidPercent);
  const animatedConfirming = useCubicAnimatedValue(confirmingPercent);

  const paidLabel = formatAmount(paid);
  const amountLabel = formatAmount(amount);
  const hasConfirming = confirmingNum > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm text-warm-500">{t("paid")}</div>
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

      {/* Progress track */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-warm-300/40">
        {/* Confirming layer — semi-transparent, extends past the paid bar */}
        {hasConfirming && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent-main"
            style={{
              width: `${Math.min(100, animatedPaid + animatedConfirming)}%`,
              opacity: 0.3,
            }}
          />
        )}

        {/* Paid layer — rendered on top */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent-main"
          style={{ width: `${animatedPaid}%` }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-warm-500">
        {hasConfirming && (
          <span className="flex items-center gap-1 text-accent-deep/70">
            <span className="inline-block size-1.5 rounded-full bg-accent-main opacity-50" />
            +{formatAmount(confirmingAmount)} {t("confirming")}
          </span>
        )}
        <span className="ml-auto">{animatedPaid.toFixed(1)}%</span>
      </div>
    </div>
  );
}
