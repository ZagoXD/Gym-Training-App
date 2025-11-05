import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'expo-router';

export default function Index() {
  const { userId, loading } = useAuth();

  if (loading) return null;
  return userId ? <Redirect href="/(tabs)" /> : <Redirect href="/sign-in" />;
}
