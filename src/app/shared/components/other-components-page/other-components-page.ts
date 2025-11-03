import { Component, EventEmitter, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBaseInput } from '../input-types/text-base-input/text-base-input';
import { IdBoxComponent } from '../input-types/id-box/id-box';
import { AmountInput } from '../input-types/amount-input/amount-input';
import { Switch } from '../input-types/switch/switch';
import { Button } from '../input-types/button/button';
import { TextArea } from '../input-types/text-area/text-area';
import { AmountToWordInput } from '../input-types/amount-to-word-input/amount-to-word-input';
import { SelectOptionField } from '../input-types/select-option-field/select-option-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpansionSubPanelHeader } from '../expansion-sub-panel-header/expansion-sub-panel-header';
import { ExpansionPanelHeader } from '../expansion-panel-header/expansion-panel-header';

@Component({
  selector: 'app-other-components-page',
  standalone: true,
  imports: [
    CommonModule,
    TextBaseInput,
        IdBoxComponent,
        ReactiveFormsModule,
        AmountInput,
        Switch,
        Button,
        TextArea,
        AmountToWordInput,
        SelectOptionField,
          ExpansionPanelHeader,
            ExpansionSubPanelHeader,

  ],
  templateUrl: './other-components-page.html',
  styleUrls: ['./other-components-page.scss']
})
export class OtherComponentsPage implements OnInit {
  frmGroup: FormGroup;
  public title = 'Other Components Page (Modal)';
   businessHeaderPanel: WritableSignal<boolean> = signal(true);

   @Output() modalResult = new EventEmitter<any>();
   @Input() modalParent?: { close(result?: any): void; closeModal(): void };
  
   @Input() initialData?: any;
  // Add t constructor for debugging
  constructor( private formBuilder: FormBuilder) {
    console.log('OtherComponentsPage constructor called');
    console.log('Title:', this.title);
  }
  
  // Add ngOnInit for debugging
  ngOnInit() {
      this.frmGroup = this.formBuilder.group({
      textBox: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      textArea: ['', [Validators.required, Validators.maxLength(500)]],
      switch: [true],
      amount: ['', [Validators.required, Validators.max(1000000), Validators.min(1)]],
      amountToWord: ['', [Validators.required, Validators.max(1000000), Validators.min(1)]],
    });

      // if (this.initialData) {
      //   console.log('Modal received initialData:', this.initialData);
      //   try {
      //     const patch: any = {};
      //     Object.keys(this.frmGroup.controls).forEach(key => {
      //       if (this.initialData[key] !== undefined) {
      //         patch[key] = this.initialData[key];
      //       }
      //     });
      //     if (Object.keys(patch).length) {
      //       this.frmGroup.patchValue(patch);
      //     }
      //   } catch (e) {
      //     console.warn('Failed to apply initialData to modal form', e);
      //   }
      // }
  }



} 