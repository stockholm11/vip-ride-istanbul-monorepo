import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import Hero from "../components/Hero";
import { consumePaymentForm, removePaymentForm } from "../utils/paymentFormStorage";

export default function PaymentPage() {
  const params = useParams();
  const rawId = params.reservationId ?? params.id ?? params.bookingId;
  const cleanReservationId = rawId?.toString().replace(/\D/g, "");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formHtml, setFormHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formConsumedRef = useRef(false);

  useEffect(() => {
    console.log("========== PAYMENT PAGE MOUNTED ==========");
    console.log("[PaymentPage] URL params:", params);
    console.log("[PaymentPage] rawId:", rawId);
    console.log("[PaymentPage] cleanReservationId:", cleanReservationId);
    console.log("[PaymentPage] Expected key:", `payment-form-${cleanReservationId}`);
    
    // Prevent multiple executions for the same reservationId
    if (formConsumedRef.current) {
      return;
    }

    if (!cleanReservationId) {
      console.error("[PaymentPage] Invalid reservation id on payment page");
      setError("Invalid reservation id on payment page");
      return;
    }
    
    console.log("[PaymentPage] TRYING TO CONSUME FORM…");
    // Don't remove immediately - wait for successful render
    const stored = consumePaymentForm(cleanReservationId, false);
    console.log("[PaymentPage] RESULT OF consumePaymentForm:", stored);
    if (!stored) {
      console.error("[PaymentPage] Payment form not found in sessionStorage");
      setError(t("payment.missingForm"));
      return;
    }
    
    console.log("[PaymentPage] SETTING FORM HTML");
    formConsumedRef.current = true;
    setFormHtml(stored.formHtml);
    
    // Re-execute any <script> tags inside the formHtml
    setTimeout(() => {
      const container = document.getElementById("iyzico-container");
      if (!container) {
        console.error("[PaymentPage] Missing iyzico-container for script injection");
        return;
      }

      // Extract and reinsert scripts
      const scripts = container.getElementsByTagName("script");
      for (let oldScript of scripts) {
        const newScript = document.createElement("script");
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      }

      console.log("[PaymentPage] Iyzico scripts re-executed");
    }, 300);
    
    // DEBUG: auto-submit disabled
    /*
    setTimeout(() => {
      const form = document.getElementById('iyzipay-checkout-form') as HTMLFormElement;
      console.log("[PaymentPage] AUTO-SUBMIT executing…", form);
      if (form) {
        form.submit();
        // Remove payment form after successful form submission
        // removePaymentForm(cleanReservationId);
      } else {
        // Fallback: try to find form by other means
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
          (forms[0] as HTMLFormElement).submit();
          // Remove payment form after successful form submission
          // removePaymentForm(cleanReservationId);
        }
      }
    }, 500);
    */
  }, [cleanReservationId, t]);

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <>
      <Hero
        title={t("payment.redirectingTitle", { defaultValue: t("payment.redirecting") })}
        subtitle={t("payment.redirecting")}
        overlayOpacity={0.7}
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <p className="mb-4 text-lg font-semibold">{error}</p>
              <button
                type="button"
                onClick={handleBackHome}
                className="btn btn-secondary"
              >
                {t("payment.backHome")}
              </button>
            </div>
          ) : formHtml ? (
            <div
              id="iyzico-container"
              className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formHtml) }}
            />
          ) : (
            <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
              <p>{t("payment.redirecting")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
