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
    // L'API retourne automatiquement uniquement les absences de l'étudiant connecté
    // Le backend filtre selon le département et la spécialité de l'étudiant
    this.api.getAbsences().subscribe({
      next: (data: any[]) => {
        console.log('✅ Absences reçues depuis la base de données:', data);
        // Les données sont déjà filtrées par le backend
        this.absences = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement absences', err);
        this.loading = false;
        // Pas de données statiques - afficher un message
        this.absences = [];
        
        let errorMessage = 'Erreur lors du chargement des absences.';
        if (err.status === 404) {
          errorMessage = err.error?.message || 'Votre compte étudiant n\'est pas configuré. Veuillez contacter l\'administration.';
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource.';
        }
        
        alert(errorMessage);
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

