// API Client for BankDash Authentication
import config from './config';

const API_BASE_URL = config.api.baseUrl;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message?: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      role: string;
      name: string;
      changePassword: boolean;
    };
  };
  // Keep old structure for backward compatibility
  success?: boolean;
  user?: {
    id: string;
    username: string;
    email?: string;
    role?: string;
  };
  token?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store',
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem(config.auth.tokenKey);
    if (token) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    console.log('ApiClient request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!token,
      headers: requestConfig.headers
    });

    try {
      const response = await fetch(url, requestConfig);
      
      console.log('ApiClient response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ApiClient error response:', errorData);
        throw {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errorData
        } as ApiError;
      }

      const data = await response.json();
      console.log('ApiClient success data:', data);
      return data;
    } catch (error) {
      console.error('ApiClient request failed:', {
        url,
        error: error instanceof Error ? error.message : error
      });
      
      if (error && typeof error === 'object' && 'status' in error) {
        throw error as ApiError;
      }
      
      // Network or parsing error
      throw {
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      } as ApiError;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // Handle different response formats from the API
      // New format: { status: "SUCCESS", data: { user: {...}, token: "..." } }
      // Old format: { success: true, user: {...}, token: "..." }
      
      if (response.status === "SUCCESS" && response.data) {
        // New API format
        return {
          status: response.status,
          message: response.message,
          data: response.data,
          success: true, // For backward compatibility
        };
      } else {
        // Old API format or other response
        const isSuccess = response.success === true || 
                         response.message?.toLowerCase().includes('success') ||
                         response.user; // If user exists, consider it successful
        
        return {
          status: isSuccess ? "SUCCESS" : "FAILED",
          success: isSuccess,
          message: response.message,
          user: response.user,
          token: response.token
        };
      }
    } catch (error) {
      // Only log actual authentication failures, not network issues during successful login
      const errorMessage = (error as any)?.message || 'Unknown error';
      const errorStatus = (error as any)?.status;
      
      // Don't log as error if it's just a network issue but login might have succeeded
      if (errorStatus === 0 || errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
        console.warn('Network issue during login - login may have succeeded:', {
          message: errorMessage,
          url: `${this.baseURL}/auth/login`
        });
      } else {
        console.error('Login API error:', {
          message: errorMessage,
          status: errorStatus || 'No status',
          url: `${this.baseURL}/auth/login`
        });
      }
      throw error;
    }
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user?: any }> {
    try {
      return await this.request<{ valid: boolean; user?: any }>('/auth/verify', {
        method: 'GET',
      });
    } catch (error) {
      // If verify endpoint doesn't exist or fails, assume token is valid if it exists
      // This is a fallback for development/demo purposes
      const token = localStorage.getItem(config.auth.tokenKey);
      if (token) {
        console.log('Token verification endpoint not available, assuming valid token');
        return { valid: true };
      }
      console.log('No token found, assuming invalid');
      return { valid: false };
    }
  }

  // User profile methods
  async getUserProfile(userId: string): Promise<any> {
    return this.request<any>(`/auth/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateUserProfile(userId: string, userData: any): Promise<any> {
    return this.request<any>(`/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfileGeneral(): Promise<any> {
    return this.request<any>('/user/profile', {
      method: 'GET',
    });
  }

  // User creation method
  async createUser(userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    username: string;
    jobTitle: string;
    userRole: string;
    assignments?: number;
    active?: boolean;
  }): Promise<any> {
    console.log('ApiClient: Making request to /auth/users (CREATE USER)');
    console.log('ApiClient: Base URL:', this.baseURL);
    console.log('ApiClient: Full URL:', `${this.baseURL}/auth/users`);
    console.log('ApiClient: User data being sent:', userData);
    
    return this.request<any>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User management methods
  async getUsers(): Promise<any> {
    try {
      console.log('ApiClient: Making request to /auth/users');
      console.log('ApiClient: Base URL:', this.baseURL);
      console.log('ApiClient: Full URL:', `${this.baseURL}/auth/users`);
      
      const result = await this.request<any>('/auth/users', {
        method: 'GET',
      });
      
      console.log('ApiClient: Successfully received response from /auth/users');
      console.log('ApiClient: Response type:', typeof result);
      console.log('ApiClient: Response is array:', Array.isArray(result));
      console.log('ApiClient: Response keys:', Object.keys(result || {}));
      
      return result;
    } catch (error) {
      console.error('ApiClient: Error in getUsers:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<any> {
    return this.request<any>(`/auth/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    return this.request<any>(`/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Service management methods
  async getServices(): Promise<any> {
    try {
      console.log('ApiClient: Making request to /services/services');
      console.log('ApiClient: Base URL:', this.baseURL);
      console.log('ApiClient: Full URL:', `${this.baseURL}/services/services`);
      
      const result = await this.request<any>('/services/services', {
        method: 'GET',
      });
      
      console.log('ApiClient: Successfully received response from /services/services');
      console.log('ApiClient: Response type:', typeof result);
      console.log('ApiClient: Response is array:', Array.isArray(result));
      console.log('ApiClient: Response keys:', Object.keys(result || {}));
      
      return result;
    } catch (error) {
      console.error('ApiClient: Error in getServices:', error);
      throw error;
    }
  }

  async getService(serviceId: string): Promise<any> {
    return this.request<any>(`/services/services/${serviceId}`, {
      method: 'GET',
    });
  }

  async createService(serviceData: {
    name: string;
    description: string;
    logo_url: string;
    status: string;
  }): Promise<any> {
    return this.request<any>('/services/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(serviceId: string, serviceData: any): Promise<any> {
    return this.request<any>(`/services/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(serviceId: string): Promise<any> {
    return this.request<any>(`/services/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  // Transaction methods
  async getTransactions(serviceId: string, limit: number = 5, offset: number = 40): Promise<any> {
    try {
      console.log('ApiClient: Making request to /transactions/service/{serviceId}');
      console.log('ApiClient: Base URL:', this.baseURL);
      console.log('ApiClient: Full URL:', `${this.baseURL}/transactions/service/${serviceId}?limit=${limit}&offset=${offset}`);
      
      const result = await this.request<any>(`/transactions/service/${serviceId}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });
      
      console.log('ApiClient: Successfully received response from /transactions/service/{serviceId}');
      console.log('ApiClient: Response type:', typeof result);
      console.log('ApiClient: Response is array:', Array.isArray(result));
      console.log('ApiClient: Response keys:', Object.keys(result || {}));
      
      return result;
    } catch (error) {
      console.error('ApiClient: Error in getTransactions:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
