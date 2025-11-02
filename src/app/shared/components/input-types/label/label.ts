import { Component, input } from '@angular/core';

@Component({
  selector: 'lds-label',
  imports: [
  ],
  templateUrl: './label.html',
  styleUrl: './label.scss'
})
export class Label {
  readonly labelValue = input<string>('');
  readonly visible = input<boolean>(true);

  get isHidden(): boolean {
    return !this.visible();
  }
} 