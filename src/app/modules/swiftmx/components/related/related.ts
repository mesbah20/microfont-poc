import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateInput } from '../../../../shared/components/input-types/date-input/date-input';
import { SelectOptionField } from '../../../../shared/components/input-types/select-option-field/select-option-field';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { SubPanelHeader } from '../../../../shared/components/sub-panel-header/sub-panel-header';

@Component({
  selector: 'app-related',
  standalone: true,
  imports: [CommonModule, TextBaseInput, SubPanelHeader, DateInput, SelectOptionField],
  templateUrl: './related.html',
  styleUrl: './related.scss'
})
export class RelatedComponent {
  @Input() frmGroup!: FormGroup;
  @Input() prefix: string = ''; // For different related types like 'Rltd', etc.
  @Input() title: string = 'Related Message Details';
  @Input() isOptional: boolean = true;

  get controlPrefix(): string {
    return this.prefix ? `${this.prefix}` : '';
  }

  // Options for Related component
  duplicateOptions = [
    {key: 'CODU', value: 'CODU'},
    {key: 'COPY', value: 'COPY'},
    {key: 'DUPL', value: 'DUPL'}
  ];

  priorityOptions = [
    {key: 'HIGH', value: 'High'},
    {key: 'NORM', value: 'Normal'}
  ];
} 