import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordPolicy } from './password-policy';

describe('PasswordPolicy', () => {
  let component: PasswordPolicy;
  let fixture: ComponentFixture<PasswordPolicy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordPolicy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordPolicy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
