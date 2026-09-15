import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Loader2,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Soul, SoulStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { SoulModal } from './SoulModal';

interface SoulsDashboardProps {
  onOpenAdminManagement?: () => void;
}

export const SoulsDashboard: React.FC<SoulsDashboardProps> = () => {
  const { user, isAdmin, isSuperAdmin, role } = useAuth();
  const [souls, setSouls] = useState<Soul[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewScope, setViewScope] = useState<'all' | 'mine'>('all');

  // Modal states
  const [isSoulModalOpen, setIsSoulModalOpen] = useState(false);
  const [editingSoul, setEditingSoul] = useState<Soul | null>(null);
  const [soulToDelete, setSoulToDelete] = useState<Soul | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    let q;
    if (isAdmin && viewScope === 'all') {
      // Admins and Super Admins can see all souls
      q = collection(db, 'souls');
    } else {
      // Regular users (or admin viewing only their own) query solely their own created souls
      q = query(collection(db, 'souls'), where('createdByUid', '==', user.uid));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Soul[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            fullName: data.fullName || '',
            phoneNumber: data.phoneNumber || '',
            location: data.location || '',
            date: data.date || '',
            status: data.status || 'New',
            createdByUid: data.createdByUid || '',
            createdByEmail: data.createdByEmail || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        // Sort by date or createdAt descending
        items.sort((a, b) => {
          if (b.date && a.date && b.date !== a.date) {
            return b.date.localeCompare(a.date);
          }
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setSouls(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching souls:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin, viewScope]);

  // Filtered souls list
  const filteredSouls = useMemo(() => {
    return souls.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phoneNumber.includes(searchTerm);

      const matchStatus =
        statusFilter === 'ALL' || s.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [souls, searchTerm, statusFilter]);

  const handleSaveSoul = async (data: {
    fullName: string;
    phoneNumber: string;
    location: string;
    date: string;
    status: SoulStatus;
  }) => {
    if (!user) return;

    if (editingSoul) {
      const docRef = doc(db, 'souls', editingSoul.id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, 'souls'), {
        ...data,
        createdByUid: user.uid,
        createdByEmail: user.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const handleDeleteSoul = async () => {
    if (!soulToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'souls', soulToDelete.id));
      setSoulToDelete(null);
    } catch (err) {
      console.error('Failed to delete soul:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="souls-dashboard-view" className="space-y-6">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 id="page-title-new-souls" className="text-2xl font-bold tracking-tight text-slate-900">
              New Souls
            </h1>
            {isAdmin && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {isSuperAdmin ? 'Super Admin Mode' : 'Admin Mode'}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin && viewScope === 'all'
              ? 'Church-wide directory of all souls recorded across The New Brook Church.'
              : 'Records of souls you have personally added for follow-up and discipleship.'}
          </p>
        </div>

        <button
          id="btn-add-new-soul"
          type="button"
          onClick={() => {
            setEditingSoul(null);
            setIsSoulModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Soul</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search by Name */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-soul-name-input"
              type="text"
              placeholder="Search by name, location, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              id="status-filter-select"
              aria-label="Filter souls by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 text-slate-700 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Joined Church">Joined Church</option>
            </select>
          </div>
        </div>

        {/* View Scope (Only visible to Admins / Super Admins) */}
        {isAdmin && (
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 self-start md:self-auto shrink-0">
            <button
              id="btn-filter-all-souls"
              type="button"
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                viewScope === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Souls
            </button>
            <button
              id="btn-filter-my-souls"
              type="button"
              onClick={() => setViewScope('mine')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                viewScope === 'mine'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Added by Me
            </button>
          </div>
        )}
      </div>

      {/* Database Table or Empty States */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm font-medium">Loading database records...</span>
          </div>
        ) : souls.length === 0 ? (
          /* Completely empty state for new user */
          <div id="souls-empty-state" className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 id="empty-state-heading" className="text-base font-semibold text-slate-800">
              No souls recorded yet
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Your database is completely empty. Record new souls from church services, outreaches, and evangelism visits.
            </p>
            <button
              id="btn-empty-state-add-soul"
              type="button"
              onClick={() => {
                setEditingSoul(null);
                setIsSoulModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Soul</span>
            </button>
          </div>
        ) : filteredSouls.length === 0 ? (
          /* Filter/search mismatch state */
          <div id="souls-search-empty-state" className="p-12 text-center">
            <p className="text-sm font-medium text-slate-700">No souls match your search or filter</p>
            <p className="text-xs text-slate-500 mt-1">
              Try modifying your search term or setting the status filter back to &quot;All Statuses&quot;.
            </p>
            <button
              id="btn-clear-filters"
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="mt-3 text-xs font-medium text-slate-900 underline hover:text-slate-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          /* Database Table */
          <div className="overflow-x-auto">
            <table id="souls-database-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && viewScope === 'all' && (
                    <th className="py-3 px-4">Added By</th>
                  )}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSouls.map((soul) => {
                  const isOwner = soul.createdByUid === user?.uid;
                  const canManage = isOwner || isAdmin;

                  return (
                    <tr
                      key={soul.id}
                      id={`soul-row-${soul.id}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {soul.fullName}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <a
                          id={`phone-link-${soul.id}`}
                          href={`tel:${soul.phoneNumber}`}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 transition hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{soul.phoneNumber}</span>
                        </a>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{soul.location}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{soul.date}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={soul.status} />
                      </td>

                      {/* Added By (for Admin view) */}
                      {isAdmin && viewScope === 'all' && (
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          <span className="truncate block max-w-[160px]" title={soul.createdByEmail}>
                            {soul.createdByEmail || 'Unknown'}
                          </span>
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {canManage && (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              id={`btn-edit-soul-${soul.id}`}
                              type="button"
                              onClick={() => {
                                setEditingSoul(soul);
                                setIsSoulModalOpen(true);
                              }}
                              title="Edit Record"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-soul-${soul.id}`}
                              type="button"
                              onClick={() => setSoulToDelete(soul)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Soul Modal */}
      <SoulModal
        isOpen={isSoulModalOpen}
        onClose={() => {
          setIsSoulModalOpen(false);
          setEditingSoul(null);
        }}
        onSave={handleSaveSoul}
        initialSoul={editingSoul}
      />

      {/* Delete Confirmation Modal */}
      {soulToDelete && (
        <div
          id="delete-soul-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div
            id="delete-soul-modal"
            className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-6"
          >
            <h4 id="delete-soul-modal-title" className="text-base font-semibold text-slate-900">
              Delete Soul Record?
            </h4>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete the record for{' '}
              <span className="font-semibold text-slate-900">{soulToDelete.fullName}</span>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                id="btn-cancel-delete-soul"
                type="button"
                onClick={() => setSoulToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-soul"
                type="button"
                onClick={handleDeleteSoul}
                disabled={isDeleting}
                className="px-3.5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
