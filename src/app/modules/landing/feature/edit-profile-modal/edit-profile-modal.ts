import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Button } from '../../../../shared/components/input-types/button/button';
import { FileComponent } from '../../../../shared/components/input-types/file-input/file-input';
import { IdBoxComponent } from '../../../../shared/components/input-types/id-box/id-box';
import { OfficeBoxComponent } from '../../../../shared/components/input-types/office-box/office-box';
import { TextArea } from '../../../../shared/components/input-types/text-area/text-area';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { DataGridComponent } from '../../../../shared/components/data-grid';
import { DataSelectionModal } from '../../../../shared/components/data-selection-modal/data-selection-modal';
import { ExpansionPanelHeader } from '../../../../shared/components/expansion-panel-header/expansion-panel-header';
import { ExpansionSubPanelHeader } from '../../../../shared/components/expansion-sub-panel-header/expansion-sub-panel-header';
import { AmountToWordInput } from '../../../../shared/components/input-types/amount-to-word-input/amount-to-word-input';
import { DateInput } from '../../../../shared/components/input-types/date-input/date-input';
import { NumberInput } from '../../../../shared/components/input-types/number-input/number-input';
import { SelectOptionField } from '../../../../shared/components/input-types/select-option-field/select-option-field';
import { Switch } from '../../../../shared/components/input-types/switch/switch';
import { LdsModalComponent } from '../../../../shared/components/lds-modal/lds-modal';
import { LdsStepperComponent } from '../../../../shared/components/lds-stepper/lds-stepper';
import { MultiSelectOptionField } from '../../../../shared/components/multi-select-option-field/multi-select-option-field';
import { OtherComponentsPage } from '../../../../shared/components/other-components-page/other-components-page';
import { MatIcon } from '@angular/material/icon';



@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextBaseInput,
    TextArea,
    FileComponent,
    OfficeBoxComponent,
    IdBoxComponent,
    Button,
    Switch,
    AmountToWordInput,
    SelectOptionField,
    DateInput,
    MultiSelectOptionField,
    LdsStepperComponent,
    LdsModalComponent,
    NumberInput,
    DataGridComponent,
    ExpansionPanelHeader,
    ExpansionSubPanelHeader,
    DataSelectionModal,
    OtherComponentsPage,
    MatIcon
      
  ],
  templateUrl: './edit-profile-modal.html',
  styleUrls: ['./edit-profile-modal.scss'],

})
export class EditProfileModal implements OnInit {
  @Input() initialData?: any;
  @Input() modalParent?: { close(result?: any): void; closeModal(): void };


  @Output() modalResult = new EventEmitter<any>();

    frmGroup!: FormGroup;
  headerOpen: WritableSignal<boolean> = signal(true);
  imgPreviewUrl: string | ArrayBuffer | null = null;
  selectedImageFile?: File;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.frmGroup = this.fb.group({
      user_id: [{ value: '', disabled: true }],
      home_office_id: [{ value: '', disabled: true }],
      login_id: [{ value: '', disabled: true }],
      user_nm: ['', [Validators.required, Validators.maxLength(100)]],
      user_descrip: ['', [Validators.maxLength(500)]],
      user_email_id: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      mobile_number: [
        '',
        [Validators.maxLength(30), Validators.pattern(/^[0-9+\-\s()]{0,30}$/)]
      ],
      user_img: [null],
    });

    if (this.initialData) {
      const patch: any = {};
      Object.keys(this.frmGroup.controls).forEach((k) => {
        if (this.initialData[k] !== undefined) patch[k] = this.initialData[k];
      });
      this.frmGroup.patchValue(patch);
      if (this.initialData.user_img) this.imgPreviewUrl = this.initialData.user_img;
    }
  }

  getModalResult() {
    return this.frmGroup.getRawValue();
  }

  onProfilePicSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.selectedImageFile = file;
    this.frmGroup.patchValue({ user_img: file });

    const reader = new FileReader();
    reader.onload = () => (this.imgPreviewUrl = reader.result);
    reader.readAsDataURL(file);
  }
}

