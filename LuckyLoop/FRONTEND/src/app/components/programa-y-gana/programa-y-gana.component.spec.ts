import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaYGanaComponent } from './programa-y-gana.component';

describe('ProgramaYGanaComponent', () => {
  let component: ProgramaYGanaComponent;
  let fixture: ComponentFixture<ProgramaYGanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramaYGanaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaYGanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
