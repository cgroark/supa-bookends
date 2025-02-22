import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export class SupabaseService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  async createUser(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }

  async login(email: string, password: string): Promise<any> {
      console.warn('SUPA', this.supabase);

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return data;

  }

  async logout(): Promise<void> {
    console.warn('LOGOUT this.supabase.auth', this.supabase.auth)
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw error;
    }
    this.clearAppState();
  }

  private clearAppState() {
    localStorage.removeItem('auth_token_bookends');
  }

  // // Get the current user
  // getCurrentUser() {
  //   return this.supabase.auth.user();
  // }

  // // Get current session
  // getSession() {
  //   return this.supabase.auth.session();
  // }

}
