import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonToggle, IonInput } from '@ionic/angular';
import { AuthService, User } from '../services/auth.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonToggle, IonInput]
})
export class Tab3Page implements OnInit {
  user: User | null = null;
  userName = '';
  userEmail = '';
  notifications = true;
  darkMode = false;
  saving = false;
  message = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigateByUrl('/tabs/tab1');
      return;
    }

    this.userName = this.user.username;
    this.userEmail = this.user.email;
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.user) return;

    this.usersService.getById(this.user.id).subscribe({
      next: (response) => {
        if (!response.success) return;
        this.user = response.user;
        this.userName = response.user.username;
        this.userEmail = response.user.email;
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      },
      error: (error) => {
        if (error?.response?.status === 401) this.forceLogout();
      }
    });
  }

  saveProfile(): void {
    if (!this.user) return;

    this.message = '';
    this.errorMessage = '';
    this.saving = true;

    this.usersService.update(this.user.id, {
      username: this.userName.trim(),
      email: this.userEmail.trim(),
    }).subscribe({
      next: (response) => {
        this.saving = false;
        if (!response.success) {
          this.errorMessage = response.message;
          return;
        }
        this.user = response.user;
        this.userName = response.user.username;
        this.userEmail = response.user.email;
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        this.message = 'Perfil actualizado correctamente.';
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error?.response?.data?.message || 'No fue posible actualizar el perfil.';
        if (error?.response?.status === 401) this.forceLogout();
      },
    });
  }

  toggleDarkMode(): void {
    document.body.classList.toggle('dark', this.darkMode);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.authService.clearSession();
      this.router.navigateByUrl('/tabs/tab1');
    });
  }

  private forceLogout(): void {
    this.authService.clearSession();
    this.router.navigateByUrl('/tabs/tab1');
  }
}
