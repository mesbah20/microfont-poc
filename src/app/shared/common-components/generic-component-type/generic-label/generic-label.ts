import { Component, input } from '@angular/core';

@Component({
  selector: 'generic-label',
  imports: [
  ],
  templateUrl: './generic-label.html',
  styleUrl: './generic-label.scss'
})
export class Label {
  readonly labelValue = input<string>('');
  readonly visible = input<boolean>(true);

  get isHidden(): boolean {
    return !this.visible();
  }
} 