import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinasComponent } from './minas.component';

describe('MinasComponent', () => {
  let component: MinasComponent;
  let fixture: ComponentFixture<MinasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MinasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
