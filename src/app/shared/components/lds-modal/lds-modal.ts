// lds-modal.component.ts - Angular 20 Compatible with Enhanced Design
import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ViewContainerRef, Type } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lds-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lds-modal.html',
  styleUrls: ['./lds-modal.scss'],

})
export class LdsModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() modalTitle: string = "Modal Dialog";
  @Input() cssClass: string = "";
  @Input() closeOnBackdropClick: boolean = true;
  @Input() showDefaultFooter: boolean = true;
  @Input() showOkButton: boolean = true;
  @Input() okButtonText: string = 'OK';
  @Input() modalComponent?: Type<any>;
  @Input() modalComponentData?: any;

  // NEW: Dynamic sizing inputs
  @Input() modalSize: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' | 'auto' = 'md';
  @Input() maxHeight?: string | number; // e.g., '70vh', '600px', 85, '85%'
  @Input() maxWidth?: string | number;  // e.g., '800px', '90vw', 80, '80%'
  @Input() minHeight?: string | number; // e.g., '400px', 50, '50%'
  @Input() minWidth?: string | number;  // e.g., '300px', 30, '30%'

  @Output() isVisibleChanged = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() modalOpened = new EventEmitter<void>();
  @Output() modalResult = new EventEmitter<any>();

  @ContentChild('bodyContent', { read: TemplateRef }) bodyContentTemplate?: TemplateRef<any>;
  @ContentChild('[slot=footer]', { read: TemplateRef }) footerContentTemplate?: TemplateRef<any>;
  @ViewChild('modalContainer', { read: ViewContainerRef, static: false }) modalContainer!: ViewContainerRef;

  private originalBodyOverflow: string = '';
  private componentRef: any;

  // Computed CSS class based on size
  get computedModalClass(): string {
    const baseClass = this.cssClass || '';
    const sizeClass = this.getSizeClass();
    return `${baseClass} ${sizeClass}`.trim();
  }

  // Computed inline styles for custom dimensions
  get modalDialogStyles(): any {
    const styles: any = {};

    if (this.maxHeight) {
      styles['max-height'] = this.normalizeSize(this.maxHeight);
    }
    if (this.maxWidth) {
      styles['max-width'] = this.normalizeSize(this.maxWidth);
    }
    if (this.minHeight) {
      styles['min-height'] = this.normalizeSize(this.minHeight);
    }
    if (this.minWidth) {
      styles['min-width'] = this.normalizeSize(this.minWidth);
    }

    return Object.keys(styles).length > 0 ? styles : null;
  }

  // Normalize size values - add unit if missing
  private normalizeSize(value: string | number): string {
    if (typeof value === 'number') {
      // If number provided, treat as percentage
      return `${value}%`;
    }

    const strValue = value.toString().trim();

    // If already has unit (%, px, vh, vw, rem, em), return as is
    if (/(%|px|vh|vw|rem|em|pt|cm|mm|in)$/i.test(strValue)) {
      return strValue;
    }

    // If it's a pure number string, treat as percentage
    if (/^\d+(\.\d+)?$/.test(strValue)) {
      return `${strValue}%`;
    }

    // Default fallback
    return strValue;
  }

  private getSizeClass(): string {
    switch (this.modalSize) {
      case 'sm': return 'modal-sm';
      case 'md': return 'modal-md';
      case 'lg': return 'modal-lg';
      case 'xl': return 'modal-xl';
      case 'fullscreen': return 'modal-fullscreen';
      case 'auto': return 'modal-auto';
      default: return 'modal-md';
    }
  }

  ngOnInit() {
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
    if (this.isVisible) {
      this.restoreBodyScroll();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible']) {
      if (this.isVisible) {
        this.handleModalOpen();
        setTimeout(() => {
          if (this.modalComponent) {
            this.loadComponent();
          }
        }, 300);
      } else {
        if (this.componentRef) {
          this.componentRef.destroy();
          this.componentRef = null;
        }
        this.handleModalClose();
      }
    }

    if (changes['modalComponent'] && this.isVisible && this.modalComponent) {
      setTimeout(() => {
        this.loadComponent();
      }, 0);
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

  private handleEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isVisible) {
      this.closeModal();
    }
  }

  onOkClick(): void {
    try {
      let result: any = true;
      if (this.componentRef && this.componentRef.instance) {
        const inst: any = this.componentRef.instance;
        if (typeof inst.getModalResult === 'function') {
          result = inst.getModalResult();
        } else if (inst.frmGroup && typeof inst.frmGroup.getRawValue === 'function') {
          result = inst.frmGroup.getRawValue();
        }
      }
      this.modalResult.emit(result);
    } catch (e) {
      console.warn('OK click: failed to collect child result, emitting true', e);
      this.modalResult.emit(true);
    }
    this.closeModal();
  }

  private loadComponent(retryCount: number = 0) {
    if (!this.modalContainer) {
      if (retryCount < 3) {
        setTimeout(() => {
          this.loadComponent(retryCount + 1);
        }, (retryCount + 1) * 200);
      }
      return;
    }

    if (!this.modalComponent) {
      return;
    }

    try {
      this.modalContainer.clear();
      this.componentRef = this.modalContainer.createComponent(this.modalComponent);

      if (this.modalComponentData && this.componentRef.instance) {
        Object.keys(this.modalComponentData).forEach(key => {
          if (this.componentRef.instance.hasOwnProperty(key) || key in this.componentRef.instance) {
            this.componentRef.instance[key] = this.modalComponentData[key];
          }
        });
      }

      this.componentRef.changeDetectorRef.detectChanges();

      // Provide modalParent API
      if (this.componentRef && this.componentRef.instance) {
        this.componentRef.instance.modalParent = {
          close: (result?: any) => {
            this.modalResult.emit(result);
            this.closeModal();
          },
          closeModal: () => this.closeModal()
        };
      }

      // Auto-subscribe to child outputs
      const inst = this.componentRef.instance as any;
      if (inst) {
        Object.keys(inst).forEach(key => {
          const prop = inst[key];
          if (prop && typeof prop.subscribe === 'function' && typeof prop.emit === 'function') {
            try {
              prop.subscribe((value: any) => {
                this.modalResult.emit(value);
              });
            } catch (subErr) {
              console.warn(`Failed to subscribe to child output ${key}:`, subErr);
            }
          }
        });
      }

    } catch (error) {
      console.error('Error loading component:', error);
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
