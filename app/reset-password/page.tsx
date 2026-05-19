"use client";

import { useActionState, useEffect, useState } from 'react';
import { resetPasswordAction } from '@/actions/auth';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, undefined);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      router.push('/login');
    } else {
      setToken(urlToken);
    }
  }, [searchParams, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark font-sans p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-amber/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-amber/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-bg-panel rounded-3xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden relative z-10">
        <div className="p-8 text-center bg-black/20 border-b border-white/5">
          <div className="w-16 h-16 bg-brand-amber/10 border border-brand-amber/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(255,191,0,0.2)]">
            <KeyRound className="w-8 h-8 text-brand-amber" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">Set New Password</h1>
        </div>
        
        <div className="p-8">
          {state?.success ? (
            <div className="text-center space-y-6">
              <div className="bg-brand-green/10 text-brand-green p-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-brand-green/20">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{state.message}</p>
              </div>
              <Link href="/login" className="w-full inline-block bg-brand-amber text-black font-black py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,191,0,0.3)] uppercase tracking-wide">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="token" value={token} />
              
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
                />
              </div>

              {state?.success === false && (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{state.error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-brand-amber hover:bg-brand-amber-dark text-black font-black py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,191,0,0.3)] disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-wide mt-4"
              >
                {isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
