import {Component, computed, DestroyRef, effect, EventEmitter, inject, signal, WritableSignal} from '@angular/core';
import {BUTTON_VISIBILITY, ONCLICK_RESET, ONCLICK_SAVE} from '../../../shared/constant/button-signals.constant';
import {ToastrService} from 'ngx-toastr';
import {CommonModule} from '@angular/common';
import {TextBaseInput} from '../../../shared/components/input-types/text-base-input/text-base-input';
import {UserListModal} from '../user-list-modal/user-list-modal';
import {ExpansionPanelHeader} from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import {SelectOptionField} from '../../../shared/components/input-types/select-option-field/select-option-field';
import {TextArea} from '../../../shared/components/input-types/text-area/text-area';
import {Button} from '../../../shared/components/input-types/button/button';
import {
  CheckboxChangeEvent,
  ColumnSelectAllEvent,
  DataGridComponent
} from '../../../shared/components/data-grid/data-grid';
import {NumberInput} from '../../../shared/components/input-types/number-input/number-input';
import {LdsModalComponent} from '../../../shared/components/lds-modal/lds-modal';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SubPanelHeader} from '../../../shared/components/sub-panel-header/sub-panel-header';
import {MatButtonModule} from '@angular/material/button';
import {IdBoxComponent} from '../../../shared/components/input-types/id-box/id-box';
import {ExpansionSubPanelHeader} from '../../../shared/components/expansion-sub-panel-header/expansion-sub-panel-header';
import {UserProfileModel} from '../../model/UserProfile.model';
import {
  AppFunctionsRequest, AppFunctionsResponse,
  DefineUserRole, UserGrantRole,
  UserRoleFunctionModel,
  UserRoleFunctionUI,
  UserRolesModel
} from '../../model/UserRoles.model';
import {DefineRolesService} from '../../service/define-roles-service';
import {UserRolesModal} from './user-roles-modal/user-roles-modal';
import {ApprovalFunctionLevelModel, MetaAppListItem, MetaAppModuleItem} from '../../model/approval-workflow.model';
import {WorkflowDesignerService} from '../workflow-designer/services/workflow-designer.service';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-define-roles',
  imports: [CommonModule,   ExpansionPanelHeader, SelectOptionField, TextArea, Button, DataGridComponent,
      MatMenuModule, MatIconModule, ReactiveFormsModule, SubPanelHeader,
    MatButtonModule, IdBoxComponent,  UserRolesModal],
  templateUrl: './define-roles.html',
  styleUrl: './define-roles.scss'
})

export class DefineRoles {
  onClickSave = ONCLICK_SAVE;
  onClickReset = ONCLICK_RESET;
  toastr = inject(ToastrService);

  businessHeaderPanel: WritableSignal<boolean> = signal(true);

  frmGroup: FormGroup;
  selectorForm: FormGroup;
  assignedUserFunction: UserRoleFunctionUI[] = [];        // list to be added
  removedTempList: UserRoleFunctionUI[] = [];             // list to be removed

  unassignedUserFunction: AppFunctionsResponse[] = [];
  filteredFunctionList!: AppFunctionsResponse[];

  //addRoleList: AppFunctionsResponse[] = [];
  addRoleList: UserRoleFunctionUI[] = [];
  removeRoleList: UserRoleFunctionUI[] = [];

  showUserInfoBlock : boolean | null = null;
  showUserRolesModal = false;
  showAssignedRoleGrid = false;
  showUnassignedGrid = false;
  enableSelection = false;

  userRole!: DefineUserRole;
  private readonly applications = signal<MetaAppListItem[]>([]);
  private readonly modules = signal<MetaAppModuleItem[]>([]);
  private readonly destroyRef = inject(DestroyRef);


  constructor(private formBuilder: FormBuilder, private service:DefineRolesService, private workflowService :WorkflowDesignerService) {
    this.frmGroup = this.formBuilder.group({
      userRole: this.formBuilder.group({
        roleName: ['',  [Validators.required]],
        roleDescrip: ['',  [Validators.required]],
      }),
    });

    this.selectorForm = this.formBuilder.group({
      appId: [null as number | null],
      moduleId: [null as string | null],
      itemType: [null as number | null]
    });
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: true,
    });
    effect(() => {
      if(this.onClickSave()) {
        this.submit();
        ONCLICK_SAVE.set(false);
      }
      if(this.onClickReset()) {
        this.reset();
        ONCLICK_RESET.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.registerFormListeners();
  }

  private loadInitialData(): void {
    this.workflowService.getApplications()
      .pipe(catchError(() => of([])))
      .subscribe(apps => this.applications.set(apps ?? []));
  }
  private registerFormListeners(): void {
    this.selectorForm.get('appId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(appId => {
        this.modules.set([]);
        this.selectorForm.patchValue({
          moduleId: null
        }, { emitEvent: false });
        if (appId !== null && appId !== undefined) {
          this.fetchModules(appId);
        }
      });

  }
  private fetchModules(appId: number): void {
    this.workflowService.getModules(appId)
      .pipe(catchError(() => of([])))
      .subscribe(mods => this.modules.set(mods ?? []));
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
  itemTypeOptions = [
    { key: 'F', value: 'Function' },
    { key: 'R', value: 'Report' }
  ];
  get rolesForm(): FormGroup {
    return this.frmGroup.get('userRole') as FormGroup;
  }
  openModal(){
    this.showUserRolesModal = false;
    setTimeout(() => {
      this.showUserRolesModal = true;
    }, 0);
  }
  loadRole(serializedData: any): void {
    console.log("load Role... ", serializedData);
    this.onRoleNameChange(serializedData.roleName);
  }

  onRoleNameChange(roleName: any): void{
    this.service.getRoleInfoByRoleName(roleName)
      .subscribe(data => {
        this.userRole = data;
        this.showAssignedRoleGrid = true;
        this.showUnassignedGrid = true;
        if(data.roleName!=null){
          console.log("onRoleNameChange: ", this.userRole);
          this.frmGroup.get('userRole')?.patchValue(this.userRole);
          if (this.userRole.mregUserRoleFunction.length !== 0) {
            this.assignedUserFunction = this.userRole.mregUserRoleFunction.map(item => ({
              ...item,
              allowMaintAddFlag: item.allowMaintAddFlag === 1,
              allowMaintEditFlag: item.allowMaintEditFlag === 1,
              allowMaintDelFlag: item.allowMaintDelFlag === 1,
              allowMaintViewFlag: item.allowMaintViewFlag === 1,
              allowMaintAuthFlag: item.allowMaintAuthFlag === 1,
              allowProcessFlag: item.allowProcessFlag === 1,
              allowReportViewFlag: item.allowReportViewFlag === 1,
              allowReportPrintFlag: item.allowReportPrintFlag === 1,
              allowReportGenFlag: item.allowReportGenFlag === 1,
              allowAnyOfficeOpsFlag: item.allowAnyOfficeOpsFlag === 1,
              approveFlag: item.approveFlag === 1
            }));
            this.showUserInfoBlock = true;
          }
          else{
            this.showUserInfoBlock = false;
          }
        }else {
          console.log("new role");
          this.rolesForm.patchValue({
            roleDescrip: ''
          });
          this.selectorForm.reset();
          this.removedTempList = [];
          this.assignedUserFunction = [];
          this.unassignedUserFunction = [];
          this.filteredFunctionList = [];
          this.addRoleList = [];
          this.removeRoleList = [];
          this.showAssignedRoleGrid = false;
          this.showUnassignedGrid = false;
        }

      });
  }
  enableSelectionVal(): boolean {
    return this.enableSelection;
  }

  handleCheckboxChange(event: CheckboxChangeEvent){
  }
  onApproveAll(event: ColumnSelectAllEvent) {
    console.log('Select all column:', event);
  }

  resetAll(): void {
    this.selectorForm.reset();
    this.modules.set([]);
  }
  /*searchFunction() {
    const payload: AppFunctionsRequest = {
      ...this.selectorForm.value,
      appId: this.selectorForm.get('appId')?.value ?? null,
      itemType: this.selectorForm.get('itemType')?.value ?? null,
      moduleId: this.selectorForm.get('moduleId')?.value ?? null,
    };
    this.service.getFilteredFunction(payload).subscribe((data) => {
      this.filteredFunctionList = data;
      console.log("this.filteredFunctionList:: ", this.filteredFunctionList);

      const assignedIds = new Set(this.assignedUserFunction.map(f => Number(f.functionId)));

      this.unassignedUserFunction = this.filteredFunctionList.filter(
        func => !assignedIds.has(func.functionId));
      this.showUnassignedGrid = true;
      console.log("Unassigned functions: ", this.unassignedUserFunction);
    });
  }*/
  searchFunction() {
    const payload: AppFunctionsRequest = {
      ...this.selectorForm.value,
      appId: this.selectorForm.get('appId')?.value ?? null,
      itemType: this.selectorForm.get('itemType')?.value ?? null,
      moduleId: this.selectorForm.get('moduleId')?.value ?? null,
    };

    this.service.getFilteredFunction(payload).subscribe((data) => {
      this.filteredFunctionList = data;
      console.log("this.filteredFunctionList:: ", this.filteredFunctionList);

      const assignedIds = new Set(this.assignedUserFunction.map(f => Number(f.functionId)));

      const filteredUnassigned: AppFunctionsResponse[] = this.filteredFunctionList.filter(
        func => !assignedIds.has(func.functionId)
      );

      // 🪄 Convert removedTempList (UserRoleFunctionUI) → AppFunctionsResponse
      const mappedRemoved: AppFunctionsResponse[] = this.removedTempList.map(pkg => ({
        functionId: pkg.functionId,
        functionNm: pkg.functionNm ?? '',
        moduleId: null,
        hoFunctionFlag: null,
        rptViewFlag: null,
        rptPrintFlag: null,
        rptGenFlag: null,
        appRoute: null,
        itemType: null,
        enabledFlag: null,
        allowAnyOfficeOpsFlag: pkg.allowAnyOfficeOpsFlag ? 1 : 0,
        quickRouteNo: null,
        isFinancial: null,
        appId: null,
      }));

      const combinedList: AppFunctionsResponse[] = [
        ...filteredUnassigned,
        ...mappedRemoved.filter(
          removed => !filteredUnassigned.some(f => f.functionId === removed.functionId)
        )
      ];

      this.unassignedUserFunction = combinedList;
      this.showUnassignedGrid = true;

      console.log("Unassigned functions (merged): ", this.unassignedUserFunction);
    });
  }


  selectPackage(): void {
    if (this.addRoleList.length > 0) {
      const mappedFunctions: UserRoleFunctionUI[] = this.addRoleList.map(func => ({
        functionId: func.functionId,
        functionNm: func.functionNm,
        roleName: '',
        allowMaintAddFlag: false,
        allowMaintEditFlag: false,
        allowMaintDelFlag: false,
        allowMaintViewFlag: false,
        allowMaintAuthFlag: false,
        allowProcessFlag: false,
        allowReportViewFlag: false,
        allowReportPrintFlag: false,
        allowReportGenFlag: false,
        allowAnyOfficeOpsFlag: false,
        approveFlag: true,
      }));

      const allAssigned = [...this.assignedUserFunction, ...mappedFunctions];
      this.assignedUserFunction = allAssigned.filter(
        (pkg, index, self) =>
          index === self.findIndex(p => p.functionId === pkg.functionId)
      );

      this.unassignedUserFunction = this.unassignedUserFunction.filter(
        pkg => !this.addRoleList.some(selected => selected.functionId === pkg.functionId)
      );

      this.addRoleList = [];

      this.resetUnassignedGrid();
    }
  }

  resetUnassignedGrid(): void {
    this.showUnassignedGrid = false;
    setTimeout(() => {
      this.showUnassignedGrid = true;
    }, 0);
  }
  onAddPackageRowSelect(event: { data: string; checked: boolean }): void {
    const selectedFunction: AppFunctionsResponse = JSON.parse(event.data);

    const mappedFunction: UserRoleFunctionUI = {
      roleName: this.selectorForm.get('roleName')?.value ?? '',
      functionId: selectedFunction.functionId,
      functionNm: selectedFunction.functionNm,
      allowMaintAddFlag: false,
      allowMaintEditFlag: false,
      allowMaintDelFlag: false,
      allowMaintViewFlag: false,
      allowMaintAuthFlag: false,
      allowProcessFlag: false,
      allowReportViewFlag: false,
      allowReportPrintFlag: false,
      allowReportGenFlag: false,
      allowAnyOfficeOpsFlag: false,
      approveFlag: true,
    };

    if (event.checked) {
      if (!this.addRoleList.some(p => p.functionId === mappedFunction.functionId)) {
        this.addRoleList.push(mappedFunction);
      }
    } else {
      this.addRoleList = this.addRoleList.filter(
        p => p.functionId !== mappedFunction.functionId
      );
    }
  }

  onAddAllPackageRowSelect(event: {
    isSelectAll: boolean;
    selectedRows: AppFunctionsResponse[];
    count: number;
  }): void {
    console.log('Select all package:', event);

    if (event.isSelectAll) {
      // Select all rows (stage them for addition)
      this.addRoleList = this.unassignedUserFunction.map(pkg => ({
        roleName: this.selectorForm.get('roleName')?.value || '',
        functionId: pkg.functionId,
        functionNm: pkg.functionNm,
        allowMaintAddFlag: false,
        allowMaintEditFlag: false,
        allowMaintDelFlag: false,
        allowMaintViewFlag: false,
        allowMaintAuthFlag: false,
        allowProcessFlag: false,
        allowReportViewFlag: false,
        allowReportPrintFlag: false,
        allowReportGenFlag: false,
        allowAnyOfficeOpsFlag: false,
        approveFlag: true,
        fromDt: null,
        toDt: null
      })) as UserRoleFunctionUI[];
    } else {
      // Deselect all (clear staged list)
      this.addRoleList = [];
    }

    console.log('Updated addRoleList:', this.addRoleList);
  }

  onRemoveAllPackageRowSelect(event: {
    isSelectAll: boolean;
    selectedRows: UserRoleFunctionUI[];
    count: number;
  }): void {
    console.log('Remove all package:', event);

    if (event.isSelectAll) {
      this.removeRoleList = [...this.assignedUserFunction];
    } else {
      this.removeRoleList = [];
    }

    console.log('Updated removeRoleList:', this.removeRoleList);
  }

  onRemovePackageRowSelect(event: { data: string; checked: boolean }): void {
    const selectedFunction: UserRoleFunctionUI = JSON.parse(event.data);

    if (event.checked) {
      if (!this.removeRoleList.some(p => p.functionId === selectedFunction.functionId)) {
        this.removeRoleList.push(selectedFunction);
      }
    } else {
      this.removeRoleList = this.removeRoleList.filter(
        p => p.functionId !== selectedFunction.functionId
      );
    }
  }

  /*removePackage(): void {
    if (this.removeRoleList.length > 0) {
      // Convert removed roles back into AppFunctionsResponse
      const removedFunctions: AppFunctionsResponse[] = this.removeRoleList.map(r => ({
        functionId: Number(r.functionId),
        functionNm: r.functionNm ?? '',
        moduleId: null,
        hoFunctionFlag: null,
        rptViewFlag: null,
        rptPrintFlag: null,
        rptGenFlag: null,
        appRoute: null,
        itemType: null,
        enabledFlag: null,
        allowAnyOfficeOpsFlag: r.allowAnyOfficeOpsFlag ? 1 : 0,
        quickRouteNo: null,
        isFinancial: null,
        appId: null,
      }));

      const existingIds = new Set(this.unassignedUserFunction.map(f => f.functionId));
      this.unassignedUserFunction = [
        ...this.unassignedUserFunction,
        ...removedFunctions.filter(f => !existingIds.has(f.functionId))
      ];

      this.assignedUserFunction = this.assignedUserFunction.filter(
        pkg => !this.removeRoleList.some(selected => selected.functionId === pkg.functionId)
      );

      this.removeRoleList = [];

      this.resetAssignedGrid();
      this.resetUnassignedGrid();
    }
  }*/
  removePackage(): void {
    if (this.removeRoleList.length > 0) {
      const removedRows = this.assignedUserFunction.filter(pkg =>
        this.removeRoleList.some(selected => selected.functionId === pkg.functionId)
      );

      this.removedTempList = [
        ...this.removedTempList,
        ...removedRows.filter(r => !this.removedTempList.some(existing => existing.functionId === r.functionId))
      ];

      const removedFunctions: AppFunctionsResponse[] = removedRows.map(r => {
        const original = this.filteredFunctionList?.find(f => f.functionId === r.functionId);

        return {
          functionId: Number(r.functionId),
          functionNm: r.functionNm ?? original?.functionNm ?? '',
          moduleId: original?.moduleId ?? null,
          hoFunctionFlag: original?.hoFunctionFlag ?? null,
          rptViewFlag: original?.rptViewFlag ?? null,
          rptPrintFlag: original?.rptPrintFlag ?? null,
          rptGenFlag: original?.rptGenFlag ?? null,
          appRoute: original?.appRoute ?? null,
          itemType: original?.itemType ?? null,
          enabledFlag: original?.enabledFlag ?? null,
          allowAnyOfficeOpsFlag: r.allowAnyOfficeOpsFlag ? 1 : 0,
          quickRouteNo: original?.quickRouteNo ?? null,
          isFinancial: original?.isFinancial ?? null,
          appId: original?.appId ?? null,
        };
      });

      const existingIds = new Set(this.unassignedUserFunction.map(f => f.functionId));
      this.unassignedUserFunction = [
        ...this.unassignedUserFunction,
        ...removedFunctions.filter(f => !existingIds.has(f.functionId))
      ];

      this.assignedUserFunction = this.assignedUserFunction.filter(
        pkg => !this.removeRoleList.some(selected => selected.functionId === pkg.functionId)
      );

      this.removeRoleList = [];
      this.resetAssignedGrid();
      this.resetUnassignedGrid();
    }
  }


  resetAssignedGrid(): void {
    this.showAssignedRoleGrid = false;
    setTimeout(() => {
      this.showAssignedRoleGrid = true;
    }, 0);
  }

  submit(): void {
    if (this.frmGroup.invalid) {
      this.frmGroup.markAllAsTouched();
      this.toastr.warning("Data Invalid/Missing.", "Warning");
      return;
    }
    const formValue = this.frmGroup.value.userRole;

    // Role info
    const roleInfo = {
      roleName: formValue.roleName,
      roleDescrip: formValue.roleDescrip,
      approveFlag: 1
    };

    // Assigned functions
    const convertedFunctions: UserRoleFunctionModel[] = this.assignedUserFunction.map(func => ({
      roleName: formValue.roleName,
      functionId: Number(func.functionId),
      functionNm: func.functionNm ?? null,
      allowMaintAddFlag: func.allowMaintAddFlag ? 1 : 0,
      allowMaintEditFlag: func.allowMaintEditFlag ? 1 : 0,
      allowMaintDelFlag: func.allowMaintDelFlag ? 1 : 0,
      allowMaintViewFlag: func.allowMaintViewFlag ? 1 : 0,
      allowMaintAuthFlag: func.allowMaintAuthFlag ? 1 : 0,
      allowProcessFlag: func.allowProcessFlag ? 1 : 0,
      allowReportViewFlag: func.allowReportViewFlag ? 1 : 0,
      allowReportPrintFlag: func.allowReportPrintFlag ? 1 : 0,
      allowReportGenFlag: func.allowReportGenFlag ? 1 : 0,
      allowAnyOfficeOpsFlag: func.allowAnyOfficeOpsFlag ? 1 : 0,
      approveFlag: 1,
    }));

    // Removed functions
    const convertedRemoved: UserRoleFunctionModel[] = this.removedTempList.map(func => ({
      roleName: formValue.roleName,
      functionId: Number(func.functionId),
      functionNm: func.functionNm ?? null,
      allowMaintAddFlag: func.allowMaintAddFlag ? 1 : 0,
      allowMaintEditFlag: func.allowMaintEditFlag ? 1 : 0,
      allowMaintDelFlag: func.allowMaintDelFlag ? 1 : 0,
      allowMaintViewFlag: func.allowMaintViewFlag ? 1 : 0,
      allowMaintAuthFlag: func.allowMaintAuthFlag ? 1 : 0,
      allowProcessFlag: func.allowProcessFlag ? 1 : 0,
      allowReportViewFlag: func.allowReportViewFlag ? 1 : 0,
      allowReportPrintFlag: func.allowReportPrintFlag ? 1 : 0,
      allowReportGenFlag: func.allowReportGenFlag ? 1 : 0,
      allowAnyOfficeOpsFlag: func.allowAnyOfficeOpsFlag ? 1 : 0,
      approveFlag: 1,
    }));

    const payload = {
      ...roleInfo,
      mregUserRoleFunction: [
        ...convertedFunctions,
      ]
    };

    console.log('Final Payload →', payload);

      this.service.saveUserRoles(payload).subscribe({
        next: (res) => {
          console.log('Transaction successful.');
          this.toastr.success('Data saved successfully!', 'Save Successful');
        },
        error: (err) => {
          console.error('API Error:', err);
          this.toastr.error(err, 'Error');
        }
      });

      console.log("Remove List →", convertedRemoved);
      if (convertedRemoved.length > 0) {
        this.service.removeRoleFunctions(convertedRemoved).subscribe({
          next: (res) => {
            console.log('Remove successful:', res);
            this.toastr.success('Data removed successfully!', 'Removed Successful');
          },
          error: (err) => {
            console.error('Remove API Error:', err);
            this.toastr.error('Error removing data', 'Error');
          }
        });
      }
  }


  reset(){
    this.frmGroup.reset();
    this.selectorForm.reset();
    this.removedTempList = [];
    this.assignedUserFunction = [];
    this.unassignedUserFunction = [];
    this.filteredFunctionList = [];
    this.addRoleList = [];
    this.removeRoleList = [];
    this.showAssignedRoleGrid = false;
    this.showUnassignedGrid = false;
  }
}
