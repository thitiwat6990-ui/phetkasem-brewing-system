"use client";

import { useActionState } from 'react';
import { registerAction } from '@/actions/auth';
import { Beer, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center bg-blue-600">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Beer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wider">Phetkasem</h1>
          <p className="text-blue-100 mt-2 font-medium">Brewery System</p>
        </div>
        
        <div className="p-8">
          <form action={formAction} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <input 
                type="text" 
                name="username" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                placeholder="Choose a username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                placeholder="Choose a password"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
              <input 
                type="password" 
                name="confirm_password" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                placeholder="Confirm your password"
              />
            </div>

            {state?.success === false && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{state.error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium">
            <p className="text-slate-500">Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
