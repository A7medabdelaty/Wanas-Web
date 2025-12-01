import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'safeImageUrl'
})
export class SafeImageUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string | null | undefined, fallback: string = ''): SafeUrl {

    // لو مفيش URL
    if (!value) {
      return this.sanitizer.bypassSecurityTrustUrl(fallback);
    }

    // لو URL كامل (http / https) رجّعه زي ما هو
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return this.sanitizer.bypassSecurityTrustUrl(value);
    }

    // نضمن إن فيه سلاش في الأول
    const path = value.startsWith('/') ? value : `/${value}`;

    // Combine with backend base URL
    const fullUrl = `${environment.apiBaseUrl}${path}`;

    return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
  }
}
