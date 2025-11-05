import { supabase } from '@/lib/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Ctx = { userId: string|null; loading: boolean; };
const AuthCtx = createContext<Ctx>({ userId: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Ctx>({ userId: null, loading: true });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setState({ userId: data.user?.id ?? null, loading: false });
      const { data: sub } = supabase.auth.onAuthStateChange((_ev, sess) => {
        setState({ userId: sess?.user?.id ?? null, loading: false });
      });
      return () => sub.subscription.unsubscribe();
    })();
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
