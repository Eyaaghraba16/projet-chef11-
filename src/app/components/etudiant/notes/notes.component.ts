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
    this.api.getNotes().subscribe({
      next: (data: any[]) => {
        // Filtrer les notes de l'étudiant connecté
        const userId = this.authService.currentUserValue?.id;
        this.notes = data.filter((note: any) => note.etudiantId === userId || !note.etudiantId);
        this.calculerMoyenne();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement notes', err);
        this.loading = false;
        // Données d'exemple
        this.notes = [
          {
            id: 1,
            matiere: 'Programmation Web',
            note: 16.5,
            coefficient: 3,
            type: 'Examen'
          },
          {
            id: 2,
            matiere: 'Base de données',
            note: 14.0,
            coefficient: 2,
            type: 'DS'
          },
          {
            id: 3,
            matiere: 'Réseaux informatiques',
            note: 15.5,
            coefficient: 2,
            type: 'Examen'
          }
        ];
        this.calculerMoyenne();
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

