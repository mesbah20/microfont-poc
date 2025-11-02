import {model, signal} from '@angular/core';
import {ButtonActionsModel} from '../models/button.actions.model';
import {FormGroup} from '@angular/forms';

export const BUTTON_VISIBILITY = signal<ButtonActionsModel>({
  save: false,
  update: false,
  view: false,
  delete: false,
  exit: false,
  reset: false
});


export const FormGroupSignal = signal<FormGroup>(new FormGroup({}));

export const ONCLICK_SAVE = signal(false);
export const ONCLICK_VIEW = signal(false);
export const ONCLICK_RESET = signal(false);
export const ONCLICK_EXIT = signal(false);
export const ONCLICK_DELETE = signal(false);
