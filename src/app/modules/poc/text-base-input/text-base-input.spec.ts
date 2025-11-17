import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextBaseInput } from './text-base-input';

describe('TextBaseInput', () => {
  let component: TextBaseInput;
  let fixture: ComponentFixture<TextBaseInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextBaseInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextBaseInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
