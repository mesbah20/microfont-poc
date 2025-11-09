import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { QUILL_MIN_EDITOR } from '../../constant/quill-editor.constant';

@Component({
  selector: 'common-quill-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuillModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './common-quill-editor.html',
  styleUrls: ['./common-quill-editor.scss'],
})
export class CommonQuillEditorComponent {
  /** minimal toolbar config */
  minModule = QUILL_MIN_EDITOR;

  /** reactive form binding */
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  /** label & appearance */
  @Input() labelName = '';
  @Input() classProperty = '';
  @Input() labelClass = '';
  @Input() isRequired = false;
}
