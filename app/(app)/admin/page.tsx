"use client";

import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, deleteUserAction, createAccountAction } from '@/actions/users';
import { Shield, ShieldAlert, ShieldCheck, Plus, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18nContext';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      loadUsers();
    } else {
      alert(res.error || 'Failed to update');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    const res = await deleteUserAction(userId);
    if (res.success) {
      loadUsers();
    } else {
      alert(res.error || 'Failed to delete user');
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createAccountAction(formData);

    if (res.success) {
      setIsAddModalOpen(false);
      loadUsers();
    } else {
      setAddError(res.error || 'Failed to create account');
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="p-8 text-white flex items-center justify-center min-h-[50vh]">Loading...</div>;

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-amber" />
            {t('Admin')}
          </h1>
          <p className="text-text-secondary mt-2">Manage user accounts and system roles.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-amber text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-amber-dark transition-colors shadow-[0_0_15px_rgba(255,191,0,0.2)]"
        >
          <Plus className="w-5 h-5" />
          Add New Account
        </button>
      </header>

      <div className="bg-bg-panel border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider w-16">ID</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Username</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm font-bold text-text-muted">#{user.id}</td>
                  <td className="p-4 text-sm font-black text-white tracking-wide">@{user.username}</td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">{user.first_name} {user.last_name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-white">{user.email}</div>
                    <div className="text-xs text-text-muted mt-0.5">{user.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      user.role === 'Master brewer' || user.role === 'admin' 
                        ? 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20' 
                        : 'bg-white/5 text-text-secondary border border-white/10'
                    }`}>
                      {user.role === 'Master brewer' || user.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-brand-amber cursor-pointer"
                      >
                        <option value="employee">employee</option>
                        <option value="Master brewer">Master brewer</option>
                      </select>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted text-sm font-bold">
                    No users found or unauthorized.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-amber" />
                Add New Account
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleAddUser} className="space-y-4">
                {addError && (
                  <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-xl border border-red-500/20 font-semibold">
                    {addError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">First Name *</label>
                    <input type="text" name="first_name" required className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-brand-amber outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Last Name *</label>
                    <input type="text" name="last_name" required className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-brand-amber outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Username *</label>
                  <input type="text" name="username" required className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-brand-amber outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Password *</label>
                  <input type="password" name="password" required className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-brand-amber outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" name="email" className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-brand-amber outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Phone</label>
                  <input type="tel" name="phone" className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-brand-amber outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Role *</label>
                  <select name="role" required className="w-full bg-bg-dark border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-brand-amber outline-none transition-colors">
                    <option value="employee">Employee</option>
                    <option value="Master brewer">Master Brewer</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/5 mt-6 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-brand-amber hover:bg-brand-amber-dark text-black px-6 py-2.5 rounded-xl font-black transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
