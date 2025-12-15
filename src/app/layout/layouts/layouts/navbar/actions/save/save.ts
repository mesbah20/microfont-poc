import {Component, effect, inject, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {FormGroupSignal, ONCLICK_RESET, ONCLICK_SAVE} from '../../../../../../shared/constant/button-signals.constant';
import {FormGroup} from '@angular/forms';
import { ActivityLogService } from '../../../../../../shared/services/activity-log.service';
import { LoaderService } from '../../../../../../shared/services/loader.service';

@Component({
    selector: 'app-save',
    imports: [],
    templateUrl: './save.html',
    standalone: true,
    styleUrl: './save.scss'
})
export class Save {
  frmGroup = signal<FormGroup>(FormGroupSignal());
  private activityLog = inject(ActivityLogService);
  private loaderService = inject(LoaderService);

  constructor() {
    effect(() => {
      const formGroup = FormGroupSignal();
      this.frmGroup.set(formGroup);
    });
  }

async save() {
  if (this.frmGroup().invalid) {
    return;
  }

  this.loaderService.show();
  ONCLICK_SAVE.set(true);

  try {
    const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';

    await this.activityLog.logEvent('SAVE_CLICK', functionId);

  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    this.loaderService.hide();
  }
}
}
