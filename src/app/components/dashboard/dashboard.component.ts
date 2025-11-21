import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.userName = `${this.currentUser.prenom} ${this.currentUser.nom}`;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(page: string) {
    if (!this.currentUser) return;

    const role = this.currentUser.role;

    // 🔥 Cas spécial : ADMINISTRATIF
    if (role === 'administratif') {
      switch (page) {
        case 'departements':
          this.router.navigate(['/admin/departements']);
          break;
        case 'enseignants':
          this.router.navigate(['/admin/enseignants']);
          break;
        case 'etudiants':
          this.router.navigate(['/admin/etudiants']);
          break;
        case 'salles':
          this.router.navigate(['/admin/salles']);
          break;
        case 'matieres':
          this.router.navigate(['/admin/matieres']);
          break;
        case 'emploi-du-temps':
          this.router.navigate(['/administratif/emploi-du-temps']);
          break;
        case 'rapports':
          this.router.navigate(['/admin/rapports']);
          break;
        case 'evenements':
          this.router.navigate(['/admin/evenements']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
      return;
    }

    // 🔥 Tous les autres rôles
    this.router.navigate([`/${role}/${page}`]);
  }
}
