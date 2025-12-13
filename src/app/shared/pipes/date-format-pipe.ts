import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date | null | undefined, format: string = 'dd/MM/yyyy'): string {
    // Handle null/undefined
    if (!value) return '';
    
    let date: Date;
    
    // Convert string to Date
    if (typeof value === 'string') {
      // Fix the microsecond issue
      const fixedString = value.replace(/(\.\d{3})\d+/, '$1');
      date = new Date(fixedString);
    } else if (value instanceof Date) {
      date = value;
    } else {
      // Try to parse as Date anyway
      date = new Date(value);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', value);
      return '';
    }
    
    // Format the date based on the requested format
    return this.formatDate(date, format);
  }
  
  private formatDate(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    switch(format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
        
      case 'dd/MM/yyyy HH:mm':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
        
      case 'dd/MM/yyyy HH:mm:ss':
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
        
      case 'relative': // Relative time (e.g., "2 days ago")
        return this.getRelativeTime(date);
        
      case 'full':
        // Arabic date format
        const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                             'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${day} ${arabicMonths[date.getMonth()]} ${year}`;
        
      default:
        return `${day}/${month}/${year}`;
    }
  }
  
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'الآن';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `قبل ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `قبل ${diffInDays} يوم`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `قبل ${diffInWeeks} أسبوع`;
    
    return this.formatDate(date, 'dd/MM/yyyy');
  }
}