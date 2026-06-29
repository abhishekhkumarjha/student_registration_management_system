/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, Eye, RefreshCw, Sparkles, Filter, X } from 'lucide-react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDeleteRequest: (student: Student) => void;
  startsInSearchMode?: boolean;
}

export default function StudentList({ students, onEdit, onDeleteRequest, startsInSearchMode = false }: StudentListProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Selected student for detailed info view modal/card
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (startsInSearchMode) {
      searchInputRef.current?.focus();
    }
  }, [startsInSearchMode]);

  // Derive unique schools & departments for dropdowns
  const uniqueSchools = useMemo(() => {
    const set = new Set(students.map(s => s.school));
    return ['All', ...Array.from(set)];
  }, [students]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set(students.map(s => s.department));
    return ['All', ...Array.from(set)];
  }, [students]);

  // Apply Search (FR-6 Search Student using Roll Number, Name, Department)
  const filteredStudents = useMemo(() => {
    let result = students;

    // Apply main query search
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(s =>
        s.roll_no.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.department.toLowerCase().includes(query)
      );
    }

    // Apply category school filter
    if (schoolFilter !== 'All') {
      result = result.filter(s => s.school === schoolFilter);
    }

    // Apply category department filter
    if (deptFilter !== 'All') {
      result = result.filter(s => s.department === deptFilter);
    }

    return result;
  }, [students, searchTerm, schoolFilter, deptFilter]);

  // Handle resetting page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, schoolFilter, deptFilter, itemsPerPage]);

  // Pagination maths
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSchoolFilter('All');
    setDeptFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Real-time Search Box */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Roll No, Name or Department..."
              className="block w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Filter by School */}
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Filter className="h-3 w-3" />
              <span>School:</span>
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="ml-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all cursor-pointer"
              >
                {uniqueSchools.map(sch => (
                  <option key={sch} value={sch}>{sch}</option>
                ))}
              </select>
            </div>

            {/* Filter by Department */}
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Filter className="h-3 w-3" />
              <span>Dept:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="ml-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-700/10 focus:border-teal-700 transition-all cursor-pointer"
              >
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || schoolFilter !== 'All' || deptFilter !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-teal-700 hover:text-teal-800 transition-colors font-semibold flex items-center gap-1 cursor-pointer bg-teal-50 hover:bg-teal-100/50 px-2.5 py-1.5 rounded-lg"
              >
                <RefreshCw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-12">ID</th>
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Full Name</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">School</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Mobile</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-slate-500 font-medium">No student records found</p>
                      <p className="text-xs">Try adjusting your search criteria or register a new student.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/45 transition-colors group">
                    <td className="py-4 px-6 text-center text-slate-400 font-mono text-xs">
                      {student.student_id}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-teal-700">
                      {student.roll_no}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {student.department}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {student.school}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                      {student.email}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                      {student.mobile}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs max-w-[240px]">
                      <span className="line-clamp-2" title={student.address}>{student.address}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => setSelectedStudent(student)}
                          title="View Profile Details"
                          className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-100 transition-all cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* Edit Button */}
                        <button
                          onClick={() => onEdit(student)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteRequest(student)}
                          title="Delete Student"
                          className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Controls (Pagination & Items per page) */}
        <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-md px-1.5 py-1 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-700 focus:border-teal-700 cursor-pointer"
            >
              {[5, 10, 20, 50].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <span>records per page</span>
            <span className="text-slate-300">|</span>
            <span>Total: <strong>{totalItems}</strong> entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-600 px-2 font-medium">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed view Modal Drawer */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 z-10"
            >
              {/* Header */}
              <div className="bg-teal-800 px-6 py-5 text-white flex items-center justify-between border-b border-teal-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-amber-500/30 text-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Student Information File
                  </span>
                  <h3 className="font-display text-lg font-bold leading-none mt-1">
                    {selectedStudent.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-lg p-1 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Card content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Student Database ID</span>
                    <span className="font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block text-xs">
                      {selectedStudent.student_id}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Roll Number</span>
                    <span className="font-mono text-teal-700 font-bold bg-teal-50/50 px-2 py-1 rounded border border-teal-100 inline-block text-xs">
                      {selectedStudent.roll_no}
                    </span>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Academic School</span>
                    <span className="text-slate-800 font-medium">{selectedStudent.school}</span>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Department / Major</span>
                    <span className="text-slate-800 font-medium">{selectedStudent.department}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Email Address</span>
                    <span className="text-slate-700 font-mono text-xs">{selectedStudent.email}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Mobile Number</span>
                    <span className="text-slate-700 font-mono text-xs">{selectedStudent.mobile}</span>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Residential Address</span>
                    <span className="text-slate-700 leading-relaxed block bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      {selectedStudent.address}
                    </span>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Registration Timestamp</span>
                    <span className="text-xs text-slate-500">
                      {new Date(selectedStudent.createdAt).toLocaleString(undefined, {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      })}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      onEdit(selectedStudent);
                      setSelectedStudent(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
