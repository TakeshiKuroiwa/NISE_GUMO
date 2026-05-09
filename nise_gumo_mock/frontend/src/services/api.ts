import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  User,
  Project,
  WbsTask,
  Schedule,
  Notification,
  LoginCredentials,
  AuthResponse,
  ApiResponse,
  TaskFilters,
  ProjectFilters,
  UserFilters,
} from '../types';
import {
  mockNotifications,
  mockProjects,
  mockSchedules,
  mockTasks,
  mockUsers,
  projectMembers,
} from '../mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiClient {
  private instance: AxiosInstance;
  private token: string | null = null;
  private currentUserId: string | null = localStorage.getItem('mockUserId');
  private users: User[] = [...mockUsers];
  private projects: Project[] = [...mockProjects];
  private tasks: WbsTask[] = [...mockTasks];
  private schedules: Schedule[] = [...mockSchedules];
  private notifications: Notification[] = [...mockNotifications];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.instance.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.token = null;
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('mockUserId');
    this.currentUserId = null;
  }

  private getCurrentMockUser(): User {
    const user = this.users.find((item) => item.id === this.currentUserId);
    return user || this.users[0];
  }

  private async requestOrMock<T>(request: () => Promise<T>, mock: () => T): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        return mock();
      }
      return mock();
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.post<ApiResponse<AuthResponse>>(
          '/auth/login',
          credentials
        );
        const data = response.data.data;
        if (data) {
          this.setToken(data.token);
        }
        return data!;
      },
      () => {
        const user = this.users.find((item) => item.username === credentials.username);
        if (!user) {
          throw new Error('Invalid demo user');
        }
        const token = `mock-token-${user.id}`;
        this.currentUserId = user.id;
        localStorage.setItem('mockUserId', user.id);
        this.setToken(token);
        return { token, user };
      }
    );
  }

  async getCurrentUser(): Promise<User> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<User>>('/auth/me');
        return response.data.data!;
      },
      () => this.getCurrentMockUser()
    );
  }

  // Project endpoints
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<Project[]>>(
          '/projects',
          { params: filters }
        );
        return response.data.data || [];
      },
      () => {
        const user = this.getCurrentMockUser();
        let projects = [...this.projects];
        if (user.role === 'Engineer') {
          projects = projects.filter((project) =>
            projectMembers[project.id]?.includes(user.id)
          );
        }
        return projects;
      }
    );
  }

  async getProject(id: string): Promise<Project> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<Project>>(
          `/projects/${id}`
        );
        return response.data.data!;
      },
      () => this.projects.find((project) => project.id === id)!
    );
  }

  async createProject(data: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
  }): Promise<Project> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.post<ApiResponse<Project>>(
          '/projects',
          data
        );
        return response.data.data!;
      },
      () => {
        const project: Project = {
          id: `p-${Date.now()}`,
          leader_id: this.getCurrentMockUser().id,
          status: 'Planning' as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        this.projects = [project, ...this.projects];
        return project;
      }
    );
  }

  async updateProject(
    id: string,
    data: {
      name?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<Project> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.put<ApiResponse<Project>>(
          `/projects/${id}`,
          data
        );
        return response.data.data!;
      },
      () => {
        const project = this.projects.find((item) => item.id === id)!;
        const updated = { ...project, ...data, updated_at: new Date().toISOString() };
        this.projects = this.projects.map((item) => (item.id === id ? updated : item));
        return updated;
      }
    );
  }

  // Task endpoints
  async getTasks(filters?: TaskFilters): Promise<WbsTask[]> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<WbsTask[]>>(
          '/tasks',
          { params: filters }
        );
        return response.data.data || [];
      },
      () => this.tasks.filter((task) => !filters?.project_id || task.project_id === filters.project_id)
    );
  }

  async getProjectTasks(
    projectId: string,
    filters?: TaskFilters
  ): Promise<WbsTask[]> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<WbsTask[]>>(
          `/projects/${projectId}/tasks`,
          { params: filters }
        );
        return response.data.data || [];
      },
      () => this.tasks.filter((task) => task.project_id === projectId)
    );
  }

  async getTask(id: string): Promise<WbsTask> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<WbsTask>>(
          `/tasks/${id}`
        );
        return response.data.data!;
      },
      () => this.tasks.find((task) => task.id === id)!
    );
  }

  async updateTask(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      assignee_id: string;
      start_date: string;
      end_date: string;
      progress: number;
      status: string;
    }>
  ): Promise<WbsTask> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.put<ApiResponse<WbsTask>>(
          `/tasks/${id}`,
          data
        );
        return response.data.data!;
      },
      () => {
        const task = this.tasks.find((item) => item.id === id)!;
        const updated: WbsTask = { ...task, ...(data as Partial<WbsTask>), updated_at: new Date().toISOString() };
        this.tasks = this.tasks.map((item) => (item.id === id ? updated : item));
        return updated;
      }
    );
  }

  // Schedule endpoints
  async getSchedules(): Promise<Schedule[]> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<Schedule[]>>(
          '/schedules'
        );
        return response.data.data || [];
      },
      () => {
        const user = this.getCurrentMockUser();
        return this.schedules.filter((schedule) => schedule.user_id === user.id);
      }
    );
  }

  async createSchedule(data: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    is_all_day: boolean;
  }): Promise<Schedule> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.post<ApiResponse<Schedule>>(
          '/schedules',
          data
        );
        return response.data.data!;
      },
      () => {
        const schedule: Schedule = {
          id: `s-${Date.now()}`,
          user_id: this.getCurrentMockUser().id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        this.schedules = [schedule, ...this.schedules];
        return schedule;
      }
    );
  }

  async updateSchedule(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      start_date: string;
      end_date: string;
      is_all_day: boolean;
    }>
  ): Promise<Schedule> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.put<ApiResponse<Schedule>>(
          `/schedules/${id}`,
          data
        );
        return response.data.data!;
      },
      () => {
        const schedule = this.schedules.find((item) => item.id === id)!;
        const updated = { ...schedule, ...data, updated_at: new Date().toISOString() };
        this.schedules = this.schedules.map((item) => (item.id === id ? updated : item));
        return updated;
      }
    );
  }

  async deleteSchedule(id: string): Promise<void> {
    return this.requestOrMock(
      async () => {
        await this.instance.delete(`/schedules/${id}`);
      },
      () => {
        this.schedules = this.schedules.filter((item) => item.id !== id);
      }
    );
  }

  // User endpoints
  async getUsers(filters?: UserFilters): Promise<User[]> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<User[]>>(
          '/users',
          { params: filters }
        );
        return response.data.data || [];
      },
      () =>
        this.users.filter((user) => !filters?.role || user.role === filters.role)
    );
  }

  async getUser(id: string): Promise<User> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<User>>(
          `/users/${id}`
        );
        return response.data.data!;
      },
      () => this.users.find((user) => user.id === id)!
    );
  }

  async updateProfile(
    id: string,
    data: Partial<{
      display_name: string;
      bio: string;
      is_invisible: boolean;
    }>
  ): Promise<User> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.put<ApiResponse<User>>(
          `/users/${id}/profile`,
          data
        );
        return response.data.data!;
      },
      () => {
        const user = this.users.find((item) => item.id === id)!;
        const updated = { ...user, ...data, updated_at: new Date().toISOString() };
        this.users = this.users.map((item) => (item.id === id ? updated : item));
        return updated;
      }
    );
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    return this.requestOrMock(
      async () => {
        const response = await this.instance.get<ApiResponse<Notification[]>>(
          '/notifications'
        );
        return response.data.data || [];
      },
      () => this.notifications
    );
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.requestOrMock(
      async () => {
        await this.instance.post(`/notifications/${id}/read`);
      },
      () => {
        this.notifications = this.notifications.filter((item) => item.id !== id);
      }
    );
  }
}

export const apiClient = new ApiClient();
