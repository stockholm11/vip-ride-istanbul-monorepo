import { FormEvent, useEffect, useState } from "react";
import AdminModal from "./AdminModal";
import {
  AdminAddOn,
  createAddOn,
  deleteAddOn,
  getAddOns,
  updateAddOn,
} from "../../api/admin";

interface AddOnFormState {
  name: string;
  shortDescription: string;
  price: string;
  isActive: boolean;
  displayOrder: string;
}

const initialAddOnForm: AddOnFormState = {
  name: "",
  shortDescription: "",
  price: "0",
  isActive: true,
  displayOrder: "0",
};

const AddOnsPage = () => {
  const [addOns, setAddOns] = useState<AdminAddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<AddOnFormState>(initialAddOnForm);
  const [selectedAddOnId, setSelectedAddOnId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminAddOn | null>(null);

  const loadAddOns = async () => {
    try {
      const data = await getAddOns();
      setAddOns(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Veriler yüklenemedi");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAddOns = async () => {
      setLoading(true);
      try {
        const data = await getAddOns();
        if (!isMounted) {
          return;
        }
        setAddOns(data);
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

    fetchAddOns();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setFormState(initialAddOnForm);
    setSelectedAddOnId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addOn: AdminAddOn) => {
    setModalMode("edit");
    setSelectedAddOnId(addOn.id);
    setFormState({
      name: addOn.name || "",
      shortDescription: addOn.shortDescription || "",
      price: addOn.price.toString(),
      isActive: addOn.isActive,
      displayOrder: addOn.displayOrder.toString(),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (field: keyof AddOnFormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formState.name.trim(),
      shortDescription: formState.shortDescription.trim() || null,
      price: parseFloat(formState.price) || 0,
      isActive: formState.isActive,
      displayOrder: parseInt(formState.displayOrder) || 0,
    };

    try {
      if (modalMode === "create") {
        await createAddOn(payload);
      } else if (selectedAddOnId) {
        await updateAddOn(selectedAddOnId, payload);
      }
      await loadAddOns();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Ek hizmet kaydedilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteAddOn(deleteTarget.id);
      await loadAddOns();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Ek hizmet silinemedi");
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

    if (addOns.length === 0) {
      return renderState("Kayıt bulunamadı");
    }

    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Fiyat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sıra</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Durum</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {addOns.map((addOn) => (
                <tr key={addOn.id}>
                  <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{addOn.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">€{addOn.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{addOn.displayOrder}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      addOn.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {addOn.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(addOn)}
                        className="text-primary font-medium hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(addOn)}
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
        <h2 className="text-2xl font-semibold text-gray-900">Ek Hizmetler</h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow hover:bg-primary/90 transition-colors"
        >
          Ek Hizmet Ekle
        </button>
      </div>
      {renderContent()}

      {isModalOpen && (
        <AdminModal
          title={modalMode === "create" ? "Ek Hizmet Ekle" : "Ek Hizmeti Düzenle"}
          onClose={closeModal}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad *</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                value={formState.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kısa Açıklama</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                value={formState.shortDescription}
                onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fiyat (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                value={formState.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
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
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-primary rounded border-gray-300"
                checked={formState.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                Aktif
              </label>
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
        <AdminModal title="Ek Hizmeti Sil" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{deleteTarget.name}</span> ek hizmetini silmek istediğinizden emin misiniz?
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

export default AddOnsPage;

