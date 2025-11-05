import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [isLogged, setIsLogged] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setIsLogged(!!data.session);

      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setIsLogged(!!session);
      });
      setReady(true);
      return () => sub.subscription.unsubscribe();
    })();
  }, []);

  if (!ready) return null;
  return isLogged ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/sign-in" />;
}
