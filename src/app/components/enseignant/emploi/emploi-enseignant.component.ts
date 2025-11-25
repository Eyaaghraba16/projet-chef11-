import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

interface Emploi {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: string;
  groupe: string;
  salle: string;
  statut: string;
  type_seance?: string;
}

@Component({
  selector: 'app-emploi-enseignant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emploi-enseignant.component.html',
  styleUrls: ['./emploi-enseignant.component.css']
})
export class EmploiEnseignantComponent implements OnInit {
  loading = false;
  message = '';
  emplois: Record<string, Emploi[]> = {};

  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.chargerEmplois();
  }

  chargerEmplois(): void {
    this.loading = true;
    this.api.getEmplois().subscribe({
      next: (data) => {
        this.emplois = this.organiserParJour(data || []);
        this.loading = false;
        this.message = Object.keys(this.emplois).length === 0
          ? 'Aucune séance planifiée pour le moment.'
          : '';
      },
      error: (err) => {
        console.error('❌ Erreur chargement emploi enseignant', err);
        this.loading = false;
        this.message = err.error?.message || 'Impossible de charger votre emploi du temps.';
      }
    });
  }

  organiserParJour(data: Emploi[]): Record<string, Emploi[]> {
    return data.reduce((acc, emploi) => {
      const jour = this.getJour(emploi.date);
      if (!acc[jour]) {
        acc[jour] = [];
      }
      acc[jour].push(emploi);
      acc[jour].sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
      return acc;
    }, {} as Record<string, Emploi[]>);
  }

  getJour(date: string): string {
    if (!date) {
      return 'Autres';
    }
    try {
      const d = new Date(date);
      const idx = d.getDay();
      const map = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      return map[idx] || 'Autres';
    } catch {
      return 'Autres';
    }
  }
}

