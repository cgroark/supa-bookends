import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SupabaseService, SUPABASE_CLIENT } from './supabase.service';

const recoveryKey = 'bookends_password_recovery_user';
describe('Supabase password recovery', () => {
  let auth: any;
  let callback: (event: string, session: any) => void;
  let router: { navigate: jasmine.Spy };
  let originalUrl: string;
  let originalMarker: string | null;
  let originalToken: string | null;
  const session = { user: { id: 'recovery-user' }, access_token: 'test-session' };

  beforeEach(() => {
    originalUrl = window.location.href;
    originalMarker = sessionStorage.getItem(recoveryKey);
    originalToken = localStorage.getItem('auth_token_bookends');
    sessionStorage.removeItem(recoveryKey);
    history.replaceState({}, '', '/reset-password');
    auth = jasmine.createSpyObj('auth', ['onAuthStateChange', 'initialize', 'getSession', 'getUser', 'resetPasswordForEmail', 'updateUser', 'signOut']);
    auth.onAuthStateChange.and.callFake((listener: any) => {
      callback = listener;
      return { data: { subscription: { unsubscribe: jasmine.createSpy('unsubscribe') } } };
    });
    auth.initialize.and.resolveTo({ error: null });
    auth.getSession.and.resolveTo({ data: { session }, error: null });
    auth.getUser.and.resolveTo({ data: { user: session.user }, error: null });
    auth.resetPasswordForEmail.and.resolveTo({ error: null });
    auth.updateUser.and.resolveTo({ error: null });
    auth.signOut.and.resolveTo({ error: null });
    router = { navigate: jasmine.createSpy('navigate').and.resolveTo(true) };
    TestBed.configureTestingModule({ providers: [
      { provide: SUPABASE_CLIENT, useValue: { auth } }, { provide: Router, useValue: router }
    ] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    history.replaceState({}, '', originalUrl);
    originalMarker === null ? sessionStorage.removeItem(recoveryKey) : sessionStorage.setItem(recoveryKey, originalMarker);
    originalToken === null ? localStorage.removeItem('auth_token_bookends') : localStorage.setItem('auth_token_bookends', originalToken);
  });

  it('uses the reset-email action and a same-site recovery redirect', async () => {
    const service = TestBed.inject(SupabaseService);
    await service.requestPasswordReset(' reader@example.com ');
    expect(auth.resetPasswordForEmail).toHaveBeenCalledOnceWith('reader@example.com', {
      redirectTo: new URL('reset-password', document.baseURI).href
    });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it('accepts a valid recovery callback even before the deferred recovery event arrives', async () => {
    history.replaceState({}, '', '/reset-password#type=recovery&access_token=test');
    const service = TestBed.inject(SupabaseService);
    expect(await service.preparePasswordRecovery()).toBeTrue();
    expect(auth.initialize).toHaveBeenCalled();
    expect(auth.getUser).toHaveBeenCalled();
    expect(window.location.hash).toBe('');
    expect(sessionStorage.getItem(recoveryKey)).toBe('recovery-user');
  });

  it('routes recovery events to the recovery page without granting the app a login token', () => {
    TestBed.inject(SupabaseService);
    localStorage.setItem('auth_token_bookends', 'previous-login');
    callback('PASSWORD_RECOVERY', session);
    expect(router.navigate).toHaveBeenCalledWith(['/reset-password'], { replaceUrl: true });
    expect(localStorage.getItem('auth_token_bookends')).toBeNull();
  });

  it('rejects direct access with an ordinary login session', async () => {
    const service = TestBed.inject(SupabaseService);
    expect(await service.preparePasswordRecovery()).toBeFalse();
    await expectAsync(service.resetPassword('new-password')).toBeRejected();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejects expired links even when an older login session exists', async () => {
    history.replaceState({}, '', '/reset-password#type=recovery&error_code=otp_expired');
    auth.initialize.and.resolveTo({ error: new Error('expired') });
    const service = TestBed.inject(SupabaseService);
    expect(await service.preparePasswordRecovery()).toBeFalse();
    expect(auth.getUser).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(recoveryKey)).toBeNull();
  });

  it('permits refresh only for the verified recovery user', async () => {
    sessionStorage.setItem(recoveryKey, 'recovery-user');
    const service = TestBed.inject(SupabaseService);
    expect(await service.preparePasswordRecovery()).toBeTrue();
    auth.getUser.and.resolveTo({ data: { user: { id: 'different-user' } }, error: null });
    expect(await service.preparePasswordRecovery()).toBeFalse();
    expect(sessionStorage.getItem(recoveryKey)).toBeNull();
  });

  it('updates the password and clears both recovery state and the local app login', async () => {
    const service = TestBed.inject(SupabaseService);
    callback('PASSWORD_RECOVERY', session);
    await service.resetPassword('new-password');
    expect(auth.updateUser).toHaveBeenCalledOnceWith({ password: 'new-password' });
    expect(auth.signOut).toHaveBeenCalledOnceWith({ scope: 'local' });
    expect(sessionStorage.getItem(recoveryKey)).toBeNull();
    expect(localStorage.getItem('auth_token_bookends')).toBeNull();
    expect(await service.preparePasswordRecovery()).toBeFalse();
  });

  it('preserves recovery state when the password update fails, allowing a retry', async () => {
    const service = TestBed.inject(SupabaseService);
    callback('PASSWORD_RECOVERY', session);
    auth.updateUser.and.resolveTo({ error: new Error('password too weak') });
    await expectAsync(service.resetPassword('new-password')).toBeRejected();
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(recoveryKey)).toBe('recovery-user');
  });
});
