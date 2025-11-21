import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-etudiant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './etudiant.component.html',
  styleUrls: ['./etudiant.component.css']
})
export class EtudiantComponent implements OnInit {
  emploiTemps: any[] = [];
  absences: any[] = [];
  notifications: any[] = [];
  notes: any[] = [];
  loading: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEtudiantData();
  }

  loadEtudiantData() {
    this.loading = true;

    // Emploi du temps
    this.api.get('etudiant/emploiTemps').subscribe({
      next: (data: any[]) => this.emploiTemps = data,
      error: (err: any) => console.error(err)
    });

    // Absences
    this.api.get('etudiant/absences').subscribe({
      next: (data: any[]) => this.absences = data,
      error: (err: any) => console.error(err)
    });

    // Notifications
    this.api.get('etudiant/notifications').subscribe({
      next: (data: any[]) => this.notifications = data,
      error: (err: any) => console.error(err)
    });

    // Notes et statistiques
    this.api.get('etudiant/notes').subscribe({
      next: (data: any[]) => this.notes = data,
      error: (err: any) => console.error(err),
      complete: () => this.loading = false
    });
  }

  demanderExcuse(absenceId: number) {
    const motif = prompt('Entrez votre motif d’excuse :');
    if (motif) {
      this.api.post(`etudiant/absences/${absenceId}/excuse`, { motif }).subscribe({
        next: () => alert('Demande d’excuse envoyée !'),
        error: (err: any) => console.error('Erreur lors de la demande', err)
      });
    }
  }
}
