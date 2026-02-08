/**
 * Service API pour les appels backend
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ProductOut, ProductListResponse, CategoriesResponse, BulkOrderRequestOut } from '@/types/product';
import type { 
  WorkshopOut, 
  WorkshopListResponse, 
  WorkshopCreate, 
  WorkshopUpdate,
  WorkshopSessionOut,
  WorkshopSessionCreate,
  WorkshopBookingOut,
  WorkshopBookingCreate,
  BookingConfirmation,
  AvailabilityResponse
} from '@/types/workshop';
import type {
  PendingValidationsResponse,
  ValidationStats,
  ValidationResponse,
  PlatformOverview,
  RevenueStats,
  ArtisanStats,
  ConversionStats,
  UserBehaviorStats,
  PaymentListResponse,
  PaymentTrackingOut,
  RecordPaymentRequest,
  PayoutListResponse,
  ArtisanPayoutOut,
  GeneratePayoutRequest,
  MarkPayoutPaidRequest,
  SubscriptionOut,
  SubscriptionListResponse,
  SubscriptionOverviewResponse,
  SubscriptionCancelRequest,
  SubscriptionExtendRequest,
  SubscriptionAddCreditsRequest,
  SubscriptionHistoryResponse,
  SubscriptionStatsResponse
} from '@/types/admin';
import type {
  Quote,
  QuoteRequestIn,
  QuoteUpdateIn,
  QuoteListResponse,
  QuoteSummaryResponse,
  QuoteConversionResponse,
  QuoteStats
} from '@/types/quote';

// Base URL: prefer env var, fallback to FastAPI default '/api' (no version)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token JWT aux requêtes
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs et refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Si erreur 401 et pas déjà une requête de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                { refresh_token: refreshToken }
              );
              const { access_token, refresh_token } = response.data;
              this.setTokens(access_token, refresh_token);
              
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Gestion des tokens
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Auth endpoints
  async registerBuyer(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    country: string;
    buyer_type: 'particulier' | 'entreprise';
    company_name?: string;
    siret?: string;
  }) {
    const response = await this.api.post('/auth/register/buyer', data);
    return response.data;
  }

  async registerArtisan(
    data: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      region: string;
      city: string;
      address?: string;
      languages?: string[];
      company_name: string;
      main_specialty: string;
      other_skills?: string[];
      years_experience?: string;
      activity_description: string;
      brand_story?: string;
      offerings: string[];
      nif?: string;
      stat?: string;
      documents_not_available: boolean;
    },
    photos?: File[]
  ) {
    const formData = new FormData();
    
    // Ajouter les champs textuels
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Convertir les tableaux en JSON string ou liste séparée par virgules
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Ajouter les photos
    if (photos && photos.length > 0) {
      photos.slice(0, 5).forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await this.api.post('/auth/register/artisan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }

  /**
   * Récupère la liste des utilisateurs avec filtres
   * @param role - Filtre par rôle (artisan/client/admin)
   * @param skip - Pagination
   * @param limit - Pagination
   */
  // NOTE: Endpoint GET /users n'existe pas dans le backend
  // Pour récupérer la liste des utilisateurs/artisans, utiliser:
  // - getAdminArtisanStats() pour les statistiques artisans
  // - getArtisan(id) pour un artisan spécifique
  /*
  async getUsers(params?: {
    role?: string;
    skip?: number;
    limit?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.order) searchParams.append('order', params.order);
    
    const response = await this.api.get(`/users?${searchParams.toString()}`);
    return response.data;
  }
  */

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Continue même si erreur
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Product endpoints
  async getProducts(params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    artisan_id?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ProductListResponse> {
    const response = await this.api.get('/products/', { params });
    return response.data;
  }

  async getProduct(productId: string): Promise<ProductOut> {
    const response = await this.api.get(`/products/${productId}`);
    return response.data;
  }

  async createProduct(
    data: {
      name: string;
      description: string;
      category: string;
      subcategory?: string;
      price: number;
      materials?: string[];
      available_colors?: string[];
      stock: number;
      customizable?: boolean;
      production_time_days: number;
      bulk_order_enabled?: boolean;
      min_bulk_quantity?: number;
      dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        weight?: number;
      };
    },
    photos?: File[]
  ): Promise<ProductOut> {
    const formData = new FormData();
    
    // Ajouter les champs textuels
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'dimensions') {
          // Dimensions sont envoyées séparément
          const dims = value as { length?: number; width?: number; height?: number; weight?: number };
          if (dims.length !== undefined) formData.append('dimensions_length', String(dims.length));
          if (dims.width !== undefined) formData.append('dimensions_width', String(dims.width));
          if (dims.height !== undefined) formData.append('dimensions_height', String(dims.height));
          if (dims.weight !== undefined) formData.append('dimensions_weight', String(dims.weight));
        } else if (Array.isArray(value)) {
          // Convertir les tableaux en liste séparée par virgules pour le backend
          formData.append(key, value.join(','));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Ajouter les photos
    if (photos && photos.length > 0) {
      photos.slice(0, 10).forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await this.api.post('/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProduct(
    productId: string,
    data: {
      name?: string;
      description?: string;
      category?: string;
      subcategory?: string;
      price?: number;
      materials?: string[];
      available_colors?: string[];
      stock?: number;
      customizable?: boolean;
      production_time_days?: number;
      bulk_order_enabled?: boolean;
      min_bulk_quantity?: number;
      dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        weight?: number;
      };
      status?: string;
    },
    photos?: File[],
    delete_image_ids?: string[]
  ): Promise<ProductOut> {
    const formData = new FormData();
    
    // Ajouter les champs textuels
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'dimensions') {
          // Dimensions sont envoyées séparément
          const dims = value as { length?: number; width?: number; height?: number; weight?: number };
          if (dims.length !== undefined) formData.append('dimensions_length', String(dims.length));
          if (dims.width !== undefined) formData.append('dimensions_width', String(dims.width));
          if (dims.height !== undefined) formData.append('dimensions_height', String(dims.height));
          if (dims.weight !== undefined) formData.append('dimensions_weight', String(dims.weight));
        } else if (Array.isArray(value)) {
          // Convertir les tableaux en liste séparée par virgules pour le backend
          formData.append(key, value.join(','));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    if (photos && photos.length > 0) {
      photos.slice(0, 10).forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    // Image deletions (sent as JSON)
    if (delete_image_ids && delete_image_ids.length > 0) {
      formData.append('delete_image_ids', JSON.stringify(delete_image_ids));
    }

    const response = await this.api.patch(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProduct(productId: string) {
    const response = await this.api.delete(`/products/${productId}`);
    return response.data;
  }

  async publishProduct(productId: string): Promise<ProductOut> {
    const formData = new FormData();
    formData.append('status', 'published');
    const response = await this.api.patch(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async unpublishProduct(productId: string): Promise<ProductOut> {
    const formData = new FormData();
    formData.append('status', 'draft');
    const response = await this.api.patch(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getCategories(): Promise<CategoriesResponse> {
    const response = await this.api.get('/products/categories');
    return response.data;
  }

  async getSimilarProducts(productId: string, limit: number = 3): Promise<ProductListResponse> {
    const response = await this.api.get(`/products/${productId}/similar`, {
      params: { limit }
    });
    return response.data;
  }

  async createBulkOrderRequest(
    productId: string,
    data: {
      quantity: number;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      company?: string;
      message?: string;
    }
  ): Promise<BulkOrderRequestOut> {
    const response = await this.api.post(`/products/${productId}/bulk-order-request`, data);
    return response.data;
  }

  // Workshop endpoints
  async getWorkshops(params?: {
    type?: string;
    category?: string;
    skill_level?: string;
    search?: string;
    artisan_id?: string;
    page?: number;
    limit?: number;
  }): Promise<WorkshopListResponse> {
    // Backend expects 'skip' and 'limit'; map page to skip
    const query: any = { ...params };
    if (params?.page && params?.limit) {
      query.skip = (params.page - 1) * params.limit;
      delete query.page;
    }
    const response = await this.api.get('/workshops', { params: query });
    return response.data;
  }

  async getWorkshop(workshopId: string): Promise<WorkshopOut> {
    const response = await this.api.get(`/workshops/${workshopId}`);
    return response.data;
  }

  async getWorkshopAvailability(
    workshopId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AvailabilityResponse> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await this.api.get(`/workshops/${workshopId}/availability`, { params });
    return response.data;
  }

  async getWorkshopSessions(
    workshopId: string,
    params?: { date_from?: string; date_to?: string }
  ): Promise<WorkshopSessionOut[]> {
    const response = await this.api.get(`/workshops/${workshopId}/sessions`, { params });
    return response.data;
  }

  async getWorkshopBookings(
    workshopId: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<WorkshopBookingOut[]> {
    const response = await this.api.get(`/workshops/${workshopId}/bookings`, { params });
    return response.data;
  }

  async createWorkshop(data: WorkshopCreate, publish: boolean = false): Promise<WorkshopOut> {
    const response = await this.api.post('/workshops/json', data, {
      params: { publish }
    });
    return response.data;
  }

  async createWorkshopWithPhotos(data: WorkshopCreate, photos?: File[], publish: boolean = false): Promise<WorkshopOut> {
    const formData = new FormData();
    
    // Ajouter les données du formulaire
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.short_description) formData.append('short_description', data.short_description);
    formData.append('category', data.category);
    formData.append('workshop_type', data.workshop_type);
    formData.append('skill_level', data.skill_level);
    formData.append('base_price', data.base_price.toString());
    if (data.foreign_price) formData.append('foreign_price', data.foreign_price.toString());
    formData.append('max_participants', data.max_participants.toString());
    formData.append('min_participants', (data.min_participants || 1).toString());
    formData.append('duration_minutes', data.duration_minutes.toString());
    formData.append('location', data.location);
    if (data.address) formData.append('address', data.address);
    
    // Ajouter les listes JSON
    if (data.materials_included) formData.append('materials_included', JSON.stringify(data.materials_included));
    if (data.materials_to_bring) formData.append('materials_to_bring', JSON.stringify(data.materials_to_bring));
    if (data.prerequisites) formData.append('prerequisites', data.prerequisites);
    if (data.what_you_will_learn) formData.append('what_you_will_learn', JSON.stringify(data.what_you_will_learn));
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    
    // Ajouter les photos
    if (photos) {
      photos.forEach((photo, index) => {
        formData.append('photos', photo);
      });
    }
    
    const response = await this.api.post('/workshops', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { publish }
    });
    return response.data;
  }

  async updateWorkshop(workshopId: string, data: WorkshopUpdate): Promise<WorkshopOut> {
    const response = await this.api.patch(`/workshops/${workshopId}`, data);
    return response.data;
  }

  async deleteWorkshop(workshopId: string): Promise<void> {
    await this.api.delete(`/workshops/${workshopId}`);
  }

  async publishWorkshop(workshopId: string): Promise<WorkshopOut> {
    const response = await this.api.post(`/workshops/${workshopId}/publish`);
    return response.data;
  }

  async unpublishWorkshop(workshopId: string): Promise<WorkshopOut> {
    const response = await this.api.post(`/workshops/${workshopId}/unpublish`);
    return response.data;
  }

  async archiveWorkshop(workshopId: string): Promise<WorkshopOut> {
    const response = await this.api.post(`/workshops/${workshopId}/archive`);
    return response.data;
  }

  async createWorkshopSession(
    workshopId: string,
    data: WorkshopSessionCreate
  ): Promise<WorkshopSessionOut> {
    const response = await this.api.post(`/workshops/${workshopId}/sessions`, data);
    return response.data;
  }

  async deleteWorkshopSession(workshopId: string, sessionId: string): Promise<void> {
    await this.api.delete(`/workshops/${workshopId}/sessions/${sessionId}`);
  }

  async bookWorkshop(workshopId: string, data: WorkshopBookingCreate): Promise<BookingConfirmation> {
    const response = await this.api.post(`/workshops/${workshopId}/book`, data);
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await this.api.post(`/bookings/${bookingId}/cancel`);
  }

  async confirmBooking(bookingId: string): Promise<WorkshopBookingOut> {
    const response = await this.api.post(`/bookings/${bookingId}/confirm`);
    return response.data;
  }

  async getUserBookings(): Promise<WorkshopBookingOut[]> {
    const response = await this.api.get('/bookings/user');
    return response.data;
  }

  // Cart endpoints
  async getCart() {
    const response = await this.api.get('/carts/me');
    return response.data;
  }

  async addToCart(data: {
    product_id: string;
    quantity: number;
    customization_notes?: string;
  }) {
    const response = await this.api.post('/carts/items', data);
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.api.patch(`/carts/items/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId: string) {
    const response = await this.api.delete(`/carts/items/${itemId}`);
    return response.data;
  }

  async clearCart() {
    await this.api.delete('/carts/');
  }

  // Order endpoints
  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.api.get('/orders/', { params });
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  async createOrder(data: {
    cart_id: string;
    shipping_address: any;
    billing_address?: any;
    shipping_method?: string;
    notes?: string;
  }) {
    const response = await this.api.post('/orders/', data);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string, comment?: string) {
    const response = await this.api.patch(`/orders/${orderId}/status`, { status, comment });
    return response.data;
  }

  // Artisan stats endpoint
  async getArtisanStats() {
    const response = await this.api.get('/analytics/artisan/stats');
    const data = response.data;
    
    // Map backend snake_case to frontend camelCase
    return {
      totalSales: data.total_revenue || 0,
      ordersThisMonth: data.monthly_sales || 0,
      rating: data.average_rating || 0,
      totalProducts: data.total_products || 0
    };
  }

  // Review endpoints
  async getProductReviews(productId: string, params?: { page?: number; limit?: number }) {
    const response = await this.api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  }

  async createReview(data: {
    product_id: string;
    order_item_id: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) {
    const response = await this.api.post(`/products/${data.product_id}/reviews`, data);
    return response.data;
  }

  async voteReviewHelpful(reviewId: string, helpful: boolean) {
    const response = await this.api.post(`/reviews/${reviewId}/vote`, { helpful });
    return response.data;
  }

  // Unavailability endpoints
  async getUnavailabilities() {
    const response = await this.api.get('/unavailabilities');
    return response.data.items || [];
  }

  async createUnavailability(data: {
    start_date: string;
    end_date?: string;
    reason?: string;
    type: 'single' | 'range';
  }) {
    const response = await this.api.post('/unavailabilities', data);
    return response.data;
  }

  async deleteUnavailability(unavailabilityId: string) {
    await this.api.delete(`/unavailabilities/${unavailabilityId}`);
  }

  // User profile endpoints
  async updateUserProfile(data: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    profile_image?: string;
  }) {
    const response = await this.api.put('/users/me', data);
    return response.data;
  }

  async updateArtisanProfile(data: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    specialty?: string;
    experience_years?: number;
    location?: string;
    description?: string;
    documents?: any;
  }) {
    const response = await this.api.put('/users/me/artisan', data);
    return response.data;
  }

  // ===== ADMIN VALIDATION ENDPOINTS =====
  
  /**
   * Récupère la liste des validations en attente
   * @param validationType - Type de validation (profile/product/workshop/all)
   * @param skip - Nombre d'items à sauter pour la pagination
   * @param limit - Nombre d'items à retourner
   */
  async getAdminPendingValidations(
    validationType?: string,
    skip: number = 0,
    limit: number = 50
  ) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    if (validationType) {
      params.append('validation_type', validationType);
    }
    
    const response = await this.api.get(`/admin/validations/pending?${params.toString()}`);
    return response.data;
  }

  /**
   * Valider un profil artisan (approve/reject)
   * @param artisanId - ID de l'artisan
   * @param action - Action (approve/reject)
   * @param notes - Notes optionnelles de l'administrateur
   */
  async validateArtisanProfile(
    artisanId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) {
    const response = await this.api.post(
      `/admin/validations/artisan/${artisanId}`,
      { action, notes }
    );
    return response.data;
  }

  /**
   * Valider un produit (approve/reject)
   * @param productId - ID du produit
   * @param action - Action (approve/reject)
   * @param notes - Notes optionnelles de l'administrateur
   */
  async validateProduct(
    productId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) {
    const response = await this.api.post(
      `/admin/validations/product/${productId}`,
      { action, notes }
    );
    return response.data;
  }

  /**
   * Valider un atelier (approve/reject)
   * @param workshopId - ID de l'atelier
   * @param action - Action (approve/reject)
   * @param notes - Notes optionnelles de l'administrateur
   */
  async validateWorkshop(
    workshopId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) {
    const response = await this.api.post(
      `/admin/validations/workshop/${workshopId}`,
      { action, notes }
    );
    return response.data;
  }

  /**
   * Récupère les statistiques de validation
   * @param period - Période (day/week/month/all)
   */
  async getValidationStats(period: string = 'month') {
    const response = await this.api.get(`/admin/validations/stats?period=${period}`);
    return response.data;
  }

  // ===== ADMIN ANALYTICS ENDPOINTS (PHASE 2) =====
  
  /**
   * Récupère la vue d'ensemble de la plateforme
   */
  async getAdminPlatformOverview(): Promise<PlatformOverview> {
    const response = await this.api.get('/admin/analytics/overview');
    return response.data;
  }

  /**
   * Récupère les statistiques de revenus
   * @param period - Période (day/week/month/year/all)
   * @param startDate - Date de début (format: YYYY-MM-DD)
   * @param endDate - Date de fin (format: YYYY-MM-DD)
   */
  async getAdminRevenueStats(
    period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month',
    startDate?: string,
    endDate?: string
  ): Promise<RevenueStats> {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await this.api.get(`/admin/analytics/revenue?${params.toString()}`);
    return response.data;
  }

  /**
   * Récupère les statistiques des artisans
   */
  async getAdminArtisanStats(): Promise<ArtisanStats> {
    const response = await this.api.get('/admin/analytics/artisans');
    return response.data;
  }

  /**
   * Récupère les statistiques de conversion
   */
  async getAdminConversionStats(): Promise<ConversionStats> {
    const response = await this.api.get('/admin/analytics/conversion');
    return response.data;
  }

  /**
   * Récupère les statistiques de comportement utilisateurs
   */
  async getAdminUserBehaviorStats(): Promise<UserBehaviorStats> {
    const response = await this.api.get('/admin/analytics/users');
    return response.data;
  }

  // ===== ADMIN PAYMENT TRACKING ENDPOINTS (PHASE 3) =====

  /**
   * Récupère la liste des paiements
   * @param paymentStatus - Filtre par statut (unpaid/partial/paid/pending_collection)
   * @param artisanType - Filtre par type artisan (artizaho/uber)
   * @param skip - Pagination
   * @param limit - Pagination
   */
  async getAdminPayments(
    paymentStatus?: string,
    artisanType?: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<PaymentListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (paymentStatus) params.append('payment_status', paymentStatus);
    if (artisanType) params.append('artisan_type', artisanType);

    const response = await this.api.get(`/admin/payments?${params.toString()}`);
    return response.data;
  }

  /**
   * Récupère un paiement par ID
   * @param paymentId - ID du paiement
   */
  async getAdminPaymentById(paymentId: string): Promise<PaymentTrackingOut> {
    const response = await this.api.get(`/admin/payments/${paymentId}`);
    return response.data;
  }

  /**
   * Enregistrer un paiement (total/partiel)
   * @param paymentId - ID du paiement
   * @param data - Détails de paiement
   */
  async recordAdminPayment(
    paymentId: string,
    data: RecordPaymentRequest
  ): Promise<PaymentTrackingOut> {
    const response = await this.api.post(`/admin/payments/${paymentId}/record`, data);
    return response.data;
  }

  /**
   * Récupère les payouts artisans en attente
   */
  async getAdminPendingPayouts(
    skip: number = 0,
    limit: number = 50
  ): Promise<PayoutListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    const response = await this.api.get(`/admin/payouts/pending?${params.toString()}`);
    return response.data;
  }

  /**
   * Générer un payout artisan pour une période
   */
  async generateAdminPayout(
    data: GeneratePayoutRequest
  ): Promise<ArtisanPayoutOut> {
    const response = await this.api.post('/admin/payouts/generate', data);
    return response.data;
  }

  /**
   * Marquer un payout comme payé
   */
  async markAdminPayoutPaid(
    payoutId: string,
    data: MarkPayoutPaidRequest
  ): Promise<ArtisanPayoutOut> {
    const response = await this.api.post(`/admin/payouts/${payoutId}/mark-paid`, data);
    return response.data;
  }

  /**
   * Historique payouts d'un artisan
   */
  async getAdminPayoutHistory(
    artisanId: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<PayoutListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    const response = await this.api.get(`/admin/payouts/${artisanId}/history?${params.toString()}`);
    return response.data;
  }

  // ===== QUOTE MANAGEMENT ENDPOINTS =====

  /**
   * Créer une demande de devis
   */
  async createQuoteRequest(data: QuoteRequestIn): Promise<QuoteSummaryResponse> {
    const response = await this.api.post('/admin/quotes', data);
    return response.data;
  }

  /**
   * Récupérer tous les devis (admin)
   */
  async getAllQuotes(
    status?: string,
    quoteType?: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<QuoteListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    if (quoteType) params.append('quote_type', quoteType);
    
    const response = await this.api.get(`/admin/quotes?${params.toString()}`);
    return response.data;
  }

  /**
   * Récupérer mes demandes de devis (user)
   */
  async getMyQuotes(skip: number = 0, limit: number = 50): Promise<QuoteListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    const response = await this.api.get(`/admin/quotes/my?${params.toString()}`);
    return response.data;
  }

  /**
   * Récupérer les détails d'un devis
   */
  async getQuoteDetails(quoteId: string): Promise<Quote> {
    const response = await this.api.get(`/admin/quotes/${quoteId}`);
    return response.data;
  }

  /**
   * Mettre à jour un devis (admin: prix + notes)
   */
  async updateQuote(quoteId: string, data: QuoteUpdateIn): Promise<QuoteSummaryResponse> {
    const response = await this.api.patch(`/admin/quotes/${quoteId}`, data);
    return response.data;
  }

  /**
   * Approuver un devis (client)
   */
  async approveQuote(quoteId: string): Promise<QuoteSummaryResponse> {
    const response = await this.api.post(`/admin/quotes/${quoteId}/approve`, {});
    return response.data;
  }

  /**
   * Rejeter un devis (client)
   */
  async rejectQuote(quoteId: string): Promise<QuoteSummaryResponse> {
    const response = await this.api.post(`/admin/quotes/${quoteId}/reject`, {});
    return response.data;
  }

  /**
   * Convertir un devis en commande
   */
  async convertQuoteToOrder(quoteId: string): Promise<QuoteConversionResponse> {
    const response = await this.api.post(`/admin/quotes/${quoteId}/convert-to-order`, {});
    return response.data;
  }

  /**
   * Récupérer les statistiques des devis
   */
  async getQuoteStats(): Promise<QuoteStats> {
    const response = await this.api.get('/admin/quotes/stats/overview');
    return response.data;
  }

  // ===== SUBSCRIPTION ADMIN ENDPOINTS (PHASE 5) =====

  /**
   * Vue d'ensemble des abonnements
   */
  async getSubscriptionsOverview(): Promise<SubscriptionOverviewResponse> {
    const response = await this.api.get('/admin/subscriptions/overview');
    return response.data;
  }

  /**
   * Liste des abonnements avec filtres
   */
  async getSubscriptionsList(
    status?: string,
    plan?: string,
    userId?: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<SubscriptionListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    if (plan) params.append('plan', plan);
    if (userId) params.append('user_id', userId);
    
    const response = await this.api.get(`/admin/subscriptions/list?${params.toString()}`);
    return response.data;
  }

  /**
   * Détails complets d'un abonnement
   */
  async getSubscriptionDetail(subscriptionId: string): Promise<SubscriptionOut> {
    const response = await this.api.get(`/admin/subscriptions/${subscriptionId}`);
    return response.data;
  }

  /**
   * Annuler un abonnement (action admin)
   */
  async cancelSubscription(
    subscriptionId: string,
    data: SubscriptionCancelRequest
  ): Promise<SubscriptionOut> {
    const response = await this.api.post(`/admin/subscriptions/${subscriptionId}/cancel`, data);
    return response.data;
  }

  /**
   * Prolonger un abonnement (geste commercial)
   */
  async extendSubscription(
    subscriptionId: string,
    data: SubscriptionExtendRequest
  ): Promise<SubscriptionOut> {
    const response = await this.api.post(`/admin/subscriptions/${subscriptionId}/extend`, data);
    return response.data;
  }

  /**
   * Ajouter des crédits bonus à un abonnement
   */
  async addBonusCredits(
    subscriptionId: string,
    data: SubscriptionAddCreditsRequest
  ): Promise<SubscriptionOut> {
    const response = await this.api.post(`/admin/subscriptions/${subscriptionId}/add-credits`, data);
    return response.data;
  }

  /**
   * Historique des modifications d'un abonnement  
   */
  async getSubscriptionHistory(
    subscriptionId: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<SubscriptionHistoryResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    const response = await this.api.get(`/admin/subscriptions/${subscriptionId}/history?${params.toString()}`);
    return response.data;
  }

  /**
   * Statistiques détaillées des abonnements
   */
  async getSubscriptionStats(): Promise<SubscriptionStatsResponse> {
    const response = await this.api.get('/admin/subscriptions/stats/detailed');
    return response.data;
  }

  // Méthodes génériques pour d'autres endpoints
  get(endpoint: string, config?: any) {
    return this.api.get(endpoint, config);
  }

  post(endpoint: string, data?: any, config?: any) {
    return this.api.post(endpoint, data, config);
  }

  put(endpoint: string, data?: any, config?: any) {
    return this.api.put(endpoint, data, config);
  }

  patch(endpoint: string, data?: any, config?: any) {
    return this.api.patch(endpoint, data, config);
  }

  delete(endpoint: string, config?: any) {
    return this.api.delete(endpoint, config);
  }
}

// Export instance singleton
export const apiService = new ApiService();
export default apiService;

