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
})
export class LoginFormComponent implements OnInit {
  protected form: FormGroup = new FormGroup({
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('',{
      validators: [Validators.required]}),
  });

  protected showResetForm = false;
  protected resetEmailSent = false;
  protected resetError: string | null = null;
  protected isSendingReset = false;
  protected resetForm = new FormGroup({ email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }) });

  protected openPasswordReset(): void {
    this.resetForm.controls.email.setValue(this.form.controls['email'].value?.trim() ?? '');
    this.form.controls['password'].reset();
    this.resetEmailSent = false;
    this.resetError = null;
    this.showResetForm = true;
  }

  protected async sendResetEmail(): Promise<void> {
    if (this.isSendingReset) return;
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) return;
    this.isSendingReset = true;
    this.resetError = null;
    try {
      await this.supabaseService.requestPasswordReset(this.resetForm.controls.email.value);
      this.resetEmailSent = true;
    } catch (error: any) {
      this.resetError = ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error?.code)
        ? 'Too many requests. Please wait a little before trying again.'
        : 'We couldn’t send the reset link. Please try again.';
    } finally { this.isSendingReset = false; }
  }

  protected fromSignup = false;
  protected isSubmitting = false;
  protected loginError: string | null = null;

  constructor(private systemMessageService: SystemMessageService, private activatedRoute: ActivatedRoute, private authService: AuthService, private router: Router, private supabaseService: SupabaseService){}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const from = params['from'];
      if (from === 'reset') this.showResetForm = true;
      if(from === 'signup') {
        this.fromSignup = true;
      }
    })
  }

  onSubmit() {
    if (this.isSubmitting) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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
