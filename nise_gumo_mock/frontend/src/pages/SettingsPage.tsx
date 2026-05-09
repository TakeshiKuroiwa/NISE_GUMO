import React, { useState } from 'react';
import { useAuthStore } from '../context/authStore';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [isInvisible, setIsInvisible] = useState(user?.is_invisible || false);
  const [message, setMessage] = useState('');

  const handleInvisibleChange = async () => {
    try {
      await updateProfile({ is_invisible: !isInvisible });
      setIsInvisible(!isInvisible);
      setMessage('設定を保存しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('設定の保存に失敗しました');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ 設定</h1>
      </div>

      <div className="settings-container">
        <section className="settings-section">
          <h2>プライバシー設定</h2>
          <div className="setting-item">
            <div className="setting-label">
              <h3>ログイン非通知</h3>
              <p>オンにするとログイン状態が他のユーザーに見えません</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isInvisible}
                onChange={handleInvisibleChange}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>表示設定</h2>
          <div className="setting-item">
            <div className="setting-label">
              <h3>言語</h3>
              <p>現在: 日本語</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>その他</h2>
          <div className="setting-item">
            <button className="danger-button">アカウント削除依頼</button>
          </div>
        </section>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
};