import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClipboard } from "@/hooks/use-clipboard";
import { Copy, Check, Info } from "lucide-react";
import type { InvoiceStatus } from "@/types/invoice";

interface InvoiceInfoProps {
  id: string;
  status: InvoiceStatus;
  token: string;
  network: string;
  createdAt: string;
  requiredConfirmations: number;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  Pending: "bg-accent-main/20 text-accent-deep border-accent-main/60 ring-2 ring-accent-main/25",
  Paid: "bg-accent-green/60 text-warm-900 border-accent-green",
  Expired: "bg-warm-300/30 text-warm-500 border-warm-300",
  Cancelled: "bg-warm-300/30 text-warm-500 border-warm-300",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateId(id: string) {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

export function InvoiceInfo({
  id,
  status,
  token,
  network,
  createdAt,
  requiredConfirmations,
}: InvoiceInfoProps) {
  const { copied, copy } = useClipboard();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {status}
        </Badge>
        <div className="flex items-center gap-1.5 text-xs text-warm-500">
          <span className="font-medium text-accent-deep">{token}</span>
          <span>on</span>
          <span className="font-medium text-warm-900">{network}</span>
        </div>
      </div>

      <Separator className="bg-warm-300/40" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-warm-500">Invoice ID</span>
        <button
          type="button"
          onClick={() => copy(id)}
          className="flex items-center gap-1 font-mono text-warm-900 transition-colors hover:text-accent-deep"
        >
          {truncateId(id)}
          {copied ? (
            <Check className="size-3 text-accent-deep" />
          ) : (
            <Copy className="size-3 text-warm-500" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-warm-500">Created</span>
        <span className="text-warm-900">{formatDate(createdAt)}</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex cursor-help items-center gap-1 text-warm-500">
              Confirmations
              <Info className="size-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56 text-xs leading-relaxed">
            Network confirmations protect against chain reorganizations.
            More confirmations mean lower risk of transaction reversal and loss of funds.
          </TooltipContent>
        </Tooltip>
        <span className="font-medium text-warm-900">{requiredConfirmations}</span>
      </div>
    </div>
  );
}
