import React, { useEffect, useState } from 'react';
import { Check, Plus, UserMinus, UserPlus } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useProjectStore, useTaskStore } from '../context/projectStore';
import { mockUsers, projectMembers } from '../mockData';
import { UserRole } from '../types';
import { formatDate } from '../utils/dateUtils';

export const ProjectsPage: React.FC = () => {
  const { projects, fetchProjects, createProject } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects().catch(() => undefined);
    fetchTasks().catch(() => undefined);
  }, [fetchProjects, fetchTasks]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || projects[0];
  const selectedTasks = tasks.filter((task) => task.project_id === selectedProject?.id);
  const isLeader = user?.role === UserRole.ProjectLeader;

  const addProject = () => {
    const base = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 2);
    createProject({
      name: '新規プロジェクト',
      description: 'モック上で追加されたプロジェクトです。',
      start_date: base.toISOString(),
      end_date: end.toISOString(),
    }).catch(() => undefined);
  };

  return (
    <div className="page-container project-workspace">
      <div className="page-header compact-header">
        <div>
          <h1>{isLeader ? 'プロジェクト管理' : 'プロジェクト'}</h1>
          <p>{isLeader ? 'WBS、招待、離脱処理を確認できます。' : '参画依頼と参画中詳細を確認できます。'}</p>
        </div>
        {isLeader && (
          <button onClick={addProject}>
            <Plus size={16} />
            新規作成
          </button>
        )}
      </div>

      <div className="project-layout">
        <section className="project-list-panel">
          {projects.map((project) => (
            <button
              key={project.id}
              className={`project-list-item ${selectedProject?.id === project.id ? 'active' : ''}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <strong>{project.name}</strong>
              <span>{project.status} / {formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
            </button>
          ))}
        </section>

        {selectedProject && (
          <section className="project-detail-panel">
            <div className="project-detail-head">
              <div>
                <h2>{selectedProject.name}</h2>
                <p>{selectedProject.description}</p>
              </div>
              {!isLeader && (
                <button
                  className={requestSent === selectedProject.id ? 'success-button' : ''}
                  onClick={() => setRequestSent(selectedProject.id)}
                >
                  {requestSent === selectedProject.id ? <Check size={16} /> : <UserPlus size={16} />}
                  {requestSent === selectedProject.id ? '依頼済み' : '参画依頼'}
                </button>
              )}
            </div>

            <div className="project-metrics">
              <div><strong>{selectedTasks.length}</strong><span>WBS項目</span></div>
              <div><strong>{projectMembers[selectedProject.id]?.length || 0}</strong><span>メンバー</span></div>
              <div><strong>{Math.round(selectedTasks.reduce((sum, task) => sum + task.progress, 0) / Math.max(selectedTasks.length, 1))}%</strong><span>平均進捗</span></div>
            </div>

            <div className="wbs-table">
              <div className="wbs-row head">
                <span>WBS</span>
                <span>担当</span>
                <span>期間</span>
                <span>進捗</span>
              </div>
              {selectedTasks.map((task) => {
                const assignee = mockUsers.find((item) => item.id === task.assignee_id);
                return (
                  <div className="wbs-row" key={task.id}>
                    <span>{task.title}</span>
                    <span>{assignee?.display_name || '未割当'}</span>
                    <span>{formatDate(task.start_date)} - {formatDate(task.end_date)}</span>
                    <span>{task.progress}%</span>
                  </div>
                );
              })}
            </div>

            {isLeader && (
              <div className="member-actions">
                <button><UserPlus size={16} />新規参画者招待</button>
                <button><UserMinus size={16} />現参画者離脱</button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
