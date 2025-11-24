import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  standalone:true,
  imports:[CommonModule]
})
export class LoaderComponent implements OnInit {

  isLoading: boolean = false;

  constructor(public loaderService: LoaderService) {}

  ngOnInit() {
   
  }

}
