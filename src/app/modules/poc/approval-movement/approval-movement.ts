import { Component, EnvironmentInjector, ViewChild, ViewContainerRef, AfterViewInit, inject, WritableSignal, signal } from '@angular/core';
import { ComponentRegistry } from '../component-registry';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { ApprovalService } from '../../../shared/services/approval-service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BUTTON_VISIBILITY } from '../../../shared/constant/button-signals.constant';
import { MatIcon } from '@angular/material/icon';
import { ApprovalRequest } from '../../../shared/models/approval';
import { ToastrService } from 'ngx-toastr';
import { HighlightService } from '../../../shared/services/highlight.service';
import { ExpansionPanelHeader } from "../../../shared/components/expansion-panel-header/expansion-panel-header";
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

  isLoading: boolean = true;
  errorMessage: string | null = null;
  errorLeft: string | null = null;
  errorRight: string | null = null;

  toastr = inject(ToastrService);
  data: any;
  private diffMap: DiffMap = {};
  private setId: number;
  rejectReason = '';

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

  // ---------------------------------------
  //           ON INIT (WITH DUMMY DATA)
  // ---------------------------------------
  ngOnInit(): void {

    // Inject dummy data when router provides nothing
    if (!this.data) {
      console.log("ℹ️ No navigation data. Using dummy data for demo.");

      this.data = {
        setId: 999,
        selector: "text-base-input", // MUST exist in ComponentRegistry
        currentUxContent: {
          selector: "text-base-input",
          label: "Full Name",
          value: "John Doe",
          type: "text"
        },
        previousUxContent: {
          selector: "text-base-input",
          label: "Full Name",
          value: "Jonathan Doe",
          type: "text"
        }
      };
    }

    this.setId = this.data.setId;
    this.data.currentUxContent = this.data.currentContext || this.safeParse(this.data.currentUxContent);
    this.data.previousUxContent = this.data.previousContext || this.safeParse(this.data.previousUxContent);

    if (this.data?.currentUxContent) {
      this.diffMap = buildDiffMap(this.data.previousUxContent, this.data.currentUxContent, []);
    }
  }

  // ---------------------------------------
  ngAfterViewInit(): void {
    setTimeout(() => this.loadAndRender());
  }

  safeParse(value: any): any {
    if (!value) return {};
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return {};
    }
  }

  // ---------------------------------------
  //              LOAD + RENDER
  // ---------------------------------------
  private loadAndRender(): void {
    this.isLoading = false;

    try {
      if (!this.data.selector || !this.data.currentUxContent) {
        throw new Error('Invalid data: Missing content or selector.');
      }

      // Build diff
      const diffMap = buildDiffMap(
        this.data.previousUxContent,
        this.data.currentUxContent,
        []
      );

      const isBothhost = !!(this.hostLeft && this.hostRight);

      // Render Left (Change Request)
      const successLeft = this.createInto(
        this.data.selector,
        this.hostLeft,
        this.data.currentUxContent,
        true,
        isBothhost,
        diffMap
      );

      if (!successLeft) {
        this.errorLeft = `Failed to render Change Request component (${this.data.selector})`;
      }

      // Render Right (Previous Data)
      if (this.data?.previousUxContent) {
        const sel = this.data.previousUxContent.selector || this.data.selector;

        const successRight = this.createInto(
          sel,
          this.hostRight,
          this.data.previousUxContent,
          isBothhost,
          true
        );

        if (!successRight) {
          this.errorRight = `Failed to render Previous Data component (${sel})`;
        }
      }

      this.toastr.success('Approval view loaded successfully!', 'Success');

    } catch (e: any) {
      this.errorMessage = e.message;
      this.toastr.error(e.message, 'Error');
    }
  }

  // ---------------------------------------
  private createInto(
    selector: string,
    host: ViewContainerRef,
    data: any,
    isView: boolean,
    isBothhost: boolean,
    highlightMap?: Record<string, boolean>
  ): boolean {

    if (!host) return false;

    const compType = this.registry.resolve(selector);
    if (!compType) return false;

    host.clear();
    const ref = host.createComponent(compType, { environmentInjector: this.env });

    ref.setInput('viewObject', data);
    ref.setInput('isViewDetails', isView);
    ref.setInput('isApprovalView', isBothhost);

    if (highlightMap) {
      ref.setInput('highlightMap', highlightMap);
    }

    return true;
  }

  // ---------------------------
  //      ACTION BUTTONS
  // ---------------------------
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
      next: () => {
        this.toastr.success('Approved successfully');
        this.router.navigate(['/approval-items']);
      },
      error: (err) => {
        this.toastr.error('Approval Failed', err);
      }
    });
  }

  onReject(): void {
    if (!this.rejectReason) {
      this.toastr.warning('Remarks Required!');
      return;
    }

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
      next: () => {
        this.toastr.success('Rejected successfully');
        this.router.navigate(['/approval-items']);
      },
      error: (err) => {
        this.toastr.error('Reject Failed', err);
      }
    });
  }


  onSendBack(): void {
    if (!this.rejectReason) {
      this.toastr.warning('Remarks Required!');
      return;
    }

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
      next: () => {
        this.toastr.success('Sent back successfully');
        this.router.navigate(['/approval-items']);
      },
      error: (err) => {
        this.toastr.error('Send Back Failed', err);
      }
    });
  }


  goBack() {
    this.location.back();
  }

}

// ---------------------------------------
//              DIFF HELPER
// ---------------------------------------
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
    if (isArr(x)) {
      if (x.length !== y.length) {
        mark(path);
        return;
      }
      for (let i = 0; i < x.length; i++) walk(x[i], y[i], `${path}[${i}]`);
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
