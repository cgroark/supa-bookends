import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { createClient, SupabaseClient, Subscription } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('Supabase auth client', {
  providedIn: 'root',
  factory: () => createClient(environment.supabaseUrl, environment.supabaseKey)
});
const RECOVERY_USER_KEY = 'bookends_password_recovery_user';

@Injectable({ providedIn: 'root' })
export class SupabaseService implements OnDestroy {
  private subscription: Subscription;
  private recoveryRequested: boolean;
  private recoveryLinkError: boolean;

  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private router: Router, @Inject(DOCUMENT) private document: Document) {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    this.recoveryRequested = hash.get('type') === 'recovery';
    this.recoveryLinkError = hash.has('error') || hash.has('error_code') || query.has('error_code') || query.has('error');
    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      // Keep callbacks synchronous: awaiting SDK calls here can deadlock its auth lock.
      if (event === 'PASSWORD_RECOVERY' && session) {
        this.recoveryRequested = true;
        sessionStorage.setItem(RECOVERY_USER_KEY, session.user.id);
        localStorage.removeItem('auth_token_bookends');
        void this.router.navigate(['/reset-password'], { replaceUrl: true });
      } else if (event === 'SIGNED_OUT') {
        this.clearAppState();
      }
    });
    this.subscription = data.subscription;
  }

  async createUser(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
  }

  async login(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.clearRecoveryState();
    return data;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const redirectTo = new URL('reset-password', this.document.baseURI).href;
    const { error } = await this.supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) throw error;
  }

  async preparePasswordRecovery(): Promise<boolean> {
    // The SDK processes the email's token fragment; never parse or persist tokens ourselves.
    const { error: initializationError } = await this.supabase.auth.initialize();
    this.removeRecoveryParams();
    if (initializationError || this.recoveryLinkError) {
      this.clearRecoveryState();
      return false;
    }
    const { data, error } = await this.supabase.auth.getSession();
    const session = data.session;
    const recoveryUser = sessionStorage.getItem(RECOVERY_USER_KEY);
    if (error || !session || (!this.recoveryRequested && recoveryUser !== session.user.id)) return false;
    // Validate against Auth, rather than trusting a previously stored session.
    const { data: verified, error: verificationError } = await this.supabase.auth.getUser();
    if (verificationError || !verified.user || verified.user.id !== session.user.id) {
      this.clearRecoveryState();
      return false;
    }
    sessionStorage.setItem(RECOVERY_USER_KEY, verified.user.id);
    return true;
  }

  async resetPassword(password: string): Promise<void> {
    if (!(await this.preparePasswordRecovery())) throw new Error('This reset link has expired. Please request a new one.');
    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) throw error;
    this.clearAppState();
    // A failed cleanup must not report that an already-completed password change failed.
    try { await this.supabase.auth.signOut({ scope: 'local' }); } catch { /* Next login replaces the local session. */ }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    this.clearAppState();
  }

  private removeRecoveryParams(): void {
    if (window.location.pathname.endsWith('/reset-password')) {
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
  }
  private clearRecoveryState(): void {
    sessionStorage.removeItem(RECOVERY_USER_KEY);
    this.recoveryRequested = false;
  }
  private clearAppState(): void {
    localStorage.removeItem('auth_token_bookends');
    this.clearRecoveryState();
  }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
}
