import { FormEvent, useEffect, useState } from "react";
import AdminModal from "./AdminModal";
import {
  AdminCategory,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../api/admin";

interface CategoryFormState {
  name: string;
  slug: string;
}

const initialCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formState, setFormState] = useState<CategoryFormState>(initialCategoryForm);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Veriler yüklenemedi");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        if (!isMounted) {
          return;
        }
        setCategories(data);
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

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setFormState(initialCategoryForm);
    setSelectedCategoryId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: AdminCategory) => {
    setModalMode("edit");
    setSelectedCategoryId(category.id);
    setFormState({
      name: category.name,
      slug: category.slug,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (field: keyof CategoryFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formState.name.trim(),
      slug: formState.slug.trim(),
    };

    try {
      if (modalMode === "create") {
        await createCategory(payload);
      } else if (selectedCategoryId) {
        await updateCategory(selectedCategoryId, payload);
      }
      await loadCategories();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Kategori kaydedilemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteCategory(deleteTarget.id);
      await loadCategories();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      alert("Kategori silinemedi");
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

    if (categories.length === 0) {
      return renderState("Kayıt bulunamadı");
    }

    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{category.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{category.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="text-primary font-medium hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
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
        <h2 className="text-2xl font-semibold text-gray-900">Kategoriler</h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow hover:bg-primary/90 transition-colors"
        >
          Kategori Ekle
        </button>
      </div>
      {renderContent()}

      {isModalOpen && (
        <AdminModal
          title={modalMode === "create" ? "Kategori Ekle" : "Kategoriyi Düzenle"}
          onClose={closeModal}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
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
        <AdminModal title="Kategoriyi Sil" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{deleteTarget.name}</span> kategorisini silmek istediğinizden emin misiniz?
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

export default CategoriesPage;

