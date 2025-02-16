import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private router: Router) { }

  // Método para iniciar sesión
  login() {
    this.authService.login(this.loginData.username, this.loginData.password).subscribe(
      (response) => {
        this.authService.saveTokens(response.access, response.refresh);
        console.log('Login exitoso', response);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Error en login', error);
        const errorMessage = error.error?.detail || 'Error de autenticación';
        alert(errorMessage);
      }
    );
  }

  // Método para registrarse
  register() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.authService.register(
      this.registerData.username,
      this.registerData.email,
      this.registerData.password
    ).subscribe(
      (response) => {
        console.log('Registro exitoso', response);
        alert('Registro exitoso, ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error en registro', error);
        const errorMessage = this.getRegistrationErrorMessage(error);
        alert(errorMessage);
      }
    );
  }

  // Función para manejar errores de registro
  private getRegistrationErrorMessage(error: any): string {
    if (error.error?.email) {
      return error.error.email[0];
    }
    if (error.error?.username) {
      return error.error.username[0];
    }
    return 'Error en el registro';
  }
}
