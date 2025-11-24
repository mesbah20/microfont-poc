import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Usernote } from './usernote';

describe('Usernote', () => {
  let component: Usernote;
  let fixture: ComponentFixture<Usernote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usernote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Usernote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
