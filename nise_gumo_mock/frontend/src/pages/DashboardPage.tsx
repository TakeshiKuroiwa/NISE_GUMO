import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight, Plus, Save } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useProjectStore, useTaskStore } from '../context/projectStore';
import { useScheduleStore } from '../context/scheduleStore';
import { mockNotifications } from '../mockData';
import { formatDate } from '../utils/dateUtils';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { schedules, fetchSchedules, createSchedule } = useScheduleStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [newSchedule, setNewSchedule] = useState('');

  useEffect(() => {
    fetchProjects().catch(() => undefined);
    fetchTasks().catch(() => undefined);
    fetchSchedules().catch(() => undefined);
  }, [fetchProjects, fetchSchedules, fetchTasks]);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = [
    ...Array(monthStart.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
  const selectedDateKey = selectedDate.toDateString();

  const selectedSchedules = schedules.filter(
    (schedule) => new Date(schedule.start_date).toDateString() === selectedDateKey
  );

  const selectedTasks = tasks.filter((task) => {
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    return selectedDate >= start && selectedDate <= end;
  });

  const ganttRows = useMemo(
    () =>
      tasks.slice(0, 5).map((task) => {
        const start = new Date(task.start_date).getDate();
        const end = new Date(task.end_date).getDate();
        const left = Math.max(0, (start - 1) / daysInMonth) * 100;
        const width = Math.max(9, ((end - start + 1) / daysInMonth) * 100);
        return { task, left, width };
      }),
    [daysInMonth, tasks]
  );

  const addSchedule = async () => {
    if (!newSchedule.trim()) return;
    const start = new Date(selectedDate);
    start.setHours(10, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(11, 0, 0, 0);
    await createSchedule({
      title: newSchedule,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      is_all_day: false,
    });
    setNewSchedule('');
  };

  const canMoveMonth = (offset: number) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const limitPast = new Date();
    limitPast.setFullYear(limitPast.getFullYear() - 1);
    const limitFuture = new Date();
    limitFuture.setFullYear(limitFuture.getFullYear() + 1);
    return next >= limitPast && next <= limitFuture;
  };

  const moveMonth = (offset: number) => {
    if (!canMoveMonth(offset)) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDay(1);
  };

  return (
    <div className="dashboard-page">
      <header className="workspace-topbar">
        <div>
          <h1>スケジュール</h1>
          <p>{user?.display_name}さんのWBSと個人予定をまとめて確認できます。</p>
        </div>
        <div className="notification-banner">
          <Bell size={17} />
          <strong>{mockNotifications[0].title}</strong>
          <span>{mockNotifications[0].message}</span>
          <button>はい</button>
          <button>後で</button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="calendar-section">
          <div className="calendar-header">
            <button onClick={() => moveMonth(-1)} disabled={!canMoveMonth(-1)} title="前月">
              <ChevronLeft size={18} />
            </button>
            <h2>
              {currentDate.toLocaleString('ja-JP', { year: 'numeric', month: 'long' })}
            </h2>
            <button onClick={() => moveMonth(1)} disabled={!canMoveMonth(1)} title="翌月">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-weekdays">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((day, index) => {
              const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
              const dayTasks = date
                ? tasks.filter((task) => date >= new Date(task.start_date) && date <= new Date(task.end_date))
                : [];
              const daySchedules = date
                ? schedules.filter((schedule) => new Date(schedule.start_date).toDateString() === date.toDateString())
                : [];
              return (
                <button
                  key={`${day}-${index}`}
                  className={`calendar-day ${day ? '' : 'empty'} ${day === selectedDay ? 'selected' : ''}`}
                  disabled={!day}
                  onClick={() => day && setSelectedDay(day)}
                >
                  {day && <span className="day-number">{day}</span>}
                  {dayTasks.slice(0, 2).map((task) => (
                    <small key={task.id} className="task-chip">{task.title}</small>
                  ))}
                  {daySchedules.slice(0, 1).map((schedule) => (
                    <small key={schedule.id} className="schedule-chip">{schedule.title}</small>
                  ))}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="day-panel">
          <h2>{formatDate(selectedDate.toISOString())}</h2>
          <section>
            <h3>今日やるWBS</h3>
            {selectedTasks.length ? (
              selectedTasks.map((task) => (
                <div className="task-row" key={task.id}>
                  <span>{task.title}</span>
                  <strong>{task.progress}%</strong>
                </div>
              ))
            ) : (
              <p className="empty-message">該当タスクはありません</p>
            )}
          </section>
          <section>
            <h3>個人スケジュール</h3>
            {selectedSchedules.map((schedule) => (
              <div className="schedule-row" key={schedule.id}>{schedule.title}</div>
            ))}
            <div className="quick-add">
              <input
                value={newSchedule}
                onChange={(event) => setNewSchedule(event.target.value)}
                placeholder="例: 11:00 打ち合わせ"
              />
              <button onClick={addSchedule} title="追加">
                <Plus size={16} />
              </button>
            </div>
          </section>
        </aside>
      </div>

      <section className="gantt-section">
        <div className="section-title">
          <h2>参画中プロジェクト ガント</h2>
          <button>
            <Save size={16} />
            進捗保存
          </button>
        </div>
        <div className="gantt-list">
          {ganttRows.map(({ task, left, width }) => {
            const project = projects.find((item) => item.id === task.project_id);
            return (
              <div className="gantt-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{project?.name}</span>
                </div>
                <div className="gantt-track">
                  <span style={{ left: `${left}%`, width: `${width}%` }}>{task.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
