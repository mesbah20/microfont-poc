import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalCalendarSetup } from './graphical-calendar-setup';

describe('GraphicalCalendarSetup', () => {
  let component: GraphicalCalendarSetup;
  let fixture: ComponentFixture<GraphicalCalendarSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphicalCalendarSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphicalCalendarSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
