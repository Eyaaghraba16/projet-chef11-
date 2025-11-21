import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-evenements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evenements.html',
  styleUrls: ['./evenements.css']
})
export class EvenementsComponent implements OnInit {

  evenements: any[] = [];
  newEvenement = { titre: '', date: '', description: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadEvenements();
  }

  loadEvenements() {
    this.api.get('evenements').subscribe(data => this.evenements = data);
  }

  ajouter() {
    if (!this.newEvenement.titre || !this.newEvenement.date) {
      alert('Veuillez remplir le titre et la date');
      return;
    }
    this.api.post('evenements', this.newEvenement).subscribe(() => {
      this.loadEvenements();
      this.newEvenement = { titre: '', date: '', description: '' };
    });
  }

  supprimer(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.api.delete(`evenements/${id}`).subscribe(() => this.loadEvenements());
    }
  }
}
