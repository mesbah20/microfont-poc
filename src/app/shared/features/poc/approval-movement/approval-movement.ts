import {
  Component,
  EnvironmentInjector,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  OnInit,
  inject,
  WritableSignal,
  signal,
  ChangeDetectorRef
} from '@angular/core';
import { ComponentRegistry } from '../component-registry';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../../../services/approval-service';
import { HighlightService } from '../../../services/highlight.service';
import { BUTTON_VISIBILITY } from '../../../constant/button-signals.constant';
import { ExpansionPanelHeader } from '../../../common-components/expansion-panel-header/expansion-panel-header';

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
export class ApprovalMovement implements OnInit, AfterViewInit {

  @ViewChild('dynamicHostLeft', { read: ViewContainerRef })
  hostLeft!: ViewContainerRef;

  @ViewChild('dynamicHostRight', { read: ViewContainerRef })
  hostRight!: ViewContainerRef;

  isLoading: boolean = false;        // ⬅ start as false so content renders immediately
  errorMessage: string | null = null;
  errorLeft: string | null = null;
  errorRight: string | null = null;

  toastr = inject(ToastrService);
  data: any;
  private diffMap: DiffMap = {};
  private setId: number = 0;
  rejectReason = '';

  businessHeaderPanel: WritableSignal<boolean> = signal(true);

  constructor(
    private registry: ComponentRegistry,
    private env: EnvironmentInjector,
    private approvalService: ApprovalService,
    private router: Router,
    private location: Location,
    private hl: HighlightService,
    private cdr: ChangeDetectorRef
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
  //           ON INIT (DUMMY DATA)
  // ---------------------------------------
  ngOnInit(): void {
    // For now always use dummy data so the view renders
    if (!this.data) {
      console.log("ℹ️ No navigation data. Using dummy Name + Phone data.");

      this.data = {
        setId: 1,
        selector: "text-base-input",
        currentUxContent: {
          selector: "text-base-input",
          fields: [
            { key: "name", label: "Name", value: "John Doe" },
            { key: "phone", label: "Phone Number", value: "01812345678" }
          ]
        },
        previousUxContent: {
          selector: "text-base-input",
          fields: [
            { key: "name", label: "Name", value: "Jonathan Doe" },
            { key: "phone", label: "Phone Number", value: "01798765432" }
          ]
        }
      };
    }

    this.setId = this.data.setId ?? 0;

    this.data.currentUxContent = this.safeParse(this.data.currentUxContent);
    this.data.previousUxContent = this.safeParse(this.data.previousUxContent);

    if (this.data?.currentUxContent) {
      this.diffMap = buildDiffMap(this.data.previousUxContent, this.data.currentUxContent, []);
    }
  }

  // ---------------------------------------
  ngAfterViewInit(): void {
    // Make sure view children are resolved, then render
    this.cdr.detectChanges();
    this.loadAndRender();
  }

  safeParse(value: any): any {
    if (!value) return {};
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  // ---------------------------------------
  //              LOAD + RENDER
  // ---------------------------------------
  private loadAndRender(): void {
    try {
      if (!this.data.selector || !this.data.currentUxContent) {
        throw new Error('Invalid data: Missing content or selector.');
      }

      const isBothhost = !!(this.hostLeft && this.hostRight);

      // Render Left (Change Request)
      const successLeft = this.createInto(
        this.data.selector,
        this.hostLeft,
        this.data.currentUxContent,
        true,
        isBothhost,
        this.diffMap
      );

      if (!successLeft) {
        this.errorLeft = `Failed to render 'Change Request' component (${this.data.selector})`;
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
          this.errorRight = `Failed to render 'Previous Data' component (${sel})`;
        }
      } else {
        console.log('ℹ️ No previous data to render (New record creation)');
      }

      this.toastr.success('Approval view loaded successfully!', 'Success');

    } catch (e: any) {
      this.errorMessage = e.message || 'Unknown error';
      //this.toastr.error(this.errorMessage, 'Error');
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

    console.log("🟦 createInto() called with selector:", selector);
    const compType = this.registry.resolve(selector);
    console.log("🟧 Resolved component:", compType);

    if (!compType) {
      console.error("❌ Component not found in registry:", selector);
      return false;
    }

    if (!host) {
      console.error("❌ Host not available");
      return false;
    }

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
