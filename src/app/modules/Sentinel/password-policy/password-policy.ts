import {Component, effect, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TextBaseInput} from '../../../shared/components/input-types/text-base-input/text-base-input';
import {ExpansionPanelHeader} from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import {Button} from '../../../shared/components/input-types/button/button';
import {NumberInput} from '../../../shared/components/input-types/number-input/number-input';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SubPanelHeader} from '../../../shared/components/sub-panel-header/sub-panel-header';
import {Switch} from '../../../shared/components/input-types/switch/switch';
import {BUTTON_VISIBILITY, ONCLICK_RESET, ONCLICK_SAVE} from '../../../shared/constant/button-signals.constant';
import {ToastrService} from 'ngx-toastr';
import {UserCredentialsPolicyModel} from '../../model/UserCredentialsPolicy.model';
import {PasswordPolicyService} from '../../service/password-policy-service';

@Component({
  selector: 'app-password-policy',
  imports: [CommonModule,  ExpansionPanelHeader,  NumberInput, MatMenuModule,
    MatIconModule, ReactiveFormsModule,  Switch,],
  templateUrl: './password-policy.html',
  styleUrl: './password-policy.scss'
})
export class PasswordPolicy implements OnInit{
  onClickSave = ONCLICK_SAVE;
  toastr = inject(ToastrService);
  formBuilder = inject(FormBuilder);
  service = inject(PasswordPolicyService);

  businessHeaderPanel: WritableSignal<boolean> = signal(true);

  passwordPolicy!: UserCredentialsPolicyModel;

  constructor(){
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: false,
    });
    effect(() => {
      if(this.onClickSave()) {
        this.updatePasswordPolicy();
        ONCLICK_SAVE.set(false);
      }
    });
  }
  readonly frmGroup = this.formBuilder.group({
    passwordPolicy: this.formBuilder.group({
      passLengthMax: ['', Validators.required],
      nonAlphaNumCharMin: ['', Validators.required],
      passHistoryDays: ['', Validators.required],
      passReuseMax: ['', Validators.required],
      passLengthMin: ['', Validators.required],
      failedLoginAttempts: ['', Validators.required],
      passExpPeriodDays: ['', Validators.required],
      passExpAlertDays: ['', Validators.required],
      capitalCharMin: ['', Validators.required],
      smallCharMin: ['', Validators.required],
      numberMin: ['', Validators.required],
      samePassConsequtive: ['', Validators.required],
      samePassReuseAfter: ['', Validators.required],
      recentMenuItem: [''],
      favoriteMenuItem: [''],
      userInactiveNoLoginDays: [''],
      samePassRepeatAllow: ['', Validators.required],
      adminUserGrade: ['', Validators.required],
      passSuccSameCharAllow: [true],
      passExpForceChangeFlag: [true],
      passIsAlphanumeric: [true],
    })
  });
  get passwordPolicyForm(): FormGroup {
    return this.frmGroup.get('passwordPolicy') as FormGroup;
  }

  ngOnInit(): void {
    this.loadDataForPasswordPolicy();

    this.frmGroup.get('passwordPolicy.passSuccSameCharAllow')?.valueChanges.subscribe((isEnabled: boolean | null) => {
      this.handleSwitchToggle(isEnabled);
    });
  }
  private handleSwitchToggle(isEnabled: boolean | null): void {
    if (isEnabled) {
      //this.frmGroup.get('user.employeeId')?.setValidators([Validators.requiredTrue]);
      //this.frmGroup.get('user.employeeCode')?.setValidators([Validators.requiredTrue]);
    } else {
      //this.frmGroup.get('user.employeeId')?.clearValidators();
      //this.frmGroup.get('user.employeeCode')?.clearValidators();
    }
  }
/*  loadDataForPasswordPolicy() {
    const request = { };
    this.service.getPasswordPolicy().subscribe({
      next: (res: any) => {
        this.passwordPolicy = res
        this.frmGroup.get('passwordPolicy')?.patchValue(this.passwordPolicy);
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });
  }*/
  loadDataForPasswordPolicy() {
    this.service.getPasswordPolicy().subscribe({
      next: (res: UserCredentialsPolicyModel[] | any) => {
        if (Array.isArray(res) && res.length > 0) {
          const firstPolicy = res[0];
          const policy = {
            ...firstPolicy,
          };
          this.passwordPolicy = policy;
          console.log("this.passwordPolicy", this.passwordPolicy);

          this.passwordPolicyForm.patchValue(policy);
        } else {
          console.warn('No password policy data found.');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error Fetching Data');
      }
    });
  }



  updatePasswordPolicy() {
    const formValue = this.passwordPolicyForm.value;

    const payload: UserCredentialsPolicyModel = {
      ...formValue,
      passLengthMax: Number(formValue.passLengthMax),
      passLengthMin: Number(formValue.passLengthMin),
      passExpPeriodDays: Number(formValue.passExpPeriodDays),
      passHistoryDays: Number(formValue.passHistoryDays),
      passReuseMax: Number(formValue.passReuseMax),
      failedLoginAttempts: Number(formValue.failedLoginAttempts),
      passExpAlertDays: Number(formValue.passExpAlertDays),
      nonAlphaNumCharMin: Number(formValue.nonAlphaNumCharMin),
      capitalCharMin: Number(formValue.capitalCharMin),
      smallCharMin: Number(formValue.smallCharMin),
      numberMin: Number(formValue.numberMin),
      samePassConsequtive: Number(formValue.samePassConsequtive),
      samePassReuseAfter: Number(formValue.samePassReuseAfter),
      recentMenuItem: Number(formValue.recentMenuItem),
      favoriteMenuItem: Number(formValue.favoriteMenuItem),
      userInactiveNoLoginDays: Number(formValue.userInactiveNoLoginDays),
      samePassRepeatAllow: Number(formValue.samePassRepeatAllow),
      adminUserGrade: Number(formValue.adminUserGrade),
      passSuccSameCharAllow: Boolean(formValue.passSuccSameCharAllow),
      passExpForceChangeFlag: Boolean(formValue.passExpForceChangeFlag),
      passIsAlphanumeric: Boolean(formValue.passIsAlphanumeric),
      recordUserId : localStorage.getItem("userId"),
      //recordUserId : "shawon",
      recordDate: new Date()

    };
console.log("payload...",payload);
   // this.service.savePasswordPolicy(payload).subscribe(...);
    this.service.updatePasswordPolicy(payload).subscribe({
      next: (res) => {
        this.toastr.success('Data updated successfully!', 'Updated Successful');
        this.loadDataForPasswordPolicy();
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error(err, 'Error');
      }
    });
  }

}
