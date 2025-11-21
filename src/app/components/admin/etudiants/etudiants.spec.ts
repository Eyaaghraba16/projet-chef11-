import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Etudiants } from './etudiants.component';

describe('Etudiants', () => {
  let component: Etudiants;
  let fixture: ComponentFixture<Etudiants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Etudiants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Etudiants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
