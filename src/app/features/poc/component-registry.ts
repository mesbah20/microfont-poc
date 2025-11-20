import { Injectable } from '@angular/core';
import { Type } from '@angular/core';
import { GlSubsidiary } from './gl-subsidiary/gl-subsidiary';
import { TextBaseInput } from './text-base/text-base';


@Injectable({ providedIn: 'root' })
export class ComponentRegistry {

  private readonly map: Record<string, Type<any>> = {
    "text-base-input": TextBaseInput
  };

  resolve(selector: string): Type<any> | undefined {
    return this.map[selector];
  }
}
