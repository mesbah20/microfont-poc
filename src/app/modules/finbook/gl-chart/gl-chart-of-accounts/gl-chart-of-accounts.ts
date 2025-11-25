import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountNodeComponent } from '../gl-node-component/gl-node-component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '../../../service/common-service';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { GLTreeNode } from '../gl-tree-node-model';
import { GlChartService } from '../gl-chart-service';
import { ExchangeService } from '../../exchange-service';
import { BUTTON_VISIBILITY } from '../../../../shared/constant/button-signals.constant';

@Component({
  selector: 'app-gl-chart-of-accounts',
  standalone: true,
  imports: [CommonModule, AccountNodeComponent, ExpansionPanelHeader, InputSelectOptionField, InputTextBox],
  templateUrl: './gl-chart-of-accounts.html',
  styleUrls: ['./gl-chart-of-accounts.scss']
})
export class GlChartOfAccounts implements OnInit {
  frmGroup: FormGroup;
  treeNodes: GLTreeNode[] = [];
  //GL_INPUT: string;
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  constructor(private formBuilder: FormBuilder, private glService: GlChartService, private commonService: CommonService, private exchangeService : ExchangeService) { }
  entityOptions: { key: string, value: string }[] = [];

  //Page Load
  ngOnInit() {
    this.frmGroup = this.formBuilder.group({
      ENTITY_ID: ['C'],
      GL_INPUT :['']
    });
    this.loadDataForTree();
    this.getEntityTypeList();
    
    BUTTON_VISIBILITY.set({
      save: false,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: false,
    });
    
  }

  //User Defined Methods
  public loadDataForTree() {
    const request = { pentityId: this.frmGroup.get('ENTITY_ID')?.value ?? 'C', };
    console.log('request = ', request);

    this.glService.getGLChartAccounts(request).subscribe(res => {
      console.log(res);
      this.treeNodes = this.buildTree(res);
    });
  }
    public loadDataForTreeWithFiltering(searchValue: string) {
        const request = { pentityId: this.frmGroup.get('ENTITY_ID')?.value ?? 'C', };
        console.log('request for filter= ', request);

        this.glService.getGLChartAccounts(request).subscribe(res => {
          console.log(res);
         let filteredList = res.filter((q: any) =>
          (q.glAccSl && String(q.glAccSl).includes(searchValue)) ||
          (q.accountNo && q.accountNo.toUpperCase().includes(searchValue.toUpperCase())) ||
          (q.accountTitle && q.accountTitle.toUpperCase().includes(searchValue.toUpperCase()))
        );

         // Step 2: Collect matches + their children (recursively)
          let filteredListWithChild: any[] = [];

          const addChildrenRecursively = (node: any) => {
            // add this node if not already added
            if (!filteredListWithChild.some(x => x.glAccSl === node.glAccSl)) {
              filteredListWithChild.push(node);
            }
            // find direct children
            const children = res.filter((q: any) => q.totGlAccSl === node.glAccSl);
            children.forEach((child: any) => addChildrenRecursively(child));
          };

          filteredList.forEach((node: any) => addChildrenRecursively(node));
                console.log(filteredList);
                this.treeNodes = this.buildTree(filteredListWithChild);
              });
      }
  private buildTree(flatData: any[]): GLTreeNode[] {
    const lookup: { [key: string]: GLTreeNode } = {};
    const root: GLTreeNode[] = [];

    // Create nodes and ensure children array
    flatData.forEach(item => {
      lookup[item.glAccSl] = {
        GL_ACC_SL: item.glAccSl,
        ACCOUNT_TITLE: item.accountTitle,
        ACC_LEVEL: item.accLevel,
        ACCOUNT_NO: item.accountNo,  // already number
        expanded: false,
        children: [],
        hasChildren: item.hasChildren ?? false,
        txnFlag: item.txnFlag,
        PRODUCT_TYPE: item.productType,
        ACC_DR_CR: item.accDrCr,
        CURRENCY_ID: item.currencyId,
        CURRENCY_SH_NM: item.currencyShNm,
        CURRENCY_FULL_NM: item.currencyFullNm,
        TXN_FLAG: item.txnFlag,
        OFF_BS_FLAG: item.offBsFlag,
        TOT_GL_ACC_SL: item.totGlAccSl,
        ENTITY_ID: item.entityId,
        CONTRA_CONTINGENT_FLAG: item.contraContigentFlag,
        SWITCH_GL_FLAG: item.switchGlFlag,
        HO_ACCESS_FLAG: item.hoAccessFlag


      };
    });
    // Build tree
    flatData.forEach(item => {
      if (item.totGlAccSl && lookup[item.totGlAccSl]) {
        lookup[item.totGlAccSl].children.push(lookup[item.glAccSl]);
      } else if (!item.totGlAccSl || item.totGlAccSl === '0') {
        root.push(lookup[item.glAccSl]);
      }
    });
    return root;
  }

  getEntityTypeList() {
    const payload = {};
    console.log('called getEntityTypeList');
    this.exchangeService.getEntityTypeList(payload).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.entityOptions = res.map((item: { ENTITY_TYPE_ID: any; ENTITY_TYPE_NM: any; }) => ({
          key: item.ENTITY_TYPE_ID,
          value: item.ENTITY_TYPE_NM
        }));
      },
      error: (err) => { console.error(err); alert('Error Fetching Entity Type'); }
    });
  }
  //Event generated methods

  onChildAdded(child: GLTreeNode, parent: GLTreeNode) {
    parent.children.push(child);
    parent.expanded = true;
  }

 

  
  onGLInputChanged(value: string): void {
    console.log('Textbox blurred, value:', value);
    
    if(value){
      this.treeNodes = [];
      this.loadDataForTreeWithFiltering(value);
    }

  }


}
