import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RegisterPage {
  form = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacyAccepted: false,
  };

  showPassword = false;
  showConfirmPassword = false;
  passwordMismatch = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  readonly eyePath =
    'M11.5,18C15.5,18 18.96,15.78 20.74,12.5C18.96,9.22 15.5,7 11.5,7C7.5,7 4.04,9.22 2.26,12.5C4.04,15.78 7.5,18 11.5,18M11.5,6C16.06,6 20,8.65 21.86,12.5C20,16.35 16.06,19 11.5,19C6.94,19 3,16.35 1.14,12.5C3,8.65 6.94,6 11.5,6M11.5,8C14,8 16,10 16,12.5C16,15 14,17 11.5,17C9,17 7,15 7,12.5C7,10 9,8 11.5,8M11.5,9C9.57,9 8,10.57 8,12.5C8,14.43 9.57,16 11.5,16C13.43,16 15,14.43 15,12.5C15,10.57 13.43,9 11.5,9Z';

  readonly eyeOffPath =
    'M2.54,4.71L3.25,4L20,20.75L19.29,21.46L15.95,18.11C14.58,18.68 13.08,19 11.5,19C6.94,19 3,16.35 1.14,12.5C2.11,10.5 3.63,8.83 5.5,7.68L2.54,4.71M11.5,18C12.79,18 14.03,17.77 15.17,17.34L14.05,16.21C13.32,16.71 12.45,17 11.5,17C9,17 7,15 7,12.5C7,11.55 7.29,10.68 7.79,9.95L6.24,8.41C4.57,9.38 3.19,10.8 2.26,12.5C4.04,15.78 7.5,18 11.5,18M20.74,12.5C18.96,9.22 15.5,7 11.5,7C10.35,7 9.23,7.19 8.19,7.53L7.41,6.75C8.68,6.26 10.06,6 11.5,6C16.06,6 20,8.65 21.86,12.5C20.95,14.39 19.53,16 17.79,17.13L17.07,16.4C18.6,15.44 19.87,14.1 20.74,12.5M11.5,8C14,8 16,10 16,12.5C16,13.32 15.78,14.08 15.4,14.74L14.66,14C14.88,13.54 15,13.04 15,12.5C15,10.57 13.43,9 11.5,9C10.96,9 10.46,9.12 10,9.34L9.26,8.6C9.92,8.22 10.68,8 11.5,8M8,12.5C8,14.43 9.57,16 11.5,16C12.17,16 12.79,15.81 13.32,15.5L8.5,10.68C8.19,11.21 8,11.83 8,12.5Z';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  validatePasswords(): void {
    this.passwordMismatch =
      !!this.form.confirmPassword &&
      this.form.password !== this.form.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(formRef: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.validatePasswords();

    if (formRef.invalid || this.passwordMismatch) {
      formRef.control.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.register({
      username: this.form.username.trim(),
      email: this.form.email.trim().toLowerCase(),
      password: this.form.password,
    }).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.success) {
          this.successMessage =
            'Request submitted. RH must approve your account before you can log in.';

          setTimeout(() => this.router.navigateByUrl('/login'), 1200);
        } else {
          this.errorMessage =
            response.message || 'The account could not be created.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          'Could not connect to the server. Check your PHP API and network connection.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
