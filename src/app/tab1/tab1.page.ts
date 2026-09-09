import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class Tab1Page {
  isRegister = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  loginData = { username: '', password: '' };
  registerData = { username: '', email: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  login(): void {
    this.isRegister = false;
    this.clearMessages();
  }

  register(): void {
    this.isRegister = true;
    this.clearMessages();
  }

  onLogin(): void {
    this.clearMessages();

    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Usuario y contraseña son obligatorios.';
      return;
    }

    this.loading = true;
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success || !response.token) {
          this.errorMessage = response.message || 'No fue posible iniciar sesión.';
          return;
        }
        this.router.navigateByUrl('/tabs/tab2');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.response?.data?.message || 'No se pudo conectar con la API.';
        console.error('Login error:', error);
      },
    });
  }

  onRegister(): void {
    this.clearMessages();

    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    this.loading = true;
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success) {
          this.errorMessage = response.message || 'No fue posible registrar el usuario.';
          return;
        }

        this.successMessage = 'Registro exitoso. Ahora puedes iniciar sesión.';
        this.loginData.username = this.registerData.username;
        this.loginData.password = '';
        this.registerData.password = '';
        this.isRegister = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.response?.data?.message || 'No se pudo conectar con la API.';
        console.error('Register error:', error);
      },
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
