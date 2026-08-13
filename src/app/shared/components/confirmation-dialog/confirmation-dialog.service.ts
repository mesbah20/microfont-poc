import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from './confirmation-dialog.component';

/**
 * Options for `ConfirmationDialogService.confirm()`.
 * `tone` controls the visual style of the confirm button:
 *   - 'primary' (default): brand-colored OK button
 *   - 'danger'            : red OK button (for destructive actions like sign-out)
 */
export interface ConfirmOptions extends ConfirmationDialogData {
  tone?: 'primary' | 'danger';
}

/**
 * Reusable confirmation dialog service.
 *
 * Demo-faithful replacement for the Bootstrap `#exampleModal` the demo
 * uses for its logout confirmation. Wraps `ConfirmationDialogComponent`
 * and exposes a one-liner `confirm()` method returning an Observable<boolean>.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private readonly dialog = inject(MatDialog);

  confirm(options: ConfirmOptions): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmationDialogComponent, boolean> =
      this.dialog.open(ConfirmationDialogComponent, {
        data: options,
        width: 'min(420px, 92vw)',
        panelClass: 'confirmation-dialog-panel',
        autoFocus: 'dialog',
        restoreFocus: true,
      });

    return dialogRef.afterClosed().pipe(map((result) => result === true));
  }
}