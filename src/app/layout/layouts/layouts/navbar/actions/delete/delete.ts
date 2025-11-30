import {Component, effect, inject, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { FormGroupSignal } from '../../../../../../shared/constant/button-signals.constant';
import { ActivityLogService } from '../../../../../../shared/services/activity-log.service';
import { ConfirmationDialogue } from '../../../../../../shared/common-components/delete-confirmation-dialogue/confirmation-dialogue';

@Component({
  selector: 'app-delete',
  imports: [],
  templateUrl: './delete.html',
  standalone: true,
  styleUrl: './delete.scss'
})
export class Delete {

  private dialog = inject(MatDialog);
  frmGroup = signal<FormGroup>(FormGroupSignal());
  private activityLog = inject(ActivityLogService);
   constructor() {
    effect(() => {
      const formGroup = FormGroupSignal();
      this.frmGroup.set(formGroup);
    });
  }
  delete() {
    let dialogRef = this.dialog.open(ConfirmationDialogue, {
      width: '450px',
      data: { 
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this item? <br>This action cannot be undone.',
        buttons: [
          { text: 'Delete', action: 'confirm' },
          { text: 'Cancel', action: 'cancel' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // User confirmed deletion
        console.log('Item deleted!');
        // Add your deletion logic here
        const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';
        this.activityLog.logEvent('DELETE_CLICK', functionId);
      } else {
        // User cancelled
        console.log('Deletion cancelled');
        const functionId = localStorage.getItem('currentFunctionId') || 'UNKNOWN';
        this.activityLog.logEvent('DELETE_CLICK_CANCEL', functionId);
      }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   this.animal = result;
    // });

  }
}
