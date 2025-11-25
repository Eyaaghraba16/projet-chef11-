import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

interface Rattrapage {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: string;
  salle?: string;
  etudiant?: string;
  statut: string;
}

@Component({
  selector: 'app-rattrapages-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rattrapages-enseignant.component.html',
  styleUrls: ['./rattrapages-enseignant.component.css']
})
export class RattrapagesEnseignantComponent implements OnInit {
  rattrapages: Rattrapage[] = [];
  matieres: any[] = [];
  salles: any[] = [];
  submitting = false;
  message = '';

  form = {
    id_matiere: null as number | null,
    id_salle: null as number | null,
    date: '',
    heure_debut: '',
    heure_fin: '',
    id_etudiant: null as number | null
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.chargerRattrapages();
    this.chargerMatieres();
    this.chargerSalles();
  }

  chargerRattrapages(): void {
    this.api.getRattrapages().subscribe({
      next: (data) => {
        this.rattrapages = (data || []).filter((r: any) => !r.id_enseignant || r.enseignant);
      },
      error: (err) => {
        console.error('❌ Erreur chargement rattrapages', err);
        this.message = err.error?.message || 'Impossible de récupérer les rattrapages.';
      }
    });
  }

  chargerMatieres(): void {
    this.api.getMatieres().subscribe({
      next: (data) => this.matieres = data || [],
      error: (err) => console.error('❌ Erreur chargement matières', err)
    });
  }

  chargerSalles(): void {
    this.api.getSalles().subscribe({
      next: (data) => this.salles = data || [],
      error: (err) => console.error('❌ Erreur chargement salles', err)
    });
  }

  proposer(): void {
    if (!this.form.id_matiere || !this.form.date || !this.form.heure_debut || !this.form.heure_fin) {
      this.message = 'Merci de remplir la matière, la date et les heures.';
      return;
    }

    this.submitting = true;
    this.api.proposerRattrapage(this.form).subscribe({
      next: () => {
        this.message = 'Séance de rattrapage proposée.';
        this.form = { id_matiere: null, id_salle: null, date: '', heure_debut: '', heure_fin: '', id_etudiant: null };
        this.submitting = false;
        this.chargerRattrapages();
      },
      error: (err) => {
        console.error('❌ Erreur création rattrapage', err);
        this.submitting = false;
        this.message = err.error?.message || 'Impossible d\'enregistrer le rattrapage.';
      }
    });
  }
}

