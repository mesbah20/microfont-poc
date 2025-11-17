import { Injectable } from '@angular/core';
import { Type } from '@angular/core';
import { GlSubsidiary } from './gl-subsidiary/gl-subsidiary';

@Injectable({ providedIn: 'root' })
export class ComponentRegistry {
    private readonly map: Record<string, Type<any>> = {
        'app-gl-subsidiary': GlSubsidiary,
    };

    resolve(selector: string): Type<any> | undefined {
        return this.map[selector];
    }
}
