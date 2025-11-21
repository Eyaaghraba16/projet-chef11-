// Modèle simple pour l'utilisateur
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'etudiant' | 'enseignant' | 'directeur' | 'administratif';
  token?: string;
}
