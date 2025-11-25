import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-notes-etudiant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesEtudiantComponent implements OnInit {
  notes: any[] = [];
  loading: boolean = false;
  moyenneGenerale: number = 0;

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.chargerNotes();
  }

  chargerNotes() {
    this.loading = true;
    // L'API retourne automatiquement uniquement les notes de l'étudiant connecté
    // Le backend filtre selon le département et la spécialité de l'étudiant
    this.api.getNotes().subscribe({
      next: (data: any[]) => {
        console.log('✅ Notes reçues depuis la base de données:', data);
        // Les données sont déjà filtrées par le backend
        this.notes = data || [];
        this.calculerMoyenne();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement notes', err);
        this.loading = false;
        // Pas de données statiques - afficher un message
        this.notes = [];
        this.moyenneGenerale = 0;
        
        let errorMessage = 'Erreur lors du chargement des notes.';
        if (err.status === 404) {
          errorMessage = err.error?.message || 'Votre compte étudiant n\'est pas configuré. Veuillez contacter l\'administration.';
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = 'Vous n\'êtes pas autorisé à accéder à cette ressource.';
        }
        
        alert(errorMessage);
      }
    });
  }

  calculerMoyenne() {
    if (this.notes.length === 0) {
      this.moyenneGenerale = 0;
      return;
    }

    let sommeNotes = 0;
    let sommeCoefficients = 0;

    this.notes.forEach(note => {
      const noteValue = parseFloat(note.note) || 0;
      const coef = parseFloat(note.coefficient) || 1;
      sommeNotes += noteValue * coef;
      sommeCoefficients += coef;
    });

    this.moyenneGenerale = sommeCoefficients > 0 ? sommeNotes / sommeCoefficients : 0;
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'excellent';
    if (note >= 14) return 'tres-bien';
    if (note >= 12) return 'bien';
    if (note >= 10) return 'passable';
    return 'insuffisant';
  }

  getNoteLabel(note: number): string {
    if (note >= 16) return 'Excellent';
    if (note >= 14) return 'Très bien';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getMatiereStats() {
    const stats: any = {};
    this.notes.forEach(note => {
      if (!stats[note.matiere]) {
        stats[note.matiere] = {
          notes: [],
          moyenne: 0,
          totalCoef: 0
        };
      }
      stats[note.matiere].notes.push(note);
      const noteValue = parseFloat(note.note) || 0;
      const coef = parseFloat(note.coefficient) || 1;
      stats[note.matiere].totalCoef += coef;
      stats[note.matiere].moyenne = 
        (stats[note.matiere].moyenne * (stats[note.matiere].totalCoef - coef) + noteValue * coef) / stats[note.matiere].totalCoef;
    });
    return stats;
  }
}

