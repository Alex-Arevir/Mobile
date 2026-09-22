import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { EmployeeRequest, RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon],
})
export class RequestsPage implements OnInit {
  requests: EmployeeRequest[] = [];
  loading = false;
  processingId: number | null = null;
  errorMessage = '';

  constructor(
    private requestsService: RequestsService,
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons({ checkmarkCircleOutline });
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user || user.role !== 'admin') {
      this.router.navigateByUrl('/tabs/tab2');
      return;
    }
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';
    this.requestsService.getAll('pending').subscribe({
      next: response => {
        this.loading = false;
        if (!response.success) {
          this.errorMessage = response.message;
          return;
        }
        this.requests = response.requests;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error?.response?.data?.message || 'No se pudieron cargar las solicitudes.';
      }
    });
  }

  changeStatus(request: EmployeeRequest, status: 'approved' | 'rejected'): void {
    this.processingId = request.id;
    this.requestsService.updateStatus(request.id, status).subscribe({
      next: response => {
        this.processingId = null;
        if (!response.success) {
          this.errorMessage = response.message;
          return;
        }
        this.requests = this.requests.filter(item => item.id !== request.id);
      },
      error: error => {
        this.processingId = null;
        this.errorMessage = error?.response?.data?.message || 'No se pudo actualizar la solicitud.';
      }
    });
  }

  initial(name: string): string {
    return (name || '?').charAt(0).toUpperCase();
  }
}
