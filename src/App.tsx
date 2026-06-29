/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  GraduationCap,
  PlusCircle,
  Settings,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Search,
  Moon,
  Sun
} from 'lucide-react';

import { Student, DashboardTab, AdminProfile } from './types';

// Component imports
import LoginView from './components/LoginView';
import DashboardOverview from './components/DashboardOverview';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import SettingsView from './components/SettingsView';
import ConfirmModal from './components/ConfirmModal';
import { DEFAULT_ADMIN_PASSWORD } from './utils/auth';
import {
  changePassword,
  createStudent,
  deleteStudent,
  getAdmin,
  getStudents,
  importStudents,
  login,
  logout,
  resetStudents,
  updateStudent,
  StudentInput,
} from './api/client';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('srs_dark_mode') === 'true';
  });

  // Authentication status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('srs_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('srs_current_user') || '';
  });

  // Admin Profile matching Data Dictionary specs (Page 8-9)
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    admin_id: 1,
    username: "admin",
    email: "admin@gmail.com",
    mobileno: "9876543210"
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [serverError, setServerError] = useState('');

  // Active Tab View Navigation
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');

  // Modal / Form trigger states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('srs_dark_mode', isDarkMode ? 'true' : 'false');
    localStorage.setItem('srs_logged_in', isLoggedIn ? 'true' : 'false');
    localStorage.setItem('srs_current_user', currentUser);
  }, [isDarkMode, isLoggedIn, currentUser]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const loadServerData = async () => {
      setIsLoadingData(true);
      setServerError('');
      try {
        const [admin, serverStudents] = await Promise.all([getAdmin(), getStudents()]);
        setAdminProfile(admin);
        setStudents(serverStudents);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Unable to load data from PHP/MongoDB server.');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadServerData();
  }, [isLoggedIn]);

  // Auth Callbacks
  const handleLogin = async (username: string, password: string) => {
    const admin = await login(username.trim(), password);
    const serverStudents = await getStudents();
    setAdminProfile(admin);
    setStudents(serverStudents);
    setIsLoggedIn(true);
    setCurrentUser(admin.username);
    setCurrentTab('overview');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Server logout failed; clearing local session anyway.', error);
    }
    setIsLoggedIn(false);
    setCurrentUser('');
    setEditingStudent(null);
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword);
  };

  // CRUD Actions
  const handleSaveStudent = async (studentData: StudentInput) => {
    setServerError('');
    try {
      if (editingStudent) {
        // UPDATE Student (FR-4)
        const updated = await updateStudent(editingStudent.id, studentData);
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        setEditingStudent(null);
      } else {
        // CREATE/ADD Student (FR-2)
        const created = await createStudent(studentData);
        setStudents(prev => [created, ...prev]);
      }
      setCurrentTab('students');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to save student record.');
    }
  };

  const handleEditTrigger = (student: Student) => {
    setEditingStudent(student);
    setCurrentTab('add'); // Swap to form tab
  };

  const handleDeleteTrigger = (student: Student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      // DELETE Student (FR-5)
      try {
        await deleteStudent(studentToDelete.id);
        setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
        setStudentToDelete(null);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Unable to delete student record.');
      }
    }
  };

  // Settings Actions (DB management)
  const handleResetDatabase = async () => {
    const reset = await resetStudents();
    setStudents(reset);
    setEditingStudent(null);
  };

  const handleExportDatabase = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "student_registry_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDatabase = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            // Basic schema check to make sure it contains required keys
            const isValid = parsed.every(s => s.roll_no && s.name && s.school && s.department);
            if (isValid) {
              importStudents(parsed).then((imported) => {
                setStudents(imported);
                resolve();
              }).catch(reject);
              return;
            }
          }
          reject(new Error('Invalid JSON format'));
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  };

  // If unauthorized: show login screen
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} defaultPassword={DEFAULT_ADMIN_PASSWORD} />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col antialiased">
      {/* Upper Brand Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 border-t-4 border-t-teal-700 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-teal-700 text-amber-400 flex items-center justify-center shadow-md shadow-teal-900/10 border border-teal-600">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-slate-900 text-base leading-none flex items-center gap-2">
              <span>Student Registration Management System</span>
            </h1>
            <span className="text-[10px] text-teal-700 font-bold tracking-wider uppercase">National Registry Portal • India</span>
          </div>
        </div>

        {/* Current Admin badge & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <UserCheck className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium font-mono">admin</span>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-all border border-slate-200 cursor-pointer"
          >
            {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={handleLogout}
            title="Secure Logout"
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 px-3.5 py-2 rounded-xl transition-all border border-rose-100 hover:border-rose-600 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar/Rail - MATCHING Menu requirements on Page 10 */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-6 sticky top-24">
            
            <div className="px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menu Navigation</span>
            </div>

            <nav className="space-y-1.5">
              {/* Dashboard Overview tab */}
              <button
                onClick={() => {
                  setCurrentTab('overview');
                  setEditingStudent(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'overview'
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
                <span>Dashboard Home</span>
              </button>

              {/* View Students tab */}
              <button
                onClick={() => {
                  setCurrentTab('students');
                  setEditingStudent(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'students'
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="h-4.5 w-4.5 shrink-0" />
                <span>View Students</span>
              </button>

              {/* Search Student tab */}
              <button
                onClick={() => {
                  setCurrentTab('search');
                  setEditingStudent(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'search'
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Search className="h-4.5 w-4.5 shrink-0" />
                <span>Search Student</span>
              </button>

              {/* Add Student tab */}
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setCurrentTab('add');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'add' && !editingStudent
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Add Student</span>
              </button>

              {/* Settings tab (handles Change Password module requirement) */}
              <button
                onClick={() => {
                  setCurrentTab('settings');
                  setEditingStudent(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'settings'
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className="h-4.5 w-4.5 shrink-0" />
                <span>Security & Console</span>
              </button>
            </nav>

            <div className="border-t border-slate-50 pt-4 px-2 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registry Stats</span>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Total records:</span>
                <span className="font-semibold text-slate-800 font-mono">{students.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Core dynamic content viewport panel */}
        <main className="flex-1 min-w-0">
          {serverError && (
            <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {serverError}
            </div>
          )}

          {isLoadingData && (
            <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
              Loading records from PHP/MongoDB server...
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab + (editingStudent ? '_editing' : '_normal')}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'overview' && (
                <DashboardOverview
                  students={students}
                  onNavigate={(tab) => setCurrentTab(tab)}
                />
              )}

              {(currentTab === 'students' || currentTab === 'search') && (
                <StudentList
                  students={students}
                  onEdit={handleEditTrigger}
                  onDeleteRequest={handleDeleteTrigger}
                  startsInSearchMode={currentTab === 'search'}
                />
              )}

              {currentTab === 'add' && (
                <StudentForm
                  studentToEdit={editingStudent}
                  existingStudents={students}
                  onSave={handleSaveStudent}
                  onCancel={() => {
                    setEditingStudent(null);
                    setCurrentTab('students');
                  }}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  adminProfile={adminProfile}
                  onPasswordChange={handlePasswordChange}
                  onResetDatabase={handleResetDatabase}
                  onExportDatabase={handleExportDatabase}
                  onImportDatabase={handleImportDatabase}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Indian National Student Registration Management System. Centralized academic administration.</p>
      </footer>

      {/* Deletion confirmation modal matching Page 7 specifications */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this student?"
        confirmText="Confirm Delete"
        cancelText="Keep Record"
        onConfirm={handleConfirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
