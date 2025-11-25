import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-evenements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evenements.html',
  styleUrls: ['./evenements.css']
})
export class EvenementsComponent implements OnInit {

  evenements: any[] = [];
  newEvenement = { 
    titre: '', 
    description: '', 
    type: 'public',
    date_debut: '',
    date_fin: '',
    lieu: ''
  };
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadEvenements();
  }

  loadEvenements() {
    this.api.getEvenements().subscribe({
      next: (data: any) => {
        this.evenements = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement événements', err);
        this.message = 'Erreur lors du chargement';
      }
    });
  }

  ajouter() {
    if (!this.newEvenement.titre || !this.newEvenement.date_debut) {
      this.message = 'Veuillez remplir le titre et la date de début';
      return;
    }
    
    // Convertir les dates au format datetime pour le backend
    const evenementToSend = {
      ...this.newEvenement,
      date_debut: this.newEvenement.date_debut ? new Date(this.newEvenement.date_debut).toISOString().slice(0, 16) : null,
      date_fin: this.newEvenement.date_fin ? new Date(this.newEvenement.date_fin).toISOString().slice(0, 16) : null
    };
    
    console.log('🔵 Tentative d\'ajout événement:', evenementToSend);
    
    this.api.addEvenement(evenementToSend).subscribe({
      next: (response) => {
        console.log('✅ Événement ajouté:', response);
        this.message = 'Événement ajouté avec succès';
        this.loadEvenements();
        this.newEvenement = { 
          titre: '', 
          description: '', 
          type: 'public',
          date_debut: '',
          date_fin: '',
          lieu: ''
        };
      },
      error: (err) => {
        console.error('❌ Erreur ajout événement:', err);
        console.error('❌ Erreur complète:', JSON.stringify(err, null, 2));
        this.message = err.error?.message || err.message || 'Erreur lors de l\'ajout';
        if (err.status === 401 || err.status === 403) {
          this.message += ' - Vérifiez que vous êtes connecté en tant qu\'administrateur';
        }
      }
    });
  }

  supprimer(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.api.deleteEvenement(id).subscribe({
        next: () => {
          this.message = 'Événement supprimé';
          this.loadEvenements();
        },
        error: (err) => {
          console.error('Erreur suppression événement', err);
          this.message = 'Erreur lors de la suppression';
        }
      });
    }
  }
}
