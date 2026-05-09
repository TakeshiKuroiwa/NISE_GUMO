use crate::models::*;
use crate::mock_db::MockDatabase;
use axum::{
    extract::{Path, Query, State},
    http::{StatusCode, HeaderMap},
    response::Json,
    routing::{get, post, put, delete},
    Router,
};
use chrono::{Utc, Duration};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey, errors::Error as JwtError};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // user id
    exp: usize,  // expiration time
}

pub fn create_router(db: Arc<MockDatabase>) -> Router {
    Router::new()
        .route("/auth/login", post(login))
        .route("/auth/me", get(get_current_user))
        .route("/projects", get(get_projects))
        .route("/projects", post(create_project))
        .route("/projects/:id", get(get_project))
        .route("/projects/:id", put(update_project))
        .route("/projects/:id/tasks", get(get_project_tasks))
        .route("/tasks", get(get_tasks))
        .route("/tasks/:id", get(get_task))
        .route("/tasks/:id", put(update_task))
        .route("/schedules", get(get_schedules))
        .route("/schedules", post(create_schedule))
        .route("/schedules/:id", put(update_schedule))
        .route("/schedules/:id", delete(delete_schedule))
        .route("/users", get(get_users))
        .route("/users/:id", get(get_user))
        .route("/users/:id/profile", put(update_profile))
        .route("/notifications", get(get_notifications))
        .route("/notifications", post(create_notification))
        .route("/notifications/:id/read", post(mark_notification_read))
        .layer(CorsLayer::permissive())
        .with_state(db)
}

fn get_jwt_secret() -> &'static str {
    "your-secret-key-change-this-in-production"
}

fn create_token(user_id: &str) -> Result<String, JwtError> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_owned(),
        exp: expiration,
    };

    let header = Header::new(Algorithm::HS256);
    let encoding_key = EncodingKey::from_secret(get_jwt_secret().as_ref());

    encode(&header, &claims, &encoding_key)
}

fn verify_token(token: &str) -> Result<Claims, JwtError> {
    let decoding_key = DecodingKey::from_secret(get_jwt_secret().as_ref());
    let validation = Validation::new(Algorithm::HS256);

    decode::<Claims>(token, &decoding_key, &validation).map(|data| data.claims)
}

fn extract_user_id(headers: &HeaderMap) -> Result<Uuid, StatusCode> {
    let auth_header = headers.get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "));

    match auth_header {
        Some(token) => {
            match verify_token(token) {
                Ok(claims) => {
                    Uuid::parse_str(&claims.sub).map_err(|_| StatusCode::UNAUTHORIZED)
                },
                Err(_) => Err(StatusCode::UNAUTHORIZED),
            }
        },
        None => Err(StatusCode::UNAUTHORIZED),
    }
}

async fn login(
    State(db): State<Arc<MockDatabase>>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<ApiResponse<LoginResponse>>, StatusCode> {
    // Simple authentication - in real app, verify password hash
    if let Some(user) = db.get_user_by_username(&req.username) {
        // For demo purposes, accept any password for existing users
        let token = create_token(&user.id.to_string()).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        let response = LoginResponse {
            token,
            user: user.clone(),
        };

        Ok(Json(ApiResponse {
            success: true,
            data: Some(response),
            error: None,
        }))
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

async fn get_current_user(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
) -> Result<Json<ApiResponse<User>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    if let Some(user) = db.users.iter().find(|u| u.id == user_id) {
        Ok(Json(ApiResponse {
            success: true,
            data: Some(user.clone()),
            error: None,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn get_projects(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Query(filters): Query<ProjectFilters>,
) -> Result<Json<ApiResponse<Vec<Project>>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    // Engineers can only see their own projects
    let mut filtered_filters = filters;
    if matches!(current_user.role, UserRole::Engineer) {
        filtered_filters.member_id = Some(user_id);
    }

    let projects: Vec<Project> = db.filter_projects(&filtered_filters)
        .into_iter()
        .cloned()
        .collect();

    Ok(Json(ApiResponse {
        success: true,
        data: Some(projects),
        error: None,
    }))
}

async fn create_project(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Json(req): Json<CreateProjectRequest>,
) -> Result<Json<ApiResponse<Project>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    // Only Project Leaders and System Admins can create projects
    if !matches!(current_user.role, UserRole::ProjectLeader | UserRole::SystemAdmin) {
        return Err(StatusCode::FORBIDDEN);
    }

    let project = Project {
        id: Uuid::new_v4(),
        name: req.name,
        description: req.description,
        leader_id: user_id,
        start_date: req.start_date,
        end_date: req.end_date,
        status: ProjectStatus::Planning,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    // In a real app, this would be saved to database
    // For mock, we just return the created project

    Ok(Json(ApiResponse {
        success: true,
        data: Some(project),
        error: None,
    }))
}

async fn get_project(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Project>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    if let Some(project) = db.projects.iter().find(|p| p.id == project_id) {
        // Check if user has access to this project
        let has_access = matches!(current_user.role, UserRole::SystemAdmin) ||
            project.leader_id == user_id ||
            db.project_members.iter().any(|m| m.project_id == project_id && m.user_id == user_id && m.status == MemberStatus::Active);

        if has_access {
            Ok(Json(ApiResponse {
                success: true,
                data: Some(project.clone()),
                error: None,
            }))
        } else {
            Err(StatusCode::FORBIDDEN)
        }
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn update_project(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(project_id): Path<Uuid>,
    Json(req): Json<CreateProjectRequest>,
) -> Result<Json<ApiResponse<Project>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    if let Some(project) = db.projects.iter().find(|p| p.id == project_id) {
        // Only project leader or system admin can update
        if project.leader_id != user_id && !matches!(current_user.role, UserRole::SystemAdmin) {
            return Err(StatusCode::FORBIDDEN);
        }

        let updated_project = Project {
            name: req.name,
            description: req.description,
            start_date: req.start_date,
            end_date: req.end_date,
            updated_at: Utc::now(),
            ..project.clone()
        };

        Ok(Json(ApiResponse {
            success: true,
            data: Some(updated_project),
            error: None,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn get_project_tasks(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(project_id): Path<Uuid>,
    Query(filters): Query<TaskFilters>,
) -> Result<Json<ApiResponse<Vec<WbsTask>>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    // Check access
    let has_access = matches!(current_user.role, UserRole::SystemAdmin) ||
        db.projects.iter().any(|p| p.id == project_id && p.leader_id == user_id) ||
        db.project_members.iter().any(|m| m.project_id == project_id && m.user_id == user_id && m.status == MemberStatus::Active);

    if !has_access {
        return Err(StatusCode::FORBIDDEN);
    }

    let mut task_filters = filters;
    task_filters.project_id = Some(project_id);

    let tasks: Vec<WbsTask> = db.filter_tasks(&task_filters)
        .into_iter()
        .cloned()
        .collect();

    Ok(Json(ApiResponse {
        success: true,
        data: Some(tasks),
        error: None,
    }))
}

async fn get_tasks(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Query(filters): Query<TaskFilters>,
) -> Result<Json<ApiResponse<Vec<WbsTask>>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    // Engineers can only see tasks from their projects
    let mut task_filters = filters;
    if matches!(current_user.role, UserRole::Engineer) {
        let user_projects: Vec<Uuid> = db.get_user_projects(user_id)
            .iter()
            .map(|p| p.id)
            .collect();
        // For simplicity, we'll filter by the first project if no project filter is set
        if task_filters.project_id.is_none() && !user_projects.is_empty() {
            task_filters.project_id = Some(user_projects[0]);
        }
    }

    let tasks: Vec<WbsTask> = db.filter_tasks(&task_filters)
        .into_iter()
        .cloned()
        .collect();

    Ok(Json(ApiResponse {
        success: true,
        data: Some(tasks),
        error: None,
    }))
}

async fn get_task(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(task_id): Path<Uuid>,
) -> Result<Json<ApiResponse<WbsTask>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    if let Some(task) = db.wbs_tasks.iter().find(|t| t.id == task_id) {
        // Check if user has access to the project
        let has_access = db.project_members.iter().any(|m| m.project_id == task.project_id && m.user_id == user_id && m.status == MemberStatus::Active) ||
            db.projects.iter().any(|p| p.id == task.project_id && p.leader_id == user_id);

        if has_access {
            Ok(Json(ApiResponse {
                success: true,
                data: Some(task.clone()),
                error: None,
            }))
        } else {
            Err(StatusCode::FORBIDDEN)
        }
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn update_task(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(task_id): Path<Uuid>,
    Json(req): Json<UpdateTaskRequest>,
) -> Result<Json<ApiResponse<WbsTask>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    if let Some(task) = db.wbs_tasks.iter().find(|t| t.id == task_id) {
        // Check permissions
        let project = db.projects.iter().find(|p| p.id == task.project_id).ok_or(StatusCode::NOT_FOUND)?;
        let can_edit = matches!(current_user.role, UserRole::SystemAdmin) ||
            project.leader_id == user_id ||
            (matches!(current_user.role, UserRole::ProjectLeader) && task.assignee_id == Some(user_id));

        if !can_edit {
            return Err(StatusCode::FORBIDDEN);
        }

        let mut updated_task = task.clone();
        if let Some(title) = req.title {
            updated_task.title = title;
        }
        if let Some(description) = req.description {
            updated_task.description = description;
        }
        if let Some(assignee_id) = req.assignee_id {
            updated_task.assignee_id = Some(assignee_id);
        }
        if let Some(start_date) = req.start_date {
            updated_task.start_date = start_date;
        }
        if let Some(end_date) = req.end_date {
            updated_task.end_date = end_date;
        }
        if let Some(progress) = req.progress {
            updated_task.progress = progress;
            updated_task.status = if progress >= 1.0 {
                TaskStatus::Completed
            } else if progress > 0.0 {
                TaskStatus::InProgress
            } else {
                TaskStatus::NotStarted
            };
        }
        if let Some(status) = req.status {
            updated_task.status = status;
        }
        updated_task.updated_at = Utc::now();

        Ok(Json(ApiResponse {
            success: true,
            data: Some(updated_task),
            error: None,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn get_schedules(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
) -> Result<Json<ApiResponse<Vec<Schedule>>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    let schedules: Vec<Schedule> = db.get_user_schedules(user_id)
        .into_iter()
        .cloned()
        .collect();

    Ok(Json(ApiResponse {
        success: true,
        data: Some(schedules),
        error: None,
    }))
}

async fn create_schedule(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Json(req): Json<CreateScheduleRequest>,
) -> Result<Json<ApiResponse<Schedule>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    let schedule = Schedule {
        id: Uuid::new_v4(),
        user_id,
        title: req.title,
        description: req.description,
        start_date: req.start_date,
        end_date: req.end_date,
        is_all_day: req.is_all_day,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    Ok(Json(ApiResponse {
        success: true,
        data: Some(schedule),
        error: None,
    }))
}

async fn update_schedule(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(schedule_id): Path<Uuid>,
    Json(req): Json<CreateScheduleRequest>,
) -> Result<Json<ApiResponse<Schedule>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    if let Some(schedule) = db.schedules.iter().find(|s| s.id == schedule_id && s.user_id == user_id) {
        let updated_schedule = Schedule {
            title: req.title,
            description: req.description,
            start_date: req.start_date,
            end_date: req.end_date,
            is_all_day: req.is_all_day,
            updated_at: Utc::now(),
            ..schedule.clone()
        };

        Ok(Json(ApiResponse {
            success: true,
            data: Some(updated_schedule),
            error: None,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn delete_schedule(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(schedule_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    if db.schedules.iter().any(|s| s.id == schedule_id && s.user_id == user_id) {
        Ok(Json(ApiResponse {
            success: true,
            data: Some(()),
            error: None,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn get_users(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Query(filters): Query<UserFilters>,
) -> Result<Json<ApiResponse<Vec<User>>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    // Only system admins can see all users
    let mut user_filters = filters;
    if !matches!(current_user.role, UserRole::SystemAdmin) {
        // Non-admins can only see users in their projects
        let user_projects: Vec<Uuid> = db.get_user_projects(user_id)
            .iter()
            .map(|p| p.id)
            .collect();
        if !user_projects.is_empty() {
            user_filters.project_id = Some(user_projects[0]);
        }
    }

    let users: Vec<User> = db.filter_users(&user_filters)
        .into_iter()
        .cloned()
        .collect();

    Ok(Json(ApiResponse {
        success: true,
        data: Some(users),
        error: None,
    }))
}

async fn get_user(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(user_id): Path<Uuid>,
) -> Result<Json<ApiResponse<User>>, StatusCode> {
    let current_user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == current_user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    if let Some(user) = db.users.iter().find(|u| u.id == user_id) {
        // Check if current user can view this user
        let can_view = matches!(current_user.role, UserRole::SystemAdmin) ||
            user_id == current_user_id ||
            db.project_members.iter().any(|m1|
                db.project_members.iter().any(|m2|
                    m1.project_id == m2.project_id &&
                    m1.user_id == current_user_id &&
                    m2.user_id == user_id &&
                    m1.status == MemberStatus::Active &&
                    m2.status == MemberStatus::Active
                )
            );

        if can_view {
            Ok(Json(ApiResponse {
                success: true,
                data: Some(user.clone()),
                error: None,
            }))
        } else {
            Err(StatusCode::FORBIDDEN)
        }
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn update_profile(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(user_id): Path<Uuid>,
    Json(req): Json<UpdateProfileRequest>,
) -> Result<Json<ApiResponse<User>>, StatusCode> {
    let current_user_id = extract_user_id(&headers)?;

    if user_id != current_user_id {
        return Err(StatusCode::FORBIDDEN);
    }

    if let Some(user) = db.users.iter().find(|u| u.id == user_id) {
        let updated_user = User {
            display_name: req.display_name.unwrap_or(user.display_name.clone()),
            bio: req.bio.or(user.bio.clone()),
            is_invisible: req.is_invisible.unwrap_or(user.is_invisible),
            updated_at: Utc::now(),
            ..user.clone()
        };

        Ok(Json(ApiResponse {
            success: true,
            data: Some(updated_user),
            error: None,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn get_notifications(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
) -> Result<Json<ApiResponse<Vec<Notification>>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    let notifications: Vec<Notification> = db.get_user_notifications(user_id)
        .into_iter()
        .cloned()
        .collect();

    Ok(Json(ApiResponse {
        success: true,
        data: Some(notifications),
        error: None,
    }))
}

async fn create_notification(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Json(req): Json<CreateNotificationRequest>,
) -> Result<Json<ApiResponse<Notification>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;
    let current_user = db.users.iter().find(|u| u.id == user_id).ok_or(StatusCode::UNAUTHORIZED)?;

    // Only system admins can create notifications
    if !matches!(current_user.role, UserRole::SystemAdmin) {
        return Err(StatusCode::FORBIDDEN);
    }

    let notification = Notification {
        id: Uuid::new_v4(),
        title: req.title,
        message: req.message,
        scope: req.scope,
        target_user_ids: req.target_user_ids,
        target_project_ids: req.target_project_ids,
        options: req.options,
        created_by: user_id,
        created_at: Utc::now(),
        expires_at: req.expires_at,
    };

    Ok(Json(ApiResponse {
        success: true,
        data: Some(notification),
        error: None,
    }))
}

async fn mark_notification_read(
    headers: HeaderMap,
    State(db): State<Arc<MockDatabase>>,
    Path(notification_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    let user_id = extract_user_id(&headers)?;

    // Check if notification exists and user can access it
    if db.get_user_notifications(user_id).iter().any(|n| n.id == notification_id) {
        Ok(Json(ApiResponse {
            success: true,
            data: Some(()),
            error: None,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}