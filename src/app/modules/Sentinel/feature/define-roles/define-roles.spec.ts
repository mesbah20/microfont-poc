import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineRoles } from './define-roles';

describe('DefineRoles', () => {
  let component: DefineRoles;
  let fixture: ComponentFixture<DefineRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefineRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefineRoles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
