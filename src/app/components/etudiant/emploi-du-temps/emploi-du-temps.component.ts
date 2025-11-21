import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service'; // ✅ Vérifie le chemin

@Component({
  selector: 'app-emploi-du-temps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emploi-du-temps.component.html',
  styleUrls: ['./emploi-du-temps.component.css']
})
export class EmploiDuTempsComponent implements OnInit {
  emplois: any[] = [];
  matiere: string = '';
  enseignant: string = '';
  salle: string = '';
  jour: string = '';
  heure: string = '';
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerEmplois();
  }

  // 🔹 Charger tous les emplois du temps
  chargerEmplois() {
    this.api.getEmplois().subscribe({
      next: (data: any[]) => {
        console.log('✅ Emplois du temps reçus :', data);
        this.emplois = data;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement emplois du temps', err);
        this.message = 'Erreur lors du chargement des emplois du temps.';
      }
    });
  }

  // 🔹 Ajouter un emploi du temps
  ajouterEmploi() {
    if (!this.matiere.trim() || !this.enseignant.trim() || !this.salle.trim() || !this.jour.trim() || !this.heure.trim()) {
      this.message = '⚠️ Tous les champs sont requis.';
      return;
    }

    const nouvelEmploi = {
      matiere: this.matiere,
      enseignant: this.enseignant,
      salle: this.salle,
      jour: this.jour,
      heure: this.heure
    };

    this.api.ajouterEmploi(nouvelEmploi).subscribe({
      next: () => {
        this.message = '✅ Emploi du temps ajouté avec succès.';
        this.matiere = '';
        this.enseignant = '';
        this.salle = '';
        this.jour = '';
        this.heure = '';
        this.chargerEmplois();
      },
      error: (err: any) => {
        console.error('❌ Erreur ajout emploi du temps', err);
        this.message = 'Erreur lors de l’ajout de l’emploi du temps.';
      }
    });
  }

  // 🔹 Supprimer un emploi du temps
  supprimerEmploi(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet emploi du temps ?')) {
      this.api.supprimerEmploi(id).subscribe({
        next: () => {
          this.message = '🗑️ Emploi du temps supprimé.';
          this.chargerEmplois();
        },
        error: (err: any) => {
          console.error('❌ Erreur suppression emploi', err);
          this.message = 'Erreur lors de la suppression.';
        }
      });
    }
  }
}
