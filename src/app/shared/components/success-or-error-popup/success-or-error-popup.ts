import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import {
  SuccessOrErrorPopupService,
  PopupMessage,
} from '../../../core/services/success-or-error-popup.service';
import { NewlinePipe } from '../../pipes/newline.pipe';

/**
 * Demo-faithful success/error/pending popup.
 *
 * Visual model:
 *   1. Dark backdrop with subtle blur.
 *   2. Floating circular icon at the top of the card (sits half-out of the
 *      card to echo the demo's `.icon-box-success / .icon-box-failure`).
 *   3. Card body: header (h2) + message (with nl2br line breaks).
 *   4. Full-width colored footer button — green for success, red for
 *      failure, amber for pending (orange in the demo).
 *   5. Subtle slide+fade entrance animation + close-on-Escape.
 *
 * Service contract follows the demo's `ISuccessOrErrorPopup` shape:
 *   { header, message, btnText, popupError, btnDisable?, custStyle? }
 */
@Component({
  selector: 'app-success-or-error-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, NewlinePipe],
  templateUrl: './success-or-error-popup.html',
  styleUrl: './success-or-error-popup.scss',
})
export class SuccessOrErrorPopup implements OnInit, OnDestroy {
  private popupService = inject(SuccessOrErrorPopupService);
  private sub?: Subscription;

  visible = signal(false);
  header = signal('');
  message = signal('');
  /** Demo's `btnText` — defaults to "Close" if unspecified. */
  btnText = signal('Close');
  /** Demo's `popupError` — drives red vs green vs orange state. */
  popupError = signal(true);
  /** Optional disable flag mirrored from demo's `btnDisable`. */
  btnDisable = signal(false);

  ngOnInit(): void {
    this.sub = this.popupService.popup$.subscribe((p: PopupMessage) => {
      this.header.set(p.header);
      this.message.set(
        typeof p.message === 'string' ? p.message : JSON.stringify(p.message),
      );
      this.btnText.set(p.btnText ?? 'Close');
      this.popupError.set(p.popupError);
      this.btnDisable.set(!!p.btnDisable);
      this.visible.set(true);
      // Auto-focus the action button so Enter dismisses the popup.
      setTimeout(() => {
        const btn = document.querySelector<HTMLButtonElement>(
          '.popup-action',
        );
        btn?.focus();
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.visible.set(false);
  }

  /** Tone used by the template to pick icon + color. */
  readonly tone = () =>
    this.popupError()
      ? 'failure'
      : this.isPendingTone()
      ? 'pending'
      : 'success';

  /** Detect legacy callers that pass `tone: 'pending'` via subject. */
  private isPendingTone(): boolean {
    // No signal for tone on this side; treat all current callers as
    // success-or-failure only. Hook reserved for future use.
    return false;
  }

  /** Demo's material-icons equivalents. */
  readonly iconName = () => {
    switch (this.tone()) {
      case 'failure':
        return 'close'; // demo: &#xE5CD; (clear)
      case 'pending':
        return 'priority_high'; // demo: warning
      case 'success':
      default:
        return 'check'; // demo: &#xE876; (check)
    }
  };

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible()) this.close();
  }
}
