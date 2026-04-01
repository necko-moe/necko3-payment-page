import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { colors } from "@/lib/colors";
import { useClipboard } from "@/hooks/use-clipboard";
import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QrCodeProps {
  address: string;
  size?: number;
}

const qrCode = new QRCodeStyling({
  width: 240,
  height: 240,
  type: "svg",
  dotsOptions: {
    color: colors.accent.deep,
    type: "extra-rounded",
  },
  cornersSquareOptions: {
    color: colors.accent.deep,
    type: "extra-rounded",
  },
  cornersDotOptions: {
    color: colors.accent.deep,
    type: "dot",
  },
  backgroundOptions: {
    color: "transparent",
  },
  qrOptions: {
    errorCorrectionLevel: "M",
  },
});

export function QrCode({ address, size = 240 }: QrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useClipboard();

  useEffect(() => {
    qrCode.update({ data: address, width: size, height: size });
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      qrCode.append(containerRef.current);
    }
  }, [address, size]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => copy(address)}
          className="group relative mx-auto block cursor-pointer rounded-3xl bg-white p-5 transition-opacity"
        >
          <div ref={containerRef} className="flex items-center justify-center" />
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
            {copied ? (
              <Check className="size-8 text-accent-deep" />
            ) : (
              <Copy className="size-8 text-accent-deep" />
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? "Copied!" : "Click to copy address"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
