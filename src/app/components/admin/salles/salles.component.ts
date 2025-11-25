import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salles.component.html',
  styleUrls: ['./salles.css']
})
export class SallesComponent implements OnInit {

  salles: any[] = [];
  newSalle = { nom: '', capacite: null, type: null };
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSalles();
  }

  loadSalles() {
    this.api.getSalles().subscribe({
      next: (data) => {
        this.salles = data;
      },
      error: (err) => {
        console.error('Erreur chargement salles', err);
        this.message = 'Erreur lors du chargement';
      }
    });
  }

  ajouter() {
    if (!this.newSalle.nom.trim()) {
      this.message = 'Le nom est requis';
      return;
    }

    this.api.post('salles', this.newSalle).subscribe({
      next: () => {
        this.message = 'Salle ajoutée';
        this.loadSalles();
        this.newSalle = { nom: '', capacite: null, type: null };
      },
      error: (err) => {
        console.error('Erreur ajout salle', err);
        this.message = err.error?.message || 'Erreur lors de l\'ajout';
      }
    });
  }

  supprimer(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette salle ?')) {
      this.api.delete(`salles/${id}`).subscribe({
        next: () => {
          this.message = 'Salle supprimée';
          this.loadSalles();
        },
        error: (err) => {
          console.error('Erreur suppression salle', err);
          this.message = 'Erreur lors de la suppression';
        }
      });
    }
  }
}
