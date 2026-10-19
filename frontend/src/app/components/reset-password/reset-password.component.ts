import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { SupabaseService } from '../../services/supabase.service';
import { passwordsMatchValidator } from '../../validators/passwords-match.validator';

@Component({
  selector: 'app-reset-password', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, HeaderComponent, SkeletonComponent],
  templateUrl: './reset-password.component.html', styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  protected phase: 'checking' | 'ready' | 'invalid' | 'success' = 'checking';
  protected isSubmitting = false;
  protected error: string | null = null;
  protected showPassword = false;
  protected showConfirmation = false;
  protected form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    passwordConfirm: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  }, { validators: passwordsMatchValidator() });

  constructor(private supabase: SupabaseService) {}
  async ngOnInit(): Promise<void> {
    try { this.phase = await this.supabase.preparePasswordRecovery() ? 'ready' : 'invalid'; }
    catch { this.phase = 'invalid'; }
  }
  protected async onSubmit(): Promise<void> {
    if (this.phase !== 'ready' || this.isSubmitting) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.error = null;
    try {
      await this.supabase.resetPassword(this.form.controls.password.value);
      this.form.reset();
      this.phase = 'success';
    } catch (error: any) {
      this.error = error?.code === 'same_password'
        ? 'Choose a password different from your current password.'
        : error?.code === 'weak_password'
          ? 'Choose a stronger password with a mix of letters, numbers, and symbols.'
          : 'Your password couldn’t be updated. Try again or request a new reset link.';
    } finally { this.isSubmitting = false; }
  }
}
