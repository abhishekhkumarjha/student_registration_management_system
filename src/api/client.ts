import { AdminProfile, Student } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export type StudentInput = Omit<Student, 'id' | 'student_id' | 'createdAt'>;

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error || 'Server request failed', response.status);
  }

  return payload as T;
}

export async function login(username: string, password: string): Promise<AdminProfile> {
  const payload = await request<{ admin: AdminProfile }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return payload.admin;
}

export async function logout(): Promise<void> {
  await request('/logout', { method: 'POST' });
}

export async function getAdmin(): Promise<AdminProfile> {
  const payload = await request<{ admin: AdminProfile }>('/admin');
  return payload.admin;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request('/admin/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getStudents(): Promise<Student[]> {
  const payload = await request<{ students: Student[] }>('/students');
  return payload.students;
}

export async function createStudent(student: StudentInput): Promise<Student> {
  const payload = await request<{ student: Student }>('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
  return payload.student;
}

export async function updateStudent(id: string, student: StudentInput): Promise<Student> {
  const payload = await request<{ student: Student }>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  });
  return payload.student;
}

export async function deleteStudent(id: string): Promise<void> {
  await request(`/students/${id}`, { method: 'DELETE' });
}

export async function resetStudents(): Promise<Student[]> {
  const payload = await request<{ students: Student[] }>('/students/reset', { method: 'POST' });
  return payload.students;
}

export async function importStudents(students: Student[]): Promise<Student[]> {
  const payload = await request<{ students: Student[] }>('/students/import', {
    method: 'POST',
    body: JSON.stringify(students),
  });
  return payload.students;
}

