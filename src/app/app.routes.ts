import { Routes } from '@angular/router';

// Home
import { HomeComponent } from './components/home/home.component';

// Auth
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

// Dashboard
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Admin
import { DepartementsComponent } from './components/admin/departements.component';
import { EnseignantsComponent } from './components/admin/enseignants/enseignants.component';
import { EtudiantsAdminComponent } from './components/admin/etudiants/etudiants-admin.component';
import { SallesComponent } from './components/admin/salles/salles.component';
import { MatieresComponent } from './components/admin/matieres/matieres.component';
import { RapportsComponent } from './components/admin/rapports/rapports.component';
import { EvenementsComponent } from './components/admin/evenements/evenements.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';

// Emploi du temps
import { EmploiDuTempsComponent } from './components/etudiant/emploi-du-temps/emploi-du-temps.component';
import { EmploiDuTempsEtudiantComponent } from './components/etudiant/emploi-du-temps/emploi-du-temps-etudiant.component';

// Enseignant
import { EmploiEnseignantComponent } from './components/enseignant/emploi/emploi-enseignant.component';
import { MesAbsencesEnseignantComponent } from './components/enseignant/mes-absences/mes-absences.component';
import { AbsencesEtudiantsEnseignantComponent } from './components/enseignant/absences-etudiants/absences-etudiants.component';
import { RattrapagesEnseignantComponent } from './components/enseignant/rattrapages/rattrapages-enseignant.component';
import { MessagesEnseignantComponent } from './components/enseignant/messages/messages-enseignant.component';

// Étudiant
import { AbsencesEtudiantComponent } from './components/etudiant/absences/absences.component';
import { NotesEtudiantComponent } from './components/etudiant/notes/notes.component';
import { NotificationsEtudiantComponent } from './components/etudiant/notifications/notifications.component';

// Guard
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

  // ---------------- AUTH ----------------
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/login', component: AdminLoginComponent },

  // -------------- DASHBOARD --------------
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  // -------------- ADMIN (administratif) --------------
  {
    path: 'admin/departements',
    component: DepartementsComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }
  },
  {
    path: 'admin/enseignants',
    component: EnseignantsComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }
  },
  {
    path: 'admin/etudiants',
    component: EtudiantsAdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }
  },
  {
    path: 'admin/salles',
    component: SallesComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }
  },
  {
    path: 'admin/matieres',
    component: MatieresComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }
  },
  {
    path: 'admin/rapports',
    component: RapportsComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }
  },
  {
    path: 'admin/evenements',
    component: EvenementsComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }
  },

  // -------- ÉTUDIANT --------
  {
    path: 'etudiant/emploi-du-temps',
    component: EmploiDuTempsEtudiantComponent,
    canActivate: [AuthGuard],
    data: { role: 'etudiant' }
  },
  {
    path: 'etudiant/absences',
    component: AbsencesEtudiantComponent,
    canActivate: [AuthGuard],
    data: { role: 'etudiant' }
  },
  {
    path: 'etudiant/notes',
    component: NotesEtudiantComponent,
    canActivate: [AuthGuard],
    data: { role: 'etudiant' }
  },
  {
    path: 'etudiant/notifications',
    component: NotificationsEtudiantComponent,
    canActivate: [AuthGuard],
    data: { role: 'etudiant' }
  },

  // -------- EMPLOI DU TEMPS (autres rôles) --------

  {
    path: 'enseignant/emploi-du-temps',
    component: EmploiEnseignantComponent,
    canActivate: [AuthGuard],
    data: { role: 'enseignant' }
  },
  {
    path: 'enseignant/absences',
    component: MesAbsencesEnseignantComponent,
    canActivate: [AuthGuard],
    data: { role: 'enseignant' }
  },
  {
    path: 'enseignant/absences-etudiants',
    component: AbsencesEtudiantsEnseignantComponent,
    canActivate: [AuthGuard],
    data: { role: 'enseignant' }
  },
  {
    path: 'enseignant/rattrapages',
    component: RattrapagesEnseignantComponent,
    canActivate: [AuthGuard],
    data: { role: 'enseignant' }
  },
  {
    path: 'enseignant/messagerie',
    component: MessagesEnseignantComponent,
    canActivate: [AuthGuard],
    data: { role: 'enseignant' }
  },

  {
    path: 'directeur/emploi-du-temps',
    component: EmploiDuTempsComponent,
    canActivate: [AuthGuard],
    data: { role: 'directeur' }
  },

  {
    path: 'administratif/emploi-du-temps',
    component: EmploiDuTempsComponent,
    canActivate: [AuthGuard],
    data: { role: 'administratif' }  // 🔥 OK
  },

  { path: '**', redirectTo: '' }
];
