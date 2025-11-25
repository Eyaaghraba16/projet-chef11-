import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-enseignants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enseignants.component.html',
  styleUrls: ['./enseignants.component.css']
})
export class EnseignantsComponent implements OnInit {

  enseignants: any[] = [];
  newEnseignant = {
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    id_departement: null
  };
  departements: any[] = [];
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEnseignants();
    this.loadDepartements();
  }

  loadDepartements() {
    this.api.getDepartements().subscribe({
      next: (data: any) => {
        this.departements = data;
      }
    });
  }

  loadEnseignants() {
    this.api.get('enseignants').subscribe({
      next: (data: any) => {
        this.enseignants = data;
      },
      error: (err) => {
        console.error('Erreur chargement enseignants', err);
        this.message = 'Erreur lors du chargement';
      }
    });
  }

  ajouter() {
    if (!this.newEnseignant.nom || !this.newEnseignant.prenom || !this.newEnseignant.email) {
      this.message = 'Nom, prénom et email sont requis';
      return;
    }

    this.api.post('enseignants', this.newEnseignant).subscribe({
      next: () => {
        this.message = 'Enseignant ajouté avec succès';
        this.loadEnseignants();
        this.newEnseignant = { nom: '', prenom: '', email: '', mot_de_passe: '', id_departement: null };
      },
      error: (err) => {
        console.error('Erreur ajout enseignant', err);
        this.message = err.error?.message || 'Erreur lors de l\'ajout';
      }
    });
  }

  supprimer(id: number) {
    this.api.delete(`enseignants/${id}`).subscribe({
      next: () => this.loadEnseignants()
    });
  }
}
