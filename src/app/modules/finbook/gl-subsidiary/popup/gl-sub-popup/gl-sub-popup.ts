import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges, WritableSignal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { UtilService } from "../../../../service/util-service";
import { CommonModule } from "@angular/common";
import { GenericDataGrid } from "../../../../../shared/common-components/generic-component-type/generic-data-grid";
import { InputTextBox } from "../../../../../shared/common-components/input-types/input-text-box/input-text-box";
import { InputSelectOptionField } from "../../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field";
import { GenericModal } from "../../../../../shared/common-components/generic-component-type/generic-modal/generic-modal";
import { InputIdBox } from "../../../../../shared/common-components/input-types/input-id-box/input-id-box";
import { GetGlSubsidiaryAccountListRequest, GLSubsidiaryModel } from "../../gl-subsidiary-model";
import { ExchangeService } from "../../../exchange-service";
import { GlSubsidiaryService } from "../../gl-subsidiary-service";
import { ExpansionPanelHeader } from "../../../../../shared/common-components/expansion-panel-header/expansion-panel-header";


@Component({
  selector: 'app-gl-sub-popup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericDataGrid, InputTextBox, InputSelectOptionField, GenericModal, InputIdBox, ExpansionPanelHeader],
  templateUrl: './gl-sub-popup.html',
  styleUrl: './gl-sub-popup.scss'
})
export class GlSubPopup implements OnInit, OnChanges {
  //Declarations
  @Input() showModal!: boolean;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Input() initialData: any = null;
  @Input() mode: 'add' | 'edit' | 'view' = 'view';
  @Output() accountSelected = new EventEmitter<any>();
  @Input() branchId: number | null = null;
  mdForm!: FormGroup;
  accounts: GLSubsidiaryModel[] = [];
  selectedAccount: GLSubsidiaryModel ;
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  officeOptions: { key: number; value: string }[] = [];
  frmGroup: FormGroup;
  public title = 'Find Subsidiary Account'; 
  //End Declarations

  //Page Load
  constructor(private fb: FormBuilder, private exChangeService: ExchangeService, private glSubsidiaryService: GlSubsidiaryService, private utilService: UtilService) { }

  ngOnInit(): void {
    this.ensureForm();
    this.applyInitialData(this.initialData);
    this.applyMode(this.mode);

    this.loadDataForOffice();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mdForm) {
      this.ensureForm();
    }
    if (changes['initialData']) {
      this.applyInitialData(changes['initialData'].currentValue);
    }
    if (changes['mode']) {
      this.applyMode(changes['mode'].currentValue);
    }
  }
  //End Page Load

  //DDL Bindings
  loadDataForOffice() {
    this.exChangeService.getOwnOfficeList("1").subscribe({
      next: (res: any) => {
        this.officeOptions = res.map((item: { OFFICE_ID: any; OFFICE_NAME: any; }) => ({
          key: item.OFFICE_ID,
          value: item.OFFICE_NAME
        }));
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });
  }
  //End DDL Bindings

  //Events
  async onSearch(): Promise<void> {
    this.getGlAccountInfoList();
  }
  onRowSelect(account: any) {
    this.ensureForm();
    this.accounts = [];
    this.selectedAccount = account;
    this.accountSelected.emit(this.selectedAccount);
    this.isVisibleChange.emit(false);
  }
  async onGLSerialChange() {
    const glAccSlControl = this.mdForm.get('glAccSl');

    if (glAccSlControl != null) {
      const glAccSl = glAccSlControl.value;

      if (glAccSl) {
        const paddedValue = this.utilService.padString(String(glAccSl), '0', 3, 8);
        glAccSlControl.setValue(paddedValue);
      } else {
        glAccSlControl.setValue(glAccSl);
      }
    }


  }
  //End Events

  getModalResult() {
    return this.mdForm?.getRawValue ? this.mdForm.getRawValue() : {};
  }
  onModalVisibilityChange(isVisible: boolean) {
    this.isVisibleChange.emit(isVisible);
  }

  //User Generated Methods
  async getGlAccountInfoList() {

    let req: GetGlSubsidiaryAccountListRequest = {
      pnameValueList: "2",
      pofficeId: this.mdForm.get('officeId')?.value,
      pglAccSl: this.mdForm.get('glAccSl')?.value
    };

    try {
      const data: GLSubsidiaryModel[] = await this.glSubsidiaryService
        .getGLSubsidiaryAccountInfoList(req)
        .toPromise() ?? [];

      this.accounts = data;

      console.log(" accounts = ", this.accounts);
      console.log( " data = ", data);

    } catch (err) {
      console.error('Failed to fetch GL Subsidiary info:', err);
    }

  }
  //End User Generated Methods

  private ensureForm() {
    if (!this.mdForm) {
      this.mdForm = this.fb.group({
        officeId: [''],
        glAccSl: ['']
      });
    }
  }

  private applyInitialData(data: any) {
    if (!data || !this.mdForm) {
      return;
    }
    const patch: any = {};
    ['officeId', 'glAccSl'].forEach(key => {
      if (data[key] !== undefined) {
        patch[key] = data[key];
      }
    });
    if (Object.keys(patch).length) {
      this.mdForm.patchValue(patch, { emitEvent: false });
    }
  }

  private applyMode(mode: 'add' | 'edit' | 'view') {
    if (!this.mdForm) {
      return;
    }
    if (mode === 'view') {
      this.mdForm.disable({ emitEvent: false });
    } else {
      this.mdForm.enable({ emitEvent: false });
    }
  }

}