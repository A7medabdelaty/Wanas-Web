import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'safeImageUrl',
  standalone: true
})
export class SafeImageUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string | null | undefined, fallback: string = '/assets/images/placeholder.jpg'): SafeUrl {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustUrl(fallback);
    }

    // لو URL كامل (http / https)
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return this.sanitizer.bypassSecurityTrustUrl(value);
    }

    // لو فيه سلاش في آخر الـ apiUrl أو أول path نتجنب تكرار السلاش
    const baseUrl = environment.apiUrl.endsWith('/')
      ? environment.apiUrl.slice(0, -1)
      : environment.apiUrl;

    const path = value.startsWith('/') ? value : `/${value}`;
    const fullUrl = `${baseUrl}${path}`;

    return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
  }
}
