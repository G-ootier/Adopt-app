import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';
import type { Profile, Shelter, UserRole } from './types';
import type { User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  shelter: Shelter | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

async function fetchShelter(userId: string): Promise<Shelter | null> {
  const { data, error } = await supabase
    .from('shelters')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as Shelter;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUserData(currentUser: User | null) {
    if (!currentUser) {
      setProfile(null);
      setShelter(null);
      return;
    }

    const userProfile = await fetchProfile(currentUser.id);
    setProfile(userProfile);

    if (userProfile?.role === 'shelter') {
      const userShelter = await fetchShelter(currentUser.id);
      setShelter(userShelter);
    } else {
      setShelter(null);
    }
  }

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadUserData(currentUser).finally(() => setIsLoading(false));
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadUserData(currentUser);

      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the reset link — send them to the new password screen
        router.replace('/(auth)/reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }

  async function signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          display_name: displayName,
        },
      },
    });

    if (error) return { error };

    // If the trigger didn't create a profile, create it client-side
    if (data.user) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          role,
          display_name: displayName,
        });
      }
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setShelter(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, shelter, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
