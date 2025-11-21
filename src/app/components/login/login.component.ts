import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginOrEmail: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';
    this.loading = true;

    if (!this.loginOrEmail || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.loading = false;
      return;
    }

    this.authService.login(this.loginOrEmail, this.password).subscribe({
      next: (user) => {
        console.log('✅ Connexion réussie', user);
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur login', err);
        this.errorMessage = err.error?.message || 'Erreur de connexion';
        this.loading = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
