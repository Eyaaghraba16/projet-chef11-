import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {

    // Charger user depuis localStorage au chargement de l'app
    const savedUser = localStorage.getItem('currentUser');

    this.currentUserSubject = new BehaviorSubject<User | null>(
      savedUser ? JSON.parse(savedUser) : null
    );

    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Getter pour obtenir l'utilisateur courant
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // ===================== LOGIN =======================
  login(loginOrEmail: string, mot_de_passe: string): Observable<User> {

    loginOrEmail = loginOrEmail.trim().toLowerCase();

    return this.http.post<any>(`${this.apiUrl}/login`, {
      loginOrEmail,
      mot_de_passe
    }).pipe(
      map(response => {

        if (!response?.user || !response?.token) {
          throw new Error("Erreur lors du login : données manquantes.");
        }

        // ⚠️ Normalisation du rôle en minuscule
        const userRole = (response.user.role || '').trim().toLowerCase();

        const fullUser: User = {
          ...response.user,
          role: userRole,
          token: response.token
        };

        // Sauvegarde
        localStorage.setItem('currentUser', JSON.stringify(fullUser));

        // Mise à jour du BehaviorSubject
        this.currentUserSubject.next(fullUser);

        return fullUser;
      })
    );
  }

  // ===================== REGISTER =======================
  register(payload: {
    email: string;
    mot_de_passe: string;
    nom: string;
    prenom: string;
    role: string;
    departement?: string;
    specialite?: string;
    niveau?: string;
  }): Observable<any> {

    const {
      email,
      mot_de_passe,
      nom,
      prenom,
      role,
      departement,
      specialite,
      niveau
    } = payload;

    const normalizedEmail = email.trim().toLowerCase();
    const login = normalizedEmail.split('@')[0];

    return this.http.post(`${this.apiUrl}/register`, {
      login,
      email: normalizedEmail,
      mot_de_passe,
      nom: nom.trim(),
      prenom: prenom.trim(),
      role: role.trim().toLowerCase(),
      departement: departement?.trim() || null,
      specialite: specialite?.trim() || null,
      niveau: niveau?.trim() || null
    });
  }

  // ===================== LOGOUT =======================
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // ===================== CHECKS =======================
  isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role.trim().toLowerCase();
  }
}
