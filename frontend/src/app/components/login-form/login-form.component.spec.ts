import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LoginFormComponent } from './login-form.component';
import { SupabaseService } from '../../services/supabase.service';

describe('Login password reset requests', () => {
  let supabase: jasmine.SpyObj<SupabaseService>;
  beforeEach(() => {
    supabase = jasmine.createSpyObj<SupabaseService>('SupabaseService', ['requestPasswordReset', 'login']);
    supabase.requestPasswordReset.and.resolveTo();
    TestBed.configureTestingModule({ imports: [LoginFormComponent, RouterTestingModule], providers: [
      { provide: SupabaseService, useValue: supabase }
    ] });
  });
  it('prefills email and does not require a login password to request a link', async () => {
    const fixture = TestBed.createComponent(LoginFormComponent);
    const vm = fixture.componentInstance as any;
    vm.form.patchValue({ email: 'reader@example.com', password: 'old-password' });
    vm.openPasswordReset();
    expect(vm.resetForm.controls.email.value).toBe('reader@example.com');
    expect(vm.form.controls.password.value).toBeNull();
    await vm.sendResetEmail();
    expect(supabase.requestPasswordReset).toHaveBeenCalledOnceWith('reader@example.com');
    expect(vm.resetEmailSent).toBeTrue();
    fixture.destroy();
  });
  it('rejects invalid addresses without sending an email', async () => {
    const fixture = TestBed.createComponent(LoginFormComponent);
    const vm = fixture.componentInstance as any;
    vm.resetForm.controls.email.setValue('invalid');
    await vm.sendResetEmail();
    expect(supabase.requestPasswordReset).not.toHaveBeenCalled();
    fixture.destroy();
  });
  it('prevents duplicate submissions and recovers from send errors', async () => {
    let reject!: (reason: any) => void;
    supabase.requestPasswordReset.and.returnValue(new Promise<void>((_, fail) => reject = fail));
    const fixture = TestBed.createComponent(LoginFormComponent);
    const vm = fixture.componentInstance as any;
    vm.resetForm.controls.email.setValue('reader@example.com');
    const request = vm.sendResetEmail();
    await vm.sendResetEmail();
    expect(supabase.requestPasswordReset.calls.count()).toBe(1);
    reject({ code: 'over_email_send_rate_limit' });
    await request;
    expect(vm.isSendingReset).toBeFalse();
    expect(vm.resetError).toContain('Too many requests');
    fixture.destroy();
  });
  it('shows the email-only reset form and a generic confirmation after submit', async () => {
    const fixture = TestBed.createComponent(LoginFormComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.forgot-password').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[autocomplete="current-password"]')).toBeNull();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#reset-email');
    input.value = 'reader@example.com';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(supabase.requestPasswordReset).toHaveBeenCalledOnceWith('reader@example.com');
    expect(fixture.nativeElement.textContent).toContain('If an account uses this email');
    fixture.destroy();
  });

});
