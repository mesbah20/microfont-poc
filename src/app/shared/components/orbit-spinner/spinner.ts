// orbit-spinner.component.ts
import { Component, input, OnInit, OnDestroy } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-orbit-spinner',
  imports: [NgClass, NgStyle],
  templateUrl: './spinner.html',
  standalone: true,
  styleUrl: './spinner.scss'
})
export class OrbitSpinnerComponent implements OnInit, OnDestroy {
  // Size configuration
  readonly size = input<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  readonly customSize = input<number>(); // Custom size in pixels
  
  // Color configuration
  readonly centerColor = input<string>('#ffffff');
  readonly orbitColor = input<string>('rgba(255, 255, 255, 0.3)');
  readonly dotColor = input<string>('#ffffff');
  
  // Animation configuration
  readonly speed = input<'slow' | 'normal' | 'fast'>('normal');
  readonly customSpeed = input<number>(); // Custom speed in seconds
  
  // Display configuration
  readonly showCenter = input<boolean>(true);
  readonly showOrbitRing = input<boolean>(true);
  readonly showDots = input<boolean>(true);
  readonly dotCount = input<number>(1);
  
  // State configuration
  readonly isVisible = input<boolean>(true);
  readonly isPaused = input<boolean>(false);
  
  // Text configuration
  readonly showText = input<boolean>(false);
  readonly text = input<string>('Loading...');
  readonly textPosition = input<'top' | 'bottom' | 'left' | 'right'>('bottom');
  readonly textColor = input<string>('#ffffff');
  
  // Background configuration
  readonly showBackground = input<boolean>(false);
  readonly backgroundColor = input<string>('rgba(0, 0, 0, 0.5)');
  readonly isOverlay = input<boolean>(false);
  
  private animationId?: number;

  ngOnInit(): void {
    if (this.customSpeed()) {
      this.updateAnimationSpeed();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private updateAnimationSpeed(): void {
    // This would be handled by CSS custom properties in the template
  }

  // Get size in pixels based on size input
  getSizeInPixels(): number {
    if (this.customSize()) {
      return this.customSize()!;
    }
    
    switch (this.size()) {
      case 'small': return 40;
      case 'medium': return 60;
      case 'large': return 80;
      case 'xlarge': return 120;
      default: return 60;
    }
  }

  // Get animation duration based on speed input
  getAnimationDuration(): number {
    if (this.customSpeed()) {
      return this.customSpeed()!;
    }
    
    switch (this.speed()) {
      case 'slow': return 2.5;
      case 'normal': return 1.5;
      case 'fast': return 0.8;
      default: return 1.5;
    }
  }

  // Generate dots array for template iteration
  getDotsArray(): number[] {
    return Array.from({ length: this.dotCount() }, (_, i) => i);
  }

  // Calculate dot position based on index
  getDotRotation(index: number): number {
    return (360 / this.dotCount()) * index;
  }

  // Get container classes
  getContainerClasses(): string[] {
    const classes = ['orbit-spinner-container'];
    
    if (this.isOverlay()) {
      classes.push('overlay-mode');
    }
    
    if (this.showBackground()) {
      classes.push('with-background');
    }
    
    if (!this.isVisible()) {
      classes.push('hidden');
    }
    
    return classes;
  }

  // Get spinner classes
  getSpinnerClasses(): string[] {
    const classes = ['orbit-spinner'];
    
    if (this.isPaused()) {
      classes.push('paused');
    }
    
    classes.push(`size-${this.size()}`);
    classes.push(`speed-${this.speed()}`);
    
    return classes;
  }

  // Get text classes
  getTextClasses(): string[] {
    const classes = ['spinner-text'];
    classes.push(`text-${this.textPosition()}`);
    return classes;
  }
} 