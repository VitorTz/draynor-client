import axios, { 
    type AxiosInstance, 
    type AxiosRequestConfig, 
    type AxiosResponse,
    type AxiosError
} from 'axios';
import { type User } from '../types';


// const BASE_URL = "http://localhost:8000/api/v1"
const BASE_URL = "https://draynor.squareweb.app/api/v1"

// Extending AxiosRequestConfig to include our custom retry flag
interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}


class ApiClient {

  private client: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      withCredentials: true
    });
  }

  /**
   * Refreshes the user session. 
   * Uses the raw client to avoid triggering the retry logic recursively.
   */
  private async refreshUser(): Promise<void> {
    try {
      await this.client.post<User>("/auth/refresh");
    } catch (err) {
      console.error("Session refresh failed");
      throw err;
    } finally {
      this.refreshPromise = null;
    }
  }
  
  private async request<T>(method: string, url: string, config: CustomRequestConfig = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request({ method, url, ...config });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401 && !config._retry) {
        config._retry = true;

        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshUser();
        }

        try {
          await this.refreshPromise;
          const retryResponse: AxiosResponse<T> = await this.client.request({ method, url, ...config });
          return retryResponse.data;
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      throw error;
    }
  }
  
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, { params, ...config });
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', url, { data, ...config });
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, { data, ...config });
  }
  
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, { data, ...config });
  }
  
  async delete<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, { params, ...config });
  }
  
  async upload<T>(url: string, file: File | Blob, fieldName = 'file', config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.request<T>('POST', url, {
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    });
  }

}

export const api = new ApiClient();

