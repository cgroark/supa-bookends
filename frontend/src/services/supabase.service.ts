import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const SUPABASE_URL = 'your-supabase-url';
    const SUPABASE_KEY = 'your-anon-key';
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  async getItems() {
    const { data, error } = await this.supabase
      .from('items')
      .select('*');
    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }
    return data;
  }

  async addItem(item: any) {
    const { data, error } = await this.supabase
      .from('items')
      .insert(item);
    if (error) {
      console.error('Error adding item:', error);
      return null;
    }
    return data;
  }
}
