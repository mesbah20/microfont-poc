import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Converts every `\n` into a `<br>` so multi-line API messages render
 * with proper line breaks. Mirrors the demo's `nl2br` pipe.
 */
@Pipe({ name: 'newline', standalone: true })
export class NewlinePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    const escaped = this.escape(value);
    return this.sanitizer.bypassSecurityTrustHtml(escaped.replace(/\n/g, '<br>'));
  }

  private escape(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
