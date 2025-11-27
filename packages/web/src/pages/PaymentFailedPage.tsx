import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";

export default function PaymentFailedPage() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const reservationId = params.get("reservationId");
  const homePath = useMemo(() => `/${i18n.language}`, [i18n.language]);

  return (
    <>
      <Hero
        title={t("payment.failedTitle")}
        subtitle={t("payment.failedMessage")}
        overlayOpacity={0.7}
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-800">
            <p className="text-lg font-semibold">{t("payment.failedMessage")}</p>
            {reservationId && (
              <p className="mt-2 text-sm text-red-700">
                {t("payment.reservationLabel", { defaultValue: "Reservation ID" })}:{" "}
                <span className="font-mono font-bold">{reservationId}</span>
              </p>
            )}
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to={homePath}
                className="rounded-md bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                {t("payment.tryAgain")}
              </Link>
              <Link
                to="/contact"
                className="rounded-md border border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {t("payment.contactSupport")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


