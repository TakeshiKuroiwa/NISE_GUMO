import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('ログインに失敗しました。ユーザー名とパスワードを確認してください。');
      console.error(err);
    }
  };

  // Demo credentials
  const demoUsers = [
    { username: 'eng1', label: 'エンジニア 1' },
    { username: 'pl1', label: 'プロジェクトリーダー 1' },
    { username: 'admin1', label: 'システム管理者 1' },
  ];

  const fillDemo = (user: string) => {
    setUsername(user);
    setPassword('demo');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>NISE_GUMO</h1>
          <p className="subtitle">プロジェクト進捗管理システム</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">デモアカウント:</p>
          <div className="demo-buttons">
            {demoUsers.map((user) => (
              <button
                key={user.username}
                type="button"
                className="demo-button"
                onClick={() => fillDemo(user.username)}
              >
                {user.label}
              </button>
            ))}
          </div>
          <p className="demo-note">※ デモでは任意のパスワードで認証できます</p>
        </div>
      </div>

      <div className="login-footer">
        <p>NISE_GUMO Mock Frontend © 2026</p>
      </div>
    </div>
  );
};
