import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  QUILL_MIN_EDITOR,
  QUILL_MAX_EDITOR,
  QUILL_EDITOR_FOR_SPECS,
  MEDIUM_EDITOR_CONFIG,
  MIN_EDITOR_CONFIG,
} from '../../constant/quill-editor.constant';

type EditorConfigType =
  | 'min'
  | 'max'
  | 'spec'
  | 'medium'
  | 'minCk'; // map to your constants

@Component({
  selector: 'common-quill-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule, MatFormFieldModule, MatInputModule],
  templateUrl: './common-quill-editor.html',
  styleUrls: ['./common-quill-editor.scss'],
})
export class CommonQuillEditorComponent {
  /** reactive form binding */
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  /** label & appearance */
  @Input() labelName = '';
  @Input() classProperty = '';
  @Input() labelClass = '';
  @Input() isRequired = false;

  /** editor configuration mode: 'min' | 'max' | 'spec' | 'medium' | 'minCk' */
  @Input() configType: EditorConfigType = 'min';

  /** optional override for custom modules */
  @Input() customModules: any;

  /** resolved module passed to quill-editor */
  get modules(): any {
    if (this.customModules) return this.customModules;

    switch (this.configType) {
      case 'max':
        return QUILL_MAX_EDITOR;
      case 'spec':
        return QUILL_EDITOR_FOR_SPECS;
      case 'medium':
        return MEDIUM_EDITOR_CONFIG;
      case 'minCk':
        return MIN_EDITOR_CONFIG;
      case 'min':
      default:
        return QUILL_MIN_EDITOR;
    }
  }
}
