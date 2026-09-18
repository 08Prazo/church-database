import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, UserPlus, Trash2, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { AdminUser } from '../types';
import { subscribeToAdmins, setAdminRole, removeAdminRole } from '../lib/database';
import { INITIAL_SUPER_ADMIN_EMAIL } from '../lib/constants';
import { useAuth } from '../context/AuthContext';

export const AdminManagementSection: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'super_admin'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAdmins((list) => {
      setAdmins(list);
    });
    return () => unsubscribe();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await setAdminRole(trimmed, newRole, user?.email || 'super_admin');
      setSuccess(`Successfully granted ${newRole === 'super_admin' ? 'Super Admin' : 'Admin'} permissions to ${trimmed}`);
      setNewEmail('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update admin role.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase()) {
      setError('Cannot remove the initial Super Admin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await removeAdminRole(emailToRemove);
      setSuccess(`Removed administrative access for ${emailToRemove}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to remove admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-management-section"
      className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Super Admin Management</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-slate-100 text-slate-700 rounded-full">
                Super Admin Only
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage authorized Admins and Super Admins who can view and manage all souls
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Admin Form */}
      <form onSubmit={handleAddOrUpdate} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <span className="text-xs font-semibold text-slate-700 block">
          Add or Update Admin Privileges
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. pastor.john@gmail.com"
              required
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'super_admin')}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            >
              <option value="admin">Admin (View & Manage All Souls)</option>
              <option value="super_admin">Super Admin (Manage Souls & Admins)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign</span>
            </button>
          </div>
        </div>
      </form>

      {/* Admin List Table */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-700 block">
          Current Authorized Administrators ({admins.length})
        </span>

        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
          {admins.map((adm) => {
            const isInitial = adm.email.toLowerCase() === INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();
            return (
              <div
                key={adm.email}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-semibold uppercase">
                    {adm.email.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{adm.email}</span>
                      {isInitial && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                          Founder Super Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {adm.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                      adm.role === 'super_admin'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {adm.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>

                  {!isInitial && (
                    <button
                      type="button"
                      onClick={() => handleRemove(adm.email)}
                      disabled={loading}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Revoke Admin access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
