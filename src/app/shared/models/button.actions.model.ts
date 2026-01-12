export interface ButtonActionsModel {
  save?: boolean,
  saveNext?: boolean,
  update?: boolean,
  updateNext?: boolean,
  view?: boolean,
  delete?: boolean,
  exit?: boolean,
  reset?: boolean,
  customAction?: boolean,// 👈 optional
  customButton?: {
    customAction: boolean,
    customLevel: string,
    customIcon: string;
  }
}
