import {Component, input} from '@angular/core';

@Component({
  selector: 'app-panel-header',
  imports: [],
  templateUrl: './panel-header.html',
  standalone: true,
  styleUrl: './panel-header.scss'
})
export class PanelHeader {

  panelTitle = input<string>();
}
