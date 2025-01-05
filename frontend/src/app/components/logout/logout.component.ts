import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
  providers: [SupabaseService],

})
export class LogoutComponent {
  constructor(private supabaseService: SupabaseService, private router: Router){}

  async logout() {
    try {
      await this.supabaseService.logout();
      // Handle redirection after successful logout
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}
