import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AmountToWordInput } from '../../../../shared/components/input-types/amount-to-word-input/amount-to-word-input';
import { SelectOptionField } from '../../../../shared/components/input-types/select-option-field/select-option-field';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { SubPanelHeader } from '../../../../shared/components/sub-panel-header/sub-panel-header';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, TextBaseInput, SubPanelHeader, SelectOptionField, AmountToWordInput],
  templateUrl: './charges.html',
  styleUrl: './charges.scss'
})
export class ChargesComponent {
  @Input() frmGroup!: FormGroup;
  @Input() title: string = 'Charges Information';
  @Input() isOptional: boolean = true;

  // Options for Charges component
  chargeBearerOptions = [
    {key: 'CRED', value: 'BorneByCreditor'},
    {key: 'DEBT', value: 'BorneByDebtor'},
    {key: 'SHAR', value: 'Shared'},
    {key: 'SLEV', value: 'FollowingServiceLevel'}
  ];
} 