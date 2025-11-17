import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'text-base-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-base-input.html',
  styleUrls: ['./text-base-input.scss']
})
export class TextBaseInput {

  @Input() viewObject: any;
  @Input() isViewDetails = false;
  @Input() isApprovalView = false;
  @Input() highlightMap: any;

}
