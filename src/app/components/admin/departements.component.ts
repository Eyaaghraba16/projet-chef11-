import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departements.component.html',
  styleUrls: ['./departements.component.css']
})
export class DepartementsComponent implements OnInit {
  departements: any[] = [];
  nom: string = '';
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerDepartements();
  }

  chargerDepartements() {
    this.api.getDepartements().subscribe({
      next: (data: any[]) => {
        this.departements = data;
      },
      error: (err) => {
        console.error('Erreur chargement départements', err);
        this.message = 'Erreur lors du chargement';
      }
    });
  }

  ajouterDepartement() {
    if (!this.nom.trim()) {
      this.message = 'Le nom du département est requis';
      return;
    }

    this.api.ajouterDepartement({ nom: this.nom }).subscribe({
      next: () => {
        this.message = 'Département ajouté';
        this.nom = '';
        this.chargerDepartements();
      },
      error: (err) => {
        console.error('Erreur ajout département', err);
        this.message = 'Erreur lors de l’ajout';
      }
    });
  }

  supprimerDepartement(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce département ?')) {
      this.api.supprimerDepartement(id).subscribe({
        next: () => {
          this.message = 'Département supprimé';
          this.chargerDepartements();
        },
        error: (err) => {
          console.error('Erreur suppression département', err);
          this.message = 'Erreur lors de la suppression';
        }
      });
    }
  }
}
