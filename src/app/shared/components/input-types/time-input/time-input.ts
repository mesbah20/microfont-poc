import {ChangeDetectionStrategy, Component, input, inject, Inject} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule, FormBuilder} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {NgClass} from '@angular/common';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-time-input',
  imports: [
    FormsModule,
    MatInput,
    ReactiveFormsModule,
    NgClass
],
  templateUrl: './time-input.html',
  standalone: true,
  styleUrl: './time-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeInput {
  private dialog = inject(MatDialog);

  readonly frmGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly label = input.required<string>();
  readonly isReadonly = input<boolean>(false);
  readonly placeholder = input<string>('HH:MM:SS.sss±HH:MM');
  readonly isVertical = input<boolean>(false);
  readonly timezone = input<string>('BST');

  isRequired(): boolean {
    const control = this.frmGroup().get(this.controlName());
    if (!control?.validator) return false;
    const validation = control.validator({} as any);
    return !!validation?.['required'];
  }

  getTimeFormat(): string {
    return this.timezone() === 'BST' ? 'HH:MM:SS.sss±HH:MM (BST)' : 'HH:MM:SS.sss±HH:MM';
  }

  validateTimeFormat(value: string): boolean {
    const timePattern = /^([01]?[0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9])(\.[0-9]{1,3})?(\+|-)(0[0-9]|1[0-3]):([0-5][0-9])$/;
    return timePattern.test(value);
  }

  onTimeChange(event: any): void {
    const value = event.target.value;
    if (value && !this.validateTimeFormat(value)) {
      console.warn('Invalid time format. Expected format: HH:MM:SS.sss±HH:MM');
    }
  }

  openTimePicker(): void {
    if (this.isReadonly()) return;

    // Create a simple time picker dialog
    const dialogRef = this.dialog.open(TimePickerDialog, {
      width: '450px',
      height: 'auto',
      maxHeight: '80vh',
      data: {
        currentTime: this.frmGroup().get(this.controlName())?.value || '',
        timezone: this.timezone()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.frmGroup().get(this.controlName())?.setValue(result);
        this.frmGroup().get(this.controlName())?.markAsTouched();
      }
    });
  }
}

// Simple time picker dialog component
@Component({
  selector: 'time-picker-dialog',
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-6 text-gray-800">Select Time</h2>
      
      <form [formGroup]="timeForm">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hour</label>
            <select formControlName="hour" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1">
              <option value="">Select Hour</option>
              <option value="00">00</option>
              <option value="01">01</option>
              <option value="02">02</option>
              <option value="03">03</option>
              <option value="04">04</option>
              <option value="05">05</option>
              <option value="06">06</option>
              <option value="07">07</option>
              <option value="08">08</option>
              <option value="09">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Minute</label>
            <select formControlName="minute" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1">
              <option value="">Select Minute</option>
              <option value="01">01</option>
              <option value="02">02</option>
              <option value="03">03</option>
              <option value="04">04</option>
              <option value="05">05</option>
              <option value="06">06</option>
              <option value="07">07</option>
              <option value="08">08</option>
              <option value="09">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
              <option value="26">26</option>
              <option value="27">27</option>
              <option value="28">28</option>
              <option value="29">29</option>
              <option value="30">30</option>
              <option value="31">31</option>
              <option value="32">32</option>
              <option value="33">33</option>
              <option value="34">34</option>
              <option value="35">35</option>
              <option value="36">36</option>
              <option value="37">37</option>
              <option value="38">38</option>
              <option value="39">39</option>
              <option value="40">40</option>
              <option value="41">41</option>
              <option value="42">42</option>
              <option value="43">43</option>
              <option value="44">44</option>
              <option value="45">45</option>
              <option value="46">46</option>
              <option value="47">47</option>
              <option value="48">48</option>
              <option value="49">49</option>
              <option value="50">50</option>
              <option value="51">51</option>
              <option value="52">52</option>
              <option value="53">53</option>
              <option value="54">54</option>
              <option value="55">55</option>
              <option value="56">56</option>
              <option value="57">57</option>
              <option value="58">58</option>
              <option value="59">59</option>
              <option value="60">60</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Second</label>
            <select formControlName="second" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1">
              <option value="">Select Second</option>
              <option value="01">01</option>
              <option value="02">02</option>
              <option value="03">03</option>
              <option value="04">04</option>
              <option value="05">05</option>
              <option value="06">06</option>
              <option value="07">07</option>
              <option value="08">08</option>
              <option value="09">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
              <option value="26">26</option>
              <option value="27">27</option>
              <option value="28">28</option>
              <option value="29">29</option>
              <option value="30">30</option>
              <option value="31">31</option>
              <option value="32">32</option>
              <option value="33">33</option>
              <option value="34">34</option>
              <option value="35">35</option>
              <option value="36">36</option>
              <option value="37">37</option>
              <option value="38">38</option>
              <option value="39">39</option>
              <option value="40">40</option>
              <option value="41">41</option>
              <option value="42">42</option>
              <option value="43">43</option>
              <option value="44">44</option>
              <option value="45">45</option>
              <option value="46">46</option>
              <option value="47">47</option>
              <option value="48">48</option>
              <option value="49">49</option>
              <option value="50">50</option>
              <option value="51">51</option>
              <option value="52">52</option>
              <option value="53">53</option>
              <option value="54">54</option>
              <option value="55">55</option>
              <option value="56">56</option>
              <option value="57">57</option>
              <option value="58">58</option>
              <option value="59">59</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Milliseconds</label>
            <input formControlName="milli" type="number" min="0" max="999" class="w-full px-4 py-3 border border-gray-300 outline-none rounded-md focus:ring-1" placeholder="000">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select formControlName="timezone" class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1">
              <option value="">Select Timezone</option>
              <option value="+00:00">UTC (+00:00)</option>
              <option value="+01:00">CET (+01:00)</option>
              <option value="+02:00">EET (+02:00)</option>
              <option value="+03:00">MSK (+03:00)</option>
              <option value="+04:00">GST (+04:00)</option>
              <option value="+05:00">PKT (+05:00)</option>
              <option value="+05:30">IST (+05:30)</option>
              <option value="+06:00">BST (+06:00)</option>
              <option value="+07:00">ICT (+07:00)</option>
              <option value="+08:00">CST (+08:00)</option>
              <option value="+09:00">JST (+09:00)</option>
              <option value="+10:00">AEST (+10:00)</option>
              <option value="+11:00">SBT (+11:00)</option>
              <option value="+12:00">NZST (+12:00)</option>
              <option value="-01:00">AZOT (-01:00)</option>
              <option value="-02:00">BRST (-02:00)</option>
              <option value="-03:00">BRT (-03:00)</option>
              <option value="-04:00">AST (-04:00)</option>
              <option value="-05:00">EST (-05:00)</option>
              <option value="-06:00">CST (-06:00)</option>
              <option value="-07:00">MST (-07:00)</option>
              <option value="-08:00">PST (-08:00)</option>
              <option value="-09:00">AKST (-09:00)</option>
              <option value="-10:00">HST (-10:00)</option>
              <option value="-11:00">SBT (-11:00)</option>
              <option value="-12:00">IDLW (-12:00)</option>
            </select>
          </div>
        </div>
      </form>

      <div class="flex justify-end gap-3">
        <button 
          (click)="cancel()" 
          class="px-4 py-2 text-gray-600 border border-gray-300 cursor-pointer rounded-md hover:bg-gray-50 transition-colors duration-200">
          Cancel
        </button>
        <button 
          (click)="confirm()" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors duration-200">
          Confirm
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [NgClass, ReactiveFormsModule]
})
class TimePickerDialog {
  timeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TimePickerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.timeForm = this.fb.group({
      hour: [''],
      minute: [''],
      second: [''],
      milli: ['000'],
      timezone: ['+06:00'] // Default to BST as you selected
    });

    // Set default values
    if (data.currentTime) {
      this.parseCurrentTime(data.currentTime);
    }
  }

  private parseCurrentTime(timeString: string): void {
    // Parse existing time if available
    const match = timeString.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})(\.\d{1,3})?([+-]\d{2}:\d{2})?$/);
    if (match) {
      this.timeForm.patchValue({
        hour: match[1],
        minute: match[2],
        second: match[3],
        milli: match[4] ? match[4].substring(1) : '000',
        timezone: match[5] || '+06:00'
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (this.timeForm.invalid) {
      alert('Please select all required time fields');
      return;
    }

    const formValue = this.timeForm.value;
    const hour = String(formValue.hour || '00');
    const minute = String(formValue.minute || '00');
    const second = String(formValue.second || '00');
    const milli = String(formValue.milli || '000');
    const timezone = String(formValue.timezone || '+06:00');

    // Format time string in the required format: HH:MM:SS.sss±HH:MM
    const timeString = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}.${milli.padStart(3, '0')}${timezone}`;
    
    // console.log('Selected time:', timeString); // Debug log
    this.dialogRef.close(timeString);
  }
} 