import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Matieres } from './matieres.component';

describe('Matieres', () => {
  let component: Matieres;
  let fixture: ComponentFixture<Matieres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Matieres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Matieres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
