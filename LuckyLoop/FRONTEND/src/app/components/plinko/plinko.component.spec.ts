import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlinkoGameComponent } from './plinko.component';

describe('PlinkoGameComponent', () => {
  let component: PlinkoGameComponent;
  let fixture: ComponentFixture<PlinkoGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlinkoGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlinkoGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
