import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Salles } from './salles.component';

describe('Salles', () => {
  let component: Salles;
  let fixture: ComponentFixture<Salles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Salles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Salles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
