import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNodeComponent } from './gl-node-component';

describe('GlNodeComponent', () => {
  let component: AccountNodeComponent;
  let fixture: ComponentFixture<AccountNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
