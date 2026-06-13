# Environment Variables Setup Guide

## What's Needed NOW (Minimum for Development)

### Backend (.env)
```
PORT=8000
MONGO_URI=mongodb://localhost:27017/ysj_application_portal
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env.local or .env)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Youth Science Journal Portal
```

---

## Variable Breakdown

### 🔴 **REQUIRED NOW**

| Variable | File | Purpose | Example |
|----------|------|---------|---------|
| `MONGO_URI` | Backend | MongoDB connection string | `mongodb://localhost:27017/ysj_application_portal` |
| `PORT` | Backend | Server port | `8000` |
| `JWT_SECRET` | Backend | Secret key for JWT tokens | `your-secret-key-here` |
| `VITE_API_BASE_URL` | Frontend | Backend API endpoint | `http://localhost:8000/api` |

---

### 🟡 **OPTIONAL / FOR LATER**

| Variable | File | Purpose | When Needed |
|----------|------|---------|------------|
| `FRONTEND_URL` | Backend | Frontend URL for CORS/redirects | When email service setup |
| `MAIL_HOST` | Backend | SMTP server | When implementing email |
| `MAIL_PORT` | Backend | SMTP port | When implementing email |
| `MAIL_USER` | Backend | Email account | When implementing email |
| `MAIL_PASS` | Backend | Email password/app-password | When implementing email |
| `MAIL_FROM` | Backend | Sender email | When implementing email |
| `MAX_FILE_SIZE` | Backend | Max upload size in bytes | When file upload implemented |

---

## Quick Setup

### Backend Setup
1. Create `.env` file in `/server` folder
2. Copy content from `.env.example`
3. Update `MONGO_URI` if needed (default is `localhost:27017`)
4. Keep `JWT_SECRET` as is for development

### Frontend Setup
1. Create `.env.local` file in `/client` folder
2. Copy content from `.env.example`
3. Make sure `VITE_API_BASE_URL` matches backend port (8000)

---

## Development vs Production

### Development
- `NODE_ENV=development`
- `JWT_SECRET` - Any string (not used for security)
- `MONGO_URI` - Local MongoDB

### Production (TODO)
- `NODE_ENV=production`
- `JWT_SECRET` - Strong random string (use: `openssl rand -base64 32`)
- `MONGO_URI` - Production MongoDB Atlas or managed DB
- Enable email service
- Set `FRONTEND_URL` to production domain

---

## Troubleshooting

**Error: Cannot connect to MongoDB**
- Make sure MongoDB is running: `mongod` in terminal
- Check `MONGO_URI` format is correct
- Verify database name in URI

**Error: Cannot reach API from frontend**
- Check backend is running on correct port
- Verify `VITE_API_BASE_URL` matches backend URL
- Check CORS is enabled (if needed)

**Error: Authentication failing**
- Ensure `JWT_SECRET` is set (any string works for dev)
- Check token is being stored in localStorage
- Verify Bearer token is sent in Authorization header

---

## Files to Create

```
server/
  └── .env          ← Create this (copy from .env.example)

client/
  └── .env.local    ← Create this (copy from .env.example)
```

After copying `.env.example` to `.env`, you can keep the default values for local development.
