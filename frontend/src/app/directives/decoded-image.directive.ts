import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

/** A loaded response can still be decoding; reveal only when pixels are ready. */
@Directive({ selector: 'img[appDecodedImage]', standalone: true })
export class DecodedImageDirective {
  @Output() imageReady = new EventEmitter<void>();
  @Output() imageFailed = new EventEmitter<void>();
  constructor(private element: ElementRef<HTMLImageElement>) {}

  @HostListener('load')
  async onLoad(): Promise<void> {
    const image = this.element.nativeElement;
    const source = image.src;
    try { await image.decode(); } catch { /* Some browsers reject decode for an already drawable image. */ }
    if (image.src !== source) return;
    if (image.complete && image.naturalWidth > 0) this.imageReady.emit();
    else this.imageFailed.emit();
  }

  @HostListener('error')
  onError(): void { this.imageFailed.emit(); }
}
