import { Component, effect, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import { FormGroupSignal, ONCLICK_DELETE, ONCLICK_RESET } from '../../../../../../shared/constant/button-signals.constant';

@Component({
    selector: 'app-exit',
    imports: [
        MatIcon
    ],
    templateUrl: './exit.html',
    standalone: true,
    styleUrl: './exit.scss'
})
export class Exit {
  frmGroup = signal<FormGroup>(FormGroupSignal());
  
   constructor() {
    effect(() => {
      const formGroup = FormGroupSignal();
      this.frmGroup.set(formGroup);
    });
  }

    exit() {
      ONCLICK_DELETE.set(true);
    }
}
