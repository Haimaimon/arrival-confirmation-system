/**
 * Infrastructure Layer - API Client
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.error || 'שגיאה לא ידועה';

      switch (status) {
        case 401:
          toast.error('נדרשת התחברות מחדש');
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('אין לך הרשאה לבצע פעולה זו');
          break;
        case 404:
          toast.error('המשאב לא נמצא');
          break;
        case 429:
          toast.error('יותר מדי בקשות, נסה שוב מאוחר יותר');
          break;
        case 500:
          toast.error('שגיאת שרת, נסה שוב מאוחר יותר');
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      toast.error('לא ניתן להתחבר לשרת');
    } else {
      toast.error('שגיאה לא צפויה');
    }
  }

  get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  patch<T>(url: string, data?: any) {
    return this.client.patch<T>(url, data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export const apiClient = new ApiClient();

