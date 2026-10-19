import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { StickySectionNavDirective } from './sticky-section-nav.directive';

@Component({ standalone: true, imports: [StickySectionNavDirective], template: '<div class="section-nav-slot"><nav class="section-nav" appStickySectionNav>Sections</nav></div>' })
class HostComponent {}

describe('StickySectionNavDirective', () => {
  it('pins at the viewport top and returns to its original slot on reverse scrolling', fakeAsync(() => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    const slot: HTMLElement = fixture.nativeElement.querySelector('.section-nav-slot');
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    let top = 150;
    spyOn(slot, 'getBoundingClientRect').and.callFake(() => new DOMRect(16, top, 320, 60));
    spyOnProperty(nav, 'offsetHeight', 'get').and.returnValue(60);
    fixture.detectChanges();
    tick(20);
    expect(nav.classList.contains('section-nav--pinned')).toBeFalse();
    top = -20;
    window.dispatchEvent(new Event('scroll'));
    tick(20);
    expect(nav.classList.contains('section-nav--pinned')).toBeTrue();
    expect(slot.style.minHeight).toBe('60px');
    top = 100;
    window.dispatchEvent(new Event('scroll'));
    tick(20);
    expect(nav.classList.contains('section-nav--pinned')).toBeFalse();
    expect(slot.style.minHeight).toBe('');
    expect(nav.style.left).toBe('');
    fixture.destroy();
    fixture.nativeElement.remove();
  }));
});

@Component({ standalone: true, imports: [StickySectionNavDirective], template: '<section style="transform: translateZ(0); overflow: hidden"><div style="height: 400px"></div><div class="section-nav-slot"><nav class="section-nav" appStickySectionNav>Sections</nav></div><div style="height: 2000px"></div></section>' })
class ScrollHostComponent {}

describe('Section nav browser scrolling', () => {
  it('stays flush to the viewport and returns without a layout jump', fakeAsync(() => {
    const fixture = TestBed.createComponent(ScrollHostComponent);
    const host: HTMLElement = fixture.nativeElement;
    document.body.appendChild(host);
    window.scrollTo(0, 0);
    fixture.detectChanges();
    tick(20);
    const slot: HTMLElement = host.querySelector('.section-nav-slot')!;
    const nav: HTMLElement = host.querySelector('nav')!;
    const originalTop = slot.getBoundingClientRect().top;
    window.scrollTo(0, originalTop + 100);
    window.dispatchEvent(new Event('scroll'));
    tick(20);
    expect(nav.classList.contains('section-nav--pinned')).toBeTrue();
    expect(nav.getBoundingClientRect().top).toBe(0);
    expect(slot.offsetHeight).toBe(nav.offsetHeight);
    expect(nav.parentElement).toBe(document.body);
    // Continue down past the middle of a long page and right to its bottom.
    for (const position of [originalTop + 800, document.documentElement.scrollHeight - window.innerHeight]) {
      window.scrollTo(0, position);
      window.dispatchEvent(new Event('scroll'));
      tick(20);
      expect(nav.classList.contains('section-nav--pinned')).toBeTrue();
      expect(nav.getBoundingClientRect().top).toBe(0);
    }
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('scroll'));
    tick(20);
    expect(nav.classList.contains('section-nav--pinned')).toBeFalse();
    expect(nav.getBoundingClientRect().top).toBeCloseTo(originalTop, 0);
    expect(nav.parentElement).toBe(slot);
    fixture.destroy();
    host.remove();
  }));
});
