import { Component, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-xml-view-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './xml-view-dialog.html',
  styleUrl: './xml-view-dialog.scss'
})
export class XmlViewDialog implements AfterViewInit {
  xmlData: string;
  title: string;
  subTitle: string;
  
  @ViewChild('xmlContainer', { static: false }) xmlContainer!: ElementRef<HTMLDivElement>;

  constructor(
    public dialogRef: MatDialogRef<XmlViewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { xmlData: string, title: string, subTitle: string }
  ) {
    this.xmlData = data.xmlData;
    this.title = data.title || 'XML Message Preview';
    this.subTitle = data.subTitle || 'Generated XML Content:';
    }
  
  ngAfterViewInit(): void {
    // Ensure horizontal scrollbar starts at the left when XML data loads
    // setTimeout(() => {
    //   if (this.xmlContainer && this.xmlContainer.nativeElement) {
    //     // Reset both vertical and horizontal scroll to start position
    //     this.xmlContainer.nativeElement.scrollTop = 0;
    //     this.xmlContainer.nativeElement.scrollLeft = 0;
        
    //     // Force scroll to left position
    //     this.xmlContainer.nativeElement.scrollTo({
    //       left: 0,
    //       top: 0,
    //       behavior: 'auto'
    //     });
    //   }
    // }, 200);
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.xmlData).then(() => {
      // You could add a toast notification here
      console.log('XML copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy XML: ', err);
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
