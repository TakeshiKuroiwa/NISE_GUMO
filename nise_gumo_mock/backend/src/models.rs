use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub display_name: String,
    pub role: UserRole,
    pub avatar_url: Option<String>,
    pub bio: Option<String>,
    pub is_invisible: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum UserRole {
    Engineer,
    ProjectLeader,
    SystemAdmin,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub leader_id: Uuid,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub status: ProjectStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProjectStatus {
    Planning,
    Active,
    Completed,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMember {
    pub project_id: Uuid,
    pub user_id: Uuid,
    pub joined_at: DateTime<Utc>,
    pub status: MemberStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MemberStatus {
    Pending,
    Active,
    Left,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WbsTask {
    pub id: Uuid,
    pub project_id: Uuid,
    pub parent_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub assignee_id: Option<Uuid>,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub progress: f32, // 0.0 to 1.0
    pub status: TaskStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskStatus {
    NotStarted,
    InProgress,
    Completed,
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub is_all_day: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    pub id: Uuid,
    pub title: String,
    pub message: String,
    pub scope: NotificationScope,
    pub target_user_ids: Option<Vec<Uuid>>,
    pub target_project_ids: Option<Vec<Uuid>>,
    pub options: Option<Vec<String>>, // For multiple choice responses
    pub created_by: Uuid,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum NotificationScope {
    Global,
    Project,
    User,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationRead {
    pub notification_id: Uuid,
    pub user_id: Uuid,
    pub read_at: DateTime<Utc>,
    pub response: Option<String>,
}

// API Request/Response types
#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: User,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub description: Option<String>,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTaskRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub assignee_id: Option<Uuid>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub progress: Option<f32>,
    pub status: Option<TaskStatus>,
}

#[derive(Debug, Deserialize)]
pub struct CreateScheduleRequest {
    pub title: String,
    pub description: Option<String>,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub is_all_day: bool,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub is_invisible: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CreateNotificationRequest {
    pub title: String,
    pub message: String,
    pub scope: NotificationScope,
    pub target_user_ids: Option<Vec<Uuid>>,
    pub target_project_ids: Option<Vec<Uuid>>,
    pub options: Option<Vec<String>>,
    pub expires_at: Option<DateTime<Utc>>,
}

// Filter types for complex filtering
#[derive(Debug, Deserialize)]
pub struct TaskFilters {
    pub project_id: Option<Uuid>,
    pub assignee_id: Option<Uuid>,
    pub status: Option<TaskStatus>,
    pub progress_min: Option<f32>,
    pub progress_max: Option<f32>,
    pub start_date_from: Option<DateTime<Utc>>,
    pub start_date_to: Option<DateTime<Utc>>,
    pub end_date_from: Option<DateTime<Utc>>,
    pub end_date_to: Option<DateTime<Utc>>,
    pub search_query: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<usize>,
    pub limit: Option<usize>,
}

#[derive(Debug, Deserialize)]
pub struct ProjectFilters {
    pub leader_id: Option<Uuid>,
    pub status: Option<ProjectStatus>,
    pub start_date_from: Option<DateTime<Utc>>,
    pub start_date_to: Option<DateTime<Utc>>,
    pub end_date_from: Option<DateTime<Utc>>,
    pub end_date_to: Option<DateTime<Utc>>,
    pub search_query: Option<String>,
    pub member_id: Option<Uuid>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<usize>,
    pub limit: Option<usize>,
}

#[derive(Debug, Deserialize)]
pub struct UserFilters {
    pub role: Option<UserRole>,
    pub search_query: Option<String>,
    pub project_id: Option<Uuid>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<usize>,
    pub limit: Option<usize>,
}
