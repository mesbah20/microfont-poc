import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { SubPanelHeader } from '../../../../shared/components/sub-panel-header/sub-panel-header';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, TextBaseInput, SubPanelHeader],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class AccountComponent {
  @Input() frmGroup!: FormGroup;
  @Input() prefix: string = ''; // For different account types like 'SttlmAcct', 'DbtrAcct', etc.
  @Input() title: string = 'Account Details';
  @Input() isOptional: boolean = false;

  get controlPrefix(): string {
    return this.prefix ? `${this.prefix}` : '';
  }
} 