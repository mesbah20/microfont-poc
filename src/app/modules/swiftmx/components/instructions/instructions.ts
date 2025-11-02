import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectOptionField } from '../../../../shared/components/input-types/select-option-field/select-option-field';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { SubPanelHeader } from '../../../../shared/components/sub-panel-header/sub-panel-header';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [CommonModule, TextBaseInput, SubPanelHeader, SelectOptionField],
  templateUrl: './instructions.html',
  styleUrl: './instructions.scss'
})
export class InstructionsComponent {
  @Input() frmGroup!: FormGroup;
  @Input() title: string = 'Instructions';
  @Input() isOptional: boolean = true;

  // Options for Instructions component
  instructionForCreditorAgentOptions = [
    {key: 'TELB', value: 'Telephone Beneficiary'},
    {key: 'PHOB', value: 'Phone Beneficiary'}
  ];
} 