import { Component, effect, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import { FormGroupSignal, ONCLICK_UPDATE } from '../../../../../../shared/constant/button-signals.constant';
import { LoaderService } from '../../../../../../shared/services/loader.service';
import { ActivityLogService } from '../../../../../../shared/services/activity-log.service';

@Component({
    selector: 'app-update',
    imports: [],
    templateUrl: './update.html',
    standalone: true,
    styleUrl: './update.scss'
})
export class Update {
    frmGroup = signal<FormGroup>(FormGroupSignal());
private loaderService = inject(LoaderService);
private activityLog = inject(ActivityLogService);

async update() {
  if (this.frmGroup().invalid) {
    return;
  }

  this.loaderService.show();
  ONCLICK_UPDATE.set(true);

  try {
    const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';

    await this.activityLog.logEvent('UPDATE_CLICK', functionId);
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    this.loaderService.hide();
  }
}
}
