import {Component, effect, inject, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {
  DeleteConfirmationDialogue
} from '../../../../../../shared/components/delete-confirmation-dialogue/delete-confirmation-dialogue';
import { FormGroup } from '@angular/forms';
import { FormGroupSignal } from '../../../../../../shared/constant/button-signals.constant';

@Component({
  selector: 'app-delete',
  imports: [
    MatIcon
  ],
  templateUrl: './delete.html',
  standalone: true,
  styleUrl: './delete.scss'
})
export class Delete {

  private dialog = inject(MatDialog);
  frmGroup = signal<FormGroup>(FormGroupSignal());
  
   constructor() {
    effect(() => {
      const formGroup = FormGroupSignal();
      this.frmGroup.set(formGroup);
    });
  }
  delete() {
    let dialogRef = this.dialog.open(DeleteConfirmationDialogue, {
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
      } else {
        // User cancelled
        console.log('Deletion cancelled');
      }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   this.animal = result;
    // });

  }
}
