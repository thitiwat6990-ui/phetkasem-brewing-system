"use client";

import { useActionState } from 'react';
import { registerAction } from '@/actions/auth';
import { Beer, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark font-sans p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-amber/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-amber/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-bg-panel rounded-3xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden relative z-10 my-8">
        <div className="p-8 text-center bg-black/20 border-b border-white/5">
          <div className="w-16 h-16 bg-brand-amber/10 border border-brand-amber/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(255,191,0,0.2)]">
            <Beer className="w-8 h-8 text-brand-amber" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wider uppercase">Phetkasem</h1>
          <p className="text-brand-amber mt-1 font-bold text-sm tracking-widest uppercase">Brewery System</p>
        </div>
        
        <div className="p-8">
          <form action={formAction} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">First Name</label>
                <input 
                  type="text" 
                  name="first_name" 
                  required 
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Last Name</label>
                <input 
                  type="text" 
                  name="last_name" 
                  required 
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
              />
            </div>

            <hr className="border-white/5 my-4" />

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Username</label>
              <input 
                type="text" 
                name="username" 
                required 
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-bg-dark focus:bg-black/50 focus:ring-2 focus:ring-brand-amber/50 focus:border-brand-amber outline-none transition-all font-medium text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Confirm Password</label>
              <input 
                type="password" 
                name="confirm_password" 
                required 
                autoComplete="new-password"
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
              className="w-full bg-brand-amber hover:bg-brand-amber-dark text-black font-black py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,191,0,0.3)] disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 uppercase tracking-wide mt-4"
            >
              {isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-8 text-center space-y-4 text-sm font-medium border-t border-white/5 pt-6">
            <p className="text-text-secondary">Already have an account? <a href="/login" className="text-brand-amber hover:text-white font-bold transition-colors">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
