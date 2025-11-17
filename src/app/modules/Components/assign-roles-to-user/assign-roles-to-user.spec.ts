import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignRolesToUser } from './assign-roles-to-user';

describe('AssignRolesToUser', () => {
  let component: AssignRolesToUser;
  let fixture: ComponentFixture<AssignRolesToUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignRolesToUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignRolesToUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
