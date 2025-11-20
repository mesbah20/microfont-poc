import { Component, effect, inject, OnInit, signal, WritableSignal, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextBaseInput } from '../../shared/components/input-types/text-base-input/text-base-input';
import { DateInput } from '../../shared/components/input-types/date-input/date-input';
import { TimeInput } from '../../shared/components/input-types/time-input/time-input';
import { ExpansionPanelHeader } from '../../shared/components/expansion-panel-header/expansion-panel-header';
import { Switch } from '../../shared/components/input-types/switch/switch';
import { TextArea } from '../../shared/components/input-types/text-area/text-area';
import { LoaderService } from '../../shared/services/loader.service';
import { UserNoteService } from '../sevices/usernote.service';
import { IUserNote } from '../models/usernote.model';
import { ToastrService } from 'ngx-toastr';
import { Button } from '../../shared/components/input-types/button/button';
import { CommonModule } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import {UserService} from '../../core/user/user.service';
import {User} from '../../core/user/user.types';

@Component({
  selector: 'app-usernote',
  imports: [CommonModule,
    ExpansionPanelHeader,
    ReactiveFormsModule,
    TextBaseInput,
    TextArea,
    Switch,
    DateInput,
    TimeInput,
    Button,
    MatDivider,
    MatIcon,
    MatGridListModule,
    MatTooltipModule
  ],
  templateUrl: './usernote.html',
  styleUrl: './usernote.scss'
})
export class Usernote implements OnInit {
  frmUserNote: FormGroup;
  userNoteList: IUserNote[];
  userNote: IUserNote = {};
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  toastr = inject(ToastrService);
  cols: number = 4; // default columns
  userNoteId: number = 0;
  saveButtonText: string = "Create";
  reminderTime: string;
  private userService = inject(UserService);

  officeId!: string;
  userId!: string;
  employeeId!: string;

  constructor(private formBuilder: FormBuilder,
              public loaderService: LoaderService,
              private userNoteService: UserNoteService
  ) { }

  ngOnInit() {
    this.frmUserNote = this.formBuilder.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required, Validators.maxLength(255)]],
      isPinned: [false],
      isReminder: [false],
      reminderDate: [''],
      reminderTime: ['']

    });
    this.userService.user$.subscribe((user: User) => {
      this.officeId = user.officeId;
      this.userId = user.username;
      this.employeeId = user.employeeId;

      console.log('Office ID:', this.officeId);
      console.log('User ID:', this.userId);
    });
    this.getUserNoteByUserId();
  }

  getUserNoteByUserId() {
    const userId = this.userId;

    this.userNoteService
      .getUserNoteByUserId(userId || '')
      .subscribe({
        next: (response) => {
          this.userNoteList = response as IUserNote[];
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          this.loaderService.hideLoader();
        }
      });
  }


  // Create/Update Note
  createNote() {
    this.loaderService.showLoader();

    this.userNote.noteId = String(this.userNoteId);
    //this.userNote.userId = localStorage.getItem('userId') ?? '';
    this.userNote.userId = this.userId;
    this.userNote.noteTitle = this.form['title'].value;
    this.userNote.noteContent = this.form['content'].value;
    this.userNote.isPinned = this.form['isPinned'].value ? 1 : 0;
    this.userNote.isReminder = this.form['isReminder'].value ? 1 : 0;
    if (this.userNote.isReminder == 1) {
      this.userNote.reminderDate = this.convertToIsoDateTime(this.form['reminderDate'].value, this.reminderTime)
    }
    else
      this.userNote.reminderDate = null;

    console.log("createNote", this.userNote);

    if (this.frmUserNote.valid) {
      this.userNoteService
        .createUserNote(this.userNote)
        .subscribe((Response) => {
          if (this.userNoteId > 0) {
            this.toastr.success('Note Updated Successfully', 'Update Note');
          }
          else {
            this.toastr.success('Note Created Successfully', 'Create Note');
          }
          this.onReset();
          this.getUserNoteByUserId();
          // if (Response.Status == 'OK') {
          //   this.loading = false;

          //   this.sharedService.SuccessOrErrorPopupService.showSuccessOrErrorPopup('Success', Response.Message, 'Close', false);
          //   this.onReset();
          // } else {
          //   this.loading = false;
          //   this.sharedService.SuccessOrErrorPopupService.showSuccessOrErrorPopup('Failure', Response.Message, 'Try again');
          //   // this.popupError = true;
          //   // this.header = 'Failure';
          //   // this.message = Response.Message;
          //   // this.btnText = 'Close';
          //   // this.popup = true;
          // }
          // this.loading = false;
        });
    }
    this.loaderService.hideLoader();
  }

  updateNote(note: IUserNote) {
    this.userNoteId = Number(note.noteId);
    this.form['title'].setValue(note.noteTitle);
    this.form['content'].setValue(note.noteContent);
    this.form['isPinned'].setValue(note.isPinned);
    this.form['isReminder'].setValue(note.isReminder);
    if (note.isReminder == 1) {
      const { date, time } = this.splitFromIsoDateTime(note.reminderDate ?? '');

      this.form['reminderDate'].setValue(date);
      this.form['reminderTime'].setValue(time);
    }
    this.saveButtonText = "Update";
  }

  deleteNote(noteId: string) {
    this.userNoteService
      .deleteUserNote(noteId)
      .subscribe((Response) => {
        this.toastr.success('Note Deleted Successfully', 'Delete Note');
        this.onReset();
        this.getUserNoteByUserId();

        // if (Response.Status == 'OK') {
        //   this.loading = false;

        //   this.sharedService.SuccessOrErrorPopupService.showSuccessOrErrorPopup('Success', Response.Message, 'Close', false);
        //   this.onReset();
        // } else {
        //   this.loading = false;
        //   this.sharedService.SuccessOrErrorPopupService.showSuccessOrErrorPopup('Failure', Response.Message, 'Try again');
        //   // this.popupError = true;
        //   // this.header = 'Failure';
        //   // this.message = Response.Message;
        //   // this.btnText = 'Close';
        //   // this.popup = true;
        // }
        // this.loading = false;
      });
  }

  onReset() {
    this.frmUserNote.reset();
    this.form['title'].setValue('');
    this.form['content'].setValue('');
    this.form['isPinned'].setValue('');
    this.form['isReminder'].setValue('');
    this.form['reminderDate'].setValue('');
    this.userNoteId = 0;
    this.saveButtonText = "Create";
  }

  onUpdateNote(note: IUserNote) {
    const confirmed = confirm(`Are you sure you want to update this note?`);
    if (confirmed) {
      this.updateNote(note);
    }
  }

  onDeleteNote(noteId: string) {
    const confirmed = confirm(`Are you sure you want to delete this note?`);
    if (confirmed) {
      this.deleteNote(noteId);
    }
  }

  onTimeChange(time: string) {
    this.reminderTime = time;
    //console.log('Time:', this.reminderTime);
  }

  get form() {
    return this.frmUserNote.controls;
  }

  splitFromIsoDateTime(isoDateTime: string): { date: string; time: string } {
    if (!isoDateTime) return { date: '', time: '' };

    const [datePart, timePart] = isoDateTime.split('T'); // split at 'T'

    if (!datePart || !timePart) return { date: '', time: '' };

    // Optional: remove seconds from time
    const [hours, minutes] = timePart.split(':');
    const time = `${hours}:${minutes}`;

    return { date: datePart, time };
  }

  convertToIsoDateTime(dateStr: string, timeStr: string): string {
    const [year, month, day] = dateStr.split('-');
    const [hour, minute] = timeStr.split(':');

    return `${year}-${month}-${day}T${hour}:${minute}:00`;
  }

  // Responsive columns
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateCols(event.target.innerWidth);
  }

  updateCols(width: number) {
    if (width < 600) this.cols = 1;
    else if (width < 960) this.cols = 2;
    else if (width < 1280) this.cols = 3;
    else this.cols = 4;
  }

  onBlur(value: string): void {
    console.log('Textbox blurred, value:', value);
  }
}
