import {Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {ExpansionPanelHeader} from '../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import {FormBuilder, Validators} from '@angular/forms';
import {InputIdBox} from '../../../shared/common-components/input-types/input-id-box/input-id-box';
import {InputTextBox} from '../../../shared/common-components/input-types/input-text-box/input-text-box';
import {InputSelectOptionField} from '../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import {ApprovalLevelViewModel, ApprovalPolicyIndicatorModel} from '../../model/approval-workflow.model';
import {WorkflowDesignerService} from '../workflow-designer/services/workflow-designer.service';
import {GrapicalCalendarSetupService} from '../../service/grapical-calendar-setup-service';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';
import {CommonService} from '../../service/common-service';
import {ToastrService} from 'ngx-toastr';
import {InputDate} from '../../../shared/common-components/input-types/input-date/input-date';
import {GenericDataGrid} from '../../../shared/common-components/generic-component-type/generic-data-grid/generic-data-grid';

@Component({
  selector: 'app-graphical-calendar-setup',
  imports: [ExpansionPanelHeader, InputIdBox, InputTextBox, InputSelectOptionField, InputDate, GenericDataGrid],
  templateUrl: './graphical-calendar-setup.html',
  styleUrl: './graphical-calendar-setup.scss'
})
export class GraphicalCalendarSetup {
  readonly setupPanelOpen = signal(true);
  readonly holidayPanelOpen = signal(true);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseService = inject(GrapicalCalendarSetupService);
  private readonly commonService = inject(CommonService);

  public readonly cldType = signal<any[]>([]);
  public readonly holidayCldType = signal<any[]>([]);
  public readonly holidayType = signal<any[]>([]);
  readonly levelDetails = signal<ApprovalLevelViewModel[]>([]);
  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.baseService.getAllCalendarType()
      .pipe(catchError(() => of([])))
      .subscribe(policies => this.cldType.set(policies ?? []));
    this.baseService.getAllHolidayType()
      .pipe(catchError(() => of([])))
      .subscribe(holidays => {
        this.holidayType.set(holidays ?? []);
        this.holidayCldType.set(holidays ?? []);
      });
  }

  readonly grCldSetupForm = this.fb.group({
    officeId: [null as number | null],
    officeNm: [null as string | null],
    cldType: [null as number | null],
    holidayCldType: [null as number | null],
    holidayType: [null as number | null],
    dtFrom: [''],
    dtTo:[''],
  });
  readonly cldTypeOptions = computed(() =>
    this.cldType().map(cldType => ({
      key: String(cldType.cldTypeId),
      value: `${cldType.cldTypeId} - ${cldType.cldTypeName}`
    }))
  )
  readonly holidayCldTypeOptions = computed(() =>
    this.holidayCldType().map(cldType => ({
      key: String(cldType.cldTypeId),
      value: `${cldType.cldTypeId} - ${cldType.cldTypeName}`
    }))
  )
  readonly holidayTypeOptions = computed(() =>
    this.holidayType().map(holidayType => ({
      key: String(holidayType.holidayTypeId),
      value: `${holidayType.holidayTypeId} - ${holidayType.holidayTypeName}`
    }))
  )
  onOfficeIDChange(officeId: any): void {
    this.commonService.getOfficeName(officeId)
      .subscribe(name => {
        if (name) {
          this.grCldSetupForm.patchValue({
            officeNm: name
          });
          console.log("Office Name:", name);
          this.baseService.getCalendarAssignOfficeById(officeId)
            .subscribe(data => {
              console.log("data: ", data);
              if (data) {
                this.grCldSetupForm.patchValue({
                  cldType: data.cldTypeId
                });
              } else {
                this.toastr.info("No office found with this office ID","No Data Found!");
                this.grCldSetupForm.patchValue({ cldType: null });
              }
            });
        } else {
          this.toastr.info("No office found with this office ID","No Data Found!");
          this.grCldSetupForm.patchValue({ officeNm: '' });
        }
      });
  }
  onHolidayTypeChange(officeId: any): void {
    const holidayCldType = this.grCldSetupForm.value.holidayCldType;
    const holidayType = this.grCldSetupForm.value.holidayType;

    this.baseService.getHolidayList(holidayCldType,holidayType)
      .subscribe(name => {
        if (name) {
          // this.grCldSetupForm.patchValue({
          //   officeNm: name
          // });
          console.log("Office Name:", name);
          this.baseService.getCalendarAssignOfficeById(officeId)
            .subscribe(data => {
              console.log("data: ", data);
              if (data) {
                this.grCldSetupForm.patchValue({
                  cldType: data.cldTypeId
                });
              } else {
                this.toastr.info("No office found with this office ID","No Data Found!");
                this.grCldSetupForm.patchValue({ cldType: null });
              }
            });
        } else {
          this.toastr.info("No office found with this office ID","No Data Found!");
          this.grCldSetupForm.patchValue({ officeNm: '' });
        }
      });
  }

}
