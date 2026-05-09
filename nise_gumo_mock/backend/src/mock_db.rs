use crate::models::*;
use chrono::{DateTime, Utc, Duration};
use fake::faker::*;
use fake::Fake;
use rand::Rng;
use std::collections::HashMap;
use uuid::Uuid;

pub struct MockDatabase {
    pub users: Vec<User>,
    pub projects: Vec<Project>,
    pub project_members: Vec<ProjectMember>,
    pub wbs_tasks: Vec<WbsTask>,
    pub schedules: Vec<Schedule>,
    pub notifications: Vec<Notification>,
    pub notification_reads: Vec<NotificationRead>,
}

impl MockDatabase {
    pub fn new() -> Self {
        let mut db = Self {
            users: Vec::new(),
            projects: Vec::new(),
            project_members: Vec::new(),
            wbs_tasks: Vec::new(),
            schedules: Vec::new(),
            notifications: Vec::new(),
            notification_reads: Vec::new(),
        };
        db.generate_data();
        db
    }

    fn generate_data(&mut self) {
        self.generate_users();
        self.generate_projects();
        self.generate_project_members();
        self.generate_wbs_tasks();
        self.generate_schedules();
        self.generate_notifications();
    }

    fn generate_users(&mut self) {
        let now = Utc::now();

        // System Admins (2)
        for i in 1..=2 {
            self.users.push(User {
                id: Uuid::new_v4(),
                username: format!("admin{}", i),
                email: format!("admin{}@nise-gumo.com", i),
                display_name: format!("システム管理者 {}", i),
                role: UserRole::SystemAdmin,
                avatar_url: Some(format!("https://api.dicebear.com/7.x/avataaars/svg?seed=admin{}", i)),
                bio: Some("システム管理者です。".to_string()),
                is_invisible: false,
                created_at: now - Duration::days(rand::thread_rng().gen_range(30..365)),
                updated_at: now,
            });
        }

        // Project Leaders (7)
        for i in 1..=7 {
            self.users.push(User {
                id: Uuid::new_v4(),
                username: format!("pl{}", i),
                email: format!("pl{}@nise-gumo.com", i),
                display_name: format!("プロジェクトリーダー {}", i),
                role: UserRole::ProjectLeader,
                avatar_url: Some(format!("https://api.dicebear.com/7.x/avataaars/svg?seed=pl{}", i)),
                bio: Some("プロジェクトリーダーです。チームの進捗管理を担当しています。".to_string()),
                is_invisible: rand::thread_rng().gen_bool(0.1),
                created_at: now - Duration::days(rand::thread_rng().gen_range(30..365)),
                updated_at: now,
            });
        }

        // Engineers (45)
        for i in 1..=45 {
            let names = [
                "田中太郎", "佐藤花子", "鈴木次郎", "高橋美咲", "伊藤健太",
                "渡辺真理", "山本大輔", "中村愛美", "小林正樹", "加藤彩花",
                "吉田健一", "山田真理", "佐々木健", "松本美香", "井上太郎",
                "木村花子", "林次郎", "清水美咲", "山崎健太", "森真理",
                "池田大輔", "橋本愛美", "石川正樹", "前田彩花", "後藤健一",
                "村上真理", "遠藤健", "青木美香", "坂本太郎", "藤田花子",
                "西村次郎", "岡田美咲", "斎藤健太", "金子真理", "藤井大輔",
                "酒井愛美", "杉山正樹", "神谷彩花", "内田健一", "高野真理",
                "安藤健", "大塚美香", "小川太郎", "平野花子", "上田次郎"
            ];
            let name = names[(i - 1) % names.len()];

            self.users.push(User {
                id: Uuid::new_v4(),
                username: format!("eng{}", i),
                email: format!("eng{}@nise-gumo.com", i),
                display_name: name.to_string(),
                role: UserRole::Engineer,
                avatar_url: Some(format!("https://api.dicebear.com/7.x/avataaars/svg?seed=eng{}", i)),
                bio: Some(format!("{}です。プログラミングとシステム開発が好きです。", name)),
                is_invisible: rand::thread_rng().gen_bool(0.2),
                created_at: now - Duration::days(rand::thread_rng().gen_range(7..180)),
                updated_at: now,
            });
        }
    }

    fn generate_projects(&mut self) {
        let now = Utc::now();
        let project_names = [
            "クラウド移行プロジェクト",
            "モバイルアプリ開発",
            "AIチャットボット構築",
            "データ分析プラットフォーム",
            "セキュリティ監査システム",
            "IoTデバイス管理",
            "ブロックチェーン基盤開発"
        ];

        let project_descriptions = [
            "既存システムのクラウド移行と最適化",
            "クロスプラットフォームのモバイルアプリケーション開発",
            "自然言語処理を活用したAIチャットボット",
            "ビッグデータ分析のためのプラットフォーム構築",
            "企業セキュリティの包括的な監査システム",
            "IoTデバイスの統合管理プラットフォーム",
            "分散型台帳技術を活用した基盤システム"
        ];

        let pl_ids: Vec<Uuid> = self.users.iter()
            .filter(|u| matches!(u.role, UserRole::ProjectLeader))
            .map(|u| u.id)
            .collect();

        for (i, (name, desc)) in project_names.iter().zip(project_descriptions.iter()).enumerate() {
            let start_date = now + Duration::days(rand::thread_rng().gen_range(-30..30));
            let duration_days = rand::thread_rng().gen_range(30..60);

            self.projects.push(Project {
                id: Uuid::new_v4(),
                name: name.to_string(),
                description: Some(desc.to_string()),
                leader_id: pl_ids[i % pl_ids.len()],
                start_date,
                end_date: start_date + Duration::days(duration_days),
                status: if start_date > now {
                    ProjectStatus::Planning
                } else if start_date + Duration::days(duration_days) < now {
                    ProjectStatus::Completed
                } else {
                    ProjectStatus::Active
                },
                created_at: start_date - Duration::days(rand::thread_rng().gen_range(1..30)),
                updated_at: now,
            });
        }
    }

    fn generate_project_members(&mut self) {
        let engineer_ids: Vec<Uuid> = self.users.iter()
            .filter(|u| matches!(u.role, UserRole::Engineer))
            .map(|u| u.id)
            .collect();

        for project in &self.projects {
            // Add project leader
            self.project_members.push(ProjectMember {
                project_id: project.id,
                user_id: project.leader_id,
                joined_at: project.created_at,
                status: MemberStatus::Active,
            });

            // Add 6-8 engineers per project
            let member_count = rand::thread_rng().gen_range(6..9);
            let mut available_engineers = engineer_ids.clone();
            available_engineers.retain(|&id| id != project.leader_id);

            for &engineer_id in available_engineers.iter().take(member_count) {
                self.project_members.push(ProjectMember {
                    project_id: project.id,
                    user_id: engineer_id,
                    joined_at: project.created_at + Duration::days(rand::thread_rng().gen_range(0..7)),
                    status: MemberStatus::Active,
                });
            }
        }
    }

    fn generate_wbs_tasks(&mut self) {
        let task_templates = [
            ("要件定義", "システム要件の定義と整理"),
            ("設計", "アーキテクチャ設計と詳細設計"),
            ("実装", "コーディングとユニットテスト"),
            ("統合テスト", "システム統合とテスト"),
            ("リリース準備", "ドキュメント作成とリリース準備"),
            ("運用開始", "本番環境デプロイと運用開始"),
        ];

        let subtask_templates = [
            ("フェーズ1", "初期段階の作業"),
            ("フェーズ2", "中間段階の作業"),
            ("フェーズ3", "最終段階の作業"),
            ("レビュー", "品質チェックとレビュー"),
            ("修正", "フィードバック対応と修正"),
        ];

        for project in &self.projects {
            let project_members: Vec<Uuid> = self.project_members.iter()
                .filter(|m| m.project_id == project.id && m.status == MemberStatus::Active)
                .map(|m| m.user_id)
                .collect();

            let project_duration = (project.end_date - project.start_date).num_days() as f64;

            // Create main tasks (milestones)
            for (i, (title, desc)) in task_templates.iter().enumerate() {
                let task_start = project.start_date + Duration::days((i as f64 * project_duration / task_templates.len() as f64) as i64);
                let task_end = task_start + Duration::days((project_duration / task_templates.len() as f64) as i64);

                let progress = if project.status == ProjectStatus::Completed {
                    1.0
                } else if project.status == ProjectStatus::Planning {
                    0.0
                } else {
                    rand::thread_rng().gen_range(0.0..0.9)
                };

                let main_task = WbsTask {
                    id: Uuid::new_v4(),
                    project_id: project.id,
                    parent_id: None,
                    title: format!("{} - {}", project.name, title),
                    description: Some(desc.to_string()),
                    assignee_id: Some(project_members[rand::thread_rng().gen_range(0..project_members.len())]),
                    start_date: task_start,
                    end_date: task_end,
                    progress,
                    status: if progress >= 1.0 {
                        TaskStatus::Completed
                    } else if progress > 0.0 {
                        TaskStatus::InProgress
                    } else {
                        TaskStatus::NotStarted
                    },
                    created_at: project.created_at,
                    updated_at: Utc::now(),
                };

                self.wbs_tasks.push(main_task.clone());

                // Create subtasks (2-4 per main task)
                let subtask_count = rand::thread_rng().gen_range(2..5);
                let subtask_duration = (task_end - task_start).num_days() / subtask_count as i64;

                for j in 0..subtask_count {
                    let sub_start = task_start + Duration::days(j * subtask_duration);
                    let sub_end = sub_start + Duration::days(subtask_duration);

                    let sub_progress = if main_task.progress >= 1.0 {
                        1.0
                    } else {
                        rand::thread_rng().gen_range(0.0..main_task.progress.max(0.1))
                    };

                    self.wbs_tasks.push(WbsTask {
                        id: Uuid::new_v4(),
                        project_id: project.id,
                        parent_id: Some(main_task.id),
                        title: format!("{} - {}", main_task.title, subtask_templates[j % subtask_templates.len()].0),
                        description: Some(subtask_templates[j % subtask_templates.len()].1.to_string()),
                        assignee_id: Some(project_members[rand::thread_rng().gen_range(0..project_members.len())]),
                        start_date: sub_start,
                        end_date: sub_end,
                        progress: sub_progress,
                        status: if sub_progress >= 1.0 {
                            TaskStatus::Completed
                        } else if sub_progress > 0.0 {
                            TaskStatus::InProgress
                        } else {
                            TaskStatus::NotStarted
                        },
                        created_at: project.created_at,
                        updated_at: Utc::now(),
                    });
                }
            }
        }
    }

    fn generate_schedules(&mut self) {
        let schedule_types = [
            ("ミーティング", "チームミーティング"),
            ("レビュー", "コードレビューミーティング"),
            ("研修", "技術研修"),
            ("休暇", "有給休暇"),
            ("出張", "業務出張"),
            ("面談", "1on1ミーティング"),
        ];

        let now = Utc::now();

        for user in &self.users {
            // Generate 5-15 schedules per user
            let schedule_count = rand::thread_rng().gen_range(5..16);

            for _ in 0..schedule_count {
                let days_offset = rand::thread_rng().gen_range(-30..90);
                let start_date = now + Duration::days(days_offset);

                let (title, desc) = schedule_types[rand::thread_rng().gen_range(0..schedule_types.len())];
                let is_all_day = rand::thread_rng().gen_bool(0.3);

                let (start_time, end_time) = if is_all_day {
                    (start_date.date().and_hms(0, 0, 0), (start_date + Duration::days(1)).date().and_hms(0, 0, 0))
                } else {
                    let start_hour = rand::thread_rng().gen_range(9..17);
                    let duration_hours = rand::thread_rng().gen_range(1..4);
                    (
                        start_date.date().and_hms(start_hour, 0, 0),
                        start_date.date().and_hms(start_hour + duration_hours, 0, 0)
                    )
                };

                self.schedules.push(Schedule {
                    id: Uuid::new_v4(),
                    user_id: user.id,
                    title: title.to_string(),
                    description: Some(desc.to_string()),
                    start_date: start_time,
                    end_date: end_time,
                    is_all_day,
                    created_at: now - Duration::days(rand::thread_rng().gen_range(1..30)),
                    updated_at: now,
                });
            }
        }
    }

    fn generate_notifications(&mut self) {
        let notification_templates = [
            ("システムメンテナンスのお知らせ", "明日10:00-12:00にシステムメンテナンスを実施します。", NotificationScope::Global, None, None, None),
            ("新プロジェクト開始のお知らせ", "新しいプロジェクトが開始されました。詳細はプロジェクトページをご確認ください。", NotificationScope::Global, None, None, None),
            ("セキュリティアップデート", "セキュリティパッチが適用されました。最新版をご利用ください。", NotificationScope::Global, None, None, None),
            ("タスク期限アラート", "担当タスクの期限が近づいています。進捗をご確認ください。", NotificationScope::User, None, None, Some(vec!["確認しました".to_string(), "延期を希望".to_string()])),
            ("プロジェクト進捗確認", "プロジェクトの進捗状況をご確認ください。", NotificationScope::Project, None, None, Some(vec!["了解".to_string(), "課題あり".to_string(), "支援が必要".to_string()])),
        ];

        let now = Utc::now();
        let admin_ids: Vec<Uuid> = self.users.iter()
            .filter(|u| matches!(u.role, UserRole::SystemAdmin))
            .map(|u| u.id)
            .collect();

        for _ in 0..20 {
            let (title, message, scope, target_users, target_projects, options) = notification_templates[rand::thread_rng().gen_range(0..notification_templates.len())].clone();

            let target_user_ids = match scope {
                NotificationScope::User => {
                    let user_ids: Vec<Uuid> = self.users.iter().map(|u| u.id).collect();
                    Some(vec![user_ids[rand::thread_rng().gen_range(0..user_ids.len())]])
                },
                NotificationScope::Project => None,
                NotificationScope::Global => None,
            };

            let target_project_ids = match scope {
                NotificationScope::Project => {
                    let project_ids: Vec<Uuid> = self.projects.iter().map(|p| p.id).collect();
                    Some(vec![project_ids[rand::thread_rng().gen_range(0..project_ids.len())]])
                },
                _ => None,
            };

            let notification = Notification {
                id: Uuid::new_v4(),
                title: title.to_string(),
                message: message.to_string(),
                scope,
                target_user_ids,
                target_project_ids,
                options,
                created_by: admin_ids[rand::thread_rng().gen_range(0..admin_ids.len())],
                created_at: now - Duration::days(rand::thread_rng().gen_range(0..30)),
                expires_at: Some(now + Duration::days(rand::thread_rng().gen_range(1..30))),
            };

            self.notifications.push(notification);
        }
    }

    // Query methods
    pub fn get_user_by_username(&self, username: &str) -> Option<&User> {
        self.users.iter().find(|u| u.username == username)
    }

    pub fn get_user_projects(&self, user_id: Uuid) -> Vec<&Project> {
        let project_ids: Vec<Uuid> = self.project_members.iter()
            .filter(|m| m.user_id == user_id && m.status == MemberStatus::Active)
            .map(|m| m.project_id)
            .collect();

        self.projects.iter()
            .filter(|p| project_ids.contains(&p.id))
            .collect()
    }

    pub fn get_project_tasks(&self, project_id: Uuid) -> Vec<&WbsTask> {
        self.wbs_tasks.iter()
            .filter(|t| t.project_id == project_id)
            .collect()
    }

    pub fn get_user_schedules(&self, user_id: Uuid) -> Vec<&Schedule> {
        self.schedules.iter()
            .filter(|s| s.user_id == user_id)
            .collect()
    }

    pub fn get_user_notifications(&self, user_id: Uuid) -> Vec<&Notification> {
        self.notifications.iter()
            .filter(|n| {
                match n.scope {
                    NotificationScope::Global => true,
                    NotificationScope::User => n.target_user_ids.as_ref().map_or(false, |ids| ids.contains(&user_id)),
                    NotificationScope::Project => {
                        if let Some(project_ids) = &n.target_project_ids {
                            let user_project_ids: Vec<Uuid> = self.project_members.iter()
                                .filter(|m| m.user_id == user_id && m.status == MemberStatus::Active)
                                .map(|m| m.project_id)
                                .collect();
                            project_ids.iter().any(|pid| user_project_ids.contains(pid))
                        } else {
                            false
                        }
                    }
                }
            })
            .collect()
    }

    pub fn filter_tasks(&self, filters: &TaskFilters) -> Vec<&WbsTask> {
        let mut tasks: Vec<&WbsTask> = self.wbs_tasks.iter().collect();

        if let Some(project_id) = filters.project_id {
            tasks.retain(|t| t.project_id == project_id);
        }

        if let Some(assignee_id) = filters.assignee_id {
            tasks.retain(|t| t.assignee_id == Some(assignee_id));
        }

        if let Some(status) = &filters.status {
            tasks.retain(|t| &t.status == status);
        }

        if let Some(min) = filters.progress_min {
            tasks.retain(|t| t.progress >= min);
        }

        if let Some(max) = filters.progress_max {
            tasks.retain(|t| t.progress <= max);
        }

        if let Some(from) = filters.start_date_from {
            tasks.retain(|t| t.start_date >= from);
        }

        if let Some(to) = filters.start_date_to {
            tasks.retain(|t| t.start_date <= to);
        }

        if let Some(from) = filters.end_date_from {
            tasks.retain(|t| t.end_date >= from);
        }

        if let Some(to) = filters.end_date_to {
            tasks.retain(|t| t.end_date <= to);
        }

        if let Some(query) = &filters.search_query {
            let query_lower = query.to_lowercase();
            tasks.retain(|t| {
                t.title.to_lowercase().contains(&query_lower) ||
                t.description.as_ref().map_or(false, |d| d.to_lowercase().contains(&query_lower))
            });
        }

        // Sorting
        match filters.sort_by.as_deref() {
            Some("start_date") => {
                if filters.sort_order.as_deref() == Some("desc") {
                    tasks.sort_by(|a, b| b.start_date.cmp(&a.start_date));
                } else {
                    tasks.sort_by(|a, b| a.start_date.cmp(&b.start_date));
                }
            },
            Some("end_date") => {
                if filters.sort_order.as_deref() == Some("desc") {
                    tasks.sort_by(|a, b| b.end_date.cmp(&a.end_date));
                } else {
                    tasks.sort_by(|a, b| a.end_date.cmp(&b.end_date));
                }
            },
            Some("progress") => {
                if filters.sort_order.as_deref() == Some("desc") {
                    tasks.sort_by(|a, b| b.progress.partial_cmp(&a.progress).unwrap());
                } else {
                    tasks.sort_by(|a, b| a.progress.partial_cmp(&b.progress).unwrap());
                }
            },
            _ => {} // Default: no sorting or sort by created_at
        }

        // Pagination
        let page = filters.page.unwrap_or(0);
        let limit = filters.limit.unwrap_or(50);
        let start = page * limit;
        let end = start + limit;

        if start < tasks.len() {
            tasks[start..tasks.len().min(end)].to_vec()
        } else {
            vec![]
        }
    }

    pub fn filter_projects(&self, filters: &ProjectFilters) -> Vec<&Project> {
        let mut projects: Vec<&Project> = self.projects.iter().collect();

        if let Some(leader_id) = filters.leader_id {
            projects.retain(|p| p.leader_id == leader_id);
        }

        if let Some(status) = &filters.status {
            projects.retain(|p| &p.status == status);
        }

        if let Some(from) = filters.start_date_from {
            projects.retain(|p| p.start_date >= from);
        }

        if let Some(to) = filters.start_date_to {
            projects.retain(|p| p.start_date <= to);
        }

        if let Some(from) = filters.end_date_from {
            projects.retain(|p| p.end_date >= from);
        }

        if let Some(to) = filters.end_date_to {
            projects.retain(|p| p.end_date <= to);
        }

        if let Some(member_id) = filters.member_id {
            let member_project_ids: Vec<Uuid> = self.project_members.iter()
                .filter(|m| m.user_id == member_id && m.status == MemberStatus::Active)
                .map(|m| m.project_id)
                .collect();
            projects.retain(|p| member_project_ids.contains(&p.id));
        }

        if let Some(query) = &filters.search_query {
            let query_lower = query.to_lowercase();
            projects.retain(|p| {
                p.name.to_lowercase().contains(&query_lower) ||
                p.description.as_ref().map_or(false, |d| d.to_lowercase().contains(&query_lower))
            });
        }

        // Sorting
        match filters.sort_by.as_deref() {
            Some("start_date") => {
                if filters.sort_order.as_deref() == Some("desc") {
                    projects.sort_by(|a, b| b.start_date.cmp(&a.start_date));
                } else {
                    projects.sort_by(|a, b| a.start_date.cmp(&b.start_date));
                }
            },
            Some("end_date") => {
                if filters.sort_order.as_deref() == Some("desc") {
                    projects.sort_by(|a, b| b.end_date.cmp(&a.end_date));
                } else {
                    projects.sort_by(|a, b| a.end_date.cmp(&b.end_date));
                }
            },
            _ => {} // Default: sort by name
        }

        // Pagination
        let page = filters.page.unwrap_or(0);
        let limit = filters.limit.unwrap_or(20);
        let start = page * limit;
        let end = start + limit;

        if start < projects.len() {
            projects[start..projects.len().min(end)].to_vec()
        } else {
            vec![]
        }
    }

    pub fn filter_users(&self, filters: &UserFilters) -> Vec<&User> {
        let mut users: Vec<&User> = self.users.iter().collect();

        if let Some(role) = &filters.role {
            users.retain(|u| &u.role == role);
        }

        if let Some(project_id) = filters.project_id {
            let member_user_ids: Vec<Uuid> = self.project_members.iter()
                .filter(|m| m.project_id == project_id && m.status == MemberStatus::Active)
                .map(|m| m.user_id)
                .collect();
            users.retain(|u| member_user_ids.contains(&u.id));
        }

        if let Some(query) = &filters.search_query {
            let query_lower = query.to_lowercase();
            users.retain(|u| {
                u.username.to_lowercase().contains(&query_lower) ||
                u.display_name.to_lowercase().contains(&query_lower) ||
                u.email.to_lowercase().contains(&query_lower) ||
                u.bio.as_ref().map_or(false, |b| b.to_lowercase().contains(&query_lower))
            });
        }

        // Sorting
        match filters.sort_by.as_deref() {
            Some("display_name") => {
                if filters.sort_order.as_deref() == Some("desc") {
                    users.sort_by(|a, b| b.display_name.cmp(&a.display_name));
                } else {
                    users.sort_by(|a, b| a.display_name.cmp(&b.display_name));
                }
            },
            Some("created_at") => {
                if filters.sort_order.as_deref() == Some("desc") {
                    users.sort_by(|a, b| b.created_at.cmp(&a.created_at));
                } else {
                    users.sort_by(|a, b| a.created_at.cmp(&b.created_at));
                }
            },
            _ => {} // Default: sort by username
        }

        // Pagination
        let page = filters.page.unwrap_or(0);
        let limit = filters.limit.unwrap_or(50);
        let start = page * limit;
        let end = start + limit;

        if start < users.len() {
            users[start..users.len().min(end)].to_vec()
        } else {
            vec![]
        }
    }
}