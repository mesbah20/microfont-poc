import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdvertisementService } from '../../../core/services/advertisement.service';
import { RootResponse } from '../../../core/models/root-response.model';

export interface AdvertisementPopupData {
  /** Application icon shown when the popup is the mobile-app download prompt. */
  icon: string;
  /** App store / play store URL the user is sent to. */
  url: string;
  /**
   * Decoded base64 images as `data:image/jpg;base64,...` SafeResourceUrls.
   * Required when `ismobileRegulation === false`; ignored for the
   * mobile-app download prompt.
   */
  images?: SafeResourceUrl[];
  /**
   * When `true`, the popup renders the mobile-app download screen.
   * When `false`, the popup renders the carousel of advertisement images.
   */
  ismobileRegulation: boolean;
}

/**
 * Demo-faithful advertisement popup.
 *
 * Mirrors demo's `MobilePopupComponent` + `DialogData` pair:
 *   - On `ngOnInit` (after 500 ms) we check the viewport size.
 *   - On small screens we open the **mobile regulation** dialog (download the app).
 *   - On larger screens we open the **advertisement carousel** dialog populated
 *     from `GET /api/BankAccount/GetAdvertisementList?channelName=IBU`.
 *
 * The carousel cycles every 3 seconds using the demo's `setTimeout` loop.
 *
 * USAGE:
 *   <app-advertisement-popup
 *     [appDownloadUrl]="'https://play.google.com/store/apps/details?id=…'"
 *     [appIconUrl]="iconUrl">
 *   </app-advertisement-popup>
 */
@Component({
  selector: 'app-advertisement-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: '',
})
export class AdvertisementPopupComponent implements OnInit {
  /**
   * If `true`, opens the popup immediately on the next animation frame.
   * Binds to `(click)` of an external trigger — mirrors demo's
   * `set isOnClick(value: boolean)` setter.
   */
  @Input() set isOnClick(value: boolean) {
    if (value) this.checkMobileRegulationMethod = false;
  }

  /** App store URL passed to the dialog. */
  @Input() appDownloadUrl = '';

  /** App icon image URL passed to the dialog. */
  @Input() appIconUrl = '';

  public getScreenWidth = 0;
  public getScreenHeight = 0;
  public ismobileRegulation = false;
  public checkMobileRegulationMethod = true;

  constructor(
    private readonly matDialog: MatDialog,
    private readonly advertisementService: AdvertisementService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    // Mirror demo: defer the check so the login form paints first.
    setTimeout(() => this.checkMobileRegulation(), 500);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }

  /** Show the mobile regulation dialog immediately (manual trigger). */
  showPopUp(): void {
    this.matDialog.open(AdvertisementCarouselDialog, {
      panelClass: 'ad-popup-panel',
      data: {
        icon: this.appIconUrl,
        url: this.appDownloadUrl,
        ismobileRegulation: this.ismobileRegulation,
      } satisfies AdvertisementPopupData,
    });
  }

  private checkMobileRegulation(): void {
    if (!this.checkMobileRegulationMethod) return;
    // Mirror demo: only show the ad carousel on "desktop" widths / sane heights.
    if (this.getScreenWidth <= 768 || this.getScreenHeight < 100) {
      this.ismobileRegulation = true;
      this.showPopUp();
    } else {
      // Only enable this branch for advertisements on desktop.
      setTimeout(() => this.getAdvertisementImageList(), 500);
    }
  }

  private getAdvertisementImageList(): void {
    this.advertisementService.getAdvertisementList('IBU').subscribe({
      next: (res: RootResponse<string[]>) => {
        const images = res?.Result;
        if (Array.isArray(images) && images.length > 0) {
          const safe: SafeResourceUrl[] = images
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
            .map((payload) =>
              this.sanitizer.bypassSecurityTrustResourceUrl(
                'data:image/jpg;base64,' + payload,
              ),
            );
          this.matDialog.open(AdvertisementCarouselDialog, {
            panelClass: 'ad-popup-panel',
            data: {
              icon: this.appIconUrl,
              url: this.appDownloadUrl,
              images: safe,
              ismobileRegulation: false,
            } satisfies AdvertisementPopupData,
          });
        }
      },
      // Non-critical — silently skip if the API is down.
      error: () => undefined,
    });
  }
}

/**
 * The dialog content — either an image carousel (desktop) or a
 * "Download App" prompt (mobile).
 * Mirrors demo's `DialogData` component exactly.
 */
@Component({
  selector: 'app-advertisement-carousel-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './advertisement-popup.dialog.html',
  styleUrl: './advertisement-popup.dialog.scss',
})
export class AdvertisementCarouselDialog implements OnInit {
  activeIndex = 0;

  constructor(
    public readonly dialogRef: MatDialogRef<AdvertisementCarouselDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: AdvertisementPopupData,
  ) {}

  ngOnInit(): void {
    if (this.data.ismobileRegulation) return;
    const length = this.data.images?.length ?? 0;
    if (length > 0) this.indexChange(length);
  }

  /**
   * Demo-faithful carousel loop: cycles `activeIndex` every 3 s and
   * recurses for as long as the dialog is open.
   */
  private indexChange(imgLength: number): void {
    for (let i = 1; i <= imgLength; i++) {
      setTimeout(() => {
        this.activeIndex = i - 1;
        if (i === imgLength) this.indexChange(imgLength);
      }, i * 3000);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}