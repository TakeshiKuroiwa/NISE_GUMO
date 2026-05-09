import React, { useState } from 'react';
import { useAuthStore } from '../context/authStore';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ display_name: displayName, bio });
      setMessage('プロフィールを更新しました');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('更新に失敗しました');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👤 プロフィール編集</h1>
      </div>

      <div className="profile-form-container">
        <div className="profile-avatar-section">
          <img
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt="Profile"
            className="profile-avatar-large"
          />
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>ユーザー名</label>
            <input type="text" value={user?.username || ''} disabled />
          </div>

          <div className="form-group">
            <label>メールアドレス</label>
            <input type="email" value={user?.email || ''} disabled />
          </div>

          <div className="form-group">
            <label>表示名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力"
            />
          </div>

          <div className="form-group">
            <label>自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="自己紹介を入力"
              rows={4}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? '更新中...' : '保存'}
          </button>

          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};