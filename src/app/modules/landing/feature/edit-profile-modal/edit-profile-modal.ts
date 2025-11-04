import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LdsModalComponent } from '../../../../shared/components/lds-modal/lds-modal';

export type UserDto = {
  user_id: string;
  user_nm: string;
  user_descrip: string;
  home_office_id: string;
  user_email_id: string;
  login_id: string;
  mobile_number: string;
  user_img: string;
};

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LdsModalComponent],
  templateUrl: './edit-profile-modal.html',
  styleUrls: ['./edit-profile-modal.scss']
})
export class EditProfileModal implements OnChanges {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  @Input() user!: UserDto;

  // Editable fields only
  editableFields: Array<keyof UserDto> = [
    'user_nm', 'user_descrip', 'user_email_id', 'mobile_number', 'user_img'
  ];

  @Output() save = new EventEmitter<Partial<UserDto>>();
  @Output() close = new EventEmitter<void>();

  // CHANGE: declare the form with definite assignment; actual init happens in constructor
  frm!: ReturnType<FormBuilder['group']>;

  // CHANGE: move form initialization into constructor so fb is already injected
  constructor(private fb: FormBuilder) {
    this.frm = this.fb.group({
      user_id: [{ value: '', disabled: true }],
      user_nm: ['', Validators.required],
      user_descrip: [''],
      home_office_id: [{ value: '', disabled: true }],
      user_email_id: ['', [Validators.email]],
      login_id: [{ value: '', disabled: true }],
      mobile_number: ['', [Validators.maxLength(30)]],
      user_img: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.frm.reset({
        user_id: this.user.user_id,
        user_nm: this.user.user_nm,
        user_descrip: this.user.user_descrip,
        home_office_id: this.user.home_office_id,
        user_email_id: this.user.user_email_id,
        login_id: this.user.login_id,
        mobile_number: this.user.mobile_number,
        user_img: this.user.user_img
      });
    }
  }

  onClose() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.close.emit();
  }

  onSave() {
    if (this.frm.invalid || !this.user) return;

    const after = this.frm.getRawValue() as UserDto;
    const patch: Partial<UserDto> = {};

    // Only send changed editable fields
    for (const key of this.editableFields) {
      if (after[key] !== this.user[key]) {
        patch[key] = after[key];
      }
    }

    if (Object.keys(patch).length > 0) {
      this.save.emit(patch);
    }
    this.onClose();
  }
}
