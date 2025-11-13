import { Component, effect, inject, signal } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { FormGroupSignal, ONCLICK_VIEW } from '../../../../../../shared/constant/button-signals.constant';
import { FormGroup } from '@angular/forms';
import { ActivityLogService } from '../../../../../../shared/services/activity-log.service';

@Component({
    selector: 'app-view',
    imports: [],
    templateUrl: './view.html',
    standalone: true,
    styleUrl: './view.scss'
})
export class View {
    frmGroup = signal<FormGroup>(FormGroupSignal());
    private activityLog = inject(ActivityLogService);
    constructor() {
      effect(() => {
        const formGroup = FormGroupSignal();
        this.frmGroup.set(formGroup);
      });
    }
    view() {
        const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';
        this.activityLog.logEvent('VIEW_CLICK', functionId);
        ONCLICK_VIEW.set(true);
      }
}
