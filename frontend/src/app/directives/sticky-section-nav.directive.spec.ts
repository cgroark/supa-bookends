import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { StickySectionNavDirective } from './sticky-section-nav.directive';

@Component({ standalone: true, imports: [StickySectionNavDirective], template: '<div class="section-nav-slot"><nav class="section-nav" appStickySectionNav>Sections</nav></div>' })
class HostComponent {}

describe('StickySectionNavDirective', () => {
  it('pins at the viewport top and returns to its original slot on reverse scrolling', fakeAsync(() => {
    const fixture = TestBed.createComponent(HostComponent);
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
  }));
});

@Component({ standalone: true, imports: [StickySectionNavDirective], template: '<div style="height: 400px"></div><div class="section-nav-slot"><nav class="section-nav" appStickySectionNav>Sections</nav></div><div style="height: 2000px"></div>' })
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
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('scroll'));
    tick(20);
    expect(nav.classList.contains('section-nav--pinned')).toBeFalse();
    expect(nav.getBoundingClientRect().top).toBeCloseTo(originalTop, 0);
    fixture.destroy();
    host.remove();
  }));
});
