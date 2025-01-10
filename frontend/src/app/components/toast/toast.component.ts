import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SystemMessageService } from '../../services/system-message.service';


@Component({
  selector: 'app-toast',
  template: `
    @if(message) {
      <div class="toast">
      {{ message }}
    </div>
    }

  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  message: string | null = null;

  constructor(
    private systemMessageService: SystemMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.systemMessageService.message$.subscribe((msg) => {
      this.message = msg;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.message = null;
        this.cdr.detectChanges();
      }, 3000);
    });
  }
}