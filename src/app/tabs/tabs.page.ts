import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { gridOutline, personCircleOutline, clipboardOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage implements OnInit {
  isHr = false;

  constructor(private authService: AuthService) {
    addIcons({ gridOutline, personCircleOutline, clipboardOutline });
  }

  ngOnInit(): void {
    this.isHr = this.authService.getUser()?.role === 'admin';
  }
}
