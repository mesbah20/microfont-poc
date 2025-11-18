import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlSubsidiary } from './gl-subsidiary';

describe('GlSubsidiary', () => {
  let component: GlSubsidiary;
  let fixture: ComponentFixture<GlSubsidiary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlSubsidiary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlSubsidiary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
