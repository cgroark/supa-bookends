import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';

/** Keep the slot in flow; render the pinned bar at document level, outside clipping/transform contexts. */
@Directive({ selector: '[appStickySectionNav]', standalone: true })
export class StickySectionNavDirective implements AfterViewInit, OnDestroy {
  private frame = 0;
  private observer?: ResizeObserver;
  private slot?: HTMLElement;
  private readonly schedule = () => {
    if (!this.frame) this.frame = requestAnimationFrame(() => { this.frame = 0; this.update(); });
  };

  constructor(private element: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.slot = this.element.nativeElement.parentElement!;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.schedule, { passive: true });
      document.addEventListener('scroll', this.schedule, { passive: true, capture: true });
      window.addEventListener('resize', this.schedule);
      window.visualViewport?.addEventListener('resize', this.schedule);
      window.visualViewport?.addEventListener('scroll', this.schedule);
      this.observer = new ResizeObserver(this.schedule);
      this.observer.observe(this.element.nativeElement);
      this.observer.observe(this.slot!);
      this.schedule();
    });
  }

  private update(): void {
    if (!this.slot) return;
    const nav = this.element.nativeElement;
    const slot = this.slot;
    const bounds = slot.getBoundingClientRect();
    const pinned = nav.offsetHeight > 0 && bounds.top <= 0 && slot.getClientRects().length > 0;
    if (pinned) {
      // Reserve space before moving so scrolling never changes the anchor's position.
      slot.style.minHeight = `${nav.offsetHeight}px`;
      const mobile = window.matchMedia('(max-width: 991.98px)').matches;
      nav.style.left = mobile ? '0px' : `${bounds.left}px`;
      nav.style.width = mobile ? '100%' : `${bounds.width}px`;
      nav.classList.add('section-nav--pinned');
      if (nav.parentElement !== document.body) document.body.appendChild(nav);
    } else {
      this.restore();
    }
  }

  private restore(): void {
    const nav = this.element.nativeElement;
    if (this.slot && nav.parentElement !== this.slot) this.slot.appendChild(nav);
    nav.classList.remove('section-nav--pinned');
    nav.style.removeProperty('left');
    nav.style.removeProperty('width');
    this.slot?.style.removeProperty('min-height');
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.schedule);
    document.removeEventListener('scroll', this.schedule, true);
    window.removeEventListener('resize', this.schedule);
    window.visualViewport?.removeEventListener('resize', this.schedule);
    window.visualViewport?.removeEventListener('scroll', this.schedule);
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    this.restore();
  }
}
