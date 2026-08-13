import {
  Component,
  ChangeDetectionStrategy,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface SegmentTab {
  /** Stable id used to track the active tab */
  id: string;
  /** Label shown inside the tab */
  label: string;
  /** Material icon name (optional) */
  icon?: string;
  /** Optional badge text (e.g. "New") */
  badge?: string;
}

/**
 * Modern segmented-tab container.
 * - Animated sliding "pill" indicator behind the active tab
 * - Icon + label per tab
 * - No Material tabs dependency (clean, lightweight)
 * - Emits `tabChange` with the newly selected tab id
 */
@Component({
  selector: 'app-segmented-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  templateUrl: './segmented-tabs.html',
  styleUrl: './segmented-tabs.scss',
})
export class SegmentedTabs {
  /** List of tabs to render. The first tab is active by default. */
  @Input() set tabs(value: SegmentTab[]) {
    this._tabs.set(value ?? []);
    if (!this._activeId() && (value?.length ?? 0) > 0) {
      this._activeId.set(value![0].id);
    }
  }
  get tabsInput(): SegmentTab[] {
    return this._tabs();
  }

  @Input() set activeId(value: string) {
    if (value) this._activeId.set(value);
  }

  /** Emitted whenever the user selects a different tab. */
  @Output() readonly tabChange = new EventEmitter<string>();

  private _tabs = signal<SegmentTab[]>([]);
  private _activeId = signal<string>('');

  readonly activeIdSig = this._activeId.asReadonly();
  readonly tabsSig = this._tabs.asReadonly();

  /** Index of the active tab — used to position the sliding pill */
  readonly activeIndex = computed(() => {
    const list = this._tabs();
    return list.findIndex((t) => t.id === this._activeId());
  });

  /** Translate % for the pill (e.g. 0 = first tab, 100 = second tab) */
  readonly pillTransform = computed(() => {
    const idx = this.activeIndex();
    return idx < 0 ? 'translateX(0%)' : `translateX(${idx * 100}%)`;
  });

  /** Width % per tab — used to scale the pill */
  readonly pillWidth = computed(() => {
    const n = this._tabs().length;
    return n > 0 ? `calc(100% / ${n})` : '100%';
  });

  select(id: string): void {
    if (id === this._activeId()) return;
    this._activeId.set(id);
    this.tabChange.emit(id);
  }

  isActive(id: string): boolean {
    return this._activeId() === id;
  }
}
