import { Injectable } from '@angular/core';
import { Type } from '@angular/core';
import { InputTextBox } from './text-base/text-base';
import { GlSubsidiary } from '../../../modules/finbook/gl-subsidiary/Subsidiary/gl-subsidiary';


@Injectable({ providedIn: 'root' })
export class ComponentRegistry {

  private readonly map: Record<string, Type<any>> = {
    'text-base-input': InputTextBox,
    'app-gl-subsidiary': GlSubsidiary
  };

  resolve(selector: string): Type<any> | undefined {
    return this.map[selector];
  }
}
