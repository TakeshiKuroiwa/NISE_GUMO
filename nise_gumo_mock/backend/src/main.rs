mod models;
mod mock_db;
mod handlers;

use crate::handlers::create_router;
use crate::mock_db::MockDatabase;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    // Initialize mock database
    let db = Arc::new(MockDatabase::new());

    // Print some statistics
    println!("🚀 Starting NISE_GUMO Mock Backend Server");
    println!("📊 Generated mock data:");
    println!("   - Users: {}", db.users.len());
    println!("   - Projects: {}", db.projects.len());
    println!("   - Project Members: {}", db.project_members.len());
    println!("   - WBS Tasks: {}", db.wbs_tasks.len());
    println!("   - Schedules: {}", db.schedules.len());
    println!("   - Notifications: {}", db.notifications.len());

    // Create router
    let app = create_router(db);

    // Start server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001").await.unwrap();
    println!("🌐 Server running on http://127.0.0.1:3001");
    println!("📝 API Documentation available at http://127.0.0.1:3001/docs (if swagger is enabled)");

    axum::serve(listener, app).await.unwrap();
}
