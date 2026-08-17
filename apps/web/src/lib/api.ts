const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const authToken = token || this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401) {
      // Try refresh token
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            headers['Authorization'] = `Bearer ${data.token}`;
            const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, { ...fetchOptions, headers });
            if (!retryResponse.ok) {
              const error = await retryResponse.json().catch(() => ({}));
              throw new Error(error.error || 'İstek başarısız.');
            }
            return retryResponse.json();
          }
        } catch {
          // Refresh failed, clear tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/giris';
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status} hatası`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  async register(data: any) {
    return this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Branches
  async getBranches() { return this.request<any[]>('/branches'); }
  async createBranch(data: any) { return this.request<any>('/branches', { method: 'POST', body: JSON.stringify(data) }); }
  async updateBranch(id: string, data: any) { return this.request<any>(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteBranch(id: string) { return this.request<any>(`/branches/${id}`, { method: 'DELETE' }); }

  // Categories
  async getCategories(flat = false) { return this.request<any[]>(`/categories${flat ? '?flat=true' : ''}`); }
  async getCategoryBySlug(slug: string) { return this.request<any>(`/categories/slug/${slug}`); }
  async getCategoryById(id: string) { return this.request<any>(`/categories/${id}`); }
  async createCategory(data: any) { return this.request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }); }
  async updateCategory(id: string, data: any) { return this.request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }

  // Products
  async getProducts(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/products${query ? `?${query}` : ''}`);
  }
  async getProductBySlug(slug: string) { return this.request<any>(`/products/slug/${slug}`); }
  async getProductById(id: string) { return this.request<any>(`/products/${id}`); }
  async createProduct(data: any) { return this.request<any>('/products', { method: 'POST', body: JSON.stringify(data) }); }
  async updateProduct(id: string, data: any) { return this.request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteProduct(id: string) { return this.request<any>(`/products/${id}`, { method: 'DELETE' }); }
  async calculatePrice(data: any) { return this.request<any>('/products/calculate-price', { method: 'POST', body: JSON.stringify(data) }); }

  // Reservations
  async getReservations(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/reservations${query ? `?${query}` : ''}`);
  }
  async getReservation(id: string) { return this.request<any>(`/reservations/${id}`); }
  async createReservation(data: any) { return this.request<any>('/reservations', { method: 'POST', body: JSON.stringify(data) }); }
  async updateReservationStatus(id: string, status: string, note?: string) {
    return this.request<any>(`/reservations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) });
  }
  async cancelReservation(id: string, reason?: string) {
    return this.request<any>(`/reservations/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
  }

  // Offers
  async getOffers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/offers${query ? `?${query}` : ''}`);
  }
  async createOffer(data: any) { return this.request<any>('/offers', { method: 'POST', body: JSON.stringify(data) }); }
  async respondToOffer(id: string, data: any) { return this.request<any>(`/offers/${id}/respond`, { method: 'PUT', body: JSON.stringify(data) }); }
  async acceptOffer(id: string) { return this.request<any>(`/offers/${id}/accept`, { method: 'PUT' }); }
  async rejectOffer(id: string) { return this.request<any>(`/offers/${id}/reject`, { method: 'PUT' }); }

  // Payments
  async getPayments(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/payments${query ? `?${query}` : ''}`);
  }
  async createPayment(data: any) { return this.request<any>('/payments', { method: 'POST', body: JSON.stringify(data) }); }

  // Extras
  async getExtras() { return this.request<any[]>('/extras'); }

  // Favorites
  async getFavorites() { return this.request<any[]>('/favorites'); }
  async addFavorite(productId: string) { return this.request<any>('/favorites', { method: 'POST', body: JSON.stringify({ productId }) }); }
  async removeFavorite(productId: string) { return this.request<any>(`/favorites/${productId}`, { method: 'DELETE' }); }

  // Reviews
  async getProductReviews(productId: string) { return this.request<any>(`/reviews/product/${productId}`); }
  async createReview(data: any) { return this.request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }); }

  // Settings
  async getSettings(group?: string) { return this.request<Record<string, string>>(`/settings${group ? `?group=${group}` : ''}`); }
  async updateSettings(data: any) { return this.request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }); }

  // Dashboard
  async getDashboard() { return this.request<any>('/dashboard'); }

  // Users
  async getUsers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/users${query ? `?${query}` : ''}`);
  }
  async createUser(data: any) { return this.request<any>('/users', { method: 'POST', body: JSON.stringify(data) }); }
  async updateUser(id: string, data: any) { return this.request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }

  // Notifications
  async getNotifications() { return this.request<any>('/notifications'); }
  async markAsRead(id: string) { return this.request<any>(`/notifications/${id}/read`, { method: 'PUT' }); }

  // Contact
  async sendContactMessage(data: any) { return this.request<any>('/contact', { method: 'POST', body: JSON.stringify(data) }); }

  // Audit Logs
  async getAuditLogs(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<any>(`/audit${query ? `?${query}` : ''}`);
  }

  // Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error('Dosya yüklenemedi.');
    return response.json();
  }
}

export const api = new ApiClient(API_URL);
export default api;
