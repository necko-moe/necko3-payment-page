import { Toaster as Sonner, type ToasterProps } from "sonner"
import { OctagonXIcon } from "lucide-react"

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      className="toaster group"
      icons={{
        error: <OctagonXIcon className="size-4" />,
      }}
      style={
        {
          "--normal-bg": "var(--warm-100)",
          "--normal-text": "var(--warm-900)",
          "--normal-border": "var(--warm-300)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-sans shadow-md border !border-warm-300/50 !bg-warm-100 !text-warm-900",
          title: "text-sm font-medium",
          description: "text-xs !text-warm-500",
          error: "!border-red-200 !bg-red-50 !text-red-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
