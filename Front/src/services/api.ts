/**
 * Service API pour les appels backend
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ProductOut, ProductListResponse, CategoriesResponse, BulkOrderRequestOut } from '@/types/product';

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

