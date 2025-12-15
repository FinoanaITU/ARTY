import { useState, useCallback } from 'react';
import apiService from '@/services/api';
import type {
  WorkshopOut,
  WorkshopListResponse,
  WorkshopCreate,
  WorkshopUpdate,
  WorkshopSessionOut,
  WorkshopSessionCreate,
  WorkshopBookingOut,
  BookingConfirmation,
  AvailabilityResponse
} from '@/types/workshop';

interface FilterParams {
  type?: string;
  category?: string;
  skill_level?: string;
  search?: string;
  artisan_id?: string;
  page?: number;
  limit?: number;
}

export const useWorkshops = () => {
  const [workshops, setWorkshops] = useState<WorkshopOut[]>([]);
  const [workshopsList, setWorkshopsList] = useState<WorkshopListResponse | null>(null);
  const [currentWorkshop, setCurrentWorkshop] = useState<WorkshopOut | null>(null);
  const [sessions, setSessions] = useState<WorkshopSessionOut[]>([]);
  const [bookings, setBookings] = useState<WorkshopBookingOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workshops list with filtering
  const loadWorkshops = useCallback(async (filters?: FilterParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWorkshops(filters);
      setWorkshopsList(response);
      setWorkshops(response.items as any[]);
    } catch (err: any) {
      // Treat 404 as "no data" to enable mock fallback without error banner
      const status = err?.response?.status;
      if (status === 404) {
        setWorkshopsList({ items: [], total: 0, page: filters?.page || 1, pages: 0 } as any);
        setWorkshops([]);
        // Do not set error to keep UI clean and show fallback
      } else {
        setError(err.message || 'Failed to load workshops');
        console.error('Error loading workshops:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single workshop by ID
  const getWorkshop = useCallback(async (workshopId: string) => {
    try {
      setLoading(true);
      setError(null);
      const workshop = await apiService.getWorkshop(workshopId);
      setCurrentWorkshop(workshop);
      return workshop;
    } catch (err: any) {
      setError(err.message || 'Failed to load workshop');
      console.error('Error loading workshop:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get availability
  const getAvailability = useCallback(
    async (workshopId: string, startDate?: string, endDate?: string) => {
      try {
        setError(null);
        const availability = await apiService.getWorkshopAvailability(workshopId, startDate, endDate);
        return availability;
      } catch (err: any) {
        setError(err.message || 'Failed to load availability');
        console.error('Error loading availability:', err);
        return null;
      }
    },
    []
  );

  // Get sessions
  const getSessions = useCallback(
    async (workshopId: string, dateFrom?: string, dateTo?: string) => {
      try {
        setLoading(true);
        setError(null);
        const sessionList = await apiService.getWorkshopSessions(workshopId, {
          date_from: dateFrom,
          date_to: dateTo
        });
        setSessions(sessionList);
        return sessionList;
      } catch (err: any) {
        setError(err.message || 'Failed to load sessions');
        console.error('Error loading sessions:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Create workshop
  const createWorkshop = useCallback(async (data: WorkshopCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newWorkshop = await apiService.createWorkshop(data);
      setCurrentWorkshop(newWorkshop);
      return newWorkshop;
    } catch (err: any) {
      setError(err.message || 'Failed to create workshop');
      console.error('Error creating workshop:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update workshop
  const updateWorkshop = useCallback(async (workshopId: string, data: WorkshopUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apiService.updateWorkshop(workshopId, data);
      setCurrentWorkshop(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update workshop');
      console.error('Error updating workshop:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete workshop
  const deleteWorkshop = useCallback(async (workshopId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteWorkshop(workshopId);
      setCurrentWorkshop(null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete workshop');
      console.error('Error deleting workshop:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Publish workshop
  const publishWorkshop = useCallback(async (workshopId: string) => {
    try {
      setLoading(true);
      setError(null);
      const published = await apiService.publishWorkshop(workshopId);
      setCurrentWorkshop(published);
      return published;
    } catch (err: any) {
      setError(err.message || 'Failed to publish workshop');
      console.error('Error publishing workshop:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unpublish workshop
  const unpublishWorkshop = useCallback(async (workshopId: string) => {
    try {
      setLoading(true);
      setError(null);
      const unpublished = await apiService.unpublishWorkshop(workshopId);
      setCurrentWorkshop(unpublished);
      return unpublished;
    } catch (err: any) {
      setError(err.message || 'Failed to unpublish workshop');
      console.error('Error unpublishing workshop:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Archive workshop
  const archiveWorkshop = useCallback(async (workshopId: string) => {
    try {
      setLoading(true);
      setError(null);
      const archived = await apiService.archiveWorkshop(workshopId);
      setCurrentWorkshop(archived);
      return archived;
    } catch (err: any) {
      setError(err.message || 'Failed to archive workshop');
      console.error('Error archiving workshop:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create session
  const createSession = useCallback(
    async (workshopId: string, data: WorkshopSessionCreate) => {
      try {
        setLoading(true);
        setError(null);
        const session = await apiService.createWorkshopSession(workshopId, data);
        setSessions((prev) => [...prev, session]);
        return session;
      } catch (err: any) {
        setError(err.message || 'Failed to create session');
        console.error('Error creating session:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete session
  const deleteSession = useCallback(
    async (workshopId: string, sessionId: string) => {
      try {
        setLoading(true);
        setError(null);
        await apiService.deleteWorkshopSession(workshopId, sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to delete session');
        console.error('Error deleting session:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Book workshop
  const bookWorkshop = useCallback(
    async (workshopId: string, bookingData: any): Promise<BookingConfirmation | null> => {
      try {
        setLoading(true);
        setError(null);
        const confirmation = await apiService.bookWorkshop(workshopId, bookingData);
        return confirmation;
      } catch (err: any) {
        setError(err.message || 'Failed to book workshop');
        console.error('Error booking workshop:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
      console.error('Error canceling booking:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm booking
  const confirmBooking = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apiService.confirmBooking(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to confirm booking');
      console.error('Error confirming booking:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user bookings
  const getUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userBookings = await apiService.getUserBookings();
      setBookings(userBookings);
      return userBookings;
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      console.error('Error loading bookings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get workshop bookings (artisan)
  const getWorkshopBookings = useCallback(async (workshopId: string, params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const workshopBookings = await apiService.getWorkshopBookings(workshopId, params);
      setBookings(workshopBookings);
      return workshopBookings;
    } catch (err: any) {
      setError(err.message || 'Failed to load workshop bookings');
      console.error('Error loading workshop bookings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    workshops,
    workshopsList,
    currentWorkshop,
    sessions,
    bookings,
    loading,
    error,

    // Methods
    loadWorkshops,
    getWorkshop,
    getAvailability,
    getSessions,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    publishWorkshop,
    unpublishWorkshop,
    archiveWorkshop,
    createSession,
    deleteSession,
    bookWorkshop,
    cancelBooking,
    confirmBooking,
    getUserBookings,
    getWorkshopBookings,
  };
};
