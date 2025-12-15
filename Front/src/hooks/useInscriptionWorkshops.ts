import { useState, useEffect, useCallback } from 'react';

interface Session {
  id: string;
  start_datetime: string;
  end_datetime: string;
  current_bookings: number;
  max_participants: number;
  available_spots: number;
  session_price: number;
  status: string;
  is_full: boolean;
  needs_min_participants: boolean;
}

interface Artisan {
  id: string;
  name: string;
  avatar: string | null;
}

interface InscriptionWorkshop {
  id: string;
  title: string;
  description: string;
  short_description: string;
  skill_level: string;
  base_price: number;
  currency: string;
  min_participants: number;
  max_participants: number;
  duration_minutes: number;
  address: string;
  featured_image_url: string;
  gallery_images: string[];
  materials_included: string[];
  what_you_will_learn: string[];
  tags: string[];
  artisan: Artisan;
  sessions: Session[];
}

interface UseInscriptionWorkshopsReturn {
  workshops: InscriptionWorkshop[];
  loading: boolean;
  error: string | null;
  loadInscriptionWorkshops: () => Promise<void>;
}

export const useInscriptionWorkshops = (): UseInscriptionWorkshopsReturn => {
  const [workshops, setWorkshops] = useState<InscriptionWorkshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInscriptionWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/v1/workshops/inscription/upcoming');
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWorkshops(data);
    } catch (err) {
      console.error('Erreur lors du chargement des ateliers sur inscription:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInscriptionWorkshops();
  }, [loadInscriptionWorkshops]);

  return {
    workshops,
    loading,
    error,
    loadInscriptionWorkshops,
  };
};

export default useInscriptionWorkshops;