import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {LoaderService} from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  imports: [
    AsyncPipe
  ],
  templateUrl: './loader.html',
  styleUrl: './loader.scss'
})
export class Loader {

  readonly svc = inject(LoaderService);
}
