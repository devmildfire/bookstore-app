import { supabase } from 'api/supabase-client';

export const adminAPI = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
};
