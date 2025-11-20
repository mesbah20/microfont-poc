import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRolesModal } from './user-roles-modal';

describe('UserRolesModal', () => {
  let component: UserRolesModal;
  let fixture: ComponentFixture<UserRolesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRolesModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRolesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
