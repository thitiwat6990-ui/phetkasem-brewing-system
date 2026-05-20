import AppShell from '@/components/AppShell';
import { BrewProvider } from '@/lib/BrewContext';
import { LanguageProvider } from '@/lib/i18nContext';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getInitialState } from '@/actions/data';

async function BrewDataProvider({ children, user }: { children: React.ReactNode, user: any }) {
  const result = await getInitialState();
  const initialData = result.success ? result.data : undefined;

  return <BrewProvider initialData={initialData} user={user}>{children}</BrewProvider>;
}

function DashboardSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-bg-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-amber/20 border-t-brand-amber rounded-full animate-spin"></div>
        <p className="text-brand-amber font-bold animate-pulse tracking-widest uppercase text-sm">Loading Brewery Data...</p>
      </div>
    </div>
  );
}

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
      <AppShell user={user}>
        <Suspense fallback={<DashboardSkeleton />}>
          <BrewDataProvider user={user}>
            {children}
          </BrewDataProvider>
        </Suspense>
      </AppShell>
    </LanguageProvider>
  );
}
