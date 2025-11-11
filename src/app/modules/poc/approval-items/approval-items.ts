import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
//import { ApprovalStepsDialogComponent } from '../approval-steps/approval-steps-dialog.component/approval-steps-dialog.component';
import { DataGridComponent } from "../../../shared/components/data-grid";
import { ExpansionPanelHeader } from "../../../shared/components/expansion-panel-header/expansion-panel-header";
import {FormBuilder, FormGroup} from '@angular/forms';
import {Button} from '../../../shared/components/input-types/button/button';
import {DateInput} from '../../../shared/components/input-types/date-input/date-input';
import {SelectOptionField} from '../../../shared/components/input-types/select-option-field/select-option-field';
import {MatTab, MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {MakerList} from '../maker-list/maker-list';
import {CheckerList} from '../checker-list/checker-list';

@Component({
  selector: 'app-approval-items',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ExpansionPanelHeader, Button, DateInput, SelectOptionField, MatTabGroup, MatTab, MatTabsModule, MakerList, CheckerList],
  templateUrl: './approval-items.html',
  styleUrl: './approval-items.scss'
})
export class ApprovalItems {
  tabIndex = signal(0);// 0 = Pending Approval (default), 1 = Maker List
  onTabChange(i: number) {
    this.tabIndex.set(i);
  }
}
