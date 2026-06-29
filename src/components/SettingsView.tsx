/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, ShieldAlert, CheckCircle, Database, Download, Upload, Trash2, Info } from 'lucide-react';
import { AdminProfile } from '../types';

interface SettingsViewProps {
  adminProfile: AdminProfile;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
  onResetDatabase: () => void;
  onExportDatabase: () => void;
  onImportDatabase: (file: File) => Promise<void>;
}

export default function SettingsView({
  adminProfile,
  onPasswordChange,
  onResetDatabase,
  onExportDatabase,
  onImportDatabase,
}: SettingsViewProps) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Database control states
  const [dbSuccessMessage, setDbSuccessMessage] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPassword.length < 5) {
      setPassError('New password must be at least 5 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    try {
      await onPasswordChange(currentPassword, newPassword);
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPassError(error instanceof Error ? error.message : 'Unable to update password.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onImportDatabase(file);
        setDbSuccessMessage('Database records imported successfully!');
        setTimeout(() => setDbSuccessMessage(''), 4000);
      } catch (err) {
        alert('Failed to import database. Please verify the JSON schema.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Grid containing Profile and Password forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Admin Profile Data Dictionary card (Page 8-9) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 lg:col-span-1">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-900">Admin Account Info</h3>
            <p className="text-xs text-slate-400">Credentials & system registration identifiers</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Info className="h-5 w-5 text-teal-700 shrink-0" />
              <p className="text-xs text-slate-500 leading-normal">
                These properties match the Admin Collection and database schema specified in Section 4.2 and 5 of the SRS document.
              </p>
            </div>

            <div className="divide-y divide-slate-100 space-y-3">
              <div className="pt-3 flex justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Admin ID (Primary Key)</span>
                <span className="font-mono text-xs font-semibold text-slate-800">{adminProfile.admin_id}</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Username</span>
                <span className="font-mono text-xs font-semibold text-slate-800">{adminProfile.username}</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address</span>
                <span className="font-mono text-xs text-slate-800">{adminProfile.email}</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mobile Number</span>
                <span className="font-mono text-xs text-slate-800">{adminProfile.mobileno}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form (Page 3) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="space-y-1 mb-6">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-teal-700" />
              <span>Change Password</span>
            </h3>
            <p className="text-xs text-slate-400">Update administrative console access credentials</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passError && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-600 font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5" />
                {passError}
              </div>
            )}

            {passSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-600 font-semibold flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5" />
                Password updated successfully! Next login requires the new password.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Pass */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all font-mono"
                  placeholder="********"
                />
              </div>

              {/* New Pass */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all font-mono"
                  placeholder="Min 5 characters"
                />
              </div>

              {/* Confirm Pass */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all font-mono"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors shadow-sm cursor-pointer"
              >
                Update Access Key
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Database control deck (MongoDB backup/wipe operations) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-700" />
            <span>MongoDB Backups & Control Deck</span>
          </h3>
          <p className="text-xs text-slate-400">Wipe, restore, export, or import JSON database collection documents safely</p>
        </div>

        {dbSuccessMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-600 font-semibold flex items-center gap-2 max-w-xl">
            <CheckCircle className="h-4.5 w-4.5" />
            {dbSuccessMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Export card */}
          <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Export Registry</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Download a fully-compatible JSON document backup representing all active student records.
              </p>
            </div>
            <button
              onClick={onExportDatabase}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs cursor-pointer w-full"
            >
              <Download className="h-4 w-4 text-teal-700" />
              Download Backup.json
            </button>
          </div>

          {/* Import card */}
          <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Import Database</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Restore or replace the registry by uploading a previously downloaded registry backup JSON.
              </p>
            </div>
            <label className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs cursor-pointer text-center w-full">
              <Upload className="h-4 w-4 text-teal-700" />
              <span>Upload Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Wipe card */}
          <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Seeded Reset</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Wipe your customized inputs and re-populate the registry with initial premium demo student entries.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('This will restore original demo student entries. Your custom additions will be lost. Proceed?')) {
                  onResetDatabase();
                  setDbSuccessMessage('Database seed reset completed successfully!');
                  setTimeout(() => setDbSuccessMessage(''), 4000);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100/50 transition-colors px-4 py-2.5 text-xs font-bold text-rose-700 cursor-pointer w-full"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
