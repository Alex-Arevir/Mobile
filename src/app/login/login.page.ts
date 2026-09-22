import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [FormsModule],
})
export class LoginPage {
  isRegister = false;

  loginData = { username: '', password: '' };
  registerData = { username: '', email: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.isRegister = false;
  }

  register(): void {
    this.isRegister = true;
  }

  onLogin(): void {
    if (!this.loginData.username || !this.loginData.password) return;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.success) {
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          this.router.navigateByUrl('/tabs/tab2');
        } else {
          alert(response.message || 'Invalid credentials.');
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        alert('Could not connect to the server.');
      },
    });
  }

  onRegister(): void {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) return;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Registration submitted. RH must approve your account before you can log in.');
          this.loginData.username = this.registerData.username;
          this.loginData.password = '';
          this.isRegister = false;
        } else {
          alert(response.message || 'Registration failed.');
        }
      },
      error: (error) => {
        console.error('Register error:', error);
        alert('Could not connect to the server.');
      },
    });
  }
}
