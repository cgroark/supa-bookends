import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {
  @Input() variant: 'cover' | 'reading' | 'shelf' | 'friend' | 'goal' | 'heading' = 'shelf';
  @Input() count = 3;
  @Input() light = false;
  @Input() compact = false;
  @Input() framed = false;
  @Input() label = 'Loading books';

  protected get placeholders(): number[] {
    return Array.from({ length: Math.min(12, Math.max(0, this.count)) }, (_, index) => index);
  }
}
