import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-notifications-etudiant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsEtudiantComponent implements OnInit {
  notifications: any[] = [];
  loading: boolean = false;
  notificationsNonLues: number = 0;

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.chargerNotifications();
    // Recharger toutes les 30 secondes
    setInterval(() => {
      this.chargerNotifications();
    }, 30000);
  }

  chargerNotifications() {
    this.loading = true;
    // L'API retourne automatiquement uniquement les notifications de l'étudiant connecté
    this.api.getNotifications().subscribe({
      next: (data: any[]) => {
        console.log('✅ Notifications reçues depuis la base de données:', data);
        this.notifications = (data || []).sort((a, b) => {
          const dateA = new Date(a.date || a.date_creation).getTime();
          const dateB = new Date(b.date || b.date_creation).getTime();
          return dateB - dateA; // Plus récent en premier
        });
        this.notificationsNonLues = this.notifications.filter(n => !n.lu).length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement notifications', err);
        this.loading = false;
        // Pas de données statiques - afficher un message
        this.notifications = [];
        this.notificationsNonLues = 0;
        // Ne pas alerter pour les notifications car elles peuvent être vides
      }
    });
  }

  marquerCommeLu(notificationId: number) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.lu = true;
      this.notificationsNonLues = this.notifications.filter(n => !n.lu).length;
      // Ici, vous pourriez appeler une API pour marquer comme lu
    }
  }

  marquerToutesCommeLues() {
    this.notifications.forEach(n => n.lu = true);
    this.notificationsNonLues = 0;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'emploi-temps':
        return '📅';
      case 'rattrapage':
        return '🔄';
      case 'absence':
        return '📋';
      case 'note':
        return '📊';
      default:
        return '🔔';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'emploi-temps':
        return 'type-emploi';
      case 'rattrapage':
        return 'type-rattrapage';
      case 'absence':
        return 'type-absence';
      case 'note':
        return 'type-note';
      default:
        return 'type-default';
    }
  }

  getNotificationClasses(notification: any): string {
    const classes: string[] = [];
    
    if (!notification.lu) {
      classes.push('non-lue');
    }
    
    classes.push(this.getTypeClass(notification.type));
    
    return classes.join(' ');
  }
}

