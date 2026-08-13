export interface IMenu {
  key: string;
  title: string;
  localTitle: string;
  enabled: boolean;
  url?: string;
  imagePath: string;
  children?: IMenu[];
}