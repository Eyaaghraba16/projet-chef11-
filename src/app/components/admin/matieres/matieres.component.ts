import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-matieres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matieres.component.html',
  styleUrls: ['./matieres.css']
})
export class MatieresComponent implements OnInit {

  matieres: any[] = [];
  newMatiere = { nom: '', code: '', coefficient: 1, id_niveau: null, id_enseignant: null, nombre_heures: 0 };
  niveaux: any[] = [];
  enseignants: any[] = [];
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMatieres();
    this.loadNiveaux();
    this.loadEnseignants();
  }

  loadNiveaux() {
    this.api.get('niveaux').subscribe({
      next: (data: any) => {
        this.niveaux = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement niveaux', err);
      }
    });
  }

  loadEnseignants() {
    this.api.get('enseignants').subscribe({
      next: (data: any) => {
        this.enseignants = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement enseignants', err);
      }
    });
  }

  loadMatieres() {
    this.api.getMatieres().subscribe({
      next: (data) => {
        this.matieres = data;
      },
      error: (err) => {
        console.error('Erreur chargement matières', err);
        this.message = 'Erreur lors du chargement';
      }
    });
  }

  ajouter() {
    if (!this.newMatiere.nom.trim() || !this.newMatiere.code.trim()) {
      this.message = 'Le nom et le code sont requis';
      return;
    }

    if (!this.newMatiere.id_niveau) {
      this.message = 'Le niveau est requis';
      return;
    }

    console.log('🔵 Tentative d\'ajout matière:', this.newMatiere);
    
    this.api.post('matieres', this.newMatiere).subscribe({
      next: (response) => {
        console.log('✅ Matière ajoutée:', response);
        this.message = 'Matière ajoutée avec succès';
        this.loadMatieres();
        this.newMatiere = { nom: '', code: '', coefficient: 1, id_niveau: null, id_enseignant: null, nombre_heures: 0 };
      },
      error: (err) => {
        console.error('❌ Erreur ajout matière:', err);
        console.error('❌ Erreur complète:', JSON.stringify(err, null, 2));
        this.message = err.error?.message || err.message || 'Erreur lors de l\'ajout';
        if (err.status === 401 || err.status === 403) {
          this.message += ' - Vérifiez que vous êtes connecté en tant qu\'administrateur';
        }
      }
    });
  }

  supprimer(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette matière ?')) {
      this.api.delete(`matieres/${id}`).subscribe({
        next: () => {
          this.message = 'Matière supprimée';
          this.loadMatieres();
        },
        error: (err) => {
          console.error('Erreur suppression matière', err);
          this.message = 'Erreur lors de la suppression';
        }
      });
    }
  }
}
