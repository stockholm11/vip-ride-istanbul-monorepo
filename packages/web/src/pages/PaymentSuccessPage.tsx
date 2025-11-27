import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";

export default function PaymentSuccessPage() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const reservationId = params.get("reservationId");
  const homePath = useMemo(() => `/${i18n.language}`, [i18n.language]);

  return (
    <>
      <Hero
        title={t("payment.successTitle")}
        subtitle={t("payment.successMessage")}
        overlayOpacity={0.7}
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-lg border border-green-200 bg-green-50 p-8 text-center text-green-800">
            <p className="text-lg font-semibold">
              {t("payment.successMessage").split("\n").map((line, index, array) => (
                <span key={index}>
                  {line}
                  {index < array.length - 1 && <br />}
                </span>
              ))}
            </p>
            {reservationId && (
              <p className="mt-2 text-sm text-green-700">
                {t("payment.reservationLabel", { defaultValue: "Reservation ID" })}:{" "}
                <span className="font-mono font-bold">{reservationId}</span>
              </p>
            )}
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to={homePath}
                className="rounded-md bg-secondary px-6 py-3 font-semibold text-white transition-colors hover:bg-secondary-dark"
              >
                {t("payment.backHome")}
              </Link>
              <Link
                to="/contact"
                className="rounded-md border border-secondary px-6 py-3 font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white"
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


