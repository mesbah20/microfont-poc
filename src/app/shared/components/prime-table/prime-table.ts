import {Component} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {XmlViewDialog} from '../xml-view-dialog/xml-view-dialog';

@Component({
  selector: 'app-prime-table',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './prime-table.html',
  styleUrl: './prime-table.scss'
})
export class PrimeTable {
  displayedColumns = ['position', 'msgRefNo', 'mtId', 'senderBic', 'makeBy', 'makeDt', 'actions'];
  
  // Original data source
  private originalDataSource: SwiftMessage[] = ELEMENT_DATA;
  dataSource: SwiftMessage[] = [...this.originalDataSource];
  
  // Filter properties
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedMessageType: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  private searchTerm: string = '';
  
  // Message types for dropdown (MT types)
  messageTypes: any[] = [
  { value: 'pacs-008', label: 'pacs 008 - F1 to F1 Customer Credit Transfer' },
  { value: 'pacs-009', label: 'pacs 009 - Financial Institution Credit Transfer Return' },
  { value: 'pacs-002', label: 'pacs 002 - F1 to F1 Payment' },
  { value: 'pacs-010', label: 'pacs 010 - Payment Return' },
  { value: 'pacs-011', label: 'pacs 011 - Request for Investigation' },
  { value: 'pacs-012', label: 'pacs 012 - Request for Investigation Return' },
  { value: 'pacs-013', label: 'pacs 013 - Resolution of Investigation' },
  { value: 'pacs-014', label: 'pacs 014 - Additional Payment Information' },
  { value: 'pacs-015', label: 'pacs 015 - Account Switching Information Request' },
  { value: 'pacs-016', label: 'pacs 016 - Intra-Position Movement Instruction' },
  { value: 'pacs-017', label: 'pacs 017 - Intra-Position Movement Confirmation' },
  { value: 'pacs-018', label: 'pacs 018 - Intra-Position Movement Status Report' },
  { value: 'pacs-019', label: 'pacs 019 - Intra-Position Movement Cancellation Request' }
];

  constructor(private dialog: MatDialog) {
    this.applyPagination();
  }

  // Track function for ngFor performance
  trackByFn(index: number, item: SwiftMessage): string {
    return item.msgRefNo + item.senderBic;
  }

  // Search filter functionality
  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim().toLowerCase();
    this.currentPage = 1; // Reset to first page when searching
    this.filterAndPaginate();
  }

  // Main filter button action
  onFindClick() {
    console.log('Find button clicked');
    console.log('Start Date:', this.startDate);
    console.log('End Date:', this.endDate);
    console.log('Message Type:', this.selectedMessageType);
    
    this.currentPage = 1; // Reset to first page
    this.filterData();
  }

  // Filter data based on all criteria
  filterData() {
    console.log('Filtering data with:', {
      startDate: this.startDate,
      endDate: this.endDate,
      messageType: this.selectedMessageType,
      searchTerm: this.searchTerm
    });
    
    this.filterAndPaginate();
  }

  // Clear all filters
  clearFilters() {
    this.startDate = null;
    this.endDate = null;
    this.selectedMessageType = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.dataSource = [...this.originalDataSource];
    this.applyPagination();
  }

  // Combined filter and pagination method
  private filterAndPaginate() {
    let filteredData = [...this.originalDataSource];

    // Filter by date range
    if (this.startDate || this.endDate) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.makeDt);
        
        if (this.startDate && this.endDate) {
          return itemDate >= this.startDate! && itemDate <= this.endDate!;
        } else if (this.startDate) {
          return itemDate >= this.startDate!;
        } else if (this.endDate) {
          return itemDate <= this.endDate!;
        }
        return true;
      });
    }

    // Filter by message type
    if (this.selectedMessageType) {
      filteredData = filteredData.filter(item => 
        item.mtId.toString() === this.selectedMessageType
      );
    }

    // Filter by search term
    if (this.searchTerm) {
      filteredData = filteredData.filter(item => 
        item.msgRefNo.toLowerCase().includes(this.searchTerm) ||
        item.senderBic.toLowerCase().includes(this.searchTerm) ||
        item.makeBy.toLowerCase().includes(this.searchTerm) ||
        item.mtId.toString().includes(this.searchTerm)
      );
    }
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource = filteredData.slice(startIndex, endIndex);
    
    // Store filtered data count for pagination info
    this.filteredDataCount = filteredData.length;
  }

  private filteredDataCount: number = this.originalDataSource.length;

  // Pagination methods
  onPageSizeChange() {
    this.currentPage = 1;
    this.filterAndPaginate();
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.filterAndPaginate();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterAndPaginate();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.filterAndPaginate();
    }
  }

  goToLastPage() {
    this.currentPage = this.getTotalPages();
    this.filterAndPaginate();
  }

  // Pagination info methods
  getTotalPages(): number {
    return Math.ceil(this.filteredDataCount / this.pageSize);
  }

  getStartIndex(): number {
    if (this.filteredDataCount === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const endIndex = this.currentPage * this.pageSize;
    return Math.min(endIndex, this.filteredDataCount);
  }

  getTotalResults(): number {
    return this.filteredDataCount;
  }

  private applyPagination() {
    this.filterAndPaginate();
  }

  // Action methods for view, email and PDF
  viewDetails(data: SwiftMessage) {
    console.log('Viewing details for:', data);
    
    // Sample XML data - in a real application, this would come from an API
    const xmlData = `<?xml version="1.0" encoding="utf-16"?>
<Document xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.09">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${data.msgRefNo}</MsgId>
      <CreDtTm>2022-04-17T15:29:42.1057464+06:00</CreDtTm>
      <SttlmInf>
        <SttlmMtd>INDA</SttlmMtd>
        <InstdRmbrsmntAgt>
          <FinInstnId>
            <BICFI>ABBLBDDH011</BICFI>
          </FinInstnId>
        </InstdRmbrsmntAgt>
      </SttlmInf>
      <InstgAgt>
        <FinInstnId>
          <BICFI>${data.senderBic}</BICFI>
        </FinInstnId>
      </InstgAgt>
      <InstdAgt>
        <FinInstnId>
          <BICFI>ABGRGRAA201</BICFI>
        </FinInstnId>
      </InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>${data.msgRefNo}</InstrId>
        <EndToEndId>CROPS/SX-25T/2015-10-13</EndToEndId>
        <TxId>${data.msgRefNo}</TxId>
        <UETR>49639fda-4c91-4913-81b7-0b1d68c80d49</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="012">12</IntrBkSttlmAmt>
      <IntrBkSttlmDt>2022-04-17</IntrBkSttlmDt>
      <ChrgBr>DEBT</ChrgBr>
      <ChrgsInf>
        <Amt Ccy="USD">8798</Amt>
      </ChrgsInf>
      <PrvsInstgAgt1>
        <FinInstnId />
      </PrvsInstgAgt1>
      <PrvsInstgAgt2>
        <FinInstnId />
      </PrvsInstgAgt2>
      <PrvsInstgAgt3>
        <FinInstnId />
      </PrvsInstgAgt3>
      <DbtrAcct>
        <Id>
          <Othr>
            <Id>11100007273</Id>
          </Othr>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>SEBDBDDHCRP</BICFI>
        </FinInstnId>
      </DbtrAgt>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>ACARIT21019</BICFI>
        </FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <Nm>erte</Nm>
        <PstlAdr>
          <StrtNm>3232</StrtNm>
          <PstCd>3232</PstCd>
          <TwnNm>433</TwnNm>
          <Ctry>43</Ctry>
        </PstlAdr>
      </Cdtr>
      <CdtrAcct>
        <Id>
          <Othr>
            <Id>34</Id>
          </Othr>
        </Id>
      </CdtrAcct>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;

    const dialogRef = this.dialog.open(XmlViewDialog, {
      width: '80%',
      maxWidth: '1200px',
      height: '90%',
      maxHeight: '800px',
      data: { xmlData: xmlData },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  sendEmail(data: SwiftMessage) {
    console.log('Sending email for:', data);
    // TODO: Implement email functionality
    // Example: this.emailService.sendEmail(data);
  }

  downloadPdf(data: SwiftMessage) {
    console.log('Downloading PDF for:', data);
    // TODO: Implement PDF download functionality
    // Example: this.pdfService.generatePdf(data);
  }

  processData(data: SwiftMessage) {
    console.log('Processing data for:', data);
    // TODO: Implement process functionality
    // Example: this.processService.processMessage(data);
  }
}

export interface SwiftMessage {
  msgRefNo: string;
  mtId: string;
  senderBic: string;
  makeBy: string;
  makeDt: string;
}
const ELEMENT_DATA: SwiftMessage[] = [
  { msgRefNo: 'ENDTO4', mtId: 'pacs-009', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '7/13/2021 3:25:17 PM' },
  { msgRefNo: '43534534', mtId: 'pacs-009', senderBic: 'ABBLBDDH010', makeBy: 'asd', makeDt: '7/14/2021 9:30:51 AM' },
  { msgRefNo: '00310901900040', mtId: 'pacs-009', senderBic: 'ABBLBDDH011', makeBy: 'roney', makeDt: '4/13/2022 11:37:58 AM' },
  { msgRefNo: 'ENDTO', mtId: 'pacs-009', senderBic: 'APULIT31010', makeBy: 'asd', makeDt: '7/13/2021 2:52:35 PM' },
  { msgRefNo: 'aaaaaaaaaaaaaa', mtId: 'pacs-009', senderBic: 'AAACKWKWXXX', makeBy: 'asd', makeDt: '10/6/2021 11:05:32 AM' },
  { msgRefNo: '003105219000390', mtId: 'pacs-009', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '4/26/2022 2:30:18 PM' },
  { msgRefNo: '00310521900039', mtId: 'pacs-009', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '5/8/2022 10:59:04 AM' },
  { msgRefNo: '00311211900110', mtId: 'pacs-008', senderBic: 'ACARIT21012', makeBy: 'roney', makeDt: '4/17/2022 3:29:42 PM' },
  { msgRefNo: '0031121190009', mtId: 'pacs-008', senderBic: 'ABBLBDDH011', makeBy: 'roney', makeDt: '4/18/2022 12:09:16 PM' },
  { msgRefNo: '00311211900090', mtId: 'pacs-008', senderBic: 'ABBLBDDH011', makeBy: 'roney', makeDt: '4/17/2022 1:25:35 PM' },
  { msgRefNo: '0031052190029', mtId: 'pacs-009', senderBic: 'APULIT31010', makeBy: 'roney', makeDt: '4/26/2022 1:03:26 PM' },
  { msgRefNo: '003105219000410', mtId: 'pacs-009', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '5/24/2022 3:10:35 PM' },
  { msgRefNo: 'qwwww', mtId: 'pacs-009', senderBic: 'IKBDDEDDDIR', makeBy: 'asd', makeDt: '7/18/2021 2:59:00 PM' },
  { msgRefNo: 'aaaaa', mtId: 'pacs-009', senderBic: 'AAAARSBGXXX', makeBy: 'asd', makeDt: '9/27/2021 5:50:41 PM' },
  { msgRefNo: 'BBBB/150928-ZZ/JO/164794', mtId: 'pacs-009', senderBic: 'ABOCCNBJ103', makeBy: 'roney', makeDt: '4/7/2022 3:59:28 PM' },
  { msgRefNo: '00311211900080', mtId: 'pacs-008', senderBic: 'ACARIT21013', makeBy: 'roney', makeDt: '4/13/2022 11:56:40 AM' },
  { msgRefNo: '00310522100020', mtId: 'pacs-009', senderBic: 'APULIT31010', makeBy: 'roney', makeDt: '4/17/2022 3:36:50 PM' },
  { msgRefNo: '135119020030', mtId: 'pacs-009', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '5/24/2022 5:52:51 PM' },
  { msgRefNo: '135119010060', mtId: 'pacs-009', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '5/25/2022 1:07:46 PM' },
  { msgRefNo: '0031125190032', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '7/20/2022 8:42:02 PM' },
  { msgRefNo: '0031121190023', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '7/28/2022 6:11:48 PM' },
  { msgRefNo: '0031121190025', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'admin', makeDt: '7/31/2022 3:51:06 PM' },
  { msgRefNo: '0031121190008', mtId: 'pacs-008', senderBic: 'ACARIT21013', makeBy: 'roney', makeDt: '6/16/2022 9:58:39 AM' },
  { msgRefNo: '0031121190015', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '7/21/2022 3:41:32 PM' },
  { msgRefNo: '0031121190020', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '7/28/2022 1:52:05 PM' },
  { msgRefNo: '0031121190026', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'asd', makeDt: '8/1/2022 3:16:02 PM' },
  { msgRefNo: '00310511900028-00028', mtId: 'pacs-009', senderBic: 'AGBKBDDH', makeBy: 'roney', makeDt: '8/1/2022 3:41:48 PM' },
  { msgRefNo: '00310511900029-00029', mtId: 'pacs-009', senderBic: 'AGBKBDDH', makeBy: 'roney', makeDt: '8/2/2022 4:42:12 PM' },
  { msgRefNo: '0031090190007', mtId: 'pacs-008', senderBic: 'ABOCCNBJ301', makeBy: 'roney', makeDt: '6/19/2022 4:38:10 PM' },
  { msgRefNo: '0031125190006', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '7/20/2022 10:59:17 AM' },
  { msgRefNo: '0031121190027', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '8/3/2022 12:48:59 PM' },
  { msgRefNo: '0031121190022', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'admin', makeDt: '7/28/2022 1:44:26 PM' },
  { msgRefNo: '0031121190021', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'asd', makeDt: '7/28/2022 1:48:43 PM' },
  { msgRefNo: '0031121190031', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'asd', makeDt: '8/8/2022 5:14:31 PM' },
  { msgRefNo: '00310511900030-00030', mtId: 'pacs-009', senderBic: 'UTBLBDDH432', makeBy: 'admin', makeDt: '8/7/2022 1:35:39 PM' },
  { msgRefNo: '0031121190028', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '8/29/2022 9:44:27 AM' },
  { msgRefNo: '0031125190033', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '7/20/2022 3:11:10 PM' },
  { msgRefNo: '00310511900027-00027', mtId: 'pacs-009', senderBic: 'AGBKBDDH', makeBy: 'roney', makeDt: '8/1/2022 1:06:56 PM' },
  { msgRefNo: '0031121190032', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '8/28/2022 11:39:49 AM' },
  { msgRefNo: '0031121190030', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'roney', makeDt: '8/29/2022 11:53:39 AM' },
  { msgRefNo: '0031121220001', mtId: 'pacs-008', senderBic: 'SJBLBDDHBNA', makeBy: 'admin', makeDt: '12/27/2022 3:54:07 PM' },
  { msgRefNo: '0031121220004', mtId: 'pacs-008', senderBic: 'SJBLBDDHBNA', makeBy: 'roney', makeDt: '5/1/2024 3:21:46 PM' },
  { msgRefNo: '0031121220005', mtId: 'pacs-008', senderBic: 'SJBLBDDHBNA', makeBy: 'admin', makeDt: '2/14/2023 2:13:47 PM' },
  { msgRefNo: '00310511900026-00026', mtId: 'pacs-009', senderBic: 'AGBKBDDH', makeBy: 'admin', makeDt: '8/11/2022 12:52:56 PM' },
  { msgRefNo: '1000121230003', mtId: 'pacs-008', senderBic: 'SJBLBDDHBNA', makeBy: 'roney', makeDt: '5/1/2024 3:22:51 PM' },
  { msgRefNo: '00310512200002-00002', mtId: 'pacs-009', senderBic: 'SJBLBDDHBNA', makeBy: 'roney', makeDt: '12/28/2022 11:42:17 AM' },
  { msgRefNo: '0031121190029', mtId: 'pacs-008', senderBic: 'UTBLBDDH432', makeBy: 'admin', makeDt: '9/11/2022 12:39:30 PM' },
  { msgRefNo: '0031125220001', mtId: 'pacs-008', senderBic: 'SJBLBDDHBNA', makeBy: 'admin', makeDt: '10/19/2022 5:05:37 PM' }
];
