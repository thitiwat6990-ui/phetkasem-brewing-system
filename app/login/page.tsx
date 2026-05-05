"use client";

import { useActionState } from 'react';
import { loginAction } from '@/actions/auth';
import { Beer, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

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
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                placeholder="Enter your password"
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
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-8 text-center space-y-4 text-sm font-medium">
            <p className="text-slate-500">Don't have an account? <a href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">Sign up</a></p>
            <p className="text-slate-500">Default credentials: <strong className="text-slate-800">admin</strong> / <strong className="text-slate-800">admin123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
