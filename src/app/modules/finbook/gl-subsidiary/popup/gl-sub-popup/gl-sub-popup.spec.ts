import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlSubPopup } from './gl-sub-popup';

describe('GlSubPopup', () => {
  let component: GlSubPopup;
  let fixture: ComponentFixture<GlSubPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlSubPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlSubPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
