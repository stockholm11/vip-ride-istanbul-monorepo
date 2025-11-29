import { FormEvent, useEffect, useState } from "react";
import AdminModal from "./AdminModal";
import {
  AdminVehicle,
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
  uploadImage,
  VehiclePayload,
} from "../../api/admin";

type VehicleType = "transfer" | "chauffeur";

interface VehicleFormState {
  name: string;
  slug: string;
  types: VehicleType[];
  capacity: string;
  basePrice: string;
  kmPrice: string;
  imageUrl: string;
  description: string;
}

const initialVehicleForm: VehicleFormState = {
  name: "",
  slug: "",
  types: ["transfer"],
  capacity: "1",
  basePrice: "0",
  kmPrice: "0",
  imageUrl: "",
  description: "",
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<VehicleFormState>(initialVehicleForm);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminVehicle | null>(null);

  const fetchVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Veriler yüklenemedi");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getVehicles();
        if (!isMounted) {
          return;
        }
        setVehicles(data);
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

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setFormState(initialVehicleForm);
    setSelectedVehicleId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: AdminVehicle) => {
    setModalMode("edit");
    setSelectedVehicleId(vehicle.id);
    
    // Normalize types: ensure it's always a valid array
    let normalizedTypes: VehicleType[] = ["transfer"];
    if (vehicle.types) {
      if (Array.isArray(vehicle.types) && vehicle.types.length > 0) {
        // Filter valid types and remove duplicates
        const validTypes = vehicle.types.filter(
          (t): t is VehicleType => t === "transfer" || t === "chauffeur"
        );
        normalizedTypes = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
      }
    }
    
    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[Vehicles.tsx] openEditModal - vehicle.types:", vehicle.types);
      console.log("[Vehicles.tsx] openEditModal - normalizedTypes:", normalizedTypes);
    }
    
    setFormState({
      name: vehicle.name,
      slug: vehicle.slug,
      types: normalizedTypes,
      capacity: vehicle.capacity.toString(),
      basePrice: vehicle.basePrice.toString(),
      kmPrice: vehicle.kmPrice.toString(),
      imageUrl: vehicle.imageUrl ?? "",
      description: vehicle.description ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (field: keyof VehicleFormState, value: string | VehicleType[]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypesChange = (value: VehicleType, checked: boolean) => {
    setFormState((prev) => {
      const currentTypes = prev.types || [];
      if (checked) {
        // Only add if not already in array
        if (!currentTypes.includes(value)) {
          return { ...prev, types: [...currentTypes, value] };
        }
        return prev;
      } else {
        const filtered = currentTypes.filter((t) => t !== value);
        // Ensure at least one type remains
        return { ...prev, types: filtered.length > 0 ? filtered : ["transfer"] };
      }
    });
  };

  const buildPayload = (): VehiclePayload => {
    // Ensure types is always a valid array
    let types: VehicleType[] = ["transfer"];
    if (Array.isArray(formState.types) && formState.types.length > 0) {
      // Filter valid types and remove duplicates
      const validTypes = formState.types.filter(
        (t): t is VehicleType => t === "transfer" || t === "chauffeur"
      );
      types = validTypes.length > 0 ? [...new Set(validTypes)] : ["transfer"];
    }

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("[Vehicles.tsx] buildPayload - formState.types:", formState.types);
      console.log("[Vehicles.tsx] buildPayload - final types:", types);
    }

    return {
      name: formState.name.trim(),
      slug: formState.slug.trim(),
      types,
      capacity: Number(formState.capacity),
      basePrice: Number(formState.basePrice),
      kmPrice: Number(formState.kmPrice),
      imageUrl: formState.imageUrl.trim() ? formState.imageUrl.trim() : null,
      description: formState.description.trim() ? formState.description.trim() : null,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      if (modalMode === "create") {
        await createVehicle(payload);
      } else if (selectedVehicleId) {
        await updateVehicle(selectedVehicleId, payload);
      }
      await fetchVehicles();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Araç kaydedilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteVehicle(deleteTarget.id);
      await fetchVehicles();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Araç silinemedi");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Yükleniyor...
        </div>
      );
    }

    if (error) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-red-500">
          {error}
        </div>
      );
    }

    if (vehicles.length === 0) {
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Kayıt bulunamadı
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-dashed border-gray-200">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Araç</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tür</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Kapasite</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">{vehicle.name}</div>
                  <div className="text-xs text-gray-500">{vehicle.slug}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {vehicle.types && vehicle.types.length > 0
                    ? vehicle.types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
                    : "Transfer"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{vehicle.capacity}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(vehicle)}
                      className="text-primary font-medium hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(vehicle)}
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
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Araçlar</h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow hover:bg-primary/90 transition-colors"
        >
          Araç Ekle
        </button>
      </div>
      {renderContent()}

      {isModalOpen && (
        <AdminModal
          title={modalMode === "create" ? "Araç Ekle" : "Aracı Düzenle"}
          onClose={closeModal}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Türler</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={formState.types.includes("transfer")}
                        onChange={(e) => handleTypesChange("transfer", e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Transfer</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={formState.types.includes("chauffeur")}
                        onChange={(e) => handleTypesChange("chauffeur", e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Şoförlü</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Baz Ücret (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.basePrice}
                    onChange={(e) => handleInputChange("basePrice", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">KM Ücreti (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                    value={formState.kmPrice}
                    onChange={(e) => handleInputChange("kmPrice", e.target.value)}
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
                          const url = await uploadImage(file, "vehicle");
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  rows={3}
                  value={formState.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
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
        <AdminModal title="Aracı Sil" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{deleteTarget.name}</span> aracını silmek istediğinizden emin misiniz?
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

export default VehiclesPage;

