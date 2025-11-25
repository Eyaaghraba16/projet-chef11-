import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

interface AbsenceEtudiant {
  id: number;
  date_absence: string;
  matiere: string;
  etudiant: string;
  groupe?: string;
  statut: string;
  motif?: string;
}

@Component({
  selector: 'app-absences-etudiants-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './absences-etudiants.component.html',
  styleUrls: ['./absences-etudiants.component.css']
})
export class AbsencesEtudiantsEnseignantComponent implements OnInit {
  absences: AbsenceEtudiant[] = [];
  loading = false;
  filtreStatut = '';
  actionMessage = '';

  statuts = [
    { label: 'Tous les statuts', value: '' },
    { label: 'En attente', value: 'en_attente' },
    { label: 'Justifiée', value: 'justifie' },
    { label: 'Refusée', value: 'refuse' },
    { label: 'Non justifiée', value: 'non_justifie' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.chargerAbsences();
  }

  chargerAbsences(): void {
    this.loading = true;
    const params = this.filtreStatut ? { statut: this.filtreStatut } : undefined;
    this.api.getAbsences(params).subscribe({
      next: (data) => {
        this.absences = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement absences étudiants', err);
        this.loading = false;
        this.actionMessage = err.error?.message || 'Impossible de charger les absences.';
      }
    });
  }

  mettreAJourStatut(absence: AbsenceEtudiant, statut: string): void {
    this.api.updateAbsence(absence.id, { statut }).subscribe({
      next: () => {
        this.actionMessage = `Absence ${statut === 'justifie' ? 'justifiée' : statut === 'refuse' ? 'refusée' : 'mise à jour'}.`;
        this.chargerAbsences();
      },
      error: (err) => {
        console.error('❌ Erreur mise à jour absence', err);
        this.actionMessage = err.error?.message || 'Impossible de mettre à jour l\'absence.';
      }
    });
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'justifie':
        return 'badge success';
      case 'refuse':
        return 'badge danger';
      case 'en_attente':
        return 'badge warning';
      default:
        return 'badge neutral';
    }
  }
}

