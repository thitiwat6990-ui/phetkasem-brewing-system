import AppShell from '@/components/AppShell';
import { BrewProvider } from '@/lib/BrewContext';
import { LanguageProvider } from '@/lib/i18nContext';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  let user;
  if (sessionCookie && sessionCookie.value) {
    try {
      user = JSON.parse(sessionCookie.value);
    } catch (e) {
      redirect('/login');
    }
  } else {
    redirect('/login');
  }

  return (
    <LanguageProvider>
      <BrewProvider>
        <AppShell user={user}>{children}</AppShell>
      </BrewProvider>
    </LanguageProvider>
  );
}
