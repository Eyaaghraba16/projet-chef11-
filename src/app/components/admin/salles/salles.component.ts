import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salles.component.html',
  styleUrls: ['./salles.css']
})
export class SallesComponent implements OnInit {

  salles: any[] = [];
  newSalle = { nom: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSalles();
  }

  loadSalles() {
    this.api.getSalles().subscribe(data => this.salles = data);
  }

  ajouter() {
    this.api.post('salles', this.newSalle).subscribe(() => {
      this.loadSalles();
      this.newSalle = { nom: '' };
    });
  }

  supprimer(id: number) {
    this.api.delete(`salles/${id}`).subscribe(() => this.loadSalles());
  }
}
