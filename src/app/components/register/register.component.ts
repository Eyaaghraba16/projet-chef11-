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

    this.authService.register(this.email, this.password, this.nom, this.prenom, this.role)
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
}
