import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminModal from "./AdminModal";
import {
  AdminFeaturedTransfer,
  createFeaturedTransfer,
  deleteFeaturedTransfer,
  getAdminFeaturedTransfers,
  updateFeaturedTransfer,
} from "../../api/admin";
import { AdminVehicle, getVehicles as getAdminVehicles } from "../../api/admin/adminVehiclesApi";

interface FeaturedTransferFormState {
  vehicleId: string;
  fromLocation: string;
  toLocation: string;
  estimatedTime: string;
  basePrice: string;
  displayOrder: string;
  isActive: boolean;
}

const initialFormState: FeaturedTransferFormState = {
  vehicleId: "",
  fromLocation: "",
  toLocation: "",
  estimatedTime: "",
  basePrice: "",
  displayOrder: "0",
  isActive: true,
};

const FeaturedTransfersPage = () => {
  const [transfers, setTransfers] = useState<AdminFeaturedTransfer[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<FeaturedTransferFormState>(initialFormState);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminFeaturedTransfer | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transferData, vehicleData] = await Promise.all([
        getAdminFeaturedTransfers(),
        getAdminVehicles(),
      ]);
      setTransfers(transferData);
      setVehicles(vehicleData);
      setError(null);
    } catch (err) {
      console.error("[FeaturedTransfersPage] loadData error:", err);
      setError("Öne çıkan transferler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setFormState(initialFormState);
    setSelectedTransferId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transfer: AdminFeaturedTransfer) => {
    setModalMode("edit");
    setSelectedTransferId(transfer.id);
    setFormState({
      vehicleId: transfer.vehicleId ?? "",
      fromLocation: transfer.fromLocation,
      toLocation: transfer.toLocation,
      estimatedTime: transfer.estimatedTime,
      basePrice: transfer.basePrice.toString(),
      displayOrder: transfer.displayOrder?.toString() ?? "0",
      isActive: transfer.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsModalOpen(false);
  };

  const handleInputChange = <K extends keyof FeaturedTransferFormState>(
    key: K,
    value: FeaturedTransferFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.vehicleId) {
      alert("Lütfen bir araç seçin");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      vehicleId: formState.vehicleId,
      fromLocation: formState.fromLocation.trim(),
      toLocation: formState.toLocation.trim(),
      estimatedTime: formState.estimatedTime.trim(),
      basePrice: Number(formState.basePrice) || 0,
      displayOrder: Number(formState.displayOrder) || 0,
      isActive: formState.isActive,
    };

    try {
      if (modalMode === "create") {
        await createFeaturedTransfer(payload);
      } else if (selectedTransferId) {
        await updateFeaturedTransfer(selectedTransferId, payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("[FeaturedTransfersPage] handleSubmit error:", err);
      alert("Öne çıkan transfer kaydedilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteFeaturedTransfer(deleteTarget.id);
      await loadData();
      setDeleteTarget(null);
    } catch (err) {
      console.error("[FeaturedTransfersPage] handleDelete error:", err);
      alert("Öne çıkan transfer silinemedi");
    }
  };

  const sortedTransfers = useMemo(() => {
    return [...transfers].sort((a, b) => {
      if (a.displayOrder === b.displayOrder) {
        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      }
      return a.displayOrder - b.displayOrder;
    });
  }, [transfers]);

  const getVehicleLabel = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      return "Bilinmiyor";
    }
    return `${vehicle.name} (${vehicle.capacity} yolcu)`;
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

  const renderTable = () => {
    if (loading) {
      return renderState("Yükleniyor...");
    }

    if (error) {
      return renderState(error, true);
    }

    if (sortedTransfers.length === 0) {
      return renderState("Öne çıkan transfer kaydı bulunamadı");
    }

    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rota</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Araç</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Süre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fiyat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Durum</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTransfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {transfer.fromLocation}
                    </div>
                    <div className="text-sm text-gray-500">{transfer.toLocation}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {transfer.vehicleName || getVehicleLabel(transfer.vehicleId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{transfer.estimatedTime}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    €{transfer.basePrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transfer.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {transfer.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(transfer)}
                        className="text-primary font-medium hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(transfer)}
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Öne Çıkan Transferler</h2>
          <p className="text-gray-600 text-sm mt-1">
            Ana sayfada gösterilecek transfer rotalarını burada yönetebilirsiniz.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow hover:bg-primary/90 transition-colors"
        >
          Yeni Öne Çıkan Transfer
        </button>
      </div>

      {renderTable()}

      {isModalOpen && (
        <AdminModal
          title={modalMode === "create" ? "Öne Çıkan Transfer Ekle" : "Öne Çıkan Transferi Düzenle"}
          onClose={closeModal}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Araç *</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                value={formState.vehicleId}
                onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                required
              >
                <option value="">Araç seçin</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.capacity} yolcu)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Başlangıç *</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.fromLocation}
                  onChange={(e) => handleInputChange("fromLocation", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bitiş *</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.toLocation}
                  onChange={(e) => handleInputChange("toLocation", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tahmini Süre *</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.estimatedTime}
                  onChange={(e) => handleInputChange("estimatedTime", e.target.value)}
                  placeholder="Örn: 45-60 dakika"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sıralama</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.displayOrder}
                  onChange={(e) => handleInputChange("displayOrder", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fiyat (€) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                  value={formState.basePrice}
                  onChange={(e) => handleInputChange("basePrice", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ayarlar</label>
                <div className="mt-2 flex flex-col gap-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary rounded border-gray-300"
                      checked={formState.isActive}
                      onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    />
                    Aktif
                  </label>
                </div>
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
                className="px-4 py-2 rounded-lg bg-primary text-white shadow hover:bg-primary/90 disabled:opacity-60"
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {deleteTarget && (
        <AdminModal title="Öne Çıkan Transferi Sil" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {deleteTarget.fromLocation} → {deleteTarget.toLocation}
            </span>{" "}
            rotasını silmek istediğinizden emin misiniz?
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

export default FeaturedTransfersPage;


