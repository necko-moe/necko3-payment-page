import { useEffect, useState } from "react";

export function useCountdown(expiresAt: string | null): number {
  const [remaining, setRemaining] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  });

  useEffect(() => {
    if (!expiresAt) return;

    const target = new Date(expiresAt).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();

    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}
