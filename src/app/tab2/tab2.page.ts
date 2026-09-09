import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import {
  IonContent,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  menuOutline,
  searchOutline,
  gridOutline,
  folderOutline,
  calendarOutline,
  mailOutline,
  cartOutline,
  bagHandleOutline,
  settingsOutline,
  mapOutline,
  notificationsOutline,
  chatbubbleEllipsesOutline,
  chevronDownOutline,
  eyeOutline,
  peopleOutline,
  documentsOutline,
  mailUnreadOutline,
  logOutOutline,
  personCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
  ],
})
export class Tab2Page implements OnInit {
  sidebarOpen = true;
  searchTerm = '';
  userName = 'Admin';
  currentUser: User | null = null;
  users: User[] = [];
  usersLoading = false;
  usersError = '';

  stats = [
    { value: '1,245', label: 'Emails', detail: 'Mensajes recibidos', icon: 'mailUnreadOutline', className: 'primary' },
    { value: '34', label: 'Projects', detail: 'Proyectos activos', icon: 'documentsOutline', className: 'danger' },
    { value: '0', label: 'Users', detail: 'Usuarios registrados', icon: 'peopleOutline', className: 'success' },
  ];

  quickStats = [
    { value: '5,154', label: 'Page views', icon: 'eyeOutline', className: 'primary' },
    { value: '245', label: 'User registered', icon: 'peopleOutline', className: 'danger' },
    { value: '1,154', label: 'Product sales', icon: 'cartOutline', className: 'warning' },
    { value: '3,154', label: 'Transactions', icon: 'documentsOutline', className: 'success' },
  ];

  chartOne = [45, 25, 40, 20, 60, 20, 35, 25];
  chartTwo = [20, 40, 20, 50, 25, 40, 25, 10];
  chartLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Ago', 'Sep'];

  admins = [
    { name: 'Joge Lucky', role: 'Administrador', description: 'Gestión general del sistema' },
    { name: 'Ana Torres', role: 'Administrador', description: 'Gestión de usuarios' },
    { name: 'Carlos Ruiz', role: 'Administrador', description: 'Gestión de proyectos' },
  ];

  moderators = [
    { name: 'María López', role: 'Moderador', description: 'Supervisión de contenido' },
    { name: 'Luis Gómez', role: 'Moderador', description: 'Soporte de usuarios' },
    { name: 'Jorge Pérez', role: 'Moderador', description: 'Seguimiento de actividades' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    addIcons({
      menuOutline,
      searchOutline,
      gridOutline,
      folderOutline,
      calendarOutline,
      mailOutline,
      cartOutline,
      bagHandleOutline,
      settingsOutline,
      mapOutline,
      notificationsOutline,
      chatbubbleEllipsesOutline,
      chevronDownOutline,
      eyeOutline,
      peopleOutline,
      documentsOutline,
      mailUnreadOutline,
      logOutOutline,
      personCircleOutline,
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.userName = this.currentUser?.username || 'Admin';
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.usersError = '';

    this.usersService.getAll().subscribe({
      next: (response) => {
        this.usersLoading = false;
        if (!response.success) {
          this.usersError = response.message;
          return;
        }
        this.users = response.users;
        this.stats[2].value = String(response.count);
      },
      error: (error) => {
        this.usersLoading = false;
        this.usersError = error?.response?.data?.message || 'No fue posible cargar usuarios.';
        if (error?.response?.status === 401) {
          this.authService.clearSession();
          this.router.navigateByUrl('/tabs/tab1');
        }
      },
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        this.authService.clearSession();
        this.router.navigateByUrl('/tabs/tab1');
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigateByUrl('/tabs/tab1');
      },
    });
  }

  goToProfile(): void {
    this.router.navigate(['/tabs/tab3']);
  }

  maxChartValue(): number {
    return Math.max(...this.chartOne, ...this.chartTwo);
  }

  chartHeight(value: number): string {
    const percentage = Math.max(5, (value / this.maxChartValue()) * 100);
    return `${percentage}%`;
  }
}
