import { FormEvent, useEffect, useState } from "react";
import AdminModal from "./AdminModal";
import {
  AdminCategory,
  AdminTour,
  AdminVehicle,
  createTour,
  deleteTour,
  getCategories,
  getTours,
  getVehicles,
  TourPayload,
  updateTour,
  uploadImage,
} from "../../api/admin";

const formatPrice = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface TourFormState {
  title: string;
  slug: string;
  categoryId: string;
  vehicleId: string;
  price: string;
  imageUrl: string;
  shortDescription: string;
  longDescription: string;
  durationHours: string;
  capacity: string;
  isActive: boolean;
}

const initialTourForm: TourFormState = {
  title: "",
  slug: "",
  categoryId: "",
  vehicleId: "",
  price: "0",
  imageUrl: "",
  shortDescription: "",
  longDescription: "",
  durationHours: "1",
  capacity: "4",
  isActive: false,
};

const ToursPage = () => {
  const durationOptions = Array.from({ length: 12 }, (_, idx) => (idx + 1).toString());
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<TourFormState>(initialTourForm);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminTour | null>(null);

  const loadData = async () => {
    try {
      const [tourData, vehicleData, categoryData] = await Promise.all([
        getTours(),
        getVehicles(),
        getCategories(),
      ]);
      setTours(tourData);
      setVehicles(vehicleData);
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Veriler yüklenemedi");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [tourData, vehicleData, categoryData] = await Promise.all([
          getTours(),
          getVehicles(),
          getCategories(),
        ]);
        if (!isMounted) {
          return;
        }
        setTours(tourData);
        setVehicles(vehicleData);
        setCategories(categoryData);
        setError(null);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Veriler yüklenemedi");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    if (categories.length === 0 || vehicles.length === 0) {
      alert("Lütfen tur oluşturmadan önce en az bir kategori ve araç ekleyin.");
      return;
    }
    const defaultVehicleId = vehicles[0]?.id ?? "";
    const defaultCapacity =
      vehicles.find((vehicle) => vehicle.id === defaultVehicleId)?.capacity?.toString() ?? "4";
    setModalMode("create");
    setFormState({
      ...initialTourForm,
      categoryId: categories[0]?.id ?? "",
      vehicleId: defaultVehicleId,
      durationHours: "1",
      capacity: defaultCapacity,
    });
    setSelectedTourId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tour: AdminTour) => {
    setModalMode("edit");
    setSelectedTourId(tour.id);
    const fallbackCapacity =
      vehicles.find((vehicle) => vehicle.id === tour.vehicleId)?.capacity?.toString() ?? "4";
    setFormState({
      title: tour.title,
      slug: tour.slug,
      categoryId: tour.categoryId,
      vehicleId: tour.vehicleId,
      price: tour.price.toString(),
      imageUrl: tour.imageUrl ?? "",
      shortDescription: tour.shortDescription ?? "",
      longDescription: tour.longDescription ?? "",
      durationHours: tour.durationHours
        ? tour.durationHours.toString()
        : tour.durationMinutes
        ? Math.max(1, Math.min(12, Math.round(Number(tour.durationMinutes) / 60))).toString()
        : "1",
      capacity: tour.capacity ? tour.capacity.toString() : fallbackCapacity,
      isActive: tour.isActive === true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (field: keyof TourFormState, value: string) => {
    setFormState((prev) => {
      const nextState = { ...prev, [field]: value };
      if (field === "vehicleId") {
        const selectedVehicle = vehicles.find((vehicle) => vehicle.id === value);
        if (selectedVehicle) {
          nextState.capacity = selectedVehicle.capacity.toString();
        }
      }
      return nextState;
    });
  };

  const buildPayload = (): TourPayload => ({
    title: formState.title.trim(),
    slug: formState.slug.trim(),
    categoryId: formState.categoryId,
    vehicleId: formState.vehicleId,
    price: Number(formState.price),
    imageUrl: formState.imageUrl.trim() ? formState.imageUrl.trim() : null,
    shortDescription: formState.shortDescription.trim()
      ? formState.shortDescription.trim()
      : null,
    longDescription: formState.longDescription.trim()
      ? formState.longDescription.trim()
      : null,
    durationHours: Math.max(1, Number(formState.durationHours) || 0),
    capacity: Math.max(1, Number(formState.capacity) || 0),
    isActive: formState.isActive,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      if (modalMode === "create") {
        await createTour(payload);
      } else if (selectedTourId) {
        await updateTour(selectedTourId, payload);
      }

      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Tur kaydedilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteTour(deleteTarget.id);
      await loadData();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Tur silinemedi");
    }
  };

  const renderState = (message: string, isError = false) => (
    <div
      className={`border-2 border-dashed border-gray-200 rounded-lg p-8 text-center ${
        isError ? "text-red-500" : "text-gray-500"
      }`}
    >
      {message}
    </div>
  );

  const renderContent = () => {
    if (loading) {
    return renderState("Yükleniyor...");
    }

    if (error) {
      return renderState(error, true);
    }

    if (tours.length === 0) {
      return renderState("Kayıt bulunamadı");
    }

    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tur</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Araç</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fiyat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Detaylar</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">{tour.title}</div>
                    <div className="text-xs text-gray-500">{tour.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>{tour.categoryName}</div>
                    <div className="text-xs text-gray-400">{tour.categorySlug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>{tour.vehicleName}</div>
                    <div className="text-xs text-gray-400">{tour.vehicleSlug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{formatPrice(tour.price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>
                      {tour.durationHours
                        ? `${tour.durationHours} saat`
                        : tour.durationMinutes
                        ? `${Math.max(1, Math.round(tour.durationMinutes / 60))} saat`
                        : "—"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {tour.capacity ? `${tour.capacity} kişi` : "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(tour)}
                        className="text-primary font-medium hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tour)}
                        className="text-red-500 font-medium hover:underline"
                      >
                        Sil
                      </button>
                    </div>
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Turlar</h2>
        <button
          type="button"
          onClick={openCreateModal}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Tur Ekle
        </button>
      </div>
      {(categories.length === 0 || vehicles.length === 0) && !loading && (
        <p className="mb-4 text-sm text-amber-600">
          Tur eklemeden önce en az bir kategori ve bir araç oluşturmalısınız.
        </p>
      )}
      {renderContent()}

      {isModalOpen && (
        <AdminModal title={modalMode === "create" ? "Tur Ekle" : "Turu Düzenle"} onClose={closeModal}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Başlık</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.categoryId}
                    onChange={(e) => handleInputChange("categoryId", e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Kategori seçin
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Araç</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.vehicleId}
                    onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Araç seçin
                    </option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fiyat</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Görsel URL'si</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="https://..."
                  />
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">veya Görsel Yükle</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImage(file, "tour");
                          setFormState((prev) => ({ ...prev, imageUrl: url }));
                        } catch (error) {
                          console.error("Image upload failed:", error);
                          alert("Görsel yüklenemedi");
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Süre (saat)</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.durationHours}
                    onChange={(e) => handleInputChange("durationHours", e.target.value)}
                    required
                  >
                    {durationOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kapasite (kişi)</label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 bg-gray-100"
                    value={formState.capacity}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kısa Açıklama</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  rows={3}
                  value={formState.shortDescription}
                  onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Detaylı Açıklama</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  rows={4}
                  value={formState.longDescription}
                  onChange={(e) => handleInputChange("longDescription", e.target.value)}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formState.isActive}
                    onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className="text-sm font-medium text-gray-700">Öne Çıkan Tur</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-white shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {deleteTarget && (
        <AdminModal title="Turu Sil" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{deleteTarget.title}</span> turunu silmek istediğinizden emin misiniz?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-500 text-white shadow hover:bg-red-600"
            >
              Sil
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default ToursPage;

