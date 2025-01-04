import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export class SupabaseService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  async createUser(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    // The user is available in data.user
    console.warn('created in supa service', data.user )
    return data.user;
  }
}
