import { Component, input, output, signal, computed, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface TableRowDesigner {
  condition: (item: any) => boolean;
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: string;
  borderColor?: string;
}

export interface DropdownOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface GridColumn {
  property: string;
  header: string;
  isEditable: boolean;
  isNumeric: boolean;
  isVisible: boolean;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  isDropdown?: boolean;
  dropdownOptions?: DropdownOption[];
  dropdownOptionsSource?: string; 
  isMultiSelect?: boolean; 
  isCheckbox?: boolean;
  showSelectAll?: boolean; // New property for checkbox columns
  readOnly?: boolean; // New property to make checkboxes read-only
}

export interface GridAction {
  type: 'edit' | 'delete' | 'view' | 'print';
  icon: string;
  tooltip: string;
  visible: boolean;
  disabled?: boolean;
}

export interface CheckboxChangeEvent {
  item: any;
  property: string;
  value: boolean;
  index: number;
}

export interface ColumnSelectAllEvent {
  property: string;
  checked: boolean;
}

@Component({
  selector: 'lds-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.scss'
})
export class DataGridComponent<T extends Record<string, any> = any> implements OnInit, OnDestroy {
  // Basic Inputs
  readonly id = input<string>('');
  readonly showEditButton = input<boolean>(false);
  readonly showDeleteButton = input<boolean>(false);
  readonly showViewButton = input<boolean>(false);
  readonly showProgressButton = input<boolean>(false);
  readonly showPrintButton = input<boolean>(false);
  readonly enableSelection = input<boolean>(false);
  readonly tblClass = input<string>('');
  readonly customColumnNames = input<Record<string, string>>({});
  readonly selectedColumns = input<string[]>([]);
  readonly editableColumns = input<string[]>([]);
  readonly numberColumns = input<string[]>([]);
  readonly rowDesignerList = input<TableRowDesigner[]>([]);
  readonly dataSource = input<T[]>([]);
  readonly initPageSize = input<number>(5);
  readonly useInlineEdit = input<boolean>(true);
  readonly searchEnabled = input<boolean>(false);

  // Dropdown Inputs
  readonly dropdownColumns = input<string[]>([]);
  readonly dropdownOptions = input<Record<string, DropdownOption[]>>({});
  readonly multiSelectColumns = input<string[]>([]);
  readonly dynamicDropdownSources = input<Record<string, string>>({});

  // Enhanced Checkbox Inputs
  readonly checkboxColumns = input<string[]>([]);
  readonly checkboxSelectAllColumns = input<string[]>([]); // Columns that should show select all
  readonly readOnlyCheckboxColumns = input<string[]>([]); // Columns that should be read-only

  // Basic Outputs
  readonly onSelectAllChange = output<{ 
    isSelectAll: boolean, 
    selectedRows: T[], 
    count: number 
  }>();
  readonly onFHEditClick = output<string>();
  readonly onFHDeleteClick = output<string>();
  readonly onFHViewClick = output<string>();
  readonly onFHProgressClick = output<string>();
  readonly onChecked = output<{ data: string, checked: boolean }>();
  readonly onPrint = output<string>();
  readonly dataSourceChanged = output<T[]>();

  // Enhanced Checkbox Outputs
  readonly onCheckboxValueChange = output<CheckboxChangeEvent>();
  readonly onColumnSelectAll = output<ColumnSelectAllEvent>();

  // Internal state signals
  public _dataSource = signal<T[]>([]);
  public _filteredData = signal<T[]>([]);
  public _currentPage = signal<number>(0);
  public _pageSize = signal<number>(5);
  public _sortColumn = signal<string>('');
  public _sortDirection = signal<'asc' | 'desc'>('asc');
  public _searchTerm = signal<string>('');
  public _selectedRows = signal<Set<number>>(new Set());
  public _selectAll = signal<boolean>(false);
  public _editingRow = signal<number | null>(null);
  public _editingData = signal<Partial<T>>({});

  // Computed values
  columns = computed(() => this.buildColumns());
  displayedData = computed(() => this.getDisplayedData());
  totalPages = computed(() => Math.ceil(this._filteredData().length / this._pageSize()));
  hasNextPage = computed(() => this._currentPage() < this.totalPages() - 1);
  hasPrevPage = computed(() => this._currentPage() > 0);
  selectedCount = computed(() => this._selectedRows().size);
  isAllSelected = computed(() => this._selectedRows().size === this.displayedData().length && this.displayedData().length > 0);

  constructor() {
    // Data source effect
    effect(() => {
      const data = this.dataSource();
      
      if (data && data.length > 0) {
        this._dataSource.set([...data]); // Create a copy
        this.applyFilters();
      } else {
        this._dataSource.set([]);
        this._filteredData.set([]);
      }
    });

    // Set initial page size effect
    effect(() => {
      const pageSize = this.initPageSize();
      if (pageSize > 0) {
        this._pageSize.set(pageSize);
      }
    });
  }

  ngOnInit() {
    console.log('Enhanced DataGridComponent initialized');
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  // Enhanced Column management
  private buildColumns(): GridColumn[] {
    const allProperties = this._dataSource().length > 0 ? Object.keys(this._dataSource()[0]) : [];
    const propertiesToShow = this.selectedColumns().length > 0 ? this.selectedColumns() : allProperties;

    return propertiesToShow.map(prop => ({
      property: prop,
      header: this.customColumnNames()[prop] || this.formatColumnHeader(prop),
      isEditable: this.editableColumns().includes(prop),
      isNumeric: this.numberColumns().includes(prop),
      isVisible: true,
      sortable: !this.checkboxColumns().includes(prop), // Checkboxes are not sortable by default
      filterable: true,
      width: this.getColumnWidth(prop),
      
      // Dropdown properties
      isDropdown: this.dropdownColumns().includes(prop),
      dropdownOptions: this.dropdownOptions()[prop] || [],
      dropdownOptionsSource: this.dynamicDropdownSources()[prop],
      isMultiSelect: this.multiSelectColumns().includes(prop),
      
      // Enhanced checkbox properties
      isCheckbox: this.checkboxColumns().includes(prop),
      showSelectAll: this.checkboxSelectAllColumns().includes(prop),
      readOnly: this.readOnlyCheckboxColumns().includes(prop)
    }));
  }

  // Method to get dropdown options for a column
  getDropdownOptions(column: GridColumn, rowData?: T): DropdownOption[] {
    if (column.dropdownOptionsSource && rowData) {
      // Dynamic options from row data
      const optionsData = this.getPropertyValue(rowData, column.dropdownOptionsSource);
      if (Array.isArray(optionsData)) {
        return optionsData.map(item => ({
          value: typeof item === 'object' ? item.value : item,
          label: typeof item === 'object' ? item.label : String(item)
        }));
      }
    }
    
    // Static options from configuration
    return column.dropdownOptions || [];
  }

  // Method to get display text for dropdown values
  getDropdownDisplayText(column: GridColumn, value: any, rowData?: T): string {
    if (!column.isDropdown) return value;
    
    const options = this.getDropdownOptions(column, rowData);
    
    if (column.isMultiSelect && Array.isArray(value)) {
      return value.map(v => {
        const option = options.find(opt => opt.value === v);
        return option ? option.label : v;
      }).join(', ');
    }
    
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  // Enhanced setEditingValue to handle all input types
  setEditingValue(property: string, value: any): void {
    const column = this.columns().find(col => col.property === property);
    
    if (column?.isCheckbox) {
      // Ensure boolean value for checkboxes
      this._editingData.set({ 
        ...this._editingData(), 
        [property]: Boolean(value) 
      } as Partial<T>);
    } else if (column?.isMultiSelect && typeof value === 'string') {
      // Handle multi-select string conversion if needed
      try {
        const parsedValue = JSON.parse(value);
        this._editingData.set({ ...this._editingData(), [property]: parsedValue } as Partial<T>);
      } catch {
        this._editingData.set({ ...this._editingData(), [property]: value } as Partial<T>);
      }
    } else {
      this._editingData.set({ ...this._editingData(), [property]: value } as Partial<T>);
    }
  }

  // Method to handle multi-select changes
  onMultiSelectChange(property: string, selectedValues: any[]): void {
    this.setEditingValue(property, selectedValues);
  }

  // Enhanced checkbox methods
  
  // Method to handle individual checkbox changes in display mode
  onCheckboxChange(item: T, property: string, checked: boolean, displayIndex: number): void {
    if (this.readOnlyCheckboxColumns().includes(property)) {
      return; // Don't allow changes for read-only checkboxes
    }

    // Update the data source
    const actualIndex = this._currentPage() * this._pageSize() + displayIndex;
    const sourceIndex = this._dataSource().findIndex((sourceItem, i) => {
      // Find the actual index in the original data source
      const filteredItem = this._filteredData()[actualIndex];
      return sourceItem === filteredItem;
    });
    
    if (sourceIndex !== -1) {
      const updatedData = [...this._dataSource()];
      (updatedData[sourceIndex] as any)[property] = checked;
      
      this._dataSource.set(updatedData);
      this.applyFilters();
      
      // Emit events
      this.dataSourceChanged.emit(updatedData);
      this.onCheckboxValueChange.emit({
        item: item,
        property: property,
        value: checked,
        index: actualIndex
      });
    }
  }

  // Method to check if all values in a column are checked
  isAllColumnValuesChecked(property: string): boolean {
    const displayedData = this.displayedData();
    if (displayedData.length === 0) return false;
    
    return displayedData.every(item => 
      Boolean(this.getPropertyValue(item, property))
    );
  }

  // Method to check if some (but not all) values in a column are checked
  isSomeColumnValuesChecked(property: string): boolean {
    const displayedData = this.displayedData();
    if (displayedData.length === 0) return false;
    
    const checkedCount = displayedData.filter(item => 
      Boolean(this.getPropertyValue(item, property))
    ).length;
    
    return checkedCount > 0 && checkedCount < displayedData.length;
  }

  // Method to select/deselect all checkboxes in a column
  onSelectAllForColumn(property: string, checked: boolean): void {
    if (this.readOnlyCheckboxColumns().includes(property)) {
      return; // Don't allow changes for read-only columns
    }

    const updatedData = [...this._dataSource()];
    const displayedData = this.displayedData();
    
    // Update all displayed rows
    displayedData.forEach(displayedItem => {
      const sourceIndex = updatedData.findIndex(sourceItem => sourceItem === displayedItem);
      if (sourceIndex !== -1) {
        (updatedData[sourceIndex] as any)[property] = checked;
      }
    });
    
    this._dataSource.set(updatedData);
    this.applyFilters();
    
    // Emit events
    this.dataSourceChanged.emit(updatedData);
    this.onColumnSelectAll.emit({
      property: property,
      checked: checked
    });
  }

  private getColumnWidth(property: string): string {
    // Enhanced width mapping with checkbox consideration
    const widthMap: Record<string, string> = {
      id: '100px',
      name: '200px',
      email: '250px',
      status: '120px',
      isActive: '120px',
      // Add more properties as needed
    };
    
    // Shorter width for checkbox columns
    if (this.checkboxColumns().includes(property)) {
      return widthMap[property] || '100px';
    }
    
    return widthMap[property] || '150px'; // Default width
  }

  private formatColumnHeader(property: string): string {
    return property
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Enhanced data filtering and sorting
  private applyFilters(): void {
    let filtered = [...this._dataSource()];

    // Apply search filter
    if (this._searchTerm()) {
      filtered = filtered.filter(item => 
        Object.entries(item as Record<string, any>).some(([key, value]) => {
          const column = this.columns().find(col => col.property === key);
          
          // Handle different column types for search
          if (column?.isCheckbox) {
            // For checkboxes, search for "true", "false", "yes", "no"
            const searchTerm = this._searchTerm().toLowerCase();
            const boolValue = Boolean(value);
            return (
              (boolValue && ['true', 'yes', '1', 'checked'].includes(searchTerm)) ||
              (!boolValue && ['false', 'no', '0', 'unchecked'].includes(searchTerm))
            );
          } else if (column?.isDropdown) {
            // For dropdowns, search in both value and display text
            const displayText = this.getDropdownDisplayText(column, value, item);
            return displayText.toLowerCase().includes(this._searchTerm().toLowerCase()) ||
                   String(value).toLowerCase().includes(this._searchTerm().toLowerCase());
          } else {
            // Regular search for other columns
            return String(value).toLowerCase().includes(this._searchTerm().toLowerCase());
          }
        })
      );
    }

    // Apply sorting
    if (this._sortColumn()) {
      filtered.sort((a, b) => {
        const aVal = this.getPropertyValue(a, this._sortColumn());
        const bVal = this.getPropertyValue(b, this._sortColumn());
        
        // Handle different data types for sorting
        const column = this.columns().find(col => col.property === this._sortColumn());
        
        if (column?.isCheckbox) {
          // Boolean sorting
          const aBool = Boolean(aVal);
          const bBool = Boolean(bVal);
          if (this._sortDirection() === 'asc') {
            return aBool === bBool ? 0 : aBool ? 1 : -1;
          } else {
            return aBool === bBool ? 0 : aBool ? -1 : 1;
          }
        } else if (column?.isNumeric) {
          // Numeric sorting
          const aNum = Number(aVal) || 0;
          const bNum = Number(bVal) || 0;
          return this._sortDirection() === 'asc' ? aNum - bNum : bNum - aNum;
        } else {
          // String sorting
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          if (this._sortDirection() === 'asc') {
            return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
          } else {
            return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
          }
        }
      });
    }

    this._filteredData.set(filtered);
    
    // Reset to first page when filtering, but don't reset if it's initial load
    if (this._searchTerm() || this._sortColumn()) {
      this._currentPage.set(0);
    }
  }

  public getPropertyValue(item: T, property: string): any {
    return property.split('.').reduce((obj: any, key) => obj?.[key], item);
  }

  private getDisplayedData(): T[] {
    const startIndex = this._currentPage() * this._pageSize();
    const endIndex = startIndex + this._pageSize();
    const displayed = this._filteredData().slice(startIndex, endIndex);
    return displayed;
  }

  // Sorting
  onSort(column: string): void {
    if (this._sortColumn() === column) {
      this._sortDirection.set(this._sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this._sortColumn.set(column);
      this._sortDirection.set('asc');
    }
    this.applyFilters();
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this._currentPage.set(event.pageIndex);
    this._pageSize.set(event.pageSize);
  }

  // Search
  onSearch(term: string): void {
    this._searchTerm.set(term);
    this.applyFilters();
  }

  // Row selection
  onRowSelect(index: number, checked: boolean): void {
    const actualIndex = this._currentPage() * this._pageSize() + index;
    const newSelected = new Set(this._selectedRows());
    
    if (checked) {
      newSelected.add(actualIndex);
    } else {
      newSelected.delete(actualIndex);
    }
    
    this._selectedRows.set(newSelected);
    
    
    this.onChecked.emit({ 
      data: JSON.stringify(this._filteredData()[actualIndex]),
      checked: checked 
    });
  }
  
    onSelectAll(checked: boolean): void {
      this._selectAll.set(checked);
      
      if (checked) {
        const newSelected = new Set<number>();
        this.displayedData().forEach((_, index) => {
          newSelected.add(this._currentPage() * this._pageSize() + index);
        });
        this._selectedRows.set(newSelected);
      } else {
        this._selectedRows.set(new Set());
      }
  
    const selectedRows = this.getSelectedRows();
    this.onSelectAllChange.emit({
      isSelectAll: checked,
      selectedRows: selectedRows,
      count: selectedRows.length
    });
    }
  
  // Row editing
  startEdit(index: number): void {
    this._editingRow.set(index);
    this._editingData.set({ ...this.displayedData()[index] });
  }

  saveEdit(index: number): void {
    const displayedItem = this.displayedData()[index];
    const sourceIndex = this._dataSource().findIndex(sourceItem => sourceItem === displayedItem);
    
    if (sourceIndex !== -1) {
      const updatedData = [...this._dataSource()];
      updatedData[sourceIndex] = { ...updatedData[sourceIndex], ...this._editingData() };
      
      this._dataSource.set(updatedData);
      this._editingRow.set(null);
      this._editingData.set({});
      this.applyFilters();
      this.dataSourceChanged.emit(updatedData);
    }
  }

  cancelEdit(): void {
    this._editingRow.set(null);
    this._editingData.set({});
  }

  // Actions
  onEditClick(item: T): void {
    this.onFHEditClick.emit(JSON.stringify(item));
  }

  onDeleteClick(item: T): void {
    this.onFHDeleteClick.emit(JSON.stringify(item));
  }

  onViewClick(item: T): void {
    this.onFHViewClick.emit(JSON.stringify(item));
  }

  onFHProgress(item: T): void {
    this.onFHProgressClick.emit(JSON.stringify(item));
  }

  onPrintClick(item: T): void {
    this.onPrint.emit(JSON.stringify(item));
  }

  // Row styling
  getRowStyle(item: T): any {
    for (const designer of this.rowDesignerList()) {
      if (designer.condition(item)) {
        return {
          backgroundColor: designer.backgroundColor,
          color: designer.textColor,
          fontWeight: designer.fontWeight,
          borderColor: designer.borderColor
        };
      }
    }
    return {};
  }

  // Utility methods
  isRowSelected(index: number): boolean {
    const actualIndex = this._currentPage() * this._pageSize() + index;
    return this._selectedRows().has(actualIndex);
  }

  isRowEditing(index: number): boolean {
    return this._editingRow() === index;
  }

  getEditingValue(property: string): any {
    const value = (this._editingData() as Record<string, any>)[property];
    const column = this.columns().find(col => col.property === property);
    
    if (column?.isCheckbox) {
      return Boolean(value);
    }
    
    return value !== undefined ? value : '';
  }

  // Public methods for external access
  getSelectedRows(): T[] {
    return Array.from(this._selectedRows()).map(index => {
      // Map selected indices to actual filtered data
      if (index < this._filteredData().length) {
        return this._filteredData()[index];
      }
      return null;
    }).filter(item => item !== null) as T[];
  }

  clearSelection(): void {
    this._selectedRows.set(new Set());
    this._selectAll.set(false);
  }

  refreshData(): void {
    this.applyFilters();
  }

  // Get displayed columns for the table
  getDisplayedColumns(): string[] {
    const columns: string[] = [];
    
    if (this.enableSelection()) {
      columns.push('selection');
    }

    if (this.showEditButton() || this.showDeleteButton() || this.showViewButton() || this.showPrintButton() || this.showProgressButton()) {
      columns.push('actions');
    }
     
    const dataColumns = this.columns().map(col => col.property);
    columns.push(...dataColumns);

    return columns;
  }

  // Enhanced public methods for checkbox functionality

  // Get all checked items for a specific column
  getCheckedItemsForColumn(property: string): T[] {
    return this._dataSource().filter(item => 
      Boolean(this.getPropertyValue(item, property))
    );
  }

  // Set checkbox value for a specific item
  setCheckboxValue(item: T, property: string, checked: boolean): void {
    const sourceIndex = this._dataSource().findIndex(sourceItem => sourceItem === item);
    
    if (sourceIndex !== -1 && !this.readOnlyCheckboxColumns().includes(property)) {
      const updatedData = [...this._dataSource()];
      (updatedData[sourceIndex] as any)[property] = checked;
      
      this._dataSource.set(updatedData);
      this.applyFilters();
      this.dataSourceChanged.emit(updatedData);
    }
  }

  // Bulk update checkbox values
  bulkUpdateCheckboxColumn(property: string, checked: boolean, condition?: (item: T) => boolean): void {
    if (this.readOnlyCheckboxColumns().includes(property)) {
      return;
    }

    const updatedData = [...this._dataSource()];
    let changed = false;

    updatedData.forEach((item, index) => {
      if (!condition || condition(item)) {
        (updatedData[index] as any)[property] = checked;
        changed = true;
      }
    });

    if (changed) {
      this._dataSource.set(updatedData);
      this.applyFilters();
      this.dataSourceChanged.emit(updatedData);
    }
  }

  // Math utility for template
  Math = Math;
}