import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { SubPanelHeader } from '../../../../shared/components/sub-panel-header/sub-panel-header';

@Component({
  selector: 'app-party',
  standalone: true,
  imports: [CommonModule, TextBaseInput, SubPanelHeader],
  templateUrl: './party.html',
  styleUrl: './party.scss'
})
export class PartyComponent {
  @Input() frmGroup!: FormGroup;
  @Input() prefix: string = ''; // For different party types like 'Dbtr', 'Cdtr', etc.
  @Input() title: string = 'Party Details';
  @Input() isOptional: boolean = false;

  get controlPrefix(): string {
    return this.prefix ? `${this.prefix}` : '';
  }
} 