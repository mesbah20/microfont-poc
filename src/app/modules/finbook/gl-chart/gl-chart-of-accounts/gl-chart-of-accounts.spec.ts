import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlChartOfAccounts } from './gl-chart-of-accounts';

describe('GlChartOfAccounts', () => {
  let component: GlChartOfAccounts;
  let fixture: ComponentFixture<GlChartOfAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlChartOfAccounts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlChartOfAccounts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
