import { ElementRef } from '@angular/core';
import { DecodedImageDirective } from './decoded-image.directive';

describe('DecodedImageDirective', () => {
  it('waits for decoding before announcing the cover is visible', async () => {
    const image = document.createElement('img');
    image.src = 'cover.jpg';
    Object.defineProperty(image, 'complete', { value: true });
    Object.defineProperty(image, 'naturalWidth', { value: 80 });
    let finish!: () => void;
    spyOn(image, 'decode').and.returnValue(new Promise<void>(resolve => { finish = resolve; }));
    const directive = new DecodedImageDirective(new ElementRef(image));
    const ready = spyOn(directive.imageReady, 'emit');
    const loading = directive.onLoad();
    expect(ready).not.toHaveBeenCalled();
    finish();
    await loading;
    expect(ready).toHaveBeenCalledTimes(1);
  });
  it('ignores an old decode when the source changes', async () => {
    const image = document.createElement('img');
    image.src = 'first.jpg';
    let finish!: () => void;
    spyOn(image, 'decode').and.returnValue(new Promise<void>(resolve => { finish = resolve; }));
    const directive = new DecodedImageDirective(new ElementRef(image));
    const ready = spyOn(directive.imageReady, 'emit');
    const failed = spyOn(directive.imageFailed, 'emit');
    const loading = directive.onLoad();
    image.src = 'second.jpg';
    finish();
    await loading;
    expect(ready).not.toHaveBeenCalled();
    expect(failed).not.toHaveBeenCalled();
  });
});
