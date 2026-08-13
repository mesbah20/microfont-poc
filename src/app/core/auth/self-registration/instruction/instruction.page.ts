import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BrandingService } from '../../../services/branding.service';

@Component({
  selector: 'app-instruction-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './instruction.page.html',
})
export class InstructionPage {
  private branding = inject(BrandingService);
  protected readonly logosPath = computed(() => this.branding.logosPath());
  protected readonly filesPath = computed(() => this.branding.filesPath());
  protected readonly displayName = computed(() => this.branding.displayName());
}
