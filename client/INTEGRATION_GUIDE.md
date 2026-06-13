# YSJ Portal - Full Stack Integration Guide

## 🚀 Getting Started

Both the React frontend and PHP backend are now running and connected!

### Current Status:
- ✅ React Frontend: Running on `http://localhost:5173`
- ✅ PHP Backend: Running on `http://localhost:8000`
- ✅ API: `http://localhost:8000/api`

---

## 📋 Database Setup

### 1. Create Database
```bash
mysql -u root -p
```

In MySQL:
```sql
CREATE DATABASE ysj_application_portal;
USE ysj_application_portal;
```

### 2. Initialize Schema
Import the schema file:
```bash
mysql -u root -p ysj_application_portal < .backend/schema.sql
```

Or run the SQL commands from `.backend/schema.sql` manually in your MySQL client.

### 3. Update Database Connection
Edit `.backend/db.php` and update:
```php
$host = 'localhost';        // Your MySQL host
$db = 'ysj_application_portal';  // Database name
$user = 'root';              // MySQL username
$pass = 'your_password';     // MySQL password
```

---

## 🔑 Create Test Users

After setting up the database, create test users:

```bash
mysql -u root -p ysj_application_portal < << 'EOF'
-- Create test admin user
INSERT INTO users (username, email, password, role) VALUES (
  'admin',
  'admin@example.com',
  '$2y$10$YyJ6VJ0ZvKpZnKfVHGZhyeyqTLc6o9SV.mQVY5yRLUx6HM3EZs1wy',  -- password: admin123
  'admin'
);

-- Create test reviewer user
INSERT INTO users (username, email, password, role) VALUES (
  'reviewer',
  'reviewer@example.com',
  '$2y$10$YyJ6VJ0ZvKpZnKfVHGZhyeyqTLc6o9SV.mQVY5yRLUx6HM3EZs1wy',  -- password: admin123
  'reviewer'
);

-- Create test applicant user
INSERT INTO users (username, email, password, role) VALUES (
  'applicant',
  'applicant@example.com',
  '$2y$10$YyJ6VJ0ZvKpZnKfVHGZhyeyqTLc6o9SV.mQVY5yRLUx6HM3EZs1wy',  -- password: admin123
  'applicant'
);

-- Mark emails as verified
UPDATE verifications SET is_used = TRUE WHERE user_id IN (1, 2, 3);
EOF
```

### Test Credentials:
| Role      | Email                    | Password  |
|-----------|-------------------------|-----------|
| Admin     | admin@example.com       | admin123  |
| Reviewer  | reviewer@example.com    | admin123  |
| Applicant | applicant@example.com   | admin123  |

---

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/verify-email` - Verify email
- `POST /auth/reset-password` - Request password reset
- `POST /auth/verify-token` - Verify JWT token

### Applications
- `GET /application` - Get user's application
- `GET /application/status` - Get application status
- `POST /application/submit` - Submit application
- `POST /application/save` - Save application draft

### Admin Only
- `GET /admin/stats` - Get dashboard statistics
- `GET /admin/applications` - Get all applications (paginated)
- `GET /admin/users` - Get all users
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/announcements` - Create announcement
- `GET /admin/announcements` - Get announcements
- `PUT /admin/announcements/:id` - Update announcement
- `DELETE /admin/announcements/:id` - Delete announcement
- `POST /admin/assign-reviewer` - Assign reviewer to application
- `POST /admin/make-decision` - Approve/reject application

### Reviewer Only
- `GET /reviewer/applications` - Get assigned applications
- `GET /reviewer/application/:id` - Get application details
- `POST /reviewer/score` - Submit score
- `POST /reviewer/feedback` - Submit feedback

### Public
- `GET /announcements` - Get all announcements

---

## 🔌 Testing the Integration

### 1. Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 2. Get Admin Stats (with token)
```bash
curl -X GET http://localhost:8000/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Visit the React App
- Go to `http://localhost:5173`
- Click "Login"
- Use the test credentials above

---

## 📁 Project Structure

```
.backend/
├── api.php              # Main API router
├── db.php               # Database connection
├── schema.sql           # Database schema
└── api/
    ├── auth.php         # Authentication endpoints
    ├── user.php         # User profile endpoints
    ├── application.php  # Application endpoints
    ├── admin.php        # Admin endpoints
    ├── reviewer.php     # Reviewer endpoints
    └── announcements.php # Announcements endpoints

src/
├── pages/               # React pages
├── components/          # React components
├── context/             # Context API (AuthContext)
├── utils/               # Utilities (api.js)
└── styles/              # CSS styles
```

---

## 🛠️ FEATURES NOW WORKING

### ✅ Authentication
- User registration with email verification
- Login with JWT tokens
- Password reset functionality
- Automatic token validation

### ✅ Applications
- Create/submit applications
- Save drafts
- View application status
- Reviewer scoring system

### ✅ Admin Panel
- View all applications
- View user statistics
- Manage users (create, update, delete)
- Create and manage announcements
- Assign reviewers
- Make decisions (approve/reject)

### ✅ Reviewer System
- View assigned applications
- Score applications (0-100)
- Submit reviewer feedback
- Track review status

### ✅ Announcements
- Public announcement viewing
- Admin announcement management
- Email notification support (ready for integration)

---

## 🚨 Troubleshooting

### 401 Unauthorized Errors
- Make sure you're including the JWT token in the Authorization header
- Verify the token hasn't expired
- Check that the token is stored in localStorage

### 403 Forbidden Errors
- Check user role (admin/reviewer/applicant)
- Verify user has permission for the endpoint

### CORS Errors
- Make sure PHP server is running with proper CORS headers
- Check that localhost:8000 is accessible

### Database Connection Errors
- Verify MySQL is running
- Check database credentials in `.backend/db.php`
- Ensure tables are created with `schema.sql`

---

## 🔒 Security Notes

⚠️ **IMPORTANT**: Before deploying to production:

1. Change the `JWT_SECRET` in `api.php`
2. Use HTTPS for all connections
3. Implement CSRF token validation
4. Add rate limiting to API endpoints
5. Validate and sanitize all file uploads
6. Use environment variables for database credentials
7. Implement proper error logging
8. Add security headers (CORS, CSP, etc.)

---

## 📞 API Response Format

All endpoints return JSON:

### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🔄 Common Workflows

### User Registration & First Login
1. POST `/auth/register` with email, username, password
2. Check email for verification link
3. Click verification link or POST `/auth/verify-email` with token
4. POST `/auth/login` with email and password
5. Receive JWT token in response
6. Store token in localStorage

### Submit Application (Applicant)
1. User logs in and receives JWT token
2. POST `/application/submit` with form data
3. Receive confirmation with application ID
4. Can view status with GET `/application/status`

### Review Application (Reviewer)
1. User logs in (reviewer role)
2. GET `/reviewer/applications` to see assigned apps
3. GET `/reviewer/application/:id` for details
4. POST `/reviewer/score` to submit score
5. POST `/reviewer/feedback` to submit feedback

---

## 📚 Additional Resources

- React Router Documentation: https://reactrouter.com
- JWT Documentation: https://jwt.io
- PHP Documentation: https://www.php.net
- Axios Documentation: https://axios-http.com

---

**Last Updated**: June 12, 2026
**Status**: ✅ Full Stack Integration Complete
