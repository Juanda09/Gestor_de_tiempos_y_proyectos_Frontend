import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Evitar agregar el token en rutas públicas (login y register)
    const excludedUrls = ['/login', '/register'];
    if (excludedUrls.some(url => req.url.includes(url))) {
      console.log("No token added, path is excluded:", req.url);
      return next.handle(req);
    }


    // Si hay un token, agregarlo a la petición
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Si el token es inválido, intentar refrescarlo
          return this.authService.refreshToken().pipe(
            switchMap((newToken) => {
              // Clonar la petición con el nuevo token
              const clonedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next.handle(clonedReq);
            }),
            catchError((refreshError) => {
              console.error('Error al refrescar el token', refreshError);
              this.authService.logout(); // Cerrar sesión si falla el refresh
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
