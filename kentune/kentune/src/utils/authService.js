import { supabase } from '../lib/supabase';

export const authService = {
  // Get current user session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase?.auth?.getSession();
      if (error) {
        return { session: null, error: error?.message };
      }
      return { session, error: null };
    } catch (error) {
      return { session: null, error: 'Failed to get session' };
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase?.auth?.getUser();
      if (error) {
        return { user: null, error: error?.message };
      }
      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to get user' };
    }
  },

  // Get user profile from user_profiles table
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();

      if (error) {
        return { profile: null, error: error?.message };
      }
      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error: 'Failed to get user profile' };
    }
  },

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        return { data: null, error: 'Cannot connect to authentication service. Please check your internet connection.' };
      }
      return { data: null, error: 'Registration failed. Please try again.' };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { data: null, error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive.' };
      }
      return { data: null, error: 'Sign in failed. Please try again.' };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase?.auth?.signOut();
      if (error) {
        return { error: error?.message };
      }
      return { error: null };
    } catch (error) {
      return { error: 'Sign out failed. Please try again.' };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      });
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Password reset failed. Please try again.' };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', userId)?.select()?.single();

      if (error) {
        return { data: null, error: error?.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Profile update failed. Please try again.' };
    }
  },

  // Update user metadata in auth.users
  async updateUserMetadata(metadata) {
    try {
      const { data, error } = await supabase?.auth?.updateUser({
        data: metadata
      });

      if (error) {
        return { data: null, error: error?.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Metadata update failed. Please try again.' };
    }
  },

  // Check if user is admin
  async isAdmin(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('role')?.eq('id', userId)?.single();

      if (error) {
        return { isAdmin: false, error: error?.message };
      }

      return { isAdmin: data?.role === 'admin', error: null };
    } catch (error) {
      return { isAdmin: false, error: 'Role check failed' };
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.order('created_at', { ascending: false });

      if (error) {
        return { users: [], error: error?.message };
      }

      return { users: data, error: null };
    } catch (error) {
      return { users: [], error: 'Failed to fetch users' };
    }
  }
};