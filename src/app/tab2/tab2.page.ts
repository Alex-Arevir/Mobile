import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { IonContent, IonIcon, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { menuOutline, peopleOutline, clipboardOutline, personCircleOutline, logOutOutline, briefcaseOutline, mailOutline, callOutline, searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonButton],
})
export class Tab2Page implements OnInit {
  sidebarOpen = typeof window === 'undefined' || window.innerWidth > 900;
  user: User | null = null;
  isHr = false;
  users: User[] = [];
  employeeSearch = '';
  positionDrafts: Record<number, string> = {};
  savingPositionId: number | null = null;
  deletingUserId: number | null = null;
  usersLoading = false;
  usersError = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    addIcons({ menuOutline, peopleOutline, clipboardOutline, personCircleOutline, logOutOutline, briefcaseOutline, mailOutline, callOutline, searchOutline });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.isHr = this.user.role === 'admin';
    if (this.isHr) this.loadUsers();
  }

  get displayName(): string {
    return this.user?.preferred_name || this.user?.username || 'Usuario';
  }

  get filteredUsers(): User[] {
    const query = this.employeeSearch.trim().toLowerCase();
    if (!query) return this.users;

    return this.users.filter(employee => [
      employee.preferred_name,
      employee.username,
      employee.email,
      employee.position,
    ].some(value => value?.toLowerCase().includes(query)));
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.usersError = '';
    this.usersService.getAll().subscribe({
      next: response => {
        this.usersLoading = false;
        if (!response.success) {
          this.usersError = response.message;
          return;
        }
        this.users = response.users;
        this.positionDrafts = {};
        this.users.forEach(employee => {
          this.positionDrafts[employee.id] = employee.position || '';
        });
      },
      error: error => {
        this.usersLoading = false;
        this.usersError = error?.response?.data?.message || 'No fue posible cargar empleados.';
      }
    });
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }

  goRequests(): void { this.router.navigateByUrl('/tabs/requests'); }
  goProfile(): void { this.router.navigateByUrl('/tabs/tab3'); }

  updatePosition(employee: User, position: string): void {
    const nextPosition = position.trim();
    if (!nextPosition) {
      this.usersError = `Escribe un puesto para ${employee.username}.`;
      return;
    }

    this.usersError = '';
    this.savingPositionId = employee.id;
    this.usersService.update(employee.id, { position: nextPosition }).subscribe({
      next: response => {
        this.savingPositionId = null;
        if (!response.success) {
          this.usersError = response.message;
          return;
        }
        employee.position = response.user.position;
        this.positionDrafts[employee.id] = response.user.position || nextPosition;
      },
      error: error => {
        this.savingPositionId = null;
        this.usersError = error?.response?.data?.message || 'No fue posible actualizar el puesto.';
      },
    });
  }

  deleteEmployee(employee: User): void {
    if (employee.id === this.user?.id || !window.confirm(`¿Despedir y eliminar a ${employee.username}?`)) return;

    this.usersError = '';
    this.deletingUserId = employee.id;
    this.usersService.delete(employee.id).subscribe({
      next: response => {
        this.deletingUserId = null;
        if (!response.success) {
          this.usersError = response.message;
          return;
        }
        this.users = this.users.filter(current => current.id !== employee.id);
        delete this.positionDrafts[employee.id];
      },
      error: error => {
        this.deletingUserId = null;
        this.usersError = error?.response?.data?.message || 'No fue posible eliminar el usuario.';
      },
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
}
