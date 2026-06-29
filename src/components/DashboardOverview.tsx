/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users, GraduationCap, Building, Award, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { Student, DashboardTab } from '../types';

interface DashboardOverviewProps {
  students: Student[];
  onNavigate: (tab: DashboardTab) => void;
}

export default function DashboardOverview({ students, onNavigate }: DashboardOverviewProps) {
  // Compute analytics
  const totalStudents = students.length;

  // Group by School
  const schoolCounts: { [key: string]: number } = {};
  // Group by Department
  const deptCounts: { [key: string]: number } = {};

  students.forEach((s) => {
    schoolCounts[s.school] = (schoolCounts[s.school] || 0) + 1;
    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
  });

  const uniqueSchools = Object.keys(schoolCounts).length;
  const uniqueDepts = Object.keys(deptCounts).length;

  // Find most active department
  let topDept = 'N/A';
  let maxDeptCount = 0;
  Object.entries(deptCounts).forEach(([dept, count]) => {
    if (count > maxDeptCount) {
      maxDeptCount = count;
      topDept = dept;
    }
  });

  // Recent 3 students registered
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Custom visual list for SVG chart rendering
  const schoolsList = Object.entries(schoolCounts).map(([name, count]) => ({
    name,
    count,
    percent: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
  }));

  const deptsList = Object.entries(deptCounts).map(([name, count]) => ({
    name,
    count,
    percent: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const colors = [
    'bg-teal-700',
    'bg-amber-500',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-sky-600',
    'bg-amber-700',
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero banner */}
      <div className="rounded-2xl bg-heritage-pattern p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-teal-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/20">
            <UserCheck className="h-3.5 w-3.5" />
            Centralized Administrator Console Active
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-none">
            National Student Registry
          </h1>
          <p className="text-teal-50 text-sm leading-relaxed">
            Manage student registrations, academic departments, and profiles for institutions across India. Monitor stats and generate exports from a centralized secure platform.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('add')}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-teal-900 px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-amber-50 hover:text-teal-950 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register Student
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-900/50 text-amber-100 px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-teal-950 hover:text-white transition-colors border border-teal-600/30 cursor-pointer"
            >
              View Student Directory
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
            <span className="text-3xl font-display font-bold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500 block">Registered Profiles</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Departments</span>
            <span className="text-3xl font-display font-bold text-slate-900">{uniqueDepts}</span>
            <span className="text-xs text-slate-500 block">Active Study Divisions</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        {/* Schools */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Schools</span>
            <span className="text-3xl font-display font-bold text-slate-900">{uniqueSchools}</span>
            <span className="text-xs text-slate-500 block">Faculties Organized</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Building className="h-6 w-6" />
          </div>
        </div>

        {/* Top Department */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
          <div className="space-y-1 max-w-[70%]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Top Department</span>
            <span className="text-lg font-bold text-slate-900 truncate block" title={topDept}>{topDept}</span>
            <span className="text-xs text-slate-500 block">{maxDeptCount} Students enrolled</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* School Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-900">School Enrolment</h3>
            <p className="text-xs text-slate-400">Distribution across major academic faculties</p>
          </div>

          {totalStudents === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No data available</div>
          ) : (
            <div className="space-y-4">
              {schoolsList.map((item, index) => {
                const colorClass = colors[index % colors.length];
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600 truncate max-w-[75%]">{item.name}</span>
                      <span className="text-slate-900 font-semibold">{item.count} ({item.percent}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              Analyze in Directory
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Department Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-900">Department Distribution</h3>
            <p className="text-xs text-slate-400">Comparative representation of enrollment volume</p>
          </div>

          {totalStudents === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No data available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deptsList.slice(0, 4).map((item, index) => {
                const colorClass = colors[(index + 2) % colors.length];
                return (
                  <div
                    key={item.name}
                    className="p-4 rounded-xl border border-slate-50 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                  >
                    <span className="text-xs text-slate-500 font-semibold truncate block mb-2" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display font-bold text-slate-900">{item.count}</span>
                      <span className="text-xs text-slate-400">students</span>
                    </div>
                    {/* Bar visual indicator */}
                    <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigate('add')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              Add New Department Student
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Student Entries */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-display text-lg font-bold text-slate-900">Recently Registered Students</h3>
            <p className="text-xs text-slate-400">The latest administrative profile creations</p>
          </div>
          <button
            onClick={() => onNavigate('students')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            See All Records
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentStudents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No students registered yet. Click "Register Student" to add your first record.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                {recentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900">
                      {student.roll_no}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {student.department}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {student.school}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                      {student.email}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-xs font-medium">
                      {new Date(student.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
