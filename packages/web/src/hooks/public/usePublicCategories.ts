import { useCallback, useEffect, useState } from "react";
import { getCategories } from "../../api/public";
import { PublicCategory } from "../../types/public";

interface UsePublicCategoriesResult {
  categories: PublicCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePublicCategories(): UsePublicCategoriesResult {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

