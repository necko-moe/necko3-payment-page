import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddressDisplayProps {
  address: string;
}

function truncateAddress(addr: string) {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  const { copied, copy } = useClipboard();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => copy(address)}
          className="mx-auto flex items-center gap-2 rounded-xl bg-warm-50/80 px-4 py-2.5 font-mono text-sm text-warm-900 transition-colors hover:bg-warm-50"
        >
          <span>{truncateAddress(address)}</span>
          {copied ? (
            <Check className="size-4 shrink-0 text-accent-deep" />
          ) : (
            <Copy className="size-4 shrink-0 text-warm-500" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? "Copied!" : "Click to copy address"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
