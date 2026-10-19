import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';

/** Pin against the viewport, keeping the original slot for reliable reverse scrolling. */
@Directive({ selector: '[appStickySectionNav]', standalone: true })
export class StickySectionNavDirective implements AfterViewInit, OnDestroy {
  private frame = 0;
  private observer?: ResizeObserver;
  private readonly schedule = () => {
    if (!this.frame) this.frame = requestAnimationFrame(() => { this.frame = 0; this.update(); });
  };

  constructor(private element: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.schedule, { passive: true });
      window.addEventListener('resize', this.schedule);
      this.observer = new ResizeObserver(this.schedule);
      this.observer.observe(this.element.nativeElement);
      this.observer.observe(this.element.nativeElement.parentElement!);
      this.schedule();
    });
  }

  private update(): void {
    const nav = this.element.nativeElement;
    const slot = nav.parentElement!;
    const bounds = slot.getBoundingClientRect();
    const visible = nav.offsetHeight > 0;
    const pinned = visible && bounds.top <= 0;
    nav.classList.toggle('section-nav--pinned', pinned);
    if (pinned) {
      slot.style.minHeight = `${nav.offsetHeight}px`;
      const mobile = window.matchMedia('(max-width: 991.98px)').matches;
      nav.style.left = mobile ? '0px' : `${bounds.left}px`;
      nav.style.width = mobile ? '100%' : `${bounds.width}px`;
    } else {
      slot.style.removeProperty('min-height');
      nav.style.removeProperty('left');
      nav.style.removeProperty('width');
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.schedule);
    window.removeEventListener('resize', this.schedule);
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }
}
