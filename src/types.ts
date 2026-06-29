/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // Internal unique ID
  student_id: number; // Integer ID as requested in Page 8 data dictionary
  roll_no: string;
  name: string;
  department: string;
  school: string;
  email: string;
  mobile: string;
  address: string;
  createdAt: string; // ISO string
}

export type DashboardTab = 'overview' | 'students' | 'search' | 'add' | 'settings';

export interface AdminProfile {
  admin_id: number;
  username: string;
  email: string;
  mobileno: string;
}
