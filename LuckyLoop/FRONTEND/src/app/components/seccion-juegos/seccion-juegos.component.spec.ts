import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionJuegosComponent } from './seccion-juegos.component';

describe('SeccionJuegosComponent', () => {
  let component: SeccionJuegosComponent;
  let fixture: ComponentFixture<SeccionJuegosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeccionJuegosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionJuegosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
