import { useCallback, useEffect, useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import { AdminReservation, getReservations } from "../../api/admin";

const PAGE_SIZE = 10;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("tr-TR");
};

const getReservationType = (reservation: AdminReservation) => {
  // Use reservationType field (primary source of truth)
  if (reservation.reservationType) {
    switch (reservation.reservationType) {
      case "tour":
        return "Tur";
      case "transfer":
        return "Transfer";
      case "featured-transfer":
        return "Öne Çıkan Transfer";
      case "chauffeur":
        return "Şoför Hizmeti";
      default:
        return reservation.reservationType;
    }
  }
  // Fallback for old records without reservationType
  if (reservation.tourId) {
    return "Tur";
  }
  if (reservation.vehicleId) {
    return "Transfer";
  }
  return "Özel";
};

const getStatusBadgeClass = (status: AdminReservation["paymentStatus"]) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const getStatusLabel = (status: AdminReservation["paymentStatus"]) => {
  switch (status) {
    case "paid":
      return "Ödendi";
    case "failed":
      return "Başarısız";
    default:
      return "Beklemede";
  }
};

const ReservationsPage = () => {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "transfer" | "tour" | "chauffeur">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, dateFrom, dateTo]);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReservations({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        type: typeFilter === "all" ? undefined : typeFilter,
        dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
      });
      setReservations(response.data);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Rezervasyonlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const sortedReservations = useMemo(() => {
    const list = [...reservations];
    return list.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortDirection === "desc" ? bTime - aTime : aTime - bTime;
    });
  }, [reservations, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const currentTo = total === 0 ? 0 : Math.min(total, page * PAGE_SIZE);

  const renderState = (message: string, isError = false) => (
    <div
      className={`border-2 border-dashed border-gray-200 rounded-lg p-8 text-center ${
        isError ? "text-red-500" : "text-gray-500"
      }`}
    >
      <p>{message}</p>
      {isError && (
        <button
          type="button"
          onClick={fetchReservations}
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return renderState("Rezervasyonlar yükleniyor...");
    }

    if (error) {
      return renderState(error, true);
    }

    if (sortedReservations.length === 0) {
      return renderState("Kayıt bulunamadı");
    }

    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
                    }
                    className="flex items-center gap-1 text-gray-600"
                  >
                    Misafir
                    <span className="text-xs">{sortDirection === "desc" ? "↓" : "↑"}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İletişim</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Hizmet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Durum</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Toplam</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">{reservation.userFullName}</div>
                    <div className="text-xs text-gray-400">{formatDateTime(reservation.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>{reservation.userEmail}</div>
                    <div className="text-xs text-gray-400">{reservation.userPhone || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="font-medium text-gray-900">
                      {reservation.tourTitle ?? reservation.vehicleName ?? "Özel Hizmet"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {reservation.tourSlug ?? reservation.vehicleSlug ?? "—"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{getReservationType(reservation)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                        reservation.paymentStatus
                      )}`}
                    >
                      {getStatusLabel(reservation.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    {formatCurrency(reservation.totalPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <button
                      type="button"
                      onClick={() => setSelectedReservation(reservation)}
                      className="text-primary font-semibold hover:underline"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Ara</label>
            <input
              type="text"
              placeholder="İsim, e-posta veya telefon"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Rezervasyon Tipi</label>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "transfer" | "tour" | "chauffeur")}
            >
              <option value="all">Tümü</option>
              <option value="transfer">Transfer</option>
              <option value="tour">Tur</option>
              <option value="chauffeur">Şoför Hizmeti</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Başlangıç Tarihi</label>
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Bitiş Tarihi</label>
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            {total} rezervasyondan {currentFrom}-{currentTo} arası gösteriliyor
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Önceki
            </button>
            <span className="text-gray-700">
              Sayfa {total === 0 ? 0 : page} / {total === 0 ? 0 : totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || total === 0}
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>

      {renderContent()}

      {selectedReservation && (
        <AdminModal title="Rezervasyon Detayı" onClose={() => setSelectedReservation(null)}>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-gray-400">Tip</p>
                <p className="font-semibold text-gray-900">{getReservationType(selectedReservation)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Oluşturulma</p>
                <p className="font-semibold text-gray-900">{formatDateTime(selectedReservation.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Misafir</p>
                <p className="font-semibold text-gray-900">{selectedReservation.userFullName}</p>
                <p>{selectedReservation.userEmail}</p>
                <p>{selectedReservation.userPhone || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Ödeme</p>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                    selectedReservation.paymentStatus
                  )}`}
                >
                  {getStatusLabel(selectedReservation.paymentStatus)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-gray-400">Alış</p>
                <p className="font-semibold text-gray-900">{selectedReservation.pickupLocation ?? "—"}</p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(selectedReservation.pickupDatetime)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Bırakış</p>
                <p className="font-semibold text-gray-900">{selectedReservation.dropoffLocation ?? "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-gray-400">Hizmet</p>
                <p className="font-semibold text-gray-900">
                  {(() => {
                    // For tour reservations, show tour title if available, otherwise "Tur"
                    if (selectedReservation.reservationType === "tour") {
                      const tourTitle = selectedReservation.tourTitle;
                      // Debug: log to see what we're getting
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Tour reservation:', {
                          reservationType: selectedReservation.reservationType,
                          tourTitle: tourTitle,
                          tourId: selectedReservation.tourId,
                        });
                      }
                      return tourTitle && tourTitle.trim() ? tourTitle.trim() : "Tur";
                    }
                    // For other reservation types, show the reservation type
                    return getReservationType(selectedReservation);
                  })()}
                </p>
                {selectedReservation.reservationType !== "tour" && (
                  <p className="text-xs text-gray-500">
                    {selectedReservation.tourTitle ?? selectedReservation.vehicleName ?? "—"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Yolcu Sayısı</p>
                <p className="font-semibold text-gray-900">{selectedReservation.passengers}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 mb-1">Diğer Yolcular</p>
              {selectedReservation.additionalPassengers && selectedReservation.additionalPassengers.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {selectedReservation.additionalPassengers.map((passenger, index) => (
                    <li key={`${passenger.firstName}-${passenger.lastName}-${index}`}>
                      {index + 2}. {passenger.firstName} {passenger.lastName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Ek yolcu bulunmuyor</p>
              )}
            </div>

            {selectedReservation.addOns && selectedReservation.addOns.length > 0 && (
              <div>
                <p className="text-xs uppercase text-gray-400 mb-2">Ek Hizmetler</p>
                <div className="space-y-2">
                  {selectedReservation.addOns.map((addOn) => (
                    <div
                      key={addOn.addOnId}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{addOn.addOnName}</p>
                        <p className="text-xs text-gray-500">Adet: {addOn.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(addOn.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs uppercase text-gray-400">Toplam Tutar</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedReservation.totalPrice)}
                </p>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default ReservationsPage;

