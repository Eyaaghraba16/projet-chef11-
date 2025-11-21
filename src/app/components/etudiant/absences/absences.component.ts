import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-absences-etudiant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './absences.component.html',
  styleUrls: ['./absences.component.css']
})
export class AbsencesEtudiantComponent implements OnInit {
  absences: any[] = [];
  loading: boolean = false;
  motifExcuse: string = '';
  absenceSelectionnee: number | null = null;

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.chargerAbsences();
  }

  chargerAbsences() {
    this.loading = true;
    this.api.getAbsences().subscribe({
      next: (data: any[]) => {
        // Filtrer les absences de l'étudiant connecté
        const userId = this.authService.currentUserValue?.id;
        this.absences = data.filter((abs: any) => abs.etudiantId === userId || !abs.etudiantId);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement absences', err);
        this.loading = false;
        // Données d'exemple
        this.absences = [
          {
            id: 1,
            matiere: 'Programmation Web',
            date: '2025-10-10',
            justifiee: false,
            motif: ''
          },
          {
            id: 2,
            matiere: 'Base de données',
            date: '2025-10-12',
            justifiee: true,
            motif: 'Visite médicale'
          }
        ];
      }
    });
  }

  demanderExcuse(absenceId: number) {
    this.absenceSelectionnee = absenceId;
    const motif = prompt('Entrez votre motif d\'excuse :');
    
    if (motif && motif.trim()) {
      this.api.demanderExcuse(absenceId, { motif: motif.trim() }).subscribe({
        next: () => {
          alert('Demande d\'excuse envoyée avec succès !');
          this.chargerAbsences();
          this.absenceSelectionnee = null;
        },
        error: (err: any) => {
          console.error('Erreur lors de la demande d\'excuse', err);
          alert('Erreur lors de l\'envoi de la demande d\'excuse');
        }
      });
    }
    this.absenceSelectionnee = null;
  }

  getStatut(absence: any): string {
    if (absence.justifiee) {
      return 'Justifiée';
    } else if (absence.motif) {
      return 'En attente';
    }
    return 'Non justifiée';
  }

  getStatutClass(absence: any): string {
    if (absence.justifiee) {
      return 'justifiee';
    } else if (absence.motif) {
      return 'en-attente';
    }
    return 'non-justifiee';
  }

  getTotalAbsences(): number {
    return this.absences.length;
  }

  getAbsencesJustifiees(): number {
    return this.absences.filter(a => a.justifiee).length;
  }

  getAbsencesNonJustifiees(): number {
    return this.absences.filter(a => !a.justifiee && !a.motif).length;
  }
}

