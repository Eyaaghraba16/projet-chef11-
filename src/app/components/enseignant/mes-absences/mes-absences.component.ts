import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

interface AbsenceEnseignant {
  id: number;
  date_debut: string;
  date_fin: string;
  heure_debut?: string;
  heure_fin?: string;
  motif: string;
  statut: string;
  commentaire?: string;
  duree_heures?: number;
}

@Component({
  selector: 'app-mes-absences-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-absences.component.html',
  styleUrls: ['./mes-absences.component.css']
})
export class MesAbsencesEnseignantComponent implements OnInit {
  absences: AbsenceEnseignant[] = [];
  loading = false;
  submitting = false;
  message = '';

  form = {
    date_debut: '',
    date_fin: '',
    heure_debut: '',
    heure_fin: '',
    motif: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.chargerAbsences();
  }

  chargerAbsences(): void {
    this.loading = true;
    this.api.getAbsencesEnseignant().subscribe({
      next: (data) => {
        this.absences = data || [];
        this.loading = false;
        if (!this.absences.length) {
          this.message = 'Aucune absence déclarée.';
        } else {
          this.message = '';
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement absences enseignants', err);
        this.loading = false;
        this.message = err.error?.message || 'Impossible de charger vos absences.';
      }
    });
  }

  declarerAbsence(): void {
    if (!this.form.date_debut || !this.form.date_fin || !this.form.motif) {
      this.message = 'Merci de remplir les dates et le motif.';
      return;
    }

    this.submitting = true;
    this.api.declarerAbsenceEnseignant(this.form).subscribe({
      next: () => {
        this.message = 'Absence envoyée pour validation.';
        this.form = { date_debut: '', date_fin: '', heure_debut: '', heure_fin: '', motif: '' };
        this.chargerAbsences();
        this.submitting = false;
      },
      error: (err) => {
        console.error('❌ Erreur déclaration absence', err);
        this.submitting = false;
        this.message = err.error?.message || 'Impossible d\'enregistrer votre absence.';
      }
    });
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'approuve':
        return 'badge success';
      case 'refuse':
        return 'badge danger';
      case 'annule':
        return 'badge neutral';
      default:
        return 'badge warning';
    }
  }
}

