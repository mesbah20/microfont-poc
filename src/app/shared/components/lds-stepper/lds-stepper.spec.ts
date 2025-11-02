import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LdsStepper } from './lds-stepper';

describe('LdsStepper', () => {
  let component: LdsStepper;
  let fixture: ComponentFixture<LdsStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LdsStepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LdsStepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
