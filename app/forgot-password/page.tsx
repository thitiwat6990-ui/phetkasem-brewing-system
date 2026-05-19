"use client";

import { useActionState } from 'react';
import { forgotPasswordAction } from '@/actions/auth';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark font-sans p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-amber/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-amber/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-bg-panel rounded-3xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden relative z-10">
        <div className="p-8 text-center bg-black/20 border-b border-white/5">
          <div className="w-16 h-16 bg-brand-amber/10 border border-brand-amber/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(255,191,0,0.2)]">
            <Mail className="w-8 h-8 text-brand-amber" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">Reset Password</h1>
          <p className="text-text-secondary mt-2 text-sm">Enter your registered email address</p>
        </div>
        
        <div className="p-8">
          {state?.success ? (
            <div className="text-center space-y-6">
              <div className="bg-brand-green/10 text-brand-green p-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-brand-green/20">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{state.message}</p>
              </div>
              <Link href="/login" className="block text-brand-amber font-bold hover:text-white transition-colors">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
                  placeholder="admin@example.com"
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
                className="w-full bg-brand-amber hover:bg-brand-amber-dark text-black font-black py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,191,0,0.3)] disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 uppercase tracking-wide mt-4"
              >
                {isPending ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-text-secondary hover:text-brand-amber font-bold transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
