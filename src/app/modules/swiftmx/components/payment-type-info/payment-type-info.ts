import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { SelectOptionField } from '../../../../shared/components/input-types/select-option-field/select-option-field';
import { SubPanelHeader } from '../../../../shared/components/sub-panel-header/sub-panel-header';

@Component({
  selector: 'app-payment-type-info',
  standalone: true,
  imports: [CommonModule, TextBaseInput, SubPanelHeader, SelectOptionField],
  templateUrl: './payment-type-info.html',
  styleUrl: './payment-type-info.scss'
})
export class PaymentTypeInfoComponent {
  @Input() frmGroup!: FormGroup;
  @Input() title: string = 'Payment Type Information';
  @Input() isOptional: boolean = true;

  // Options for Payment Type Information component
  priorityOptions = [
    {key: 'HIGH', value: 'High'},
    {key: 'NORM', value: 'Normal'}
  ];

  clearingChannelOptions = [
    {key: 'BOOK', value: 'BOOK'},
    {key: 'MPNS', value: 'MPNS'},
    {key: 'RTGS', value: 'RTGS'},
    {key: 'RTNS', value: 'RTNS'}
  ];
} 