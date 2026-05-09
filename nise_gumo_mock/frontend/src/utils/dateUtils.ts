export const formatDate = (dateString: string, format: string = 'YYYY-MM-DD'): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

export const formatDateJapanese = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}年${month}月${day}日`;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const getProgressColor = (progress: number): string => {
  if (progress === 0) return '#ccc';
  if (progress < 0.3) return '#ff6b6b';
  if (progress < 0.6) return '#ffa500';
  if (progress < 1.0) return '#4caf50';
  return '#4caf50';
};

export const getTaskStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    NotStarted: '未着手',
    InProgress: '進行中',
    Completed: '完了',
    Blocked: 'ブロック',
  };
  return labels[status] || status;
};

export const getProjectStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    Planning: '計画中',
    Active: '進行中',
    Completed: '完了',
    Archived: 'アーカイブ',
  };
  return labels[status] || status;
};

export const getRoleLabel = (role: string): string => {
  const labels: { [key: string]: string } = {
    Engineer: 'エンジニア',
    ProjectLeader: 'プロジェクトリーダー',
    SystemAdmin: 'システム管理者',
  };
  return labels[role] || role;
};
