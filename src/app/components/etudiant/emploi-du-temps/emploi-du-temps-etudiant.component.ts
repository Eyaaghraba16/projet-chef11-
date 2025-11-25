import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-emploi-du-temps-etudiant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emploi-du-temps-etudiant.component.html',
  styleUrls: ['./emploi-du-temps-etudiant.component.css']
})
export class EmploiDuTempsEtudiantComponent implements OnInit {
  emplois: { [key: string]: { [key: string]: any } } = {};
  loading: boolean = false;
  groupe: string = 'DSI 31';
  semestre: string = '1er semestre 2025/2026';

  // Créneaux horaires
  creneaux = [
    { debut: '08:30', fin: '10:00' },
    { debut: '10:10', fin: '11:40' },
    { debut: '11:50', fin: '13:20' },
    { debut: '14:30', fin: '16:00' },
    { debut: '16:10', fin: '17:40' }
  ];

  // Jours de la semaine
  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.chargerEmplois();
  }

  chargerEmplois() {
    this.loading = true;
    
    // Utiliser l'API pour récupérer l'emploi du temps de l'étudiant connecté
    // Le backend filtre automatiquement selon le groupe, département et spécialité de l'étudiant
    this.api.getEmplois().subscribe({
      next: (data: any[]) => {
        console.log('✅ Emploi du temps reçu depuis la base de données:', data);
        // Transformer les données pour le format tableau
        this.emplois = this.organiserEmplois(data);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement emploi du temps', err);
        this.loading = false;
        // Pas de données statiques - afficher un message d'erreur
        this.emplois = {};
        
        let errorMessage = 'Erreur lors du chargement de l\'emploi du temps.';
        if (err.status === 404) {
          errorMessage = err.error?.message || 'Votre compte étudiant n\'est pas configuré. Veuillez contacter l\'administration.';
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource.';
        }
        
        alert(errorMessage);
      }
    });
  }

  organiserEmplois(data: any[]): any {
    const emploisOrganises: any = {};
    
    // Initialiser la structure
    this.creneaux.forEach(creneau => {
      emploisOrganises[creneau.debut] = {};
      this.jours.forEach(jour => {
        emploisOrganises[creneau.debut][jour] = null;
      });
    });

    // Remplir avec les données
    data.forEach(emploi => {
      const jour = this.getJourSemaine(emploi.date || emploi.jour);
      const creneau = this.trouverCreneau(emploi.heure_debut || emploi.heure);
      
      if (jour && creneau) {
        emploisOrganises[creneau][jour] = {
          matiere: emploi.matiere || emploi.nom_matiere,
          enseignant: emploi.enseignant || emploi.nom_enseignant,
          salle: emploi.salle || emploi.nom_salle || emploi.id_salle
        };
      }
    });

    return emploisOrganises;
  }

  getJourSemaine(dateOrJour: string): string | null {
    if (!dateOrJour) return null;
    
    // Si c'est déjà un jour de la semaine
    const jour = this.jours.find(j => dateOrJour.toLowerCase().includes(j.toLowerCase()));
    if (jour) return jour;

    // Si c'est une date, convertir
    try {
      const date = new Date(dateOrJour);
      const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      return joursSemaine[date.getDay()];
    } catch {
      return null;
    }
  }

  trouverCreneau(heure: string): string | null {
    if (!heure) return null;
    const heureFormatee = heure.substring(0, 5); // Format HH:MM
    
    for (const creneau of this.creneaux) {
      if (heureFormatee === creneau.debut) {
        return creneau.debut;
      }
    }
    return null;
  }

  getExempleEmplois(): any {
    // Données d'exemple basées sur l'image fournie
    return {
      '08:30': {
        'Lundi': { matiere: 'Développement Mobile', enseignant: 'Abdelkader MAATALLAH', salle: 'LI 02' },
        'Mercredi': { matiere: 'Atelier développement Mobile natif', enseignant: 'Abdelkader MAATALLAH', salle: 'LI 04' }
      },
      '10:10': {
        'Mardi': { matiere: '', enseignant: 'Ahmed NEFZAOUI', salle: 'LI 04' },
        'Jeudi': { matiere: '', enseignant: 'Wahid HAMDI', salle: 'LI 04' }
      }
    };
  }

  getCours(creneau: string, jour: string): any {
    if (this.loading) return null;
    
    if (this.emplois && this.emplois[creneau]) {
      return this.emplois[creneau][jour] || null;
    }
    return null;
  }
}

