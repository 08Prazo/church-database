import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  UserPlus,
  MapPin,
  Calendar,
  Phone,
  User,
  Shield,
  Clock,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Soul, SoulStatus } from '../types';
import { SOUL_STATUSES } from '../lib/constants';
import { StatusBadge } from './StatusBadge';
import { AddSoulModal } from './AddSoulModal';
import { EditSoulModal } from './EditSoulModal';
import { AdminManagementSection } from './AdminManagementSection';
import { useAuth } from '../context/AuthContext';
import { addSoul, updateSoul, deleteSoul } from '../lib/database';

interface SoulsDashboardProps {
  mode: 'my_souls' | 'admin_dashboard';
  souls: Soul[];
}

export const SoulsDashboard: React.FC<SoulsDashboardProps> = ({ mode, souls }) => {
  const { user, isSuperAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSoul, setEditingSoul] = useState<Soul | null>(null);
  const [showAdminManagement, setShowAdminManagement] = useState(false);

  // Filter souls by name and status
  const filteredSouls = useMemo(() => {
    return souls.filter((soul) => {
      const matchesSearch =
        !searchTerm.trim() ||
        soul.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        soul.location.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        soul.phoneNumber.includes(searchTerm.trim());

      const matchesStatus =
        selectedStatus === 'all' || soul.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [souls, searchTerm, selectedStatus]);

  const handleAddSoul = async (data: {
    fullName: string;
    phoneNumber: string;
    location: string;
    date: string;
    status: SoulStatus;
  }) => {
    if (!user) return;
    await addSoul({
      ...data,
      createdByUid: user.uid,
      createdByEmail: user.email,
      createdByName: user.displayName || user.email.split('@')[0]
    });
  };

  const handleUpdateSoul = async (id: string, updates: Partial<Soul>) => {
    await updateSoul(id, updates);
  };

  const handleDeleteSoul = async (id: string) => {
    await deleteSoul(id);
  };

  const isAdminView = mode === 'admin_dashboard';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isAdminView ? 'Admin Dashboard' : 'New Souls'}
            </h1>
            {isAdminView && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-900 text-white rounded-full">
                All Records ({souls.length})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdminView
              ? 'Viewing and managing all souls recorded across The New Brook Church'
              : 'Keep track of all the new souls you personally recorded'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdminView && isSuperAdmin && (
            <button
              type="button"
              onClick={() => setShowAdminManagement(!showAdminManagement)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition shadow-2xs ${
                showAdminManagement
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{showAdminManagement ? 'Hide Admin Controls' : 'Manage Admins'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Soul</span>
          </button>
        </div>
      </div>

      {/* Embedded Super Admin Management Section (Inside Admin Dashboard) */}
      {isAdminView && isSuperAdmin && showAdminManagement && (
        <AdminManagementSection />
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or location..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
          >
            <option value="all">All Statuses ({souls.length})</option>
            {SOUL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} ({souls.filter((s) => s.status === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Database Content */}
      {souls.length === 0 ? (
        /* Empty State: Completely empty until someone adds a soul */
        <div
          id="souls-empty-state"
          className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {isAdminView ? 'No Souls in Database' : 'No Souls Added Yet'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAdminView
                ? 'There are currently no soul records submitted by any user.'
                : 'Your personal list is empty. Click "Add New Soul" to record the first soul.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Soul</span>
          </button>
        </div>
      ) : filteredSouls.length === 0 ? (
        /* Empty Filter State */
        <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2">
          <p className="text-sm font-semibold text-slate-800">No matching souls found</p>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
            }}
            className="mt-2 text-xs font-medium text-slate-900 underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Professional Database Table */
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdminView && <th className="py-3 px-4">Added By</th>}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSouls.map((soul) => (
                  <tr
                    key={soul.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setEditingSoul(soul)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                          {soul.fullName.charAt(0)}
                        </div>
                        <span>{soul.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {soul.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{soul.location}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {soul.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={soul.status} size="sm" />
                    </td>
                    {isAdminView && (
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <span className="font-medium text-slate-700 block truncate max-w-[140px]">
                          {soul.createdByName || soul.createdByEmail}
                        </span>
                        <span className="text-slate-400 truncate max-w-[140px] block">
                          {soul.createdByEmail}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setEditingSoul(soul)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredSouls.map((soul) => (
              <div
                key={soul.id}
                onClick={() => setEditingSoul(soul)}
                className="p-4 space-y-3 hover:bg-slate-50/70 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{soul.fullName}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{soul.phoneNumber}</p>
                  </div>
                  <StatusBadge status={soul.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-50">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{soul.location}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{soul.date}</span>
                  </div>
                </div>

                {isAdminView && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    Added by: <span className="font-medium text-slate-600">{soul.createdByEmail}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer stats count */}
          <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing {filteredSouls.length} of {souls.length} record{souls.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      )}

      {/* Add Soul Modal */}
      <AddSoulModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSoul}
      />

      {/* Edit / Manage Soul Modal */}
      <EditSoulModal
        soul={editingSoul}
        isOpen={!!editingSoul}
        onClose={() => setEditingSoul(null)}
        onUpdate={handleUpdateSoul}
        onDelete={handleDeleteSoul}
        canDelete={true}
      />
    </div>
  );
};
