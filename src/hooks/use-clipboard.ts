import { useCallback, useRef, useState } from "react";

export function useClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), timeout);
      } catch {
        // clipboard API unavailable
      }
    },
    [timeout],
  );

  return { copied, copy };
}
