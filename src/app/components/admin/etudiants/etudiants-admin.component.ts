import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-etudiants-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etudiants-admin.component.html',
  styleUrls: ['./etudiants-admin.component.css']
})
export class EtudiantsAdminComponent implements OnInit {

  etudiants: any[] = [];
  newEtudiant = {
    nom: '',
    prenom: '',
    email: '',
    numeroEtudiant: '',
    departement: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEtudiants();
  }

  loadEtudiants() {
    this.api.get('etudiants').subscribe({
      next: (data: any) => {
        this.etudiants = data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des étudiants', err);
        this.etudiants = [];
      }
    });
  }

  ajouter() {
    if (!this.newEtudiant.nom || !this.newEtudiant.prenom || !this.newEtudiant.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.api.post('etudiants', this.newEtudiant).subscribe({
      next: () => {
        this.loadEtudiants();
        this.newEtudiant = { nom: '', prenom: '', email: '', numeroEtudiant: '', departement: '' };
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
        alert('Erreur lors de l\'ajout de l\'étudiant');
      }
    });
  }

  supprimer(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet étudiant ?')) {
      this.api.delete(`etudiants/${id}`).subscribe({
        next: () => this.loadEtudiants(),
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }
}

