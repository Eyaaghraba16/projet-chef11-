import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  nom: string = '';
  prenom: string = '';
  role: string = 'etudiant';
  departement: string = '';
  specialite: string = '';
  niveau: string = '';

  departementsOptions: {
    nom: string;
    specialites: { nom: string; niveaux: string[] }[];
  }[] = [
    {
      nom: 'Technologies de l\'Informatique',
      specialites: [
        {
          nom: 'Réseaux & services informatiques (RSI)',
          niveaux: ['1ère année', '2ème année', '3ème année']
        },
        {
          nom: 'Développement de systèmes d\'information (DSI)',
          niveaux: ['1ère année', '2ème année', '3ème année']
        }
      ]
    },
    {
      nom: 'Génie Electrique',
      specialites: [
        {
          nom: 'Électricité Industrielle (EI)',
          niveaux: ['1ère année', '2ème année', '3ème année']
        },
        {
          nom: 'Electronique Industrielle (ElnI)',
          niveaux: ['1ère année', '2ème année', '3ème année']
        },
        {
          nom: 'Automatisme & informatique industrielle (AII)',
          niveaux: ['1ère année', '2ème année', '3ème année']
        }
      ]
    },
    {
      nom: 'Génie Mécanique',
      specialites: [
        {
          nom: 'Maintenance Industrielle',
          niveaux: ['1ère année', '2ème année', '3ème année']
        },
        {
          nom: 'Energétique',
          niveaux: ['1ère année', '2ème année', '3ème année']
        },
        {
          nom: 'Mécatronique',
          niveaux: ['1ère année', '2ème année', '3ème année']
        },
        {
          nom: 'Energie et génie climatique (Licence co-construite)',
          niveaux: ['Licence 1', 'Licence 2', 'Licence 3']
        }
      ]
    },
    {
      nom: 'Génie Civil',
      specialites: [
        {
          nom: 'Bâtiment : Construction, audit énergétique...',
          niveaux: ['1ère année', '2ème année', '3ème année']
        },
        {
          nom: 'Travaux publics : Routes et ouvrages d\'art',
          niveaux: ['1ère année', '2ème année', '3ème année']
        }
      ]
    }
  ];
  specialitesDisponibles: { nom: string; niveaux: string[] }[] = [];
  niveauxDisponibles: string[] = [];

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    // Vérifier que tous les champs sont remplis
    if (!this.email || !this.password || !this.confirmPassword || !this.nom || !this.prenom || !this.role) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.loading = false;
      return;
    }

    if (this.role === 'etudiant') {
      if (!this.departement || !this.specialite || !this.niveau) {
        this.errorMessage = 'Sélectionnez un département, une spécialité et un niveau';
        this.loading = false;
        return;
      }
    }

    // Vérifier correspondance des mots de passe
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.loading = false;
      return;
    }

    // Vérifier longueur du mot de passe
    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      this.loading = false;
      return;
    }

    this.authService.register({
      email: this.email,
      mot_de_passe: this.password,
      nom: this.nom,
      prenom: this.prenom,
      role: this.role,
      departement: this.role === 'etudiant' ? this.departement : undefined,
      specialite: this.role === 'etudiant' ? this.specialite : undefined,
      niveau: this.role === 'etudiant' ? this.niveau : undefined
    })
      .subscribe({
        next: (response) => {
          this.successMessage = 'Inscription réussie ! Redirection vers la connexion...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
          this.loading = false;
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onRoleChange() {
    if (this.role !== 'etudiant') {
      this.resetEtudiantFields();
    }
  }

  onDepartementChange() {
    const departement = this.departementsOptions.find(d => d.nom === this.departement);
    this.specialitesDisponibles = departement ? departement.specialites : [];
    this.specialite = '';
    this.niveau = '';
    this.niveauxDisponibles = [];
  }

  onSpecialiteChange() {
    const specialite = this.specialitesDisponibles.find(s => s.nom === this.specialite);
    this.niveauxDisponibles = specialite ? specialite.niveaux : [];
    this.niveau = '';
  }

  private resetEtudiantFields() {
    this.departement = '';
    this.specialite = '';
    this.niveau = '';
    this.specialitesDisponibles = [];
    this.niveauxDisponibles = [];
  }
}
