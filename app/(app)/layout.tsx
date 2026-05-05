import AppShell from '@/components/AppShell';
import { BrewProvider } from '@/lib/BrewContext';
import { cookies } from 'next/headers';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  let user;
  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch (e) {}
  }

  return (
    <BrewProvider>
      <AppShell user={user}>{children}</AppShell>
    </BrewProvider>
  );
}
