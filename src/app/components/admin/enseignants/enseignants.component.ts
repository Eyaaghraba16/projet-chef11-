import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-enseignants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enseignants.component.html',
  styleUrls: ['./enseignants.component.css']
})
export class EnseignantsComponent implements OnInit {

  enseignants: any[] = [];
  newEnseignant = {
    nom: '',
    prenom: '',
    email: '',
    specialite: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadEnseignants();
  }

  loadEnseignants() {
    this.api.get('enseignants').subscribe({
      next: (data: any) => {
        this.enseignants = data;
      }
    });
  }

  ajouter() {
    this.api.post('enseignants', this.newEnseignant).subscribe({
      next: () => {
        this.loadEnseignants();
        this.newEnseignant = { nom: '', prenom: '', email: '', specialite: '' };
      }
    });
  }

  supprimer(id: number) {
    this.api.delete(`enseignants/${id}`).subscribe({
      next: () => this.loadEnseignants()
    });
  }
}
