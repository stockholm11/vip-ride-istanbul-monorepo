import { useCallback, useEffect, useState } from "react";
import { getVehicles } from "../../api/public";
import { PublicVehicle } from "../../types/public";

interface UsePublicVehiclesResult {
  vehicles: PublicVehicle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePublicVehicles(): UsePublicVehiclesResult {
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
  };
}

