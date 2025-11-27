import { useEffect, useState } from "react";
import AdminModal from "./AdminModal";
import {
  OverviewStats,
  RecentBooking,
  PopularTourStat,
  getOverviewStats,
  getRecentBookings,
  getPopularTours,
} from "../../api/admin";

const formatDateTime = (value: string) => new Date(value).toLocaleString("tr-TR");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const AdminDashboard = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  const [popularTours, setPopularTours] = useState<PopularTourStat[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [popularError, setPopularError] = useState<string | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<RecentBooking | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      try {
        const data = await getOverviewStats();
        setOverview(data);
        setOverviewError(null);
      } catch (err) {
        console.error(err);
        setOverviewError("Genel veriler yüklenemedi");
      } finally {
        setOverviewLoading(false);
      }
    };

    const fetchRecent = async () => {
      setRecentLoading(true);
      try {
        const data = await getRecentBookings();
        setRecentBookings(data);
        setRecentError(null);
      } catch (err) {
        console.error(err);
        setRecentError("Rezervasyonlar yüklenemedi");
      } finally {
        setRecentLoading(false);
      }
    };

    const fetchPopular = async () => {
      setPopularLoading(true);
      try {
        const data = await getPopularTours();
        setPopularTours(data);
        setPopularError(null);
      } catch (err) {
        console.error(err);
        setPopularError("Popüler turlar yüklenemedi");
      } finally {
        setPopularLoading(false);
      }
    };

    fetchOverview();
    fetchRecent();
    fetchPopular();
  }, []);

  const renderOverviewCards = () => {
    if (overviewLoading) {
      return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      );
    }

    if (overviewError) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-red-500">
          <p className="mb-4">{overviewError}</p>
          <button
            type="button"
            onClick={async () => {
              setOverviewLoading(true);
              try {
                const data = await getOverviewStats();
                setOverview(data);
                setOverviewError(null);
              } catch (err) {
                console.error(err);
                setOverviewError("Genel veriler yüklenemedi");
              } finally {
                setOverviewLoading(false);
              }
            }}
            className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Tekrar dene
          </button>
        </div>
      );
    }

    if (!overview) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Gösterilecek veri yok
        </div>
      );
    }

    const cards = [
      { label: "Toplam Araç", value: overview.totalVehicles },
      { label: "Toplam Tur", value: overview.totalTours },
      { label: "Toplam Kategori", value: overview.totalCategories },
      { label: "Toplam Rezervasyon", value: overview.totalBookings },
    ];

    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <div key={item.label} className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-3xl font-bold text-primary mt-2">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderRecentBookings = () => {
    if (recentLoading) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Son rezervasyonlar yükleniyor...
        </div>
      );
    }

    if (recentError) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-red-500">
          <p className="mb-4">{recentError}</p>
          <button
            type="button"
            onClick={async () => {
              setRecentLoading(true);
              try {
                const data = await getRecentBookings();
                setRecentBookings(data);
                setRecentError(null);
              } catch (err) {
                console.error(err);
                setRecentError("Rezervasyonlar yüklenemedi");
              } finally {
                setRecentLoading(false);
              }
            }}
            className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Tekrar dene
          </button>
        </div>
      );
    }

    if (recentBookings.length === 0) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Gösterilecek veri yok
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Misafir</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tip</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Alış</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Toplam</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{booking.userFullName}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{booking.type}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(booking.pickupDatetime)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                  {formatCurrency(booking.totalPrice)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(booking)}
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
    );
  };

  const renderPopularTours = () => {
    if (popularLoading) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Popüler turlar yükleniyor...
        </div>
      );
    }

    if (popularError) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-red-500">
          <p className="mb-4">{popularError}</p>
          <button
            type="button"
            onClick={async () => {
              setPopularLoading(true);
              try {
                const data = await getPopularTours();
                setPopularTours(data);
                setPopularError(null);
              } catch (err) {
                console.error(err);
                setPopularError("Popüler turlar yüklenemedi");
              } finally {
                setPopularLoading(false);
              }
            }}
            className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Tekrar dene
          </button>
        </div>
      );
    }

    if (popularTours.length === 0) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Gösterilecek veri yok
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {popularTours.map((tour) => (
          <li
            key={tour.tourId}
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{tour.title}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {tour.bookingCount} rezervasyon
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Genel Bakış</h2>
        {renderOverviewCards()}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Son Rezervasyonlar</h3>
          </div>
          {renderRecentBookings()}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Popüler Turlar</h3>
          </div>
          {renderPopularTours()}
        </div>
      </section>

      {selectedBooking && (
        <AdminModal title="Rezervasyon Detayı" onClose={() => setSelectedBooking(null)}>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-gray-400">Misafir</p>
                <p className="font-semibold text-gray-900">{selectedBooking.userFullName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Tip</p>
                <p className="font-semibold text-gray-900 capitalize">{selectedBooking.type}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Alış</p>
                <p className="font-semibold text-gray-900">{formatDateTime(selectedBooking.pickupDatetime)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Toplam</p>
                <p className="font-semibold text-gray-900">{formatCurrency(selectedBooking.totalPrice)}</p>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default AdminDashboard;

