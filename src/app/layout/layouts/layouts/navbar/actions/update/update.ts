import { Component, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import { FormGroupSignal, ONCLICK_UPDATE } from '../../../../../../shared/constant/button-signals.constant';

@Component({
    selector: 'app-update',
    imports: [],
    templateUrl: './update.html',
    standalone: true,
    styleUrl: './update.scss'
})
export class Update {
    frmGroup = signal<FormGroup>(FormGroupSignal());
    update() {
        ONCLICK_UPDATE.set(true);
      }
}
