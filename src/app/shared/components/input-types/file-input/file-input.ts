import {Component, computed, input, output, signal} from '@angular/core';
import {NgClass, NgIf, NgFor} from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
	selector: 'lds-file',
	imports: [
		NgClass,
		NgIf,
		NgFor,
		MatTooltipModule
	],
	templateUrl: './file-input.html',
	standalone: true,
	styleUrl: './file-input.scss'
})
export class FileComponent {

	// Optional form inputs to support required indicator
	readonly frmGroup = input<FormGroup>();
	readonly controlName = input<string>();

	// Inputs
	readonly id = input<string>('');
	readonly multipleFile = input<boolean>(false);
	readonly fileExtension = input<string>('*/*');
	readonly labelText = input<string>('Upload Files');
	readonly cssClass = input<string>('');
	readonly styles = input<string>('');
	readonly savePath = input<string>('');
	readonly customFileName = input<string>('');
	readonly visible = input<boolean>(true);
	readonly enable = input<boolean>(true);
	readonly tooltip = input<string>('');
	readonly isVertical = input<boolean>(false);
	// Outputs
	readonly selectedFilesChanged = output<File[]>();
	readonly onFileChanged = output<any>();
	readonly onInvalidFiles = output<{invalidFiles: File[], message: string}>();

	// Internal state
	public selectedFiles = signal<File[]>([]);
	isDragOver = signal<boolean>(false);
	fileNamesDisplay = computed(() => {
  const files = this.selectedFiles();
  if (files && files.length > 0) {
    return files.map(f => f.name).join(', ');
  }

  // When no files are selected, show extensions
  const ext = this.getDisplayExtensions();
  return `Choose file ${ext ? '(' + ext + ')' : ''}`;
});


/**
 * Format file size in human readable format
 */
formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension in uppercase
 */
getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
}

/**
 * Remove file by index
 */
removeFile(index: number): void {
  const currentFiles = this.selectedFiles();
  const newFiles = currentFiles.filter((_, i) => i !== index);
  
  this.selectedFiles.set(newFiles);
  this.selectedFilesChanged.emit(newFiles);
  
  // Also clear the file input if no files left
  if (newFiles.length === 0) {
    const inputEl = document.getElementById(this.id()) as HTMLInputElement;
    if (inputEl) {
      inputEl.value = '';
    }
  }
}


	isRequired(): boolean {
		const group = this.frmGroup();
		const name = this.controlName();
		if (!group || !name) return false;
		const control = group.get(name);
		if (!control?.validator) return false;
		const validation = control.validator({} as any);
		return !!validation?.['required'];
	}

	disabled = computed(() => !this.enable());
	containerClasses = computed(() => {
		const base = 'file-container';
		const custom = this.cssClass() || '';
		const visibility = this.visible() ? '' : 'hidden';
		return `${base} ${custom} ${visibility}`.trim();
	});

	acceptAttr(): string | null {
		const accept = this.fileExtension();
		return accept && accept.length > 0 ? accept : null;
	}

	/**
	 * Validates if files match the allowed extension(s)
	 */
	private validateFileExtensions(files: File[]): { validFiles: File[], invalidFiles: File[] } {
		const allowedExtensions = this.fileExtension();
		
		// If no extension specified or wildcard, allow all
		if (!allowedExtensions || allowedExtensions === '*/*' || allowedExtensions === '*') {
			return { validFiles: files, invalidFiles: [] };
		}

		const validFiles: File[] = [];
		const invalidFiles: File[] = [];

		// Parse allowed extensions - handle multiple extensions separated by comma
		const extensions = allowedExtensions.toLowerCase().split(',').map(ext => ext.trim());

		files.forEach(file => {
			const fileName = file.name.toLowerCase();
			const isValid = extensions.some(ext => {
				// Handle different extension formats: .pdf, pdf, *.pdf
				const cleanExt = ext.replace(/^\*\.?/, '').replace(/^\./, '');
				return fileName.endsWith('.' + cleanExt);
			});

			if (isValid) {
				validFiles.push(file);
			} else {
				invalidFiles.push(file);
			}
		});

		return { validFiles, invalidFiles };
	}

	/**
	 * Processes file selection with validation
	 */
	private processFiles(files: File[]): void {
		if (!files || files.length === 0) {
			this.selectedFiles.set([]);
			this.selectedFilesChanged.emit([]);
			return;
		}

		// Validate extensions
		const { validFiles, invalidFiles } = this.validateFileExtensions(files);

		// Handle invalid files
		if (invalidFiles.length > 0) {
			const allowedExt = this.fileExtension();
			const message = `Only ${allowedExt} files are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`;
			this.onInvalidFiles.emit({ invalidFiles, message });
		}

		// Handle multiple file restriction
		let finalFiles = validFiles;
		if (!this.multipleFile() && finalFiles.length > 1) {
			finalFiles = finalFiles.slice(0, 1);
		}

		// Update state and emit events
		this.selectedFiles.set(finalFiles);
		this.selectedFilesChanged.emit(finalFiles);
		
		if (finalFiles.length > 0) {
			this.onFileChanged.emit({ 
				files: finalFiles, 
				savePath: this.savePath(), 
				customFileName: this.customFileName() 
			});
		}
	}

	onFileInputChange(event: Event) {
		const inputEl = event.target as HTMLInputElement;
		const files = inputEl.files ? Array.from(inputEl.files) : [];
		this.processFiles(files);
	}

	onDrop(event: DragEvent) {
		event.preventDefault();
		this.isDragOver.set(false);
		
		if (!event.dataTransfer) return;
		
		const files = Array.from(event.dataTransfer.files || []);
		this.processFiles(files);
	}

	onDragOver(event: DragEvent) {
		event.preventDefault();
		this.isDragOver.set(true);
	}

	onDragLeave(event: DragEvent) {
		event.preventDefault();
		this.isDragOver.set(false);
	}

	/**
	 * Clear selected files
	 */
	clearFiles(): void {
		this.selectedFiles.set([]);
		this.selectedFilesChanged.emit([]);
		
		// Also clear the file input
		const inputEl = document.getElementById(this.id()) as HTMLInputElement;
		if (inputEl) {
			inputEl.value = '';
		}
	}

	/**
	 * Get readable extension list for display
	 */
getDisplayExtensions(): string {
  const ext = this.fileExtension();
  if (!ext || ext === '*/*' || ext === '*') return '';
  return ext.toLowerCase();
}

}