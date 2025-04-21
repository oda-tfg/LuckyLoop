import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BettingTableComponent } from './roulette-table.component';

describe('RouletteTableComponent', () => {
  let component: BettingTableComponent;
  let fixture: ComponentFixture<BettingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BettingTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BettingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
