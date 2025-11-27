import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { getTourBySlug } from "../api/public";
import { PublicTour } from "../types/public/PublicTour";
import { TourType } from "../components/TourCard";
import { mapPublicTourToTourType } from "../utils/public/mapPublicTourToTourType";
import BookingForm from "../components/BookingForm";

export default function TourDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tour, setTour] = useState<PublicTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getTourBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setTour(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setError(t("vipTours.loadError", { defaultValue: "Failed to load tour details" }));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, t]);

  const mappedTour: TourType | null = useMemo(() => {
    if (!tour) return null;
    return mapPublicTourToTourType(tour);
  }, [tour]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(
      i18n.language === "tr" ? "tr-TR" : i18n.language === "ar" ? "ar-SA" : "en-US",
      {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    ).format(price);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-gray-500">
            {t("vipTours.loadingTour", { defaultValue: "Loading tour..." })}
          </div>
        </div>
      </section>
    );
  }

  if (error || !mappedTour) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center space-y-4">
            <p className="text-red-500">
              {error || t("vipTours.notFound", { defaultValue: "Tour not found." })}
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-primary px-6 py-3 text-primary hover:bg-primary hover:text-white transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              {t("booking.back")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <button
            type="button"
            className="mb-6 inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            {t("booking.back")}
          </button>

          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative h-80 w-full">
              <img
                src={mappedTour.image}
                alt={mappedTour.title}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-white/80">
                      {mappedTour.category?.name || ""}
                    </p>
                    <h1 className="text-3xl font-bold">{mappedTour.title}</h1>
                  </div>
                  <div className="rounded-lg bg-primary/90 px-4 py-2 text-lg font-bold">
                    {formatPrice(mappedTour.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center text-secondary">
                      <ClockIcon className="mr-2 h-5 w-5" />
                      <span className="font-medium">
                        {mappedTour.duration
                          ? `${mappedTour.duration} ${t("vipTours.hours")}`
                          : mappedTour.durationMinutes !== null && mappedTour.durationMinutes !== undefined
                          ? `${Math.max(1, Math.min(12, Math.round(mappedTour.durationMinutes / 60)))} ${t("vipTours.hours")}`
                          : "—"}
                      </span>
                    </div>
                  </div>
                  {mappedTour.capacity !== undefined && mappedTour.capacity !== null && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="flex items-center text-secondary">
                        <UserGroupIcon className="mr-2 h-5 w-5" />
                        <span className="font-medium">
                          {mappedTour.capacity} {t("vipTours.persons")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {mappedTour.longDescription && (
                  <div>
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                      {t("vipTours.description")}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{mappedTour.longDescription}</p>
                  </div>
                )}

                {!!mappedTour.includes?.length && (
                  <div>
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                      {t("vipTours.includes")}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {mappedTour.includes.map((item, index) => (
                        <div key={index} className="flex items-center rounded-lg bg-gray-50 p-3">
                          <CheckCircleIcon className="mr-3 h-5 w-5 text-secondary" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-semibold text-primary">
                    {t("vipTours.readyToBook")}
                  </h3>
                  <p className="mb-6 text-gray-600">
                    {t("vipTours.bookingDescription", {
                      defaultValue: "Send us your preferred date and we will confirm shortly.",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="btn-gold w-full px-4 py-3 font-semibold"
                  >
                    {t("vipTours.bookNow")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingForm
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tour={mappedTour}
      />
    </>
  );
}


