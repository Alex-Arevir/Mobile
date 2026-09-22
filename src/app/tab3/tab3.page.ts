import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput } from '@ionic/angular';
import { AuthService, User } from '../services/auth.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput]
})
export class Tab3Page implements OnInit {
  user: User | null = null;
  preferredName = '';
  phone = '';
  email = '';
  newPassword = '';
  saving = false;
  message = '';
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService, private usersService: UsersService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.user) return;
    this.usersService.getById(this.user.id).subscribe({
      next: response => {
        if (!response.success) return;
        this.user = response.user;
        this.preferredName = response.user.preferred_name || response.user.username;
        this.phone = response.user.phone || '';
        this.email = response.user.email;
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      },
      error: error => {
        if (error?.response?.status === 401) this.forceLogout();
      }
    });
  }

  saveProfile(): void {
    if (!this.user) return;
    this.message = '';
    this.errorMessage = '';
    this.saving = true;

    const data: any = {
      preferred_name: this.preferredName.trim(),
      phone: this.phone.trim(),
      email: this.email.trim().toLowerCase(),
    };
    if (this.newPassword.trim()) data.password = this.newPassword;

    this.usersService.update(this.user.id, data).subscribe({
      next: response => {
        this.saving = false;
        if (!response.success) {
          this.errorMessage = response.message;
          return;
        }
        this.user = response.user;
        this.preferredName = response.user.preferred_name || response.user.username;
        this.phone = response.user.phone || '';
        this.email = response.user.email;
        this.newPassword = '';
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        this.message = 'Información actualizada correctamente.';
      },
      error: error => {
        this.saving = false;
        this.errorMessage = error?.response?.data?.message || 'No fue posible actualizar la información.';
        if (error?.response?.status === 401) this.forceLogout();
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.authService.clearSession();
    this.router.navigateByUrl('/login');
  }

  private forceLogout(): void {
    this.authService.clearSession();
    this.router.navigateByUrl('/login');
  }
}
