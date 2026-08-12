import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  timeForm!: FormGroup;
  show = false;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.timeForm = this.fb.group({ time: ['', Validators.required] });
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  onTimeChange(time: string) {
    console.log('Selected Time:', time);
  }
}