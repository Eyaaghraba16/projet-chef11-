import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rapports.html',
  styleUrls: ['./rapports.css']
})
export class RapportsComponent implements OnInit {
  rapports: any[] = [];
  loading: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getRapports();
  }

  getRapports() {
    this.loading = true;
    this.api.getRapports().subscribe({
      next: (data: any[]) => {
        this.rapports = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des rapports', err);
        this.loading = false;
      }
    });
  }

  // Fonction générique pour télécharger un Blob
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Télécharger le rapport en PDF
  downloadPdf(rapportId: number) {
    this.api.downloadRapportPdf(rapportId).subscribe({
      next: (blob: Blob) => this.downloadFile(blob, `rapport_${rapportId}.pdf`),
      error: (err: any) => console.error('Erreur téléchargement PDF', err)
    });
  }

  // Télécharger le rapport en CSV
  downloadCsv(rapportId: number) {
    this.api.downloadRapportCsv(rapportId).subscribe({
      next: (blob: Blob) => this.downloadFile(blob, `rapport_${rapportId}.csv`),
      error: (err: any) => console.error('Erreur téléchargement CSV', err)
    });
  }
}
