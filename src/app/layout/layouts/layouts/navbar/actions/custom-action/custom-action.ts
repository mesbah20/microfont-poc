import {Component, inject, Input, signal, WritableSignal} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {
  BUTTON_VISIBILITY,
  FormGroupSignal, ONCLICK_CUSTOM_ACTION
} from '../../../../../../shared/constant/button-signals.constant';
import {LoaderService} from '../../../../../../shared/services/loader.service';
import {ActivityLogService} from '../../../../../../shared/services/activity-log.service';
import {CommonModule} from '@angular/common';
@Component({
  selector: 'custom-action',
  imports: [CommonModule,],
  templateUrl: './custom-action.html',
  styleUrl: './custom-action.scss',
  standalone: true
})
export class CustomAction {
  /** Signal to toggle when clicked (lets you reuse the button for multiple update flows). */
  @Input() clickSignal: WritableSignal<boolean> = ONCLICK_CUSTOM_ACTION;
  buttons = BUTTON_VISIBILITY;
  frmGroup = signal<FormGroup>(FormGroupSignal());
  private loaderService = inject(LoaderService);
  private activityLog = inject(ActivityLogService);
  level: string;
  icon: string;
  constructor() {
    this.level = this.buttons()?.customButton?.customLevel ?? '';
    this.icon = this.buttons()?.customButton?.customIcon ? `/asset/icons/${this.buttons()?.customButton?.customIcon}.svg` : '';
  }
  async customAction() {
    if (this.frmGroup().invalid) {
      return;
    }
    this.loaderService.show();
    this.clickSignal.set(true);
    try {
      const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';
      this.activityLog.logEvent('UPDATE_CLICK', functionId);
    } catch (error) {
      console.error(error);
    } finally {
      this.loaderService.hide();
    }
  }
}
