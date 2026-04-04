import { Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCountdown } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  expiresAt: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const { t } = useTranslation();
  const remaining = useCountdown(expiresAt);
  const isUrgent = remaining > 0 && remaining < 60_000;
  const isExpired = remaining <= 0;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        isExpired
          ? "bg-warm-300/30 text-warm-500"
          : isUrgent
            ? "bg-red-50 text-red-600"
            : "bg-accent-light/40 text-accent-deep"
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="size-4" />
      ) : (
        <Clock className="size-4" />
      )}
      <span>{isExpired ? t("expired") : formatTime(remaining)}</span>
    </div>
  );
}
