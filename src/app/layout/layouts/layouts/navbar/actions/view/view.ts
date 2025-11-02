import { Component, effect, signal } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { FormGroupSignal, ONCLICK_VIEW } from '../../../../../../shared/constant/button-signals.constant';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-view',
    imports: [
        MatIcon
    ],
    templateUrl: './view.html',
    standalone: true,
    styleUrl: './view.scss'
})
export class View {
    frmGroup = signal<FormGroup>(FormGroupSignal());

    constructor() {
      effect(() => {
        const formGroup = FormGroupSignal();
        this.frmGroup.set(formGroup);
      });
    }
    view() {
        ONCLICK_VIEW.set(true);
      }
}
