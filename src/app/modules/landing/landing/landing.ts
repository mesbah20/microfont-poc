import { Component, OnInit } from '@angular/core';
import { KeyclockService } from '../../../core/service/keyclock.service';
import { TimeInput } from '../../../shared/components/input-types/time-input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    TimeInput,
    ReactiveFormsModule
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing implements OnInit {
  timeForm!: FormGroup;

  constructor(
     private fb: FormBuilder,
    private keyclockService: KeyclockService,
  ) { }

  ngOnInit(): void {
     this.timeForm = this.fb.group({
      time: ['',  Validators.required]
    });
   }

  login() {
    this.keyclockService.init();
  }

  onTimeChange(time: string) {
    console.log('Selected Time:', time);
  }



}
