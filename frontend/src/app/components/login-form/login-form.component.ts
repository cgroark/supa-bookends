import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AuthService } from 'src/app/services/auth.service';
import {Router, RouterModule} from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  providers: [SupabaseService],
})
export class LoginFormComponent {
  protected form: FormGroup = new FormGroup({
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('',{
      validators: [Validators.required]}),
  });

  constructor(private authService: AuthService, private router: Router, private supabaseService: SupabaseService){}

  onSubmit() {
    console.warn('submit', this.form);
    if (this.form.invalid) {
      console.warn('Form is invalid');
      return;
    }

    const { email, password } = this.form.value;

    const credentials = {
      email,
      password,
    };

    this.supabaseService
      .login(credentials.email, credentials.password)
      .then((response) => {
        console.log('Login successful:', response);
        this.authService.saveToken(response.session.access_token); // Save the JWT
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Login failed:', error.message);
    });
  }

  protected toggleType(event: any, target: HTMLInputElement) {
    event.preventDefault();
    target.type = target.type === 'password' ? 'text' : 'password';
  }
}
