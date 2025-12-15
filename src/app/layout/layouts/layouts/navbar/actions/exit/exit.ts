import { Component, effect, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import { FormGroupSignal, ONCLICK_DELETE, ONCLICK_RESET } from '../../../../../../shared/constant/button-signals.constant';
import { LoaderService } from '../../../../../../shared/services/loader.service';

@Component({
    selector: 'app-exit',
    imports: [],
    templateUrl: './exit.html',
    standalone: true,
    styleUrl: './exit.scss'
})
export class Exit {
  frmGroup = signal<FormGroup>(FormGroupSignal());
  private loaderService = inject(LoaderService);
   constructor() {
    effect(() => {
      const formGroup = FormGroupSignal();
      this.frmGroup.set(formGroup);
    });
  }

async exit() {
  this.loaderService.show();
  ONCLICK_DELETE.set(true);

  try {
    const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';

  } catch (error) {
    console.error('Exit operation failed:', error);
  } finally {
    this.loaderService.hide();
  }
}
}
