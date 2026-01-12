import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: 'img[appImageError]',
  standalone: true
})
export class ImageErrorDirective {
  @Input() fallbackImage: string = 'assets/images/LOGO.png';
  @Input() originalSrc: string = '';

  private hasError = false;

  constructor(private el: ElementRef) { }

  @HostListener('error')
  onError() {
    if (!this.hasError) {
      this.hasError = true;
      this.el.nativeElement.src = this.fallbackImage;
    }
  }

  @HostListener('load')
  onLoad() {
    this.hasError = false;
  }
} 