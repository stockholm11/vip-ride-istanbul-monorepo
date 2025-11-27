import { useEffect, useState } from "react";
import { getPublicFeaturedTransfers } from "../../api/public";
import { PublicFeaturedTransfer } from "../../types/public/FeaturedTransfer";

interface UseFeaturedTransfersResult {
  data: PublicFeaturedTransfer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFeaturedTransfers(): UseFeaturedTransfersResult {
  const [data, setData] = useState<PublicFeaturedTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getPublicFeaturedTransfers();
      setData(response);
      setError(null);
    } catch (err) {
      console.error("[useFeaturedTransfers] error:", err);
      setError("Öne çıkan transferler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}


