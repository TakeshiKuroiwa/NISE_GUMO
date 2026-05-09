import React from 'react';
import { Bell, Send, ShieldCheck, UserPlus, UserRoundX } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { mockProjects, mockUsers } from '../mockData';
import { UserRole } from '../types';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();

  if (user?.role !== UserRole.SystemAdmin) {
    return (
      <div className="page-container">
        <div className="error-message">このページにアクセスする権限がありません</div>
      </div>
    );
  }

  return (
    <div className="page-container admin-workspace">
      <div className="page-header compact-header">
        <div>
          <h1>システム管理画面</h1>
          <p>アカウント、権限、通知送信をモック操作できます。</p>
        </div>
        <button><UserPlus size={16} />新規アカウント追加</button>
      </div>

      <div className="admin-grid">
        <section>
          <h2><ShieldCheck size={18} />ユーザー管理</h2>
          {mockUsers.map((member) => (
            <div className="admin-list-row" key={member.id}>
              <img src={member.avatar_url} alt="" />
              <div>
                <strong>{member.display_name}</strong>
                <span>{member.username} / {member.role}</span>
              </div>
              <button disabled={!member.is_invisible && member.role !== UserRole.Engineer}>
                <UserRoundX size={15} />
                削除
              </button>
            </div>
          ))}
        </section>

        <section>
          <h2><Bell size={18} />通知作成</h2>
          <label>スコープ</label>
          <select>
            <option>全体</option>
            {mockProjects.map((project) => (
              <option key={project.id}>プロジェクト: {project.name}</option>
            ))}
            <option>エンジニア単位</option>
          </select>
          <label>本文</label>
          <textarea defaultValue="本日中に担当WBSの進捗率を更新してください。" rows={6} />
          <label>返信選択肢</label>
          <input defaultValue="はい, いいえ, 後で対応" />
          <button><Send size={16} />通知送信</button>
        </section>

        <section>
          <h2><ShieldCheck size={18} />PL権限譲渡</h2>
          {mockProjects.map((project) => (
            <div className="handover-row" key={project.id}>
              <strong>{project.name}</strong>
              <select defaultValue="u-pl1">
                {mockUsers
                  .filter((member) => member.role !== UserRole.SystemAdmin)
                  .map((member) => (
                    <option key={member.id} value={member.id}>{member.display_name}</option>
                  ))}
              </select>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
