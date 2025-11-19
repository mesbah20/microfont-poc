import { Injectable } from '@angular/core';
import { Type } from '@angular/core';
import {TextBaseInput} from '../../shared/components/input-types/text-base-input/text-base-input';

@Injectable({ providedIn: 'root' })
export class ComponentRegistry {

  private readonly map: Record<string, Type<any>> = {
    "text-base-input": TextBaseInput
  };

  resolve(selector: string): Type<any> | undefined {
    return this.map[selector];
  }
}
