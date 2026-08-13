import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Demo-faithful popup message shape (mirrors `ISuccessOrErrorPopup` from
 * the CBPLC demo):
 *
 *   - header:   title shown at the top of the popup
 *   - message:  body text (multi-line `\\n` is preserved via nl2br)
 *   - btnText:  button label (default "Close")
 *   - popupError: true → red failure icon, false → green success icon
 *
 * Existing callers that pass `(title, message, type)` (where type is
 * 'success' | 'error' | 'info') continue to work — `type: 'success'`
 * maps to `popupError = false`, everything else to `true`.
 *
 * `tone` adds a third demo-faithful state: 'pending' which renders the
 * orange warning style (used by the demo's `icon-box-pending`).
 */
export interface PopupMessage {
  header: string;
  message: string;
  btnText?: string;
  popupError: boolean;
  /** Theme accent — failure | success | pending */
  tone?: 'success' | 'error' | 'pending' | 'info';
  btnDisable?: boolean;
  custStyle?: string;
}

@Injectable({ providedIn: 'root' })
export class SuccessOrErrorPopupService {
  private popupSubject = new Subject<PopupMessage>();
  public popup$: Observable<PopupMessage> = this.popupSubject.asObservable();

  /**
   * Demo-faithful signature: `showSuccessOrErrorPopup(header, message, buttonText, popupError)`.
   * Both `popupError` and `buttonText` default to demo's defaults.
   */
  showSuccessOrErrorPopup(
    header: string,
    message: string,
    buttonText: string = 'Close',
    popupError: boolean = true,
  ): void {
    this.popupSubject.next({
      header,
      message,
      btnText: buttonText,
      popupError,
      tone: popupError ? 'error' : 'success',
    });
  }

  /**
   * Backward-compatible signature for current callers that pass
   * `(title, message, type)` where type is 'success' | 'error' | 'info'.
   */
  showPopup(
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'error',
  ): void {
    const popupError = type !== 'success';
    this.showSuccessOrErrorPopup(title, message, 'Close', popupError);
  }
}
