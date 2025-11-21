import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-matieres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matieres.component.html',
  styleUrls: ['./matieres.css']
})
export class MatieresComponent implements OnInit {

  matieres: any[] = [];
  newMatiere = { nom: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMatieres();
  }

  loadMatieres() {
    this.api.getMatieres().subscribe(data => this.matieres = data);
  }

  ajouter() {
    this.api.post('matieres', this.newMatiere).subscribe(() => {
      this.loadMatieres();
      this.newMatiere = { nom: '' };
    });
  }

  supprimer(id: number) {
    this.api.delete(`matieres/${id}`).subscribe(() => this.loadMatieres());
  }
}
