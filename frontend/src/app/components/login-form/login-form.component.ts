import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AuthService } from 'src/app/services/auth.service';
import { SystemMessageService } from '../../services/system-message.service';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  providers: [SupabaseService],
})
export class LoginFormComponent implements OnInit {
  protected form: FormGroup = new FormGroup({
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('',{
      validators: [Validators.required]}),
  });

  protected fromSignup = false;
  protected isSubmitting = false;
  protected loginError: string | null = null;

  constructor(private systemMessageService: SystemMessageService, private activatedRoute: ActivatedRoute, private authService: AuthService, private router: Router, private supabaseService: SupabaseService){}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      console.warn('params', params)
      const from = params['from'];
      if(from === 'signup') {
        this.fromSignup = true;
      }
    })
  }

  onSubmit() {
    console.warn('submit', this.form);
    if (this.form.invalid) {
      console.warn('Form is invalid');
      return;
    }
    this.isSubmitting = true;

    const { email, password } = this.form.value;

    const credentials = {
      email,
      password,
    };

    this.supabaseService
      .login(credentials.email, credentials.password)
      .then((response) => {
        this.isSubmitting = false;
        this.form.reset();
        this.loginError = null;
        this.authService.saveToken(response.session.access_token);
        this.systemMessageService.showMessage(`You've successfully logged in!`);
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error('Login failed:', error.message);
        this.loginError = error.message;
        this.systemMessageService.showMessage(`Login failed: ${error.message}`);
        this.isSubmitting = false;
    });
  }

  protected toggleType(event: any, target: HTMLInputElement) {
    event.preventDefault();
    target.type = target.type === 'password' ? 'text' : 'password';
  }
}
