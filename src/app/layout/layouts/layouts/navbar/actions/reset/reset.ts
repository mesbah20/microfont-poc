import { Component, effect, signal } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {FormGroupSignal, ONCLICK_RESET} from '../../../../../../shared/constant/button-signals.constant';
import { FormGroup } from '@angular/forms';

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
  
   constructor() {
    effect(() => {
      const formGroup = FormGroupSignal();
      this.frmGroup.set(formGroup);
    });
  }
  reset() {
    ONCLICK_RESET.set(true);
  }
}
