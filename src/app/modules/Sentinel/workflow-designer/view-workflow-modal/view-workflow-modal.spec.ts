import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWorkflowModal } from './view-workflow-modal';

describe('ViewWorkflowModal', () => {
  let component: ViewWorkflowModal;
  let fixture: ComponentFixture<ViewWorkflowModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWorkflowModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewWorkflowModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
