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
  newEmploi = {
    date: '',
    heure_debut: '',
    heure_fin: '',
    id_salle: null,
    id_matiere: null,
    id_groupe: null,
    id_enseignant: null,
    type_seance: 'cours',
    statut: 'planifie'
  };
  matieres: any[] = [];
  salles: any[] = [];
  groupes: any[] = [];
  enseignants: any[] = [];
  departements: any[] = [];
  specialites: any[] = [];
  selectedDepartementId: number | null = null;
  selectedSpecialiteId: number | null = null;
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerEmplois();
    this.chargerMatieres();
    this.chargerSalles();
    this.chargerEnseignants();
    this.chargerDepartements();
  }

  chargerMatieres() {
    this.api.getMatieres().subscribe({
      next: (data: any[]) => {
        this.matieres = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement matières', err);
      }
    });
  }

  chargerSalles() {
    this.api.getSalles().subscribe({
      next: (data: any[]) => {
        this.salles = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement salles', err);
      }
    });
  }

  chargerDepartements() {
    this.api.get('departements').subscribe({
      next: (data: any[]) => {
        this.departements = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement départements', err);
      }
    });
  }

  onDepartementChange() {
    console.log('🔵 Changement de département:', this.selectedDepartementId);
    // Réinitialiser spécialité et groupe quand le département change
    this.selectedSpecialiteId = null;
    this.newEmploi.id_groupe = null;
    this.specialites = [];
    this.groupes = [];
    
    // Recharger les spécialités selon le département sélectionné
    if (this.selectedDepartementId) {
      this.loadSpecialites(this.selectedDepartementId);
      // Charger les groupes du tranc commun du département (1ère année)
      // On passe undefined pour id_specialite pour indiquer qu'on veut le tranc commun
      this.loadGroupes(undefined);
    } else {
      this.loadSpecialites();
      this.loadGroupes(undefined);
    }
  }

  loadSpecialites(id_departement?: number) {
    let url = 'specialites';
    if (id_departement) {
      url += `?id_departement=${id_departement}`;
    }
    
    this.api.get(url).subscribe({
      next: (data: any) => {
        this.specialites = data || [];
        // Réinitialiser le groupe sélectionné si la liste change
        if (id_departement && !this.specialites.find((s: any) => s.id === this.newEmploi.id_groupe)) {
          this.newEmploi.id_groupe = null;
        }
      },
      error: (err) => {
        console.error('Erreur chargement spécialités', err);
        this.specialites = [];
      }
    });
  }

  loadGroupes(id_specialite?: number | null) {
    let url = 'groupes';
    const params: string[] = [];
    
    if (id_specialite) {
      params.push(`id_specialite=${id_specialite}`);
    }
    
    // Ajouter le département pour filtrer les groupes du tranc commun
    if (this.selectedDepartementId) {
      params.push(`id_departement=${this.selectedDepartementId}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    console.log('🔵 Chargement groupes avec URL:', url);
    
    this.api.get(url).subscribe({
      next: (data: any) => {
        console.log('✅ Groupes reçus:', data);
        this.groupes = data || [];
        // Réinitialiser le groupe sélectionné si la liste change
        if (id_specialite && !this.groupes.find((g: any) => g.id === this.newEmploi.id_groupe)) {
          this.newEmploi.id_groupe = null;
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement groupes', err);
        this.groupes = [];
      }
    });
  }

  onSpecialiteChange() {
    console.log('🔵 Changement de spécialité:', this.selectedSpecialiteId);
    // Réinitialiser le groupe sélectionné
    this.newEmploi.id_groupe = null;
    
    // Recharger les groupes selon la spécialité sélectionnée
    if (this.selectedSpecialiteId) {
      this.loadGroupes(this.selectedSpecialiteId);
    } else {
      // Si aucune spécialité (1ère année - tranc commun), charger les groupes du tranc commun du département
      this.loadGroupes(undefined);
    }
  }

  chargerEnseignants() {
    this.api.get('enseignants').subscribe({
      next: (data: any[]) => {
        this.enseignants = data || [];
      },
      error: (err) => {
        console.error('Erreur chargement enseignants', err);
      }
    });
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
    if (!this.newEmploi.date || !this.newEmploi.heure_debut || !this.newEmploi.heure_fin || 
        !this.newEmploi.id_salle || !this.newEmploi.id_matiere || !this.newEmploi.id_groupe || !this.newEmploi.id_enseignant) {
      this.message = '⚠️ Tous les champs sont requis.';
      return;
    }

    console.log('🔵 Tentative d\'ajout emploi du temps:', this.newEmploi);

    this.api.ajouterEmploi(this.newEmploi).subscribe({
      next: (response) => {
        console.log('✅ Emploi du temps ajouté:', response);
        this.message = '✅ Emploi du temps ajouté avec succès.';
        this.newEmploi = {
          date: '',
          heure_debut: '',
          heure_fin: '',
          id_salle: null,
          id_matiere: null,
          id_groupe: null,
          id_enseignant: null,
          type_seance: 'cours',
          statut: 'planifie'
        };
        this.chargerEmplois();
      },
      error: (err: any) => {
        console.error('❌ Erreur ajout emploi du temps', err);
        console.error('❌ Erreur complète:', JSON.stringify(err, null, 2));
        this.message = err.error?.message || err.message || 'Erreur lors de l\'ajout de l\'emploi du temps.';
        if (err.status === 401 || err.status === 403) {
          this.message += ' - Vérifiez que vous êtes connecté en tant qu\'administrateur';
        }
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
