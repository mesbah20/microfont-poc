// src/app/shared/constants/button-signals.constant.ts

import { signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonActionsModel } from '../models/button.actions.model';

/* ----------------------------------
 * Initial States (Single Source)
 * ---------------------------------- */

const INITIAL_BUTTON_STATE: ButtonActionsModel = {
  save: false,
  saveNext: false,
  update: false,
  updateNext: false,
  view: false,
  delete: false,
  exit: false,
  reset: false,
};

const INITIAL_FORM_GROUP = new FormGroup({});

/* ----------------------------------
 * Signals
 * ---------------------------------- */

export const BUTTON_VISIBILITY = signal<ButtonActionsModel>({
  ...INITIAL_BUTTON_STATE,
});

export const FormGroupSignal = signal<FormGroup>(INITIAL_FORM_GROUP);

export const ONCLICK_SAVE = signal(false);
export const ONCLICK_SAVE_NEXT = signal(false);
export const ONCLICK_VIEW = signal(false);
export const ONCLICK_RESET = signal(false);
export const ONCLICK_EXIT = signal(false);
export const ONCLICK_DELETE = signal(false);
export const ONCLICK_UPDATE = signal(false);
export const ONCLICK_UPDATE_NEXT = signal(false);

export const MENU_NAME = signal<string>('');

/* ----------------------------------
 * Utilities
 * ---------------------------------- */

export const ButtonUtils = {
  /* Reset all buttons */
  resetAllButtons(): void {
    BUTTON_VISIBILITY.set({ ...INITIAL_BUTTON_STATE });
  },

  /* Reset all click flags */
  resetAllClickSignals(): void {
    ONCLICK_SAVE.set(false);
    ONCLICK_SAVE_NEXT.set(false);
    ONCLICK_VIEW.set(false);
    ONCLICK_RESET.set(false);
    ONCLICK_EXIT.set(false);
    ONCLICK_DELETE.set(false);
    ONCLICK_UPDATE.set(false);
    ONCLICK_UPDATE_NEXT.set(false);
  },

  /* Reset FormGroup */
  resetFormGroup(): void {
    FormGroupSignal.set(new FormGroup({}));
  },

  /* Full reset (use on route change) */
  resetAll(): void {
    this.resetAllButtons();
    this.resetAllClickSignals();
    this.resetFormGroup();
    MENU_NAME.set('');
  },

  /* Set page-specific buttons */
  setPageButtons(buttons: Partial<ButtonActionsModel>): void {
    BUTTON_VISIBILITY.set({
      ...INITIAL_BUTTON_STATE,
      ...buttons,
    });
  },

  /* ----------------------------------
   * Page Presets
   * ---------------------------------- */

  setDashboardButtons(): void {
    this.setPageButtons({});
  },

  setFormPageButtons(): void {
    this.setPageButtons({
      save: true,
      reset: true,
      exit: true,
    });
  },

  setEditPageButtons(): void {
    this.setPageButtons({
      update: true,
      view: true,
      reset: true,
      exit: true,
    });
  },

  setViewPageButtons(): void {
    this.setPageButtons({
      exit: true,
    });
  },
};
