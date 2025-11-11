import { Component, effect, inject, signal } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {FormGroupSignal, ONCLICK_RESET} from '../../../../../../shared/constant/button-signals.constant';
import { FormGroup } from '@angular/forms';
import { ActivityLogService } from '../../../../../../shared/services/activity-log.service';

@Component({
    selector: 'app-reset',
    imports: [
        MatIcon
    ],
    templateUrl: './reset.html',
    standalone: true,
    styleUrl: './reset.scss'
})
export class Reset {
  frmGroup = signal<FormGroup>(FormGroupSignal());
  private activityLog = inject(ActivityLogService);

   constructor() {
    effect(() => {
      const formGroup = FormGroupSignal();
      this.frmGroup.set(formGroup);
    });
  }
  reset() {
    const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';
    this.activityLog.logEvent('RESET_CLICK', functionId);
    ONCLICK_RESET.set(true);
  }
}
