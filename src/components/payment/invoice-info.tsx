import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClipboard } from "@/hooks/use-clipboard";
import { Copy, Check, Info } from "lucide-react";
import type {
  InvoiceStatus,
  PublicChainModel,
  PublicTokenModel,
} from "@/types/invoice";

interface InvoiceInfoProps {
  id: string;
  status: InvoiceStatus;
  token: string;
  network: string;
  createdAt: string;
  chain: PublicChainModel | null;
  tokenMeta: PublicTokenModel | null;
  metaLoading: boolean;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  Pending:
    "bg-accent-main/20 text-accent-deep border-accent-main/60 ring-2 ring-accent-main/25",
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

function truncateAddressLike(addr: string) {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
}

function networkInitial(network: string): string {
  const t = network.trim();
  return t.length > 0 ? t[0]!.toUpperCase() : "?";
}

function LogoMark({
  url,
  fallbackLetter,
  className,
}: {
  url: string | null;
  fallbackLetter: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return (
      <img
        src={url}
        alt=""
        role="presentation"
        className={`size-[18px] shrink-0 object-cover ${className ?? ""}`}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span
      className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-accent-light/60 text-[10px] font-bold text-accent-deep"
      aria-hidden
    >
      {fallbackLetter}
    </span>
  );
}

export function InvoiceInfo({
  id,
  status,
  token,
  network,
  createdAt,
  chain,
  tokenMeta,
  metaLoading,
}: InvoiceInfoProps) {
  const idClipboard = useClipboard();
  const contractClipboard = useClipboard();

  const tokenSlotUrl = !metaLoading
    ? (tokenMeta?.logo_url ??
        (tokenMeta === null ? (chain?.logo_url ?? null) : null))
    : null;

  const showNetworkMark = !metaLoading && chain !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {status}
        </Badge>
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-warm-500">
          <span className="flex min-w-0 items-center gap-1">
            {tokenSlotUrl ? (
              <LogoMark
                url={tokenSlotUrl}
                fallbackLetter={networkInitial(token)}
              />
            ) : null}
            <span className="truncate font-medium text-accent-deep">
              {token}
            </span>
          </span>
          <span className="shrink-0">on</span>
          <span className="flex min-w-0 items-center gap-1">
            {showNetworkMark ? (
              <LogoMark
                url={chain?.logo_url ?? null}
                fallbackLetter={networkInitial(network)}
              />
            ) : null}
            <span className="truncate font-medium text-warm-900">
              {network}
            </span>
          </span>
        </div>
      </div>

      <Separator className="bg-warm-300/40" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-warm-500">Invoice ID</span>
        <button
          type="button"
          onClick={() => idClipboard.copy(id)}
          className="flex items-center gap-1 font-mono text-warm-900 transition-colors hover:text-accent-deep"
        >
          {truncateId(id)}
          {idClipboard.copied ? (
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

      {chain ? (
        <>
          <div className="flex items-center justify-between text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help items-center gap-1 text-warm-500">
                  Confirmations
                  <Info className="size-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-56 text-xs leading-relaxed"
              >
                Network confirmations reduce the risk of chain reorganizations
                reversing your transaction.
              </TooltipContent>
            </Tooltip>
            <span className="font-medium text-warm-900">
              {chain.required_confirmations}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help items-center gap-1 text-warm-500">
                  Block lag
                  <Info className="size-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-56 text-xs leading-relaxed"
              >
                How far behind the chain tip we process blocks. A small lag
                improves stability and protects against short reorganizations.
              </TooltipContent>
            </Tooltip>
            <span className="font-medium text-warm-900">{chain.block_lag}</span>
          </div>
        </>
      ) : null}

      {tokenMeta ? (
        <>
          <Separator className="bg-warm-300/40" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-warm-500">Contract</span>
            <button
              type="button"
              onClick={() => contractClipboard.copy(tokenMeta.contract_address)}
              className="flex max-w-[min(100%,14rem)] items-center gap-1 font-mono text-warm-900 transition-colors hover:text-accent-deep"
            >
              <span className="truncate">
                {truncateAddressLike(tokenMeta.contract_address)}
              </span>
              {contractClipboard.copied ? (
                <Check className="size-3 shrink-0 text-accent-deep" />
              ) : (
                <Copy className="size-3 shrink-0 text-warm-500" />
              )}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
