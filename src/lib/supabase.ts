import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          is_creator: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          is_creator?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          is_creator?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      mentors: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          title: string;
          description: string;
          avatar_url?: string;
          price: number;
          expertise: string[];
          status: 'draft' | 'active' | 'paused';
          subscribers_count: number;
          conversations_count: number;
          revenue: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          title: string;
          description: string;
          avatar_url?: string;
          price: number;
          expertise: string[];
          status?: 'draft' | 'active' | 'paused';
          subscribers_count?: number;
          conversations_count?: number;
          revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          name?: string;
          title?: string;
          description?: string;
          avatar_url?: string;
          price?: number;
          expertise?: string[];
          status?: 'draft' | 'active' | 'paused';
          subscribers_count?: number;
          conversations_count?: number;
          revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          mentor_id: string;
          status: 'active' | 'cancelled' | 'expired';
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mentor_id: string;
          status?: 'active' | 'cancelled' | 'expired';
          created_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mentor_id?: string;
          status?: 'active' | 'cancelled' | 'expired';
          created_at?: string;
          expires_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          mentor_id: string;
          messages: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mentor_id: string;
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mentor_id?: string;
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};