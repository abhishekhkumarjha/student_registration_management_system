/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, RotateCcw, XCircle, Sparkles, GraduationCap } from 'lucide-react';
import { Student } from '../types';

interface StudentFormProps {
  studentToEdit?: Student | null;
  existingStudents: Student[];
  onSave: (studentData: Omit<Student, 'id' | 'student_id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const POPULAR_SCHOOLS = [
  "School of Engineering",
  "School of Science",
  "School of Business",
  "School of Medicine",
  "School of Humanities",
];

const SCHOOL_DEPT_MAPPING: { [key: string]: string[] } = {
  "School of Engineering": [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering"
  ],
  "School of Science": [
    "Applied Physics",
    "Biotechnology",
    "Mathematics",
    "Chemistry"
  ],
  "School of Business": [
    "Business Administration",
    "Financial Management",
    "Marketing Analytics",
    "Human Resource Management"
  ],
  "School of Medicine": [
    "General Medicine",
    "Nursing",
    "Pharmacy",
    "Dentistry"
  ],
  "School of Humanities": [
    "English Literature",
    "Psychology",
    "Sociology",
    "Political Science"
  ],
};

export default function StudentForm({
  studentToEdit,
  existingStudents,
  onSave,
  onCancel,
}: StudentFormProps) {
  const isEditMode = !!studentToEdit;

  // Form Fields
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Populate form if we are editing
  useEffect(() => {
    if (studentToEdit) {
      setRollNo(studentToEdit.roll_no);
      setName(studentToEdit.name);
      setSchool(studentToEdit.school);
      setDepartment(studentToEdit.department);
      setEmail(studentToEdit.email);
      setMobile(studentToEdit.mobile);
      setAddress(studentToEdit.address);
    } else {
      handleReset();
    }
  }, [studentToEdit]);

  // Adjust departments when school changes
  const availableDepartments = SCHOOL_DEPT_MAPPING[school] || [];

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchool = e.target.value;
    setSchool(selectedSchool);
    setDepartment(''); // Reset department
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!rollNo.trim()) {
      newErrors.rollNo = 'Roll Number is required';
    } else {
      // Check for duplicates (only for new students, or if changed in edit mode)
      const duplicate = existingStudents.find(
        (s) =>
          s.roll_no.trim().toLowerCase() === rollNo.trim().toLowerCase() &&
          (!isEditMode || s.id !== studentToEdit?.id)
      );
      if (duplicate) {
        newErrors.rollNo = 'Roll Number already registered to another student';
      }
    }

    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!school) {
      newErrors.school = 'Academic School selection is required';
    }

    if (!department) {
      newErrors.department = 'Department selection is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email format';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{7,15}$/.test(mobile.replace(/[\s-+()]/g, ''))) {
      // General broad mobile check: between 7 and 15 digits
      newErrors.mobile = 'Mobile number must be a valid numeric sequence';
    }

    if (!address.trim()) {
      newErrors.address = 'Residential Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        roll_no: rollNo.trim(),
        name: name.trim(),
        school,
        department,
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        address: address.trim(),
      });
    }
  };

  // Reset Button behavior
  const handleReset = () => {
    if (studentToEdit) {
      // In edit mode, Reset reverts back to the original database values of the edited student
      setRollNo(studentToEdit.roll_no);
      setName(studentToEdit.name);
      setSchool(studentToEdit.school);
      setDepartment(studentToEdit.department);
      setEmail(studentToEdit.email);
      setMobile(studentToEdit.mobile);
      setAddress(studentToEdit.address);
    } else {
      // In add mode, Reset empties all inputs
      setRollNo('');
      setName('');
      setSchool('');
      setDepartment('');
      setEmail('');
      setMobile('');
      setAddress('');
    }
    setErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 leading-none">
              {isEditMode ? 'Modify Student Profile' : 'Student Registration Portal'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isEditMode ? 'Edit existing registration details' : 'Register a new student electronic record'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Roll No */}
          <div className="space-y-2">
            <label htmlFor="rollNo" className="text-sm font-semibold text-slate-700 block">
              Roll Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="rollNo"
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 22CSE001"
              className={`block w-full rounded-xl border ${
                errors.rollNo ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-700/10 focus:border-teal-700'
              } px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all text-sm font-mono`}
            />
            {errors.rollNo && (
              <p className="text-xs text-rose-600 font-medium">{errors.rollNo}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-slate-700 block">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className={`block w-full rounded-xl border ${
                errors.name ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-700/10 focus:border-teal-700'
              } px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all text-sm`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 font-medium">{errors.name}</p>
            )}
          </div>

          {/* School Selection */}
          <div className="space-y-2">
            <label htmlFor="school" className="text-sm font-semibold text-slate-700 block">
              Academic School <span className="text-rose-500">*</span>
            </label>
            <select
              id="school"
              value={school}
              onChange={handleSchoolChange}
              className={`block w-full rounded-xl border ${
                errors.school ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-700/10 focus:border-teal-700'
              } px-4 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 transition-all text-sm bg-white cursor-pointer`}
            >
              <option value="">Select Faculty / School</option>
              {POPULAR_SCHOOLS.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
            {errors.school && (
              <p className="text-xs text-rose-600 font-medium">{errors.school}</p>
            )}
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-semibold text-slate-700 block">
              Department / Major <span className="text-rose-500">*</span>
            </label>
            {school ? (
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`block w-full rounded-xl border ${
                  errors.department ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-700/10 focus:border-teal-700'
                } px-4 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 transition-all text-sm bg-white cursor-pointer`}
              >
                <option value="">Select Division / Major</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                placeholder="Choose School first..."
                className="block w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
              />
            )}
            {errors.department && (
              <p className="text-xs text-rose-600 font-medium">{errors.department}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 block">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aarav.sharma@example.com"
              className={`block w-full rounded-xl border ${
                errors.email ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-700/10 focus:border-teal-700'
              } px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all text-sm font-mono`}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <label htmlFor="mobile" className="text-sm font-semibold text-slate-700 block">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="mobile"
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className={`block w-full rounded-xl border ${
                errors.mobile ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-700/10 focus:border-teal-700'
              } px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all text-sm font-mono`}
            />
            {errors.mobile && (
              <p className="text-xs text-rose-600 font-medium">{errors.mobile}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="address" className="text-sm font-semibold text-slate-700 block">
              Residential Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat 402, Shanti Vihar, MG Road, Bengaluru, Karnataka - 560001"
              rows={3}
              className={`block w-full rounded-xl border ${
                errors.address ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-200 focus:ring-teal-700/10 focus:border-teal-700'
              } px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all text-sm resize-none`}
            />
            {errors.address && (
              <p className="text-xs text-rose-600 font-medium">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Buttons: Save, Reset, Cancel - EXACTLY as specified in Page 10 */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-teal-100 bg-teal-50/50 px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-100/50 transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="submit"
            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-colors shadow-md shadow-teal-900/10 cursor-pointer flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </form>
    </motion.div>
  );
}
