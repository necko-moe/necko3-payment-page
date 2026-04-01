import { Route, Routes } from "react-router-dom";
import { InvoicePage } from "@/components/payment/invoice-page";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-50">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-warm-900">404</h1>
        <p className="mt-2 text-warm-500">Invoice not found</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/:invoiceId" element={<InvoicePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
