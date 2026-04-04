import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InvoicePage } from "@/components/payment/invoice-page";

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-50">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-warm-900">{t("notFoundTitle")}</h1>
        <p className="mt-2 text-warm-500">{t("invoiceNotFound")}</p>
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
