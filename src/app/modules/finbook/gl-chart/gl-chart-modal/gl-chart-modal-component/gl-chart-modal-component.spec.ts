import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlChartModalComponent } from './gl-chart-modal-component';

describe('GlChartModalComponent', () => {
  let component: GlChartModalComponent;
  let fixture: ComponentFixture<GlChartModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlChartModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlChartModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
