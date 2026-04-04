import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { cssVar } from "@/lib/css-var";
import { buildQrCenterImageDataUrl } from "@/lib/qr-center-image";
import { useClipboard } from "@/hooks/use-clipboard";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PublicChainModel, PublicTokenModel } from "@/types/invoice";

export interface QrCodeProps {
  address: string;
  size?: number;
  networkName: string;
  metaLoading: boolean;
  chain: PublicChainModel | null;
  token: PublicTokenModel | null;
}

function createQrInstance(color: string) {
  return new QRCodeStyling({
    width: 240,
    height: 240,
    type: "svg",
    dotsOptions: {
      color,
      type: "extra-rounded",
    },
    cornersSquareOptions: {
      color,
      type: "extra-rounded",
    },
    cornersDotOptions: {
      color,
      type: "dot",
    },
    backgroundOptions: {
      color: "transparent",
    },
    qrOptions: {
      errorCorrectionLevel: "M",
    },
  });
}

export function QrCode({
  address,
  size = 240,
  networkName,
  metaLoading,
  chain,
  token,
}: QrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const { copied, copy } = useClipboard();
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const accentDeep = cssVar("--accent-deep");

    qrRef.current = createQrInstance(accentDeep);
    const qr = qrRef.current;
    const el = containerRef.current;
    let cancelled = false;

    const run = async () => {
      let image: string | undefined;
      let errorCorrectionLevel: "H" | "M" = "M";

      if (!metaLoading) {
        if (token?.logo_url) {
          const dataUrl = await buildQrCenterImageDataUrl({
            mode: "token",
            tokenLogoUrl: token.logo_url,
            chainLogoUrl: chain?.logo_url ?? null,
            networkName,
          });
          if (!cancelled && dataUrl) {
            image = dataUrl;
            errorCorrectionLevel = "H";
          }
        } else if (token === null && chain?.logo_url) {
          const dataUrl = await buildQrCenterImageDataUrl({
            mode: "chain_only",
            chainLogoUrl: chain.logo_url,
          });
          if (!cancelled && dataUrl) {
            image = dataUrl;
            errorCorrectionLevel = "H";
          }
        }
      }

      if (cancelled) return;

      qr.update({
        data: address,
        width: size,
        height: size,
        qrOptions: { errorCorrectionLevel },
        ...(image
          ? {
              image,
              imageOptions: {
                crossOrigin: "anonymous",
                margin: 4,
                imageSize: 0.38,
                hideBackgroundDots: true,
              },
            }
          : {
              image: "",
            }),
      });

      if (el) {
        el.innerHTML = "";
        qr.append(el);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [address, size, metaLoading, chain, token, networkName, theme]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => copy(address)}
          className="group relative mx-auto block cursor-pointer rounded-3xl bg-warm-50 p-5 transition-opacity"
        >
          <div
            ref={containerRef}
            className="mx-auto flex items-center justify-center"
            style={{ width: size, height: size }}
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-warm-50/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
            {copied ? (
              <Check className="size-8 text-accent-deep" />
            ) : (
              <Copy className="size-8 text-accent-deep" />
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? t("copied") : t("clickToCopyAddress")}</p>
      </TooltipContent>
    </Tooltip>
  );
}
