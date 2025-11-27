import { useCallback, useEffect, useState } from "react";
import { getTours } from "../../api/public";
import { PublicTour } from "../../types/public";

interface UsePublicToursResult {
  tours: PublicTour[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePublicTours(): UsePublicToursResult {
  const [tours, setTours] = useState<PublicTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTours();
      setTours(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load tours");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  return {
    tours,
    loading,
    error,
    refetch: fetchTours,
  };
}

