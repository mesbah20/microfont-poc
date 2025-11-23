import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {forkJoin, of, Observable, EMPTY, tap, concat} from 'rxjs';
import {catchError, delay, finalize, map, switchMap} from 'rxjs/operators';
import { ExpansionPanelHeader } from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import { SelectOptionField } from '../../../shared/components/input-types/select-option-field/select-option-field';
import { NumberInput } from '../../../shared/components/input-types/number-input/number-input';
import { TextBaseInput } from '../../../shared/components/input-types/text-base-input/text-base-input';
import { Button } from '../../../shared/components/input-types/button/button';
import {DataGridComponent, DropdownOption} from '../../../shared/components/data-grid/data-grid';
import { SubPanelHeader } from '../../../shared/components/sub-panel-header/sub-panel-header';
import { WorkflowDesignerService } from './services/workflow-designer.service';
import {
  ApprovalEligibleApproverModel,
  ApprovalFunctionLevelDetailModel,
  ApprovalFunctionLevelModel,
  ApprovalLevelViewModel,
  ApprovalPolicyIndicatorModel,
  MetaAppFunctionItem,
  MetaAppListItem,
  MetaAppModuleItem
} from '../../model/approval-workflow.model';
import { UserRolesModel } from '../../model/UserRoles.model';
import { ToastrService } from 'ngx-toastr';
import {
  BUTTON_VISIBILITY,
  ONCLICK_RESET,
  ONCLICK_SAVE,
  ONCLICK_VIEW
} from '../../../shared/constant/button-signals.constant';
import {OfficeType} from '../../model/OfficeType';
import {CommonService} from '../../service/common-service';
import {LdsModalComponent} from '../../../shared/components/lds-modal/lds-modal';
import {IdBoxComponent} from '../../../shared/components/input-types/id-box/id-box';

interface GridSelectionEvent {
  data: string;
  checked: boolean;
}

interface ApproverPreviewRow {
  approvalLevel: number;
  approvalPolicy: number;
  userId: string;
  userName?: string | null;
  homeOfficeId?: number | null;
  roleNames: string;
}

@Component({
  selector: 'app-workflow-designer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExpansionPanelHeader,
    SubPanelHeader,
    SelectOptionField,
    NumberInput,
    TextBaseInput,
    Button,
    DataGridComponent,
    LdsModalComponent,
    IdBoxComponent,
  ],
  templateUrl: './workflow-designer.html',
  styleUrl: './workflow-designer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowDesigner implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly workflowService = inject(WorkflowDesignerService);
  private readonly commonService = inject(CommonService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectorForm = this.fb.group({
    appId: [null as number | null],
    moduleId: [null as string | null],
    functionId: [null as number | null]
  });

  readonly levelForm = this.fb.group({
    workflowId: [null as number | null],
    workflowName: [null as string | null],
    appId: [null as number | null],
    numberOfApprovalLevel: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  readonly detailForm = this.fb.group({
    workflowDetailId: [null as number | null],
    approvalLevel: [null as number | null, [Validators.required, Validators.min(1)]],
    approvalPolicy: [null as number | null, Validators.required],
    approverNo: [null as number | null],
    organizationLevel: [null as number | null],
    roleName: [null as string | null]
  });

  readonly previewForm = this.fb.group({
    makerId: ['']
  });

  readonly appPanelOpen = signal(true);
  readonly levelPanelOpen = signal(true);
  readonly detailPanelOpen = signal(true);
  readonly previewPanelOpen = signal(false);

  private readonly applications = signal<MetaAppListItem[]>([]);
  private readonly modules = signal<MetaAppModuleItem[]>([]);
  private readonly functions = signal<MetaAppFunctionItem[]>([]);
  private readonly policies = signal<ApprovalPolicyIndicatorModel[]>([]);
  private readonly organizations = signal<OfficeType[]>([]);
  private readonly roles = signal<UserRolesModel[]>([]);

  readonly functionLevels = signal<ApprovalFunctionLevelModel[]>([]);
  readonly levelDetails = signal<ApprovalLevelViewModel[]>([]);
  readonly eligibleApprovers = signal<ApprovalEligibleApproverModel[]>([]);

  readonly selectedLevel = signal<ApprovalFunctionLevelModel | null>(null);
  readonly selectedDetail = signal<ApprovalLevelViewModel | null>(null);
  readonly selectedRoles = signal<string[]>([]);

  readonly isLoadingLevels = signal(false);
  readonly isSavingLevel = signal(false);
  readonly isSavingDetail = signal(false);
  readonly isLoadingApprovers = signal(false);

  readonly detailCountState = computed(() => {
    const level = this.selectedLevel();
    const required = level?.numberOfApprovalLevel ?? 0;
    const actual = this.levelDetails().length;
    return {
      required,
      actual,
      valid: required === 0 || actual === required
    };
  });
  isEditMode: boolean = false;
  showUserRolesModal = false;
  conditionPayload : string;
  saveDetailList:ApprovalLevelViewModel[]=[];

  //modal
  showModal = signal<boolean>(false);
  modalComponent: any = null;
  modalComponentData: any = {};

  constructor(private cdr: ChangeDetectorRef) {
    BUTTON_VISIBILITY.set({
      save: false,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: false
    });

    effect(() => {
      if (ONCLICK_SAVE()) {
        this.saveLevelWithDetail();
        ONCLICK_SAVE.set(false);
      }
      if (ONCLICK_RESET()) {
        this.resetAll();
        ONCLICK_RESET.set(false);
      }
      if (ONCLICK_VIEW()) {
        this.resetAll();
        ONCLICK_VIEW.set(false);
      }
      this.transactionDropdownOptions.update(opts => ({
        ...opts,
        //approvalPolicy: this.approvalPolicyOptions(),
        //organizationLevel: this.organizationLevelOptions()
      }));
    });

  }
  transactionDropdownOptions = signal<Record<string, DropdownOption[]>>({
    approvalPolicy: [],
    organizationLevel: [],
  });

  transactionDropdownColumns = signal(['approvalPolicy', 'organizationLevel']);
  ngOnInit(): void {
    this.loadInitialData();
    this.registerFormListeners();
  }

  readonly applicationOptions = computed(() =>
    this.applications().map(item => ({
      key: item.appId,
      value: `${item.appId} - ${item.appName}`
    }))
  );

  readonly moduleOptions = computed(() =>
    this.modules().map(item => ({
      key: item.moduleId,
      value: `${item.moduleId} - ${item.moduleName}`
    }))
  );

  readonly functionOptions = computed(() =>
    this.functions().map(item => ({
      key: item.functionId,
      value: `${item.functionId} - ${item.functionName}`
    }))
  );


  readonly approvalPolicyOptions = computed(() =>
    this.policies().map(policy => ({
      key: policy.approvalPolicyId,
      value: `${policy.approvalPolicyId} - ${policy.description}`
    }))
  );
  readonly organizationLevelOptions = computed(() =>
    this.organizations().map(officeType => ({
      key: officeType.OFC_TYPE_ID,
      value: `${officeType.OFC_TYPE_ID} - ${officeType.OFC_TYPE_NM}`
    }))
  );

  readonly roleOptions = computed(() =>
    this.roles().map(role => ({
      key: role.roleName,
      value: role.roleName
    }))
  );

  readonly approverRows = computed<ApproverPreviewRow[]>(() => {
    const rows: ApproverPreviewRow[] = [];
    this.eligibleApprovers().forEach(entry => {
      entry.approvers.forEach(user => {
        rows.push({
          approvalLevel: entry.approvalLevel,
          approvalPolicy: entry.approvalPolicy,
          userId: user.userId,
          userName: user.userName ?? '',
          homeOfficeId: user.homeOfficeId ?? null,
          roleNames: user.roleNames.join(', ')
        });
      });
    });
    return rows;
  });

  private loadInitialData(): void {
    this.workflowService.getApplications()
      .subscribe(apps => {
        console.log("Applications array:", apps);
        this.applications.set(apps);
      });

    this.workflowService.getApprovalPolicies()
      .pipe(catchError(() => of([])))
      .subscribe(policies => this.policies.set(policies ?? []));

    this.commonService.getAllOfficeType()
      .pipe(catchError(() => of([])))
      .subscribe(organizations => this.organizations.set(organizations ?? []));

    this.workflowService.getRoles()
      .pipe(catchError(() => of([])))
      .subscribe(roleList => this.roles.set(roleList ?? []));
  }

/*   registerFormListeners(): void {
    this.levelForm.get('appId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(appId => {
        this.modules.set([]);
        this.functions.set([]);
        this.functionLevels.set([]);
        this.levelDetails.set([]);
        this.selectedLevel.set(null);
        this.selectedDetail.set(null);
        this.selectedRoles.set([]);
        this.levelForm.reset({ workflowId: null, numberOfApprovalLevel: null });
        this.levelForm.markAsPristine();
        this.levelForm.markAsUntouched();
        this.detailForm.reset({
          workflowDetailId: null,
          approvalLevel: null,
          approvalPolicy: null,
          approverNo: null,
          organizationLevel: null,
          roleName: null
        });
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();
        this.selectorForm.patchValue({
          moduleId: null,
          functionId: null
        }, { emitEvent: false });
        if (appId !== null && appId !== undefined) {
          this.fetchModules(appId);
        }
      });

    this.selectorForm.get('moduleId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(moduleId => {
        this.functions.set([]);
        this.functionLevels.set([]);
        this.levelDetails.set([]);
        this.selectedLevel.set(null);
        this.selectedDetail.set(null);
        this.selectedRoles.set([]);
        this.levelForm.reset({ workflowId: null, numberOfApprovalLevel: null });
        this.levelForm.markAsPristine();
        this.levelForm.markAsUntouched();
        this.detailForm.reset({
          workflowDetailId: null,
          approvalLevel: null,
          approvalPolicy: null,
          approverNo: null,
          organizationLevel: null,
          roleName: null
        });
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();
        this.selectorForm.get('functionId')?.setValue(null, { emitEvent: false });
        const appId = this.selectorForm.get('appId')?.value;
        if (appId !== null && appId !== undefined && moduleId) {
          this.fetchFunctions(appId, moduleId);
        }
      });

    this.selectorForm.get('functionId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(functionId => {
        this.functionLevels.set([]);
        this.levelDetails.set([]);
        this.selectedLevel.set(null);
        this.selectedDetail.set(null);
        this.selectedRoles.set([]);
        this.levelForm.reset({ workflowId: null, numberOfApprovalLevel: null });
        this.levelForm.markAsPristine();
        this.levelForm.markAsUntouched();
        this.detailForm.reset({
          workflowDetailId: null,
          approvalLevel: null,
          approvalPolicy: null,
          approverNo: null,
          organizationLevel: null,
          roleName: null
        });
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();
        if (functionId !== null && functionId !== undefined) {
          this.loadFunctionLevels(functionId);
        }
      });
  }*/
  registerFormListeners(): void {
    this.levelForm.get('appId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(appId => {
        console.log('AppId changed:', appId);

        this.modules.set([]);
        this.selectorForm.patchValue(
          { moduleId: null, functionId: null },
          { emitEvent: false }
        );

        if (appId) {
          this.fetchModules(appId);
        }
      });

    this.selectorForm.get('moduleId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(moduleId => {
        console.log('ModuleId changed:', moduleId);

        const appId = this.levelForm.get('appId')?.value;

        this.functions.set([]);
        this.selectorForm.get('functionId')?.setValue(null, { emitEvent: false });

        if (appId && moduleId) {
          this.fetchFunctions(appId, moduleId);
        }
      });

    this.selectorForm.get('functionId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(functionId => {
        console.log('FunctionId changed:', functionId);
/*
        this.functionLevels.set([]);
        this.levelDetails.set([]);
        this.selectedLevel.set(null);
        this.selectedDetail.set(null);
        this.selectedRoles.set([]);*/

      /*  if (functionId) {
          this.loadFunctionLevels(functionId);
        }*/
      });
  }


  private fetchModules(appId: number): void {
    console.log('Fetching modules for appId:', appId);
    this.workflowService.getModules(appId)
      .pipe(
        catchError(() => {
          this.toastr.error('Error fetching modules.', 'Error');
          return of([]); // allow normal flow
        })
      )
      .subscribe(mods => {
        if (!mods || !mods.length) {
          this.toastr.info('No modules found for this application. You can still proceed.', 'Information');
        }
        console.log('Modules loaded:', mods);
        this.modules.set(mods ?? []);
      });
  }

/*  private fetchModules(appId: number): void {
    this.workflowService.getModules(appId)
      .pipe(catchError(() => of([])))
      .subscribe(mods => this.modules.set(mods ?? []));
  }*/

  private fetchFunctions(appId: number, moduleId: string): void {
    this.workflowService.getFunctions(appId, moduleId)
      .pipe(catchError(() => of([])))
      .subscribe(funcs => this.functions.set(funcs ?? []));
  }

/*  private loadFunctionLevels(functionId: number): void {
    this.isLoadingLevels.set(true);
    this.workflowService.getFunctionLevels(functionId)
      .pipe(
        catchError(() => {
          this.toastr.error('Unable to load approval levels', 'Load Error');
          return of([]);
        }),
        finalize(() => this.isLoadingLevels.set(false))
      )
      .subscribe(levels => {
        const levelList = levels ?? [];
        this.functionLevels.set(levelList);
        if (levelList.length === 0) {
          this.toastr.info('No approval levels defined for selected function.', 'Information');
          this.selectedLevel.set(null);
          this.levelForm.reset({ workflowId: null, numberOfApprovalLevel: null });
          this.levelForm.markAsPristine();
          this.levelForm.markAsUntouched();
          this.levelDetails.set([]);
          this.selectedDetail.set(null);
          this.detailForm.reset({
            workflowDetailId: null,
            approvalLevel: null,
            approvalPolicy: null,
            approverNo: null,
            organizationLevel: null,
            roleName: null
          });
          this.detailForm.markAsPristine();
          this.detailForm.markAsUntouched();
          this.selectedRoles.set([]);
          return;
        }

        const currentSelectionId = this.selectedLevel()?.workflowId;
        const targetLevel = levelList.find(level => level.workflowId === currentSelectionId)
          ?? levelList[0];
        this.selectedLevel.set(targetLevel);
        this.levelForm.patchValue({
          workflowId: targetLevel.workflowId,
          numberOfApprovalLevel: targetLevel.numberOfApprovalLevel
        });
        this.levelForm.markAsPristine();
        this.levelForm.markAsUntouched();
        this.loadLevelDetails(targetLevel);
      });
  }*/
  loadFunctionLevels(workflowId: number): void {
    this.isLoadingLevels.set(true);
    this.workflowService.getFunctionLevelsById(workflowId)
      .pipe(
        catchError(() => {
          this.toastr.info('No Workflow exist for this ID.', 'Information');
          return of([]);
        }),
        finalize(() => this.isLoadingLevels.set(false))
      )
      .subscribe(levels => {
        this.conditionPayload = JSON.stringify(levels);
        console.log('Payload -> ', this.conditionPayload);

        const levelList = Array.isArray(levels) ? levels : [levels].filter(Boolean);

        if (!levelList.length) {
          //this.toastr.info('No approval levels defined for this function. You can add new ones.', 'Information');
          this.functionLevels.set([]);
          return;
        }

        this.functionLevels.set(levelList);

        const currentSelectionId = this.selectedLevel()?.workflowId;
        const targetLevel = levelList.find(level => level.workflowId === currentSelectionId) ?? levelList[0];

        this.selectedLevel.set(targetLevel);

        this.levelForm.patchValue({
          workflowId: targetLevel.workflowId,
          workflowName: targetLevel.workflowName,
          appId: targetLevel.appId,
          numberOfApprovalLevel: targetLevel.numberOfApprovalLevel
        }, { emitEvent: false });

        this.cdr.detectChanges();
        this.levelForm.markAsPristine();
        this.levelForm.markAsUntouched();

        // If appId exists, manually fetch modules
        if (targetLevel.appId) {
          this.fetchModules(targetLevel.appId);
        }

        this.loadLevelDetails(targetLevel);
      });
  }

  private loadLevelDetails(level: ApprovalFunctionLevelModel): void {
    this.workflowService.getLevelDetails(level.workflowId!)
      .pipe(
        switchMap(details => {
          if (!details || details.length === 0) {
            return of([] as ApprovalLevelViewModel[]);
          }
          const requests = details.map(detail =>
            this.workflowService.getRoleMappings(detail.workflowDetailId!).pipe(
              catchError(() => of([])),
              switchMap(roleMappings => {
                const policyDescription = detail.policyDescription ?? this.resolvePolicy(detail.approvalPolicy);
                const roles = roleMappings.map(mapper => mapper.roleName);
                const viewModel: ApprovalLevelViewModel = {
                  ...detail,
                  policyDescription,
                  roles,
                  roleMappings,
                  roleCount: detail.roleCount ?? roleMappings.length
                };
                return of(viewModel);
              })
            )
          );
          return forkJoin(requests);
        }),
        catchError(() => {
          this.toastr.error('Unable to load level details', 'Load Error');
          return of([] as ApprovalLevelViewModel[]);
        })
      )
      .subscribe(viewModels => {
        const sortedViewModels = (viewModels ?? []).slice().sort((a, b) =>
          (a.approvalLevel ?? 0) - (b.approvalLevel ?? 0)
        );
        this.levelDetails.set(sortedViewModels);
        this.selectedDetail.set(null);
        this.detailForm.reset({
          workflowDetailId: null,
          approvalLevel: null,
          approvalPolicy: null,
          approverNo: null,
          organizationLevel: null,
          roleName: null
        });
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();
        this.selectedRoles.set([]);
      });
  }


  onDetailSelection(event: GridSelectionEvent): void {
    if (!event) {
      return;
    }
    if (!event.checked) {
      this.selectedDetail.set(null);
      this.detailForm.reset({
        workflowDetailId: null,
        approvalLevel: null,
        approvalPolicy: null,
        approverNo: null,
        organizationLevel: null,
        roleName: null
      });
      this.detailForm.markAsPristine();
      this.detailForm.markAsUntouched();
      this.selectedRoles.set([]);
      return;
    }

    try {
      const detail: ApprovalLevelViewModel = JSON.parse(event.data);
      this.selectedDetail.set(detail);
      this.detailForm.patchValue({
        workflowDetailId: detail.workflowDetailId,
        approvalLevel: detail.approvalLevel,
        approvalPolicy: detail.approvalPolicy,
        approverNo: detail.approverNo ?? null,
        organizationLevel: detail.organizationLevel ?? null,
        roleName: null
      });
      this.detailForm.markAsPristine();
      this.detailForm.markAsUntouched();
      this.selectedRoles.set([...(detail.roles ?? [])]);
    } catch (error) {
      console.error('Failed to parse detail selection', error);
    }
  }
  onFHEditClick(detail: string){
    console.log('Edit clicked, received detail:', detail);
   /* if (!detail) {
      this.toastr.warning('No record selected for edit.', 'Information');
      return;
    }

    // Log to confirm what you’re receiving from the grid


    // Populate the detail form with the selected row’s data
    this.detailForm.patchValue({
      workflowDetailId: detail.workflowDetailId ?? null,
      approvalLevel: detail.approvalLevel ?? null,
      approvalPolicy: detail.approvalPolicy ?? null,
      approverNo: detail.approverNo ?? null,
      organizationLevel: detail.organizationLevel ?? null,
      roleName: detail.roleName ?? null,
    });

    // Optional flag so your UI knows this is editing mode
    this.isEditMode = true;*/

  }

  addRoleToSelection(): void {
    const role = this.detailForm.get('roleName')?.value;
    if (!role) {
      return;
    }
    const current = this.selectedRoles();
    if (!current.includes(role)) {
      this.selectedRoles.set([...current, role]);
    }
    this.detailForm.get('roleName')?.setValue(null);
  }

  removeRoleFromSelection(role: string): void {
    this.selectedRoles.set(this.selectedRoles().filter(item => item !== role));
  }

  saveLevel(): void {
    if (this.selectorForm.invalid) {
      this.selectorForm.markAllAsTouched();
      this.toastr.warning('Please select application, module, and function.', 'Validation');
      return;
    }

    if (this.levelForm.invalid) {
      this.levelForm.markAllAsTouched();
      this.toastr.warning('Please provide a valid number of approval levels.', 'Validation');
      return;
    }

    const functionId = this.selectorForm.get('functionId')?.value as number;
    const payload: ApprovalFunctionLevelModel = {
      ...this.levelForm.value,
      appId: this.selectorForm.get('appId')?.value ?? null,
      workflowName: this.levelForm.get('workflowName')?.value ?? 0,
      numberOfApprovalLevel: this.levelForm.get('numberOfApprovalLevel')?.value ?? 0
    } as ApprovalFunctionLevelModel;

    const existing = this.functionLevels().find(level => level.workflowId === payload.workflowId);
    this.isSavingLevel.set(true);

    const request$ = existing
      ? this.workflowService.updateFunctionLevel(existing.workflowId!, payload)
      : this.workflowService.createFunctionLevel(payload);

    request$
      .pipe(
        catchError(() => {
          this.toastr.error('Failed to save workflow level.', 'Error');
          return of(null);
        }),
        finalize(() => this.isSavingLevel.set(false))
      )
      .subscribe(result => {
        if (!result) {
          return;
        }
        this.toastr.success('Workflow level saved successfully.', 'Success');
        this.loadFunctionLevels(functionId);
      });
  }

  deleteLevel(): void {
    const level = this.selectedLevel();
    if (!level) {
      this.toastr.warning('Select a workflow level to delete.', 'Information');
      return;
    }

    this.workflowService.deleteFunctionLevel(level.workflowId!)
      .pipe(
        catchError(() => {
          this.toastr.error('Unable to delete workflow level.', 'Error');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result === null) {
          return;
        }
        this.toastr.success('Workflow level deleted.', 'Success');
        const functionId = this.selectorForm.get('functionId')?.value as number;
        if (functionId !== undefined && functionId !== null) {
          this.loadFunctionLevels(functionId);
        }
      });
  }
  //readonly levelDetails = signal<ApprovalLevelViewModel[]>([]);

  addDetailLocally(): void {
    // Pull values from detailForm
    const approvalLevelValue = this.detailForm.get('approvalLevel')?.value ?? 0;

    const payload: ApprovalLevelViewModel = {
      ...this.detailForm.value,
      workflowId: this.levelForm.get('workflowId')?.value ?? 0,
      approvalLevel: approvalLevelValue,
      approvalPolicy: this.detailForm.get('approvalPolicy')?.value ?? 0,
      approverNo: this.detailForm.get('approverNo')?.value ?? null,
      organizationLevel: this.detailForm.get('organizationLevel')?.value ?? null,
      workflowDetailId: this.detailForm.get('workflowDetailId')?.value ?? null,
      roles: this.selectedRoles(),
      roleMappings: []
    };

    console.log("payload from add details", payload);
    const currentDetails = this.levelDetails(); // unwrap the signal

    if (payload.workflowDetailId) {
      // Existing row — update by workflowDetailId
      const existingIndex = currentDetails.findIndex(
        (detail: ApprovalLevelViewModel) =>
          detail.workflowDetailId === payload.workflowDetailId
      );
      if (existingIndex !== -1) {
        const updated = [
          ...currentDetails.slice(0, existingIndex),
          payload,
          ...currentDetails.slice(existingIndex + 1)
        ];
        this.levelDetails.set(updated);
        this.toastr.success('Workflow detail updated locally.', 'Success');
        this.resetDetailForm();
        return;
      }
    }

    // New row — check max approval levels
    const requiredLevels = this.levelForm.get('numberOfApprovalLevel')?.value ?? 0;
    if (requiredLevels > 0 && currentDetails.length >= requiredLevels) {
      this.toastr.warning(
        `You have already configured ${requiredLevels} approval level detail${requiredLevels === 1 ? '' : 's'}. Delete an existing detail before adding a new one.`,
        'Validation'
      );
      return;
    }

    // Check duplicate approval level
    const duplicateLevel = currentDetails.some(
      (detail: ApprovalLevelViewModel) =>
        detail.approvalLevel === approvalLevelValue
    );
    if (duplicateLevel) {
      this.toastr.warning(
        `Approval level ${approvalLevelValue} is already configured. Update the existing row instead.`,
        'Validation'
      );
      return;
    }

    // Add new row
    this.levelDetails.set([...currentDetails, payload]);
    this.saveDetailList = this.levelDetails();
    console.log("saveDetailList", this.saveDetailList);
    this.toastr.success('Workflow detail added locally.', 'Success');

    // Reset the detail form for next input
    this.resetDetailForm();
  }
  /*
  saveDetail(level?: ApprovalFunctionLevelModel): Observable<unknown> {
    const activeLevel = level ?? this.selectedLevel();
    if (!activeLevel?.workflowId) {
      this.toastr.warning('No workflow level found or workflowId missing.', 'Warning');
      return of(null);
    }

    const detailsToSave = this.saveDetailList; // ✅ read once
    console.log("this.saveDetailList", this.saveDetailList);
    console.log("detailsToSave", detailsToSave);
    if (!detailsToSave.length) {
      this.toastr.warning('No details to save.', 'Validation');
    }

/!*    if (!detailsToSave || detailsToSave.length === 0) {
      this.toastr.warning('No workflow details to save.', 'Validation');
      return of(null);
    }*!/

    this.isSavingDetail.set(true);

    // Save each row and sync role mappings
    const requests = detailsToSave.map(detail => {
      const payload: ApprovalFunctionLevelDetailModel = {
        workflowDetailId: detail.workflowDetailId ?? null,
        workflowId: detail.workflowId!,
        approvalLevel: detail.approvalLevel,
        approvalPolicy: detail.approvalPolicy,
        approverNo: detail.approverNo ?? 1,
        organizationLevel: detail.organizationLevel ?? 1
      };

      console.log('📤 Saving detail payload:', payload);

      // Determine create or update
      const save$ = detail.workflowDetailId
        ? this.workflowService.updateLevelDetail(detail.workflowDetailId, payload)
        : this.workflowService.createLevelDetail(payload);

      // After saving, sync role mappings
      return save$.pipe(
        switchMap(result => {
          if (!result || !result.workflowDetailId) return of(null);
          return this.syncRoleMappings(result.workflowDetailId);
        })
      );
    });

    return forkJoin(requests).pipe(
      tap(() => {
        this.toastr.success('All workflow details and role mappings saved successfully.', 'Success');
        this.loadLevelDetails(activeLevel);
        this.resetDetailForm();
      }),
      catchError(err => {
        console.error('❌ saveDetail error:', err);
        this.toastr.error('Failed to save workflow details.', 'Error');
        return of(null);
      }),
      finalize(() => this.isSavingDetail.set(false))
    );
  }*/
  saveDetail(): void {
    const level = this.selectedLevel();
    if (!level) {
      this.toastr.warning('Select a workflow level before adding details.', 'Information');
      return;
    }

    if (this.detailForm.invalid) {
      this.detailForm.markAllAsTouched();
      this.toastr.warning('Please provide valid workflow detail information.', 'Validation');
      return;
    }

    const requiredLevels = level.numberOfApprovalLevel ?? 0;
    const approvalLevelValue = this.detailForm.get('approvalLevel')?.value ?? 0;
    if (requiredLevels > 0 && (approvalLevelValue < 1 || approvalLevelValue > requiredLevels)) {
      this.toastr.warning(`Approval level must be between 1 and ${requiredLevels}.`, 'Validation');
      return;
    }

    const payload: ApprovalFunctionLevelDetailModel = {
      ...this.detailForm.value,
      workflowId: level.workflowId!,
      approvalLevel: approvalLevelValue,
      approvalPolicy: this.detailForm.get('approvalPolicy')?.value ?? 0,
      approverNo: this.detailForm.get('approverNo')?.value ?? null,
      organizationLevel: this.detailForm.get('organizationLevel')?.value ?? null
    } as ApprovalFunctionLevelDetailModel;

    const existing = this.levelDetails().find(detail => detail.workflowDetailId === payload.workflowDetailId);

    if (!existing && requiredLevels > 0 && this.levelDetails().length >= requiredLevels) {
      this.toastr.warning(`You have already configured ${requiredLevels} approval level detail${requiredLevels === 1 ? '' : 's'}. Delete an existing detail before adding a new one.`, 'Validation');
      return;
    }

    const duplicateLevel = this.levelDetails().some(detail =>
      detail.approvalLevel === approvalLevelValue && detail.workflowDetailId !== payload.workflowDetailId
    );
    if (duplicateLevel) {
      this.toastr.warning(`Approval level ${approvalLevelValue} is already configured. Update the existing row instead.`, 'Validation');
      return;
    }
    console.log("payload",payload);
    this.isSavingDetail.set(true);
    const request$ = existing
      ? this.workflowService.updateLevelDetail(existing.workflowDetailId!, payload)
      : this.workflowService.createLevelDetail(payload);

    request$
      .pipe(
        catchError(() => {
          this.toastr.error('Failed to save workflow detail.', 'Error');
          return of(null);
        }),
        switchMap(result => {
          if (!result) {
            return of(null);
          }
          return this.syncRoleMappings(result.workflowDetailId ?? null);
        }),
        finalize(() => this.isSavingDetail.set(false))
      )
      .subscribe(result => {
        if (result === null) {
          return;
        }
        this.toastr.success('Workflow detail saved successfully.', 'Success');
        this.loadLevelDetails(level);
      });
  }

  deleteDetail(): void {
    const detail = this.selectedDetail();
    if (!detail) {
      this.toastr.warning('Select a workflow detail row to delete.', 'Information');
      return;
    }

    this.workflowService.deleteLevelDetail(detail.workflowDetailId!)
      .pipe(
        catchError(() => {
          this.toastr.error('Unable to delete workflow detail.', 'Error');
          return of(null);
        })
      )
      .subscribe(() => {
        this.toastr.success('Workflow detail deleted.', 'Success');

        const level = this.selectedLevel();
        if (level) {
          this.loadLevelDetails(level);
        }

        this.selectedDetail.set(null);

        this.detailForm.reset({
          workflowDetailId: null,
          approvalLevel: null,
          approvalPolicy: null,
          approverNo: null,
          organizationLevel: null,
          roleName: null
        });
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();
        this.selectedRoles.set([]);
      });

  }

  private syncRoleMappings(workflowDetailId: number | null): Observable<unknown> {
    if (workflowDetailId === null) {
      return of(true);
    }

    const detail = this.levelDetails().find(item => item.workflowDetailId === workflowDetailId);
    const existingMappings = detail?.roleMappings ?? [];
    const currentRoles = existingMappings.map(mapping => mapping.roleName);

    const desiredRoles = this.selectedRoles();

    const toAdd = desiredRoles
      .filter(role => !currentRoles.includes(role))
      .filter((role, index, self) => self.indexOf(role) === index);

    const toRemove = existingMappings.filter(mapping => !desiredRoles.includes(mapping.roleName));

    console.log("toAdd:", toAdd);

    const requests: Observable<unknown>[] = [];

    // Add roles (failure-tolerant, ignores ORA-00001)
    for (const role of toAdd) {
      requests.push(
        this.workflowService.createRoleMapping({ workflowDetailId, roleName: role }).pipe(
          map(res => res?.[0] ?? null),
          catchError(err => {
            if (err?.error?.message?.includes('ORA-00001')) {
              console.warn(`Duplicate role '${role}' ignored`);
              return of(null);
            }
            console.warn(`Failed to add role '${role}':`, err);
            return of(null);
          })
        )
      );
    }


    for (const mapping of toRemove) {
      requests.push(this.workflowService.deleteRoleMapping(mapping.workflowRoleMapId!));
    }

    if (requests.length === 0) {
      return of(true);
    }

    return forkJoin(requests).pipe(
      catchError(() => {
        this.toastr.error('Failed to synchronise role assignments.', 'Error');
        return of(null);
      })
    );
  }

  private syncRole(
    workflowDetailId: number,
    desiredRoles: string[]
  ): Observable<unknown> {
    if (!workflowDetailId) return of(true);

    const detail = this.levelDetails().find(
      item => item.workflowDetailId === workflowDetailId
    );

    const existingMappings = detail?.roleMappings ?? [];
    const currentRoles = existingMappings.map(m => m.roleName);

    const toAdd = desiredRoles.filter(role => !currentRoles.includes(role));
    const toRemove = existingMappings.filter(m => !desiredRoles.includes(m.roleName));

    console.log('Syncing roles for', workflowDetailId, { toAdd, toRemove });

    const requests: Observable<unknown>[] = [];

    for (const role of toAdd) {
      requests.push(
        this.workflowService
          .createRoleMapping({ workflowDetailId, roleName: role })
          .pipe(
            map(res => res?.[0] ?? null),
            catchError(err => {
              if (err?.error?.message?.includes('ORA-00001')) {
                console.warn(`Duplicate role '${role}' ignored`);
                return of(null);
              }
              console.warn(`Failed to add role '${role}':`, err);
              return of(null);
            })
          )
      );
    }

    for (const mapping of toRemove) {
      requests.push(this.workflowService.deleteRoleMapping(mapping.workflowRoleMapId!));
    }

    if (requests.length === 0) {
      return of(true);
    }

    return forkJoin(requests).pipe(
      catchError(() => {
        this.toastr.error('Failed to synchronise role assignments.', 'Error');
        return of(null);
      })
    );
  }


  previewApprovers(): void {
    const appId = this.levelForm.get('appId')?.value;
    const functionId = this.selectorForm.get('functionId')?.value;
    const makerId = (this.previewForm.get('makerId')?.value || '').trim();
    if (!appId) {
      this.toastr.warning('Select an application before previewing approvers.', 'Information');
      return;
    }
    if (!functionId) {
      this.toastr.warning('Select a function before previewing approvers.', 'Information');
      return;
    }
    if (!makerId) {
      this.toastr.warning('Enter a maker user ID to preview approvers.', 'Information');
      return;
    }

    this.isLoadingApprovers.set(true);
    this.workflowService.getEligibleApprovers(appId, functionId, makerId, this.conditionPayload)
      .pipe(
        catchError(() => {
          this.toastr.error('Unable to fetch eligible approvers.', 'Error');
          return EMPTY;
        }),
        finalize(() => this.isLoadingApprovers.set(false))
      )
      .subscribe(result => {
        const allApprovers = result.flatMap(item => item.approvers);
        this.previewPanelOpen.set(true);
        this.eligibleApprovers.set(result ?? []);
        console.log("allApprovers",allApprovers);
        if (allApprovers.length === 0) {
          this.toastr.info('No eligible approvers found for the selected maker.', 'Information');
        }
      });
  }

  private resolvePolicy(policyId: number | null | undefined): string {
    if (!policyId) {
      return '';
    }
    return this.policies().find(policy => policy.approvalPolicyId === policyId)?.description ?? '';
  }
  private resolveOrganizations(officeTypeId: number | null | undefined): string {
    if (!officeTypeId) {
      return '';
    }
    return this.organizations().find(policy => policy.OFC_TYPE_ID === officeTypeId)?.OFC_TYPE_NM ?? '';
  }

  resetLevelForm(): void {
    this.levelForm.reset({ workflowId: null, numberOfApprovalLevel: null });
    this.levelForm.markAsPristine();
    this.levelForm.markAsUntouched();
    this.selectedLevel.set(null);
    this.levelDetails.set([]);
    this.selectedDetail.set(null);
    this.detailForm.reset({
      workflowDetailId: null,
      approvalLevel: null,
      approvalPolicy: null,
      approverNo: null,
      organizationLevel: null,
      roleName: null
    });
    this.detailForm.markAsPristine();
    this.detailForm.markAsUntouched();
    this.selectedRoles.set([]);
  }

  resetDetailForm(): void {
    this.detailForm.reset({
      workflowDetailId: null,
      approvalLevel: null,
      approvalPolicy: null,
      approverNo: null,
      organizationLevel: null,
      roleName: null
    });
    this.detailForm.markAsPristine();
    this.detailForm.markAsUntouched();
    this.selectedDetail.set(null);
    this.selectedRoles.set([]);
  }

  resetAll(): void {
    this.selectorForm.reset();
    this.levelForm.reset({ workflowId: null, numberOfApprovalLevel: null });
    this.detailForm.reset({
      workflowDetailId: null,
      approvalLevel: null,
      approvalPolicy: null,
      approverNo: null,
      organizationLevel: null,
      roleName: null
    });
    this.previewForm.reset();
    this.levelForm.markAsPristine();
    this.levelForm.markAsUntouched();
    this.detailForm.markAsPristine();
    this.detailForm.markAsUntouched();
    this.modules.set([]);
    this.functions.set([]);
    this.functionLevels.set([]);
    this.levelDetails.set([]);
    this.selectedLevel.set(null);
    this.selectedDetail.set(null);
    this.selectedRoles.set([]);
    this.eligibleApprovers.set([]);
    this.previewPanelOpen.set(false);
  }
  viewWorkFlow(): void {
    this.selectorForm.reset();
    this.levelForm.reset({ workflowId: null, numberOfApprovalLevel: null });
    this.detailForm.reset({
      workflowDetailId: null,
      approvalLevel: null,
      approvalPolicy: null,
      approverNo: null,
      organizationLevel: null,
      roleName: null
    });
    this.previewForm.reset();
    this.levelForm.markAsPristine();
    this.levelForm.markAsUntouched();
    this.detailForm.markAsPristine();
    this.detailForm.markAsUntouched();
    this.modules.set([]);
    this.functions.set([]);
    this.functionLevels.set([]);
    this.levelDetails.set([]);
    this.selectedLevel.set(null);
    this.selectedDetail.set(null);
    this.selectedRoles.set([]);
    this.eligibleApprovers.set([]);
    this.previewPanelOpen.set(false);
  }

  private handleGlobalSave(): void {
    if (this.detailForm.dirty && this.detailForm.valid) {
      this.saveDetail();
      return;
    }
    if (this.levelForm.dirty && this.levelForm.valid) {
      this.saveLevel();
      return;
    }
    this.toastr.info('Nothing to save.', 'Information');
  }
  loadRole(serializedData: any): void {
    console.log("load Role... ", serializedData);
    this.loadFunctionLevels(serializedData.workflowId);
  }
 /* saveLevelWithDetail(): void {
    const functionId = this.selectorForm.get('functionId')?.value as number;

    const levelPayload: ApprovalFunctionLevelModel = {
      ...this.levelForm.value,
      appId: this.selectorForm.get('appId')?.value ?? null,
      workflowName: this.levelForm.get('workflowName')?.value ?? '',
      numberOfApprovalLevel: this.levelForm.get('numberOfApprovalLevel')?.value ?? 0
    };

    const existingLevel = this.functionLevels().find(
      lvl => lvl.workflowId === levelPayload.workflowId
    );

    this.isSavingLevel.set(true);

    const levelRequest$ = existingLevel
      ? this.workflowService.updateFunctionLevel(existingLevel.workflowId!, levelPayload)
      : this.workflowService.createFunctionLevel(levelPayload);

    levelRequest$
      .pipe(
        catchError(() => {
          this.toastr.error('Failed to save workflow level.', 'Error');
          return of(null);
        }),
        switchMap(savedLevel => {
          if (!savedLevel) return of(null);

          this.toastr.success('Workflow level saved successfully.', 'Success');
          this.loadFunctionLevels(functionId);

          const details = this.levelDetails();
          if (!details || details.length === 0) {
            this.toastr.info('No workflow details to save.', 'Info');
            return of(null);
          }

          this.isSavingDetail.set(true);

          const requests = details.map(detail => {
            // Send only backend fields, remove roles
            const payload: ApprovalFunctionLevelDetailModel = {
              workflowId: savedLevel.workflowId!,
              approvalLevel: detail.approvalLevel,
              approvalPolicy: detail.approvalPolicy,
              approverNo: detail.approverNo,
              organizationLevel: detail.organizationLevel,
              workflowDetailId: detail.workflowDetailId // existing for update
            };

            const req$ = detail.workflowDetailId
              ? this.workflowService.updateLevelDetail(detail.workflowDetailId!, payload)
              : this.workflowService.createLevelDetail(payload);

            return req$.pipe(
              switchMap(result => {
                if (!result || !result.workflowDetailId) return of(null);
                const localDetail = this.levelDetails().find(
                  d => d.approvalLevel === detail.approvalLevel
                );

                // 🔹 Sync roles using the local detail's roles
                const rolesToSync = localDetail?.roles ?? [];
                return this.syncRole(result.workflowDetailId, rolesToSync);
              }),
              catchError(err => {
                this.toastr.error(
                  `Failed to save detail for level ${detail.approvalLevel}.`,
                  'Error'
                );
                console.error(err);
                return of(null);
              })
            );
          });

          return concat(...requests).pipe(
            finalize(() => this.isSavingDetail.set(false))
          );
        }),
        finalize(() => this.isSavingLevel.set(false))
      )
      .subscribe({
        next: result => {
          if (result !== null) {
            this.toastr.success('All workflow details saved successfully.', 'Success');
          }
        },
        error: err => {
          console.error(err);
          this.toastr.error('Unexpected error while saving workflow.', 'Error');
        }
      });
  }*/
  saveLevelWithDetail(): void {
   /* this.saveLevel().pipe(
      switchMap(savedLevel => {
        if (!savedLevel) {
          this.toastr.warning('No workflow level saved. Skipping details.', 'Warning');
          return of(null);
        }

        this.selectedLevel.set(savedLevel);

        return this.loadLevelDetails(savedLevel).pipe(
          switchMap(() => this.saveDetail(savedLevel))
        );
      })
    ).subscribe({
      next: result => {
        if (result !== null) {
          this.toastr.success('Workflow level & details saved successfully.', 'Success');
        }
      },
      error: err => {
        console.error('saveLevelWithDetail error:', err);
        this.toastr.error('Unexpected error while saving workflow.', 'Error');
      }
    });*/
  }
  openModal(){
    this.showUserRolesModal = false;
    setTimeout(() => {
      this.showUserRolesModal = true;
    }, 0);
  }
  openWorkflowModal() {
    console.log("Opening workflow modal...");

    this.showModal.set(false);
    this.modalComponent = undefined;

    setTimeout(() => {
      import('./view-workflow-modal/view-workflow-modal').then(module => {

        this.modalComponent = module.ViewWorkflowModal;

        this.modalComponentData = {
          workflowId: this.levelForm.get('workflowId')?.value ?? null
        };

        this.showModal.set(true);
      });
    }, 20);
  }

  onModalClose() {
    this.showModal.set(false);
  }

  onModalResult(result: any) {
    console.log("Workflow selected:", result);

    if (result) {
      this.loadRole(result);
    }

    this.showModal.set(false);
  }
}


