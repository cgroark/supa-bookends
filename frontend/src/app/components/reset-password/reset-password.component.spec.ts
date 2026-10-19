import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { SupabaseService } from '../../services/supabase.service';

describe('Reset password page', () => {
  let supabase: jasmine.SpyObj<SupabaseService>;
  beforeEach(() => {
    supabase = jasmine.createSpyObj<SupabaseService>('SupabaseService', ['preparePasswordRecovery', 'resetPassword']);
    supabase.preparePasswordRecovery.and.resolveTo(true);
    supabase.resetPassword.and.resolveTo();
    TestBed.configureTestingModule({ imports: [ResetPasswordComponent, RouterTestingModule], providers: [{ provide: SupabaseService, useValue: supabase }] });
  });
  it('disables recovery when the link is invalid', async () => {
    supabase.preparePasswordRecovery.and.resolveTo(false);
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const vm = fixture.componentInstance as any;
    await vm.ngOnInit();
    expect(vm.phase).toBe('invalid');
    await vm.onSubmit();
    expect(supabase.resetPassword).not.toHaveBeenCalled();
    fixture.destroy();
  });
  it('requires matching passwords with at least eight characters', async () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const vm = fixture.componentInstance as any;
    await vm.ngOnInit();
    vm.form.setValue({ password: 'short', passwordConfirm: 'short' });
    await vm.onSubmit();
    vm.form.setValue({ password: 'long-password', passwordConfirm: 'different-password' });
    await vm.onSubmit();
    expect(supabase.resetPassword).not.toHaveBeenCalled();
    fixture.destroy();
  });
  it('saves once, clears the form, and displays success', async () => {
    let resolve!: () => void;
    supabase.resetPassword.and.returnValue(new Promise<void>(done => resolve = done));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const vm = fixture.componentInstance as any;
    await vm.ngOnInit();
    vm.form.setValue({ password: 'new-password', passwordConfirm: 'new-password' });
    const request = vm.onSubmit();
    await vm.onSubmit();
    expect(supabase.resetPassword).toHaveBeenCalledOnceWith('new-password');
    resolve();
    await request;
    expect(vm.phase).toBe('success');
    expect(vm.form.controls.password.value).toBe('');
    fixture.destroy();
  });
  it('renders the new-password form only after verification and shows success after saving', async () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#new-password')).toBeNull();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#new-password')).toBeTruthy();
    for (const id of ['new-password', 'confirm-password']) {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#' + id);
      input.value = 'new-password';
      input.dispatchEvent(new Event('input'));
    }
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(supabase.resetPassword).toHaveBeenCalledOnceWith('new-password');
    expect(fixture.nativeElement.textContent).toContain('Password updated');
    expect(fixture.nativeElement.querySelector('#new-password')).toBeNull();
    fixture.destroy();
  });

});
