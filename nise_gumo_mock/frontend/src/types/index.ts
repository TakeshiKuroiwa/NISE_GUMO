// User types
export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  is_invisible: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  Engineer = 'Engineer',
  ProjectLeader = 'ProjectLeader',
  SystemAdmin = 'SystemAdmin',
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export enum ProjectStatus {
  Planning = 'Planning',
  Active = 'Active',
  Completed = 'Completed',
  Archived = 'Archived',
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  joined_at: string;
  status: MemberStatus;
}

export enum MemberStatus {
  Pending = 'Pending',
  Active = 'Active',
  Left = 'Left',
}

// WBS Task types
export interface WbsTask {
  id: string;
  project_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Blocked = 'Blocked',
}

// Schedule types
export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  scope: NotificationScope;
  target_user_ids?: string[];
  target_project_ids?: string[];
  options?: string[];
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export enum NotificationScope {
  Global = 'Global',
  Project = 'Project',
  User = 'User',
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter types
export interface TaskFilters {
  project_id?: string;
  assignee_id?: string;
  status?: TaskStatus;
  progress_min?: number;
  progress_max?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  search_query?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProjectFilters {
  leader_id?: string;
  status?: ProjectStatus;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  search_query?: string;
  member_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserFilters {
  role?: UserRole;
  search_query?: string;
  project_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
