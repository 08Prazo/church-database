import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Soul, SoulStatus } from '../types';

interface SoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    fullName: string;
    phoneNumber: string;
    location: string;
    date: string;
    status: SoulStatus;
  }) => Promise<void>;
  initialSoul?: Soul | null;
}

const STATUS_OPTIONS: SoulStatus[] = ['New', 'Contacted', 'Follow-up', 'Joined Church'];

export const SoulModal: React.FC<SoulModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSoul,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<SoulStatus>('New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSoul) {
      setFullName(initialSoul.fullName || '');
      setPhoneNumber(initialSoul.phoneNumber || '');
      setLocation(initialSoul.location || '');
      setDate(initialSoul.date || new Date().toISOString().split('T')[0]);
      setStatus(initialSoul.status || 'New');
    } else {
      setFullName('');
      setPhoneNumber('');
      setLocation('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('New');
    }
    setError(null);
  }, [initialSoul, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter the full name.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter the location.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        location: location.trim(),
        date,
        status,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save soul record:', err);
      setError(err?.message || 'Failed to save record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="soul-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div
        id="soul-modal-container"
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id="soul-modal-title" className="text-lg font-semibold text-slate-900">
              {initialSoul ? 'Edit Soul Record' : 'Add New Soul'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">The New Brook Church</p>
          </div>
          <button
            id="soul-modal-close-btn"
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              id="soul-modal-error"
              className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="soul-full-name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="soul-full-name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition"
            />
          </div>

          <div>
            <label
              htmlFor="soul-phone-number"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="soul-phone-number"
              type="tel"
              required
              placeholder="e.g. +44 7123 456789 or 0801 234 5678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition"
            />
          </div>

          <div>
            <label
              htmlFor="soul-location"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="soul-location"
              type="text"
              required
              placeholder="e.g. Community Center, Area 5, Downtown"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="soul-date"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="soul-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition"
              />
            </div>

            <div>
              <label
                htmlFor="soul-status"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Status
              </label>
              <select
                id="soul-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as SoulStatus)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="soul-modal-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              id="soul-modal-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialSoul ? 'Update Record' : 'Save Soul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
