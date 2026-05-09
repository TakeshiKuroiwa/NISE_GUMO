import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  Code2,
  FolderKanban,
  LogOut,
  MoreVertical,
  Settings,
  Shield,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { mockUsers } from '../mockData';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'スケジュール', icon: CalendarDays },
    { path: '/editor', label: 'コードエディタ', icon: Code2 },
    {
      path: '/projects',
      label: user?.role === 'ProjectLeader' ? 'プロジェクト管理' : 'プロジェクト',
      icon: FolderKanban,
    },
    ...(user?.role === 'SystemAdmin'
      ? [{ path: '/admin', label: '管理画面', icon: Shield }]
      : []),
  ];

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>NISE_GUMO</h1>
          <span>Mock Workspace</span>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <button
                    className={`nav-button ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="member-panel">
          <div className="member-panel-title">
            <UsersRound size={15} />
            <span>メンバー</span>
          </div>
          {mockUsers
            .filter((member) => member.role !== 'SystemAdmin')
            .slice(0, 5)
            .map((member, index) => (
              <div className="member-row" key={member.id} title={member.bio}>
                <span className={`presence-dot ${member.is_invisible ? 'away' : 'online'}`} />
                <img src={member.avatar_url} alt="" />
                <div>
                  <strong>{member.display_name}</strong>
                  <small>{index < 3 ? 'オンライン' : '直近ログイン'}</small>
                </div>
              </div>
            ))}
        </section>

        <div className="sidebar-footer">
          <div className="profile-section">
            <img
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt="Profile"
              className="profile-avatar"
            />
            <div className="profile-info">
              <p className="profile-name">{user?.display_name || 'User'}</p>
              <p className="profile-role">{user?.is_invisible ? 'ステルス中' : user?.role}</p>
            </div>
          </div>

          <div className="profile-menu">
            <button
              className="menu-button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <MoreVertical size={18} />
            </button>
            {isProfileOpen && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/profile')}>
                  <UserRound size={14} />
                  プロフィール編集
                </button>
                <button onClick={() => navigate('/settings')}>
                  <Settings size={14} />
                  設定
                </button>
                <button onClick={() => navigate('/admin')}>
                  <Bell size={14} />
                  通知確認
                </button>
                <hr />
                <button onClick={handleLogout}>
                  <LogOut size={14} />
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};
