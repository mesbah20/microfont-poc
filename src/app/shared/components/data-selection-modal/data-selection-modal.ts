import {Component, Inject, OnInit, input, output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '../../components/input-types/button/button';

@Component({
  selector: 'app-data-selection-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ReactiveFormsModule,
    Button
  ],
  templateUrl: './data-selection-modal.html',
  styleUrls: ['./data-selection-modal.scss']
})
export class DataSelectionModal implements OnInit {
  
  protected readonly Object = Object;
  dataSource: any[] = [];
  filteredDataSource: any[] = [];
  paginatedDataSource: any[] = [];
  searchTerm: string = '';
  apiSearchTerm: string = ''; // Separate field for API calls
  isLoading: boolean = false; // Loading state for API calls
  pickTablePair: Map<string, string> = new Map<string, string>();

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  // result = output<any | undefined>();
  multiSelect = false;

  // Inputs/Outputs
  allowDoubleClickSelect = input<boolean>(true);
  readonly onFindClicked = output<string>();
  readonly onRowDoubleClick = output<any>();
  
  // Configurable text from modal data
  apiSearchPlaceholder: string = 'Enter search term...';
  findButtonText: string = 'Find';
  loadingText: string = 'Searching...';
  noDataMessage: string = 'No data available. Use the search field above to find items.';
  loadingMessage: string = 'Searching...';
  
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataSource = data?.pickTableDataSource ?? [];
    this.filteredDataSource = [...this.dataSource];
    this.pickTablePair = data?.pickTablePair ?? new Map<string, string>();
    
    // Read configurable text from modal data
    this.apiSearchPlaceholder = data?.apiSearchPlaceholder ?? 'Enter search term...';
    this.findButtonText = data?.findButtonText ?? 'Find';
    this.loadingText = data?.loadingText ?? 'Searching...';
    this.noDataMessage = data?.noDataMessage ?? 'No data available. Use the search field above to find items.';
    this.loadingMessage = data?.loadingMessage ?? 'Searching...';
    
    this.updatePagination();
  }

  ngOnInit(): void {
  }

  dialogClose(value: any) {
    // this.result.emit(value);
    this.dialogRef.close(value);
  }

  // Get ordered column keys based on pickTablePair Map
  getOrderedColumnKeys(): string[] {
    return Array.from(this.pickTablePair.keys());
  }

  isPresentHead(key: string): boolean {
    return this.pickTablePair.has(key);
  }

  getHead(key: string): string {
    return this.pickTablePair.get(key) || key;
  }

  // Filter data based on search term
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase().trim();
    this.filterData();
  }

  // Filter the data source based on search term
  private filterData(): void {
    if (!this.searchTerm) {
      this.filteredDataSource = [...this.dataSource];
    } else {
      this.filteredDataSource = this.dataSource.filter(item => {
        // Search in all visible columns
        return Object.keys(item).some(key => {
          if (this.isPresentHead(key)) {
            const value = item[key];
            return value && value.toString().toLowerCase().includes(this.searchTerm);
          }
          return false;
        });
      });
    }
    
    // Reset to first page after filtering
    this.currentPage = 1;
    this.updatePagination();
  }

  // Clear search and filters
  clearFilters(): void {
    this.searchTerm = '';
    this.apiSearchTerm = '';
    this.filteredDataSource = [...this.dataSource];
    this.currentPage = 1;
    this.updatePagination();
  }

  // Clear API search field
  clearApiSearch(): void {
    this.apiSearchTerm = '';
  }

  // Set loading state
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  // Update pagination after data changes
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDataSource.length / this.pageSize);
    this.paginateData();
  }

  // Apply pagination to filtered data
  private paginateData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDataSource = this.filteredDataSource.slice(startIndex, endIndex);
  }

  // Change page size
  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  // Go to previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateData();
    }
  }

  // Go to next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateData();
    }
  }

  // Check if previous page is available
  canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Check if next page is available
  canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  // Get pagination info text
  getPaginationInfo(): string {
    if (this.filteredDataSource.length === 0) {
      return 'No results to show';
    }
    
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, this.filteredDataSource.length);
    return `Showing ${startItem} to ${endItem} of ${this.filteredDataSource.length} results`;
  }

  // Handle double click on a row
  handleRowDoubleClick(row: any) {
    if (this.allowDoubleClickSelect()) {
      this.onRowDoubleClick.emit(row);
      this.dialogClose(row);
    }
  }
}
