# Youth Science Journal (YSJ) - Application Portal

A modern full-stack web application for managing youth science journal program applications.

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Brevo account (for emails)

### Installation

1. **Clone/Extract the project**
   ```bash
   cd Junior-Program-Application-Portal
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Configure `.env` with your MongoDB and Brevo credentials.

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```
   Configure `.env.local` with API base URL.

4. **Start Both Servers**
   ```bash
   # Terminal 1: Backend (port 8000)
   cd server
   node index.js

   # Terminal 2: Frontend (port 5173/5174)
   cd client
   npm run dev
   ```

## Features

### 📱 Applicant Features
- **Register & Login** - Secure authentication with JWT tokens
- **Application Form** - Multi-step form with validation
- **Password Reset** - Email-based password recovery
- **Dashboard** - View application status

### 🔐 Admin Features
- **Protected Dashboard** - View submitted applications count
- **Role-Based Access** - Only admins can access admin panel
- **Email System** - Brevo integration for password reset emails

## Project Structure

```
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context
│   │   ├── utils/            # API client
│   │   └── styles/           # CSS files
│   └── .env.local            # Frontend config
│
├── server/                    # Node.js Backend
│   ├── controllers/          # Route handlers
│   ├── models/               # Database schemas
│   ├── routes/               # API routes
│   ├── middleware/           # Auth middleware
│   ├── utils/                # Email & utilities
│   ├── config/               # Database config
│   └── .env                  # Backend config
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Create new account
- `POST /api/users/login` - Login user
- `POST /api/users/reset-password` - Request password reset
- `POST /api/users/confirm-password-reset` - Confirm new password

### Application
- `POST /api/users/submit-application` - Submit application (protected)
- `GET /api/users/profile` - Get user profile (protected)

### Admin
- `GET /api/users/admin/stats` - Get dashboard stats (admin only)

## Admin Access

### Create Admin Account
```powershell
$body = @{
    username="admin"
    email="admin@example.com"
    password="YourPassword123"
    adminKey="ysj-admin-key-2024"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/users/create-admin" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body -UseBasicParsing
```

### Login as Admin
1. Go to http://localhost:5174/login
2. Enter admin email and password
3. Access admin dashboard

## Environment Variables

### Backend (.env)
```
PORT=8000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USER=your-brevo-email
MAIL_PASS=your-brevo-key
MAIL_FROM=your@email.com
BREVO_API_KEY=your-brevo-api-key
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Youth Science Journal Portal
```

## Key Technologies

- **Frontend**: React, React Router, Axios, Vite
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT tokens
- **Email**: Brevo SMTP API
- **Styling**: CSS3

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Protected admin endpoints
- ✅ Secure email verification
- ✅ CORS configuration

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify port 8000 is available
- Ensure `.env` file exists in server directory

### Frontend can't connect to API
- Check API base URL in `.env.local`
- Ensure backend is running on port 8000
- Check CORS configuration

### Emails not sending
- Verify Brevo credentials in `.env`
- Confirm sender email is verified in Brevo
- Check email formatting in logs

## Support

For issues or questions, check the logs in terminal output for detailed error messages.
