import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

interface Message {
  id: number;
  sujet: string;
  contenu: string;
  date_envoi: string;
  expediteur: string;
  destinataire: string;
  lu: number;
  id_expediteur: number;
  id_destinataire: number;
}

@Component({
  selector: 'app-messages-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-enseignant.component.html',
  styleUrls: ['./messages-enseignant.component.css']
})
export class MessagesEnseignantComponent implements OnInit {
  messages: Message[] = [];
  utilisateurs: any[] = [];
  filtre = 'tous';
  messageInfo = '';
  sending = false;

  form = {
    id_destinataire: null as number | null,
    sujet: '',
    contenu: ''
  };

  private currentUserId: number | null = null;

  constructor(private api: ApiService, private auth: AuthService) {
    this.currentUserId = this.auth.currentUserValue?.id || null;
  }

  ngOnInit(): void {
    this.chargerMessages();
    this.chargerUtilisateurs();
  }

  chargerMessages(): void {
    this.api.getMessages().subscribe({
      next: (data) => {
        this.messages = data || [];
      },
      error: (err) => {
        console.error('❌ Erreur chargement messages', err);
        this.messageInfo = err.error?.message || 'Impossible de récupérer les messages.';
      }
    });
  }

  chargerUtilisateurs(): void {
    this.api.getUtilisateurs().subscribe({
      next: (data) => this.utilisateurs = data || [],
      error: (err) => console.error('❌ Erreur chargement utilisateurs', err)
    });
  }

  envoyerMessage(): void {
    if (!this.form.id_destinataire || !this.form.sujet || !this.form.contenu) {
      this.messageInfo = 'Veuillez sélectionner un destinataire et remplir le sujet et le contenu.';
      return;
    }

    this.sending = true;
    this.api.envoyerMessage(this.form).subscribe({
      next: () => {
        this.messageInfo = 'Message envoyé.';
        this.form = { id_destinataire: null, sujet: '', contenu: '' };
        this.sending = false;
        this.chargerMessages();
      },
      error: (err) => {
        console.error('❌ Erreur envoi message', err);
        this.messageInfo = err.error?.message || 'Impossible d\'envoyer le message.';
        this.sending = false;
      }
    });
  }

  getMessagesFiltres(): Message[] {
    if (!this.currentUserId) {
      return this.messages;
    }

    if (this.filtre === 'recus') {
      return this.messages.filter(m => m.id_destinataire === this.currentUserId);
    }

    if (this.filtre === 'envoyes') {
      return this.messages.filter(m => m.id_expediteur === this.currentUserId);
    }

    return this.messages;
  }
}

