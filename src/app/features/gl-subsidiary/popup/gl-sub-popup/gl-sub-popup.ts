import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { GlMasterAccountService } from "../../../../services/gl-master-account";
import { DataGridComponent } from "../../../../shared/components/data-grid/data-grid";
import { TextBaseInput } from "../../../../shared/components/input-types/text-base-input/text-base-input";
import { SelectOptionField } from "../../../../shared/components/input-types/select-option-field/select-option-field";
import { LdsModalComponent } from "../../../../shared/components/lds-modal/lds-modal";
import { IdBoxComponent } from "../../../../shared/components/input-types/id-box/id-box";
import { ExchangeService } from "../../../../services/exchange-service";
import { GetGlSubsidiaryAccountListRequest, GLSubsidiaryModel } from "../../../../models/GLSubsidiary";
import { GlSubsidiaryService } from "../../../../services/gl-subsidiary-service";
import { UtilService } from "../../../../services/util-service";


@Component({
  selector: 'app-gl-sub-popup',
  standalone: true,
  imports: [DataGridComponent, TextBaseInput, SelectOptionField, LdsModalComponent, IdBoxComponent],
  templateUrl: './gl-sub-popup.html',
  styleUrl: './gl-sub-popup.scss'
})
export class GlSubPopup {
  //Declarations
  @Input() showModal!: boolean;
  @Output() accountSelected = new EventEmitter<any>();
  @Input() branchId: number | null = null;
  mdForm!: FormGroup;
  accounts: GLSubsidiaryModel[] = [];
  selectedAccount: GLSubsidiaryModel ;

  officeOptions: { key: number; value: string }[] = [];

  //End Declarations

  //Page Load
  constructor(private fb: FormBuilder, private exChangeService: ExchangeService, private glMasterAccountService: GlMasterAccountService, private glSubsidiaryService: GlSubsidiaryService, private utilService: UtilService) { }

  ngOnInit(): void {
    this.mdForm = this.fb.group({
      officeId: [''],
      glAccSl: ['']
    });

    this.loadDataForOffice();
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
      this.mdForm = this.fb.group({
      officeId: [''],
      glAccSl: ['']
    });
    this.accounts = [];
    this.selectedAccount = account;
    this.accountSelected.emit(this.selectedAccount);
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

}
