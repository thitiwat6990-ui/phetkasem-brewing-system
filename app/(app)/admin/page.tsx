"use client";

import { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '@/actions/users';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18nContext';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="p-8 text-white flex items-center justify-center min-h-[50vh]">Loading...</div>;

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-brand-amber" />
          {t('Admin')}
        </h1>
        <p className="text-text-secondary mt-2">Manage user accounts and system roles.</p>
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
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-brand-amber cursor-pointer"
                    >
                      <option value="employee">employee</option>
                      <option value="Master brewer">Master brewer</option>
                    </select>
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
    </div>
  );
}
