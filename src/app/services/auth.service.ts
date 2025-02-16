import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  // Iniciar sesión
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/jwt/create/`, { username, password }).pipe(
      tap((response: any) => this.saveTokens(response.access, response.refresh))
    );
  }

  // Registro de usuario
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}register/`, { username, email, password });
  }

  // Refrescar el token cuando expira
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('No hay refresh token disponible');
    }

    return this.http.post(`${this.apiUrl}jwt/refresh/`, { refresh: refreshToken }).pipe(
      tap((response: any) => this.saveTokens(response.access, response.refresh))
    );
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  // Guardar tokens en localStorage
  saveTokens(access: string, refresh: string): void {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
  }

  // Obtener el access token
  getAccessToken(): string | null {
    return localStorage.getItem('access');
  }

  // Obtener el refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh');
  }

  // Obtener el token (para usar en el interceptor)
  getToken(): string | null {
    return this.getAccessToken();
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
