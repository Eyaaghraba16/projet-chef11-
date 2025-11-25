import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ============================================================
  // 🔐 HEADERS AVEC TOKEN
  // ============================================================
  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    const token = user?.token;
    
    // Debug
    if (!token) {
      console.warn('⚠️ ApiService: Pas de token disponible');
    } else {
      console.log('✅ ApiService: Token disponible');
    }
    
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return new HttpHeaders(headers);
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    let url = `${this.apiUrl}/${path}`;
    if (params) {
      const query = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      if (query) {
        url += `?${query}`;
      }
    }
    return url;
  }

  // ============================================================
  // ⭐ MÉTHODES GÉNÉRIQUES
  // ============================================================
  get(url: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${url}`, { headers: this.getHeaders() });
  }

  post(url: string, body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${url}`, body, { headers: this.getHeaders() });
  }

  put(url: string, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${url}`, body, { headers: this.getHeaders() });
  }

  delete(url: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${url}`, { headers: this.getHeaders() });
  }

  // ============================================================
  // EMPLOI DU TEMPS
  // ============================================================
  getEmplois(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/emploi-du-temps`, { headers: this.getHeaders() });
  }

  getEmploiDuTemps(etudiantId?: number): Observable<any[]> {
    const id = etudiantId || this.authService.currentUserValue?.id;
    return this.http.get<any[]>(`${this.apiUrl}/emploi-du-temps/student/${id}`, { headers: this.getHeaders() });
  }

  ajouterEmploi(emploi: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/emploi-du-temps`, emploi, { headers: this.getHeaders() });
  }

  supprimerEmploi(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/emploi-du-temps/${id}`, { headers: this.getHeaders() });
  }

  // ============================================================
  // ABSENCES
  // ============================================================
  getAbsences(params?: Record<string, any>): Observable<any[]> {
    const url = this.buildUrl('absences', params);
    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }

  signalerAbsence(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/absences`, data, { headers: this.getHeaders() });
  }

  updateAbsence(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/absences/${id}`, payload, { headers: this.getHeaders() });
  }

  // Absences enseignants
  getAbsencesEnseignant(params?: Record<string, any>): Observable<any[]> {
    const url = this.buildUrl('enseignants/absences', params);
    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }

  declarerAbsenceEnseignant(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enseignants/absences`, data, { headers: this.getHeaders() });
  }

  mettreAJourAbsenceEnseignant(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/enseignants/absences/${id}`, data, { headers: this.getHeaders() });
  }

  demanderExcuse(absenceId: number, motif: { motif: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/absences/${absenceId}/excuse`, motif, { headers: this.getHeaders() });
  }

  // ============================================================
  // NOTES
  // ============================================================
  getNotes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notes`, { headers: this.getHeaders() });
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  // ============================================================
  // RATTRAPAGES
  // ============================================================
  getRattrapages(params?: Record<string, any>): Observable<any[]> {
    const url = this.buildUrl('rattrapages', params);
    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }

  proposerRattrapage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/rattrapages`, data, { headers: this.getHeaders() });
  }

  // ============================================================
  // MESSAGES
  // ============================================================
  getMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages`, { headers: this.getHeaders() });
  }

  envoyerMessage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, data, { headers: this.getHeaders() });
  }

  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateurs`, { headers: this.getHeaders() });
  }

  // ============================================================
  // DEPARTEMENTS
  // ============================================================
  getDepartements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departements`, { headers: this.getHeaders() });
  }

  ajouterDepartement(departement: { nom: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/departements`, departement, { headers: this.getHeaders() });
  }

  supprimerDepartement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/departements/${id}`, { headers: this.getHeaders() });
  }

  // ============================================================
  // MATIERES
  // ============================================================
  getMatieres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matieres`, { headers: this.getHeaders() });
  }

  ajouterMatiere(matiere: { nom: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/matieres`, matiere, { headers: this.getHeaders() });
  }

  supprimerMatiere(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/matieres/${id}`, { headers: this.getHeaders() });
  }

  // ============================================================
  // SALLES
  // ============================================================
  getSalles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/salles`, { headers: this.getHeaders() });
  }

  ajouterSalle(salle: { nom: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/salles`, salle, { headers: this.getHeaders() });
  }

  supprimerSalle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/salles/${id}`, { headers: this.getHeaders() });
  }

  // ============================================================
  // RAPPORTS
  // ============================================================
  getRapports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rapports`, { headers: this.getHeaders() });
  }

  downloadRapportPdf(rapportId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/rapports/${rapportId}/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  downloadRapportCsv(rapportId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/rapports/${rapportId}/csv`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // ============================================================
  // ÉVÉNEMENTS
  // ============================================================
  getEvenements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/evenements`, { headers: this.getHeaders() });
  }

  addEvenement(evenement: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/evenements`, evenement, { headers: this.getHeaders() });
  }

  deleteEvenement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/evenements/${id}`, { headers: this.getHeaders() });
  }
}
