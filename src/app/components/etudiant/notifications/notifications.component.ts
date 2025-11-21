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
    this.api.getNotifications().subscribe({
      next: (data: any[]) => {
        this.notifications = data.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Plus récent en premier
        });
        this.notificationsNonLues = this.notifications.filter(n => !n.lu).length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement notifications', err);
        this.loading = false;
        // Données d'exemple
        this.notifications = [
          {
            id: 1,
            titre: 'Changement d\'emploi du temps',
            message: 'Le cours de Programmation Web de mardi est déplacé en salle 102',
            date: '2025-10-15',
            lu: false,
            type: 'emploi-temps'
          },
          {
            id: 2,
            titre: 'Rattrapage disponible',
            message: 'Un rattrapage pour Base de données est prévu samedi à 9h',
            date: '2025-10-14',
            lu: false,
            type: 'rattrapage'
          },
          {
            id: 3,
            titre: 'Alerte absences',
            message: 'Vous avez accumulé 3 absences en Réseaux informatiques',
            date: '2025-10-13',
            lu: true,
            type: 'absence'
          },
          {
            id: 4,
            titre: 'Nouvelle note disponible',
            message: 'Votre note pour l\'examen de Programmation Web est disponible',
            date: '2025-10-12',
            lu: false,
            type: 'note'
          }
        ];
        this.notificationsNonLues = this.notifications.filter(n => !n.lu).length;
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

