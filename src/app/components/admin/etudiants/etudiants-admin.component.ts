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
    mot_de_passe: '',
    id_groupe: null,
    id_specialite: null,
    numero_etudiant: '',
    telephone: '',
    date_naissance: null,
    departement: '',
    specialite: '',
    niveau: ''
  };
  groupes: any[] = [];
  specialites: any[] = [];
  departements: any[] = [];
  selectedDepartementId: number | null = null;
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEtudiants();
    this.loadGroupes();
    this.loadSpecialites();
    this.loadDepartements();
  }

  loadDepartements() {
    this.api.getDepartements().subscribe({
      next: (data: any) => {
        this.departements = data;
      }
    });
  }

  loadSpecialites(id_departement?: number) {
    const url = id_departement ? `specialites?id_departement=${id_departement}` : 'specialites';
    this.api.get(url).subscribe({
      next: (data: any) => {
        this.specialites = data || [];
        // Réinitialiser la spécialité sélectionnée si la liste change
        if (id_departement && !this.specialites.find((s: any) => s.id === this.newEtudiant.id_specialite)) {
          this.newEtudiant.id_specialite = null;
          this.onSpecialiteChange(); // Recharger les groupes
        }
      },
      error: (err) => {
        console.error('Erreur chargement spécialités', err);
        this.specialites = [];
      }
    });
  }

  onDepartementChange() {
    console.log('🔵 Changement de département:', this.newEtudiant.departement);
    // Réinitialiser spécialité et groupe quand le département change
    this.newEtudiant.id_specialite = null;
    this.newEtudiant.id_groupe = null;
    this.specialites = [];
    this.groupes = [];
    
    // Recharger les spécialités selon le département sélectionné
    if (this.newEtudiant.departement) {
      // Trouver l'ID du département depuis son nom
      const dept = this.departements.find((d: any) => d.nom === this.newEtudiant.departement);
      if (dept) {
        this.selectedDepartementId = dept.id;
        this.loadSpecialites(dept.id);
        // Charger les groupes du tranc commun du département (1ère année)
        // On passe undefined pour id_specialite pour indiquer qu'on veut le tranc commun
        this.loadGroupes(undefined);
      } else {
        this.selectedDepartementId = null;
        this.loadSpecialites();
        this.loadGroupes(undefined);
      }
    } else {
      this.selectedDepartementId = null;
      this.loadSpecialites();
      this.loadGroupes(undefined);
    }
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
        if (id_specialite && !this.groupes.find((g: any) => g.id === this.newEtudiant.id_groupe)) {
          this.newEtudiant.id_groupe = null;
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement groupes', err);
        this.groupes = [];
      }
    });
  }

  onSpecialiteChange() {
    console.log('🔵 Changement de spécialité:', this.newEtudiant.id_specialite);
    // Réinitialiser le groupe sélectionné
    this.newEtudiant.id_groupe = null;
    
    // Recharger les groupes selon la spécialité sélectionnée
    if (this.newEtudiant.id_specialite) {
      // Charger les groupes de cette spécialité (DSI21-23, DSI31-32, RSI21-22, RSI31-32)
      this.loadGroupes(this.newEtudiant.id_specialite);
    } else {
      // Si aucune spécialité (1ère année - tranc commun), charger les groupes du tranc commun du département
      this.loadGroupes(undefined);
    }
  }

  loadEtudiants() {
    this.api.get('etudiants').subscribe({
      next: (data: any) => {
        this.etudiants = data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des étudiants', err);
        this.etudiants = [];
        this.message = 'Erreur lors du chargement';
      }
    });
  }

  ajouter() {
    if (!this.newEtudiant.nom || !this.newEtudiant.prenom || !this.newEtudiant.email || !this.newEtudiant.id_groupe) {
      this.message = 'Nom, prénom, email et groupe sont requis';
      return;
    }
    
    this.api.post('etudiants', this.newEtudiant).subscribe({
      next: () => {
        this.message = 'Étudiant ajouté avec succès';
        this.loadEtudiants();
        this.newEtudiant = {
          nom: '', prenom: '', email: '', mot_de_passe: '',
          id_groupe: null, id_specialite: null, numero_etudiant: '',
          telephone: '', date_naissance: null, departement: '',
          specialite: '', niveau: ''
        };
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
        this.message = err.error?.message || 'Erreur lors de l\'ajout de l\'étudiant';
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

