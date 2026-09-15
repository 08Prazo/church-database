import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  X,
  Check,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AdminRecord } from '../types';
import { ChurchLogo } from './ChurchLogo';
import { CHURCH_BRANDING } from '../lib/constants';

export const AdminManagement: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'admin' | 'super_admin'>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;

    setLoading(true);
    const adminsColRef = collection(db, 'admins');
    const unsubscribe = onSnapshot(
      adminsColRef,
      (snapshot) => {
        const list: AdminRecord[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const email = docSnap.id.toLowerCase();
          list.push({
            email,
            role: data.role === 'super_admin' ? 'super_admin' : 'admin',
            addedBy: data.addedBy || 'System',
            addedAt: data.addedAt,
          });
        });

        // Sort: Super admins first, then by email
        list.sort((a, b) => {
          if (a.role === b.role) return a.email.localeCompare(b.email);
          return a.role === 'super_admin' ? -1 : 1;
        });

        setAdmins(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load admin list:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isSuperAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const targetDoc = doc(db, 'admins', cleanEmail);
      await setDoc(
        targetDoc,
        {
          email: cleanEmail,
          role: roleInput,
          addedBy: user?.email || 'Super Admin',
          addedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setEmailInput('');
      setRoleInput('admin');
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Failed to add admin:', err);
      setErrorMsg(err?.message || 'Failed to authorize administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (targetAdmin: AdminRecord, newRole: 'admin' | 'super_admin') => {
    try {
      const targetDoc = doc(db, 'admins', targetAdmin.email);
      await setDoc(
        targetDoc,
        {
          role: newRole,
          updatedBy: user?.email || 'Super Admin',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err: any) {
      console.error('Failed to update admin role:', err);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      setIsDeleting(true);
      const targetDoc = doc(db, 'admins', adminToDelete.email);
      await deleteDoc(targetDoc);
      setAdminToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete admin:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div id="admin-management-denied" className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">Access Restricted</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Admin Management is only accessible to Super Administrators of The New Brook Church.
        </p>
      </div>
    );
  }

  return (
    <div id="admin-management-section" className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 id="admin-mgmt-title" className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authorize and manage Administrators and Super Administrators for The New Brook Church.
          </p>
        </div>

        <button
          id="btn-open-add-admin-modal"
          type="button"
          onClick={() => {
            setErrorMsg(null);
            setEmailInput('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Authorize Admin</span>
        </button>
      </div>

      {/* Role Summary Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Admin Privileges</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Can view and manage all souls across the church database. Cannot access Admin Management or add/remove admins.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Super Admin Privileges</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Full permissions: manage all souls, authorize new Admins, remove Admins, and assign Super Admins.
          </p>
        </div>
      </div>

      {/* Church Branding & Logo Source */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0 flex items-center justify-center">
              <ChurchLogo variant="mark" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{CHURCH_BRANDING.name}</span>
                <span className="text-[10px] font-medium text-slate-500 italic">{CHURCH_BRANDING.subtitle}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Active Church Logo Photo Link:
              </p>
              <div className="mt-1 flex items-center gap-2">
                <code className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-mono truncate max-w-xs sm:max-w-md">
                  {CHURCH_BRANDING.photoUrl}
                </code>
                <a
                  href={CHURCH_BRANDING.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>View in Photos</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm">Loading administrators...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm">No administrators found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="admins-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Authorized By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {admins.map((admin) => {
                  const isCurrentUser = admin.email.toLowerCase() === user?.email?.toLowerCase();

                  return (
                    <tr
                      key={admin.email}
                      id={`admin-row-${admin.email.replace(/[@.]/g, '-')}`}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{admin.email}</span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {admin.role === 'super_admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3.5 h-3.5" />
                            Admin
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {admin.addedBy}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <div className="inline-flex items-center gap-2">
                          <select
                            id={`role-select-${admin.email.replace(/[@.]/g, '-')}`}
                            aria-label={`Change role for ${admin.email}`}
                            value={admin.role}
                            onChange={(e) =>
                              handleRoleChange(admin, e.target.value as 'admin' | 'super_admin')
                            }
                            className="text-xs py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-slate-800"
                          >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>

                          <button
                            id={`btn-remove-admin-${admin.email.replace(/[@.]/g, '-')}`}
                            type="button"
                            onClick={() => setAdminToDelete(admin)}
                            title="Remove Administrator"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div
          id="add-admin-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div
            id="add-admin-modal"
            className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 id="add-admin-modal-title" className="text-base font-semibold text-slate-900">
                Authorize Administrator
              </h3>
              <button
                id="btn-close-add-admin-modal"
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              {errorMsg && (
                <div
                  id="add-admin-error-box"
                  className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg"
                >
                  {errorMsg}
                </div>
              )}

              <div>
                <label
                  htmlFor="admin-email-input"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Gmail Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  placeholder="pastor.name@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
                />
                <p className="text-xs text-slate-500 mt-1">
                  The person will sign in using this Google account.
                </p>
              </div>

              <div>
                <label
                  htmlFor="admin-role-select"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Select Role
                </label>
                <select
                  id="admin-role-select"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as 'admin' | 'super_admin')}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
                >
                  <option value="admin">Admin (Manage all souls)</option>
                  <option value="super_admin">Super Admin (Manage all souls + Admins)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  id="btn-cancel-add-admin"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-add-admin"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {adminToDelete && (
        <div
          id="delete-admin-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div
            id="delete-admin-modal"
            className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-6"
          >
            <h4 id="delete-admin-modal-title" className="text-base font-semibold text-slate-900">
              Revoke Administrator Access?
            </h4>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to remove <span className="font-medium text-slate-900">{adminToDelete.email}</span> from {adminToDelete.role === 'super_admin' ? 'Super Admins' : 'Admins'}?
              They will revert to regular User permissions.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                id="btn-cancel-delete-admin"
                type="button"
                onClick={() => setAdminToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-admin"
                type="button"
                onClick={handleDeleteAdmin}
                disabled={isDeleting}
                className="px-3.5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
