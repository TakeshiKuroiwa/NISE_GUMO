import { create } from 'zustand';
import { Project, WbsTask, ProjectFilters, TaskFilters } from '../types';
import { apiClient } from '../services/api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  
  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  createProject: (data: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
  }) => Promise<void>;
  updateProject: (
    id: string,
    data: Partial<Project>
  ) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async (filters?: ProjectFilters) => {
    set({ isLoading: true });
    try {
      const projects = await apiClient.getProjects(filters);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const project = await apiClient.getProject(id);
      set({ currentProject: project, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  createProject: async (data) => {
    set({ isLoading: true });
    try {
      const newProject = await apiClient.createProject(data);
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    set({ isLoading: true });
    try {
      const updated = await apiClient.updateProject(id, data as any);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

interface TaskState {
  tasks: WbsTask[];
  projectTasks: Map<string, WbsTask[]>;
  currentTask: WbsTask | null;
  isLoading: boolean;

  // Actions
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchProjectTasks: (projectId: string, filters?: TaskFilters) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  setCurrentTask: (task: WbsTask | null) => void;
  updateTask: (id: string, data: Partial<WbsTask>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  projectTasks: new Map(),
  currentTask: null,
  isLoading: false,

  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true });
    try {
      const tasks = await apiClient.getTasks(filters);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchProjectTasks: async (projectId: string, filters?: TaskFilters) => {
    set({ isLoading: true });
    try {
      const tasks = await apiClient.getProjectTasks(projectId, filters);
      set((state) => ({
        projectTasks: new Map(state.projectTasks).set(projectId, tasks),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchTask: async (id: string) => {
    set({ isLoading: true });
    try {
      const task = await apiClient.getTask(id);
      set({ currentTask: task, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setCurrentTask: (task: WbsTask | null) => {
    set({ currentTask: task });
  },

  updateTask: async (id: string, data: Partial<WbsTask>) => {
    set({ isLoading: true });
    try {
      const updated = await apiClient.updateTask(id, data as any);
      set((state) => {
        const newProjectTasks = new Map(state.projectTasks);
        const projectId = updated.project_id;
        const tasks = newProjectTasks.get(projectId) || [];
        newProjectTasks.set(
          projectId,
          tasks.map((t) => (t.id === id ? updated : t))
        );

        return {
          tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
          projectTasks: newProjectTasks,
          currentTask: state.currentTask?.id === id ? updated : state.currentTask,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
