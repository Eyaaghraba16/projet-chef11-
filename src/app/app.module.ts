import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmploiDuTempsComponent } from './components/etudiant/emploi-du-temps/emploi-du-temps.component';
import { DepartementsComponent } from './components/admin/departements.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    EmploiDuTempsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    DepartementsComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
