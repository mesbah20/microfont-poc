// lds-modal.component.ts - Angular 20 Compatible
import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lds-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Backdrop -->
    @if (isVisible) {
      <div class="modal-backdrop" 
           [class.show]="isVisible"
           (click)="onBackdropClick()">
      </div>
      
      <!-- Modal Dialog -->
      <div class="modal-wrapper" 
           [class.show]="isVisible"
           role="dialog"
           [attr.aria-labelledby]="modalTitle"
           [attr.aria-modal]="true"
           tabindex="-1">
        <div class="modal-dialog" [class]="cssClass" role="document">
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <h5 class="modal-title" id="modalTitle">{{ modalTitle }}</h5>
              <button type="button" 
                      class="btn-close" 
                      aria-label="Close"
                      (click)="closeModal()">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            
            <!-- Modal Body -->
            <div class="modal-body">
              <ng-content></ng-content>
              @if (bodyContentTemplate) {
                <ng-container *ngTemplateOutlet="bodyContentTemplate"></ng-container>
              }
            </div>
            
            <!-- Modal Footer -->
            @if (hasFooterContent) {
              <div class="modal-footer">
                <ng-content select="[slot=footer]"></ng-content>
                @if (!hasCustomFooter) {
                  <div class="default-footer">
                    <button type="button" class="btn btn-secondary" (click)="closeModal()">
                      Close
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./lds-modal.scss']
})
export class LdsModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() modalTitle: string = "Modal Dialog";
  @Input() cssClass: string = "";
  @Input() closeOnBackdropClick: boolean = true;
  @Input() showDefaultFooter: boolean = true;
  
  @Output() isVisibleChanged = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() modalOpened = new EventEmitter<void>();
  
  @ContentChild('bodyContent', { read: TemplateRef }) bodyContentTemplate?: TemplateRef<any>;
  @ContentChild('[slot=footer]', { read: TemplateRef }) footerContentTemplate?: TemplateRef<any>;
  
  private originalBodyOverflow: string = '';
  
  ngOnInit() {
    // Listen for escape key
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }
  
  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
    // Restore body scroll if modal was open
    if (this.isVisible) {
      this.restoreBodyScroll();
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible']) {
      if (this.isVisible) {
        this.handleModalOpen();
      } else {
        this.handleModalClose();
      }
    }
  }
  
  get hasFooterContent(): boolean {
    return this.showDefaultFooter || !!this.footerContentTemplate;
  }
  
  get hasCustomFooter(): boolean {
    return !!this.footerContentTemplate;
  }
  
  openModal(): void {
    if (!this.isVisible) {
      this.isVisible = true;
      this.handleModalOpen();
    }
  }
  
  closeModal(): void {
    if (this.isVisible) {
      this.isVisible = false;
      this.handleModalClose();
    }
  }
  
  private handleModalOpen(): void {
    this.preventBodyScroll();
    this.isVisibleChanged.emit(true);
    this.modalOpened.emit();
    
    // Focus management for accessibility
    setTimeout(() => {
      const closeButton = document.querySelector('.btn-close') as HTMLElement;
      closeButton?.focus();
    }, 150);
  }
  
  private handleModalClose(): void {
    this.restoreBodyScroll();
    this.isVisibleChanged.emit(false);
    this.modalClosed.emit();
  }
  
  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.closeModal();
    }
  }
  
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isVisible) {
      this.closeModal();
    }
  }
  
  private preventBodyScroll(): void {
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  
  private restoreBodyScroll(): void {
    document.body.style.overflow = this.originalBodyOverflow;
  }
}