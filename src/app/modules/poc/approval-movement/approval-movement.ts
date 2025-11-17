import { Component, EnvironmentInjector, ViewChild, ViewContainerRef, AfterViewInit, inject, WritableSignal, signal } from '@angular/core';
import { ComponentRegistry} from '../component-registry';
import { CommonModule } from '@angular/common';
import {MatCard, MatCardModule} from '@angular/material/card';
import { ApprovalService} from '../../../shared/services/approval-service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BUTTON_VISIBILITY } from '../../../shared/constant/button-signals.constant';
import { MatIcon } from '@angular/material/icon';
import { ApprovalRequest} from '../../../shared/models/approval';
import { ToastrService } from 'ngx-toastr';
import { FormControlHighlightDirective} from '../../../shared/directives/form-control-highlight.directive';
import { HighlightService} from '../../../shared/services/highlight.service';
import { ExpansionPanelHeader } from "../../../shared/components/expansion-panel-header/expansion-panel-header";
import { TextBaseInput } from "../../../shared/components/input-types/text-base-input/text-base-input";
import { FormsModule } from '@angular/forms';

type DiffMap = Record<string, boolean>;

@Component({
  selector: 'app-approval-movement',
  imports: [
    CommonModule,
    MatCard,
    MatIcon,
    ExpansionPanelHeader,
    FormsModule
  ],
  templateUrl: './approval-movement.html',
  styleUrl: './approval-movement.scss'
})
export class ApprovalMovement implements AfterViewInit {
  @ViewChild('dynamicHostLeft', { read: ViewContainerRef, static: false })
  private hostLeft!: ViewContainerRef;

  @ViewChild('dynamicHostRight', { read: ViewContainerRef, static: false })
  private hostRight!: ViewContainerRef;

  //exp
  isLoading: boolean = true;
  errorMessage: string | null = null;
  errorLeft: string | null = null;
  errorRight: string | null = null;

  toastr = inject(ToastrService);
  data: any;
  private diffMap: DiffMap = {};
  private setId: number;
  private approvalRequest: ApprovalRequest;
  rejectReason: string = '';
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  constructor(
    private registry: ComponentRegistry,
    private env: EnvironmentInjector,
    private approvalService: ApprovalService,
    private router: Router,
    private location: Location,
    private hl: HighlightService,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.data = nav?.extras.state?.['data'] || null;

    BUTTON_VISIBILITY.set({
      save: false,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: false
    });
  }

  // approval-movement.ts

  ngOnInit(): void {
    if (!this.data) return; // <-- This part is OK

    // ALL OF THIS is now done in loadAndRender()
    if (typeof this.data === 'string') {
      try {
        this.data = JSON.parse(this.data);
        console.log(' Parsed data from string:', this.data);
      } catch (e) {
        console.error(' Invalid JSON in router state:', e);
        return;
      }
    }
    this.setId = this.data.setId;
    console.log('data line movement : ', this.data);
    this.data.currentUxContent = this.data.currentContext || this.safeParse(this.data.currentUxContent);
    this.data.previousUxContent = this.data.previousContext || this.safeParse(this.data.previousUxContent);

    if (this.data?.currentUxContent) {
      this.diffMap = buildDiffMap(this.data.previousUxContent, this.data.currentUxContent, []);
    }
  }

  ngAfterViewInit(): void {
    //setTimeout(() => this.renderBoth());
    setTimeout(() => this.loadAndRender());
  }
  // Safe parser helper
  safeParse(value: any): any {
    if (!value) return {};
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('Failed to parse JSON:', value, e);
      return {};
    }
  }


  // approval-movement.component.ts

  // approval-movement.component.ts

  // approval-movement.component.ts

  private renderBoth(): void {
    if (!this.data) return;

    // Parse JSON if needed
    if (typeof this.data.currentUxContent === 'string') {
      this.data.currentUxContent = JSON.parse(this.data.currentUxContent);
    }
    if (typeof this.data.previousUxContent === 'string') {
      this.data.previousUxContent = JSON.parse(this.data.previousUxContent);
    }

    // Compute diff map
    const diffMap = buildDiffMap(
      this.data.previousUxContent,
      this.data.currentUxContent,
      []
    );

    const isBothhost = !!(this.hostLeft && this.hostRight);

    // Render LEFT (Change Request) with highlightMap
    this.createInto(this.data.selector, this.hostLeft, this.data.currentUxContent, true, isBothhost, diffMap);

    // Render RIGHT (Previous) WITHOUT highlightMap
    if (this.data?.previousUxContent && this.hostRight) {
      const sel = this.data.previousUxContent.selector || this.data.selector;
      this.createInto(sel, this.hostRight, this.data.previousUxContent, isBothhost, true); // no map
    }
  }

  // approval-movement.ts

  private loadAndRender(): void {
    try {
      // 1. Validate Data (This part stays the same)
      if (!this.data) {
        throw new Error('No approval data found. Please navigate from the approval list.');
      }
      // ... (rest of data validation and parsing)
      this.data.currentUxContent = this.data.currentContext || this.safeParse(this.data.currentUxContent);
      this.data.previousUxContent = this.data.previousContext || this.safeParse(this.data.previousUxContent);

      if (!this.data.selector || !this.data.currentUxContent) {
        throw new Error('Invalid data: Missing required content or component selector.');
      }

      // ... (diffMap, isBothhost)
      const diffMap = buildDiffMap(this.data.previousUxContent, this.data.currentUxContent, []);
      const isBothhost = !!(this.hostLeft && this.hostRight);


      // 4. Validate and create LEFT
      const successLeft = this.createInto(
        this.data.selector,
        this.hostLeft,
        this.data.currentUxContent,
        true,
        isBothhost,
        diffMap
      );

      // ** MODIFICATION HERE **
      if (!successLeft) {
        // Set the granular error instead of throwing
        this.errorLeft = `Failed to render 'Change Request' component. (Selector: ${this.data.selector})`;
      }

      // 5. Validate and create RIGHT
      if (this.data?.previousUxContent) {
        if (!this.hostRight) {
          // This is a fatal template error, so throwing is correct
          throw new Error("Found 'Previous Data' but the host container is missing from the template.");
        }

        const sel = this.data.previousUxContent.selector || this.data.selector;
        const successRight = this.createInto(sel, this.hostRight, this.data.previousUxContent, isBothhost, true);

        // ** MODIFICATION HERE **
        if (!successRight) {
          // Set the granular error instead of throwing
          this.errorRight = `Failed to render 'Previous Data' component. (Selector: ${sel})`;
        }
      }

      // 6. All successful (at page level)
      this.isLoading = false;

    } catch (e: any) {
      // This will now only catch FATAL errors
      console.error('Failed to load approval movement:', e);
      this.errorMessage = e.message || 'An unknown error occurred while loading the view.';
      this.isLoading = false;
    }
  }

  // approval-movement.ts

  private createInto(
    selector: string,
    host: ViewContainerRef,
    data: any,
    isView: boolean,
    isBothhost: boolean,
    highlightMap?: Record<string, boolean>
  ): boolean { // <-- 1. Change to boolean

    // 2. Add check for the host
    if (!host) {
      console.error('ViewContainerRef (host) is not available for selector:', selector);
      return false; // <-- 3. Report failure
    }

    const compType = this.registry.resolve(selector);

    if (!compType) {
      console.error(`Component not found in registry for selector: ${selector}`);
      return false; // <-- 4. Report failure
    }

    host.clear();
    const ref = host.createComponent(compType, { environmentInjector: this.env });

    ref.setInput('viewObject', data);
    ref.setInput('isViewDetails', isView);
    ref.setInput('isApprovalView', isBothhost);

    if (highlightMap) {
      ref.setInput('highlightMap', highlightMap);
    }

    (ref.instance as any).viewData = data;
    (ref.instance as any).isView = isView;
    (ref.instance as any).isApprovalView = isBothhost;
    if (highlightMap) (ref.instance as any).highlightMap = highlightMap;

    return true; // <-- 5. Report success
  }

  onApprove() {
    this.approvalService.performApprovalOperation({
      officeId: Number(sessionStorage.getItem('officeId')),
      appId: 1,
      setId: this.setId,
      approvalLevel: 0,
      nextApprovalLevel: 1,
      remarks: this.rejectReason,
      userId: sessionStorage.getItem('userId') ?? '',
      approvalFlag: 1
    }).subscribe({
      next: res => {
        console.log('Approval success:');
        this.toastr.success('Approved successfully');

        this.router.navigate(['/approval-items']);
      },
      error: err => {
        console.error('Approval failed:', err);
        this.toastr.error('Approval Failed Due to : ', err);
      }
    });
  }
  onReject() {
    if (this.rejectReason == "") {
      this.toastr.warning('Remarks Required!');
    }
    else {
      this.approvalService.performApprovalOperation({
        officeId: Number(sessionStorage.getItem('officeId')),
        appId: 1,
        setId: this.setId,
        approvalLevel: 0,
        nextApprovalLevel: 1,
        remarks: this.rejectReason,
        userId: sessionStorage.getItem('userId') ?? '',
        approvalFlag: 2
      }).subscribe({
        next: res => {
          console.log('Approval success:');
          this.toastr.success('Approved successfully');
          this.router.navigate(['/approval-items']);
        },
        error: err => {
          console.error('Approval failed:', err);
          this.toastr.error('Approval Failed Due to : ', err);

        }
      });
    }

  }

  onSendBack() {
    if (this.rejectReason == "") {
      this.toastr.warning('Remarks Required!');
    }
    else {
      this.approvalService.performApprovalOperation({
        officeId: Number(sessionStorage.getItem('officeId')),
        appId: 1,
        setId: this.setId,
        approvalLevel: 0,
        nextApprovalLevel: 1,
        remarks: this.rejectReason,
        userId: sessionStorage.getItem('userId') ?? '',
        approvalFlag: 3
      }).subscribe({
        next: res => {
          console.log('Approval success:');
          this.toastr.success('Approved successfully');
          this.router.navigate(['/approval-items']);
        },
        error: err => {
          console.error('Approval failed:', err);
          this.toastr.error('Approval Failed Due to : ', err);

        }
      });
    }

  }

  goBack() {
    this.location.back();
  }


}

/** Deep diff helper */
function buildDiffMap(
  a: any,
  b: any,
  ignorePaths: string[] = [],
  base: string = ''
): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  const ignore = new Set(ignorePaths);

  const isObj = (x: any) => x !== null && typeof x === 'object';
  const isArr = Array.isArray;
  const mark = (p: string) => !ignore.has(p) && (map[p] = true);

  const walk = (x: any, y: any, path: string) => {
    if (Object.is(x, y)) return;
    if (!isObj(x) || !isObj(y) || (isArr(x) !== isArr(y))) {
      mark(path);
      return;
    }
    if (isArr(x) && isArr(y)) {
      if (x.length !== y.length) {
        mark(path);
        return;
      }
      for (let i = 0; i < x.length; i++) walk(x[i], y[i], path ? `${path}[${i}]` : `[${i}]`);
      return;
    }
    const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
    for (const k of keys) {
      const child = path ? `${path}.${k}` : k;
      if (!(k in x) || !(k in y)) {
        mark(child);
        continue;
      }
      walk(x[k], y[k], child);
    }
  };

  walk(a, b, base);
  return map;
}

