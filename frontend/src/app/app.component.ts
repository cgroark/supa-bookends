import { SupabaseService } from './services/supabase.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // Initialize auth before route redirects can discard a recovery callback.
  constructor(private supabase: SupabaseService) {}
  title = 'frontend';
}
