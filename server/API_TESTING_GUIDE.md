# API Testing Guide

## Quick Test Instructions

### 1. Test Registration
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "User was created successfully",
  "user": {
    "id": "user_id_here",
    "username": "testuser",
    "email": "test@example.com",
    "role": "applicant"
  },
  "token": "jwt_token_here"
}
```

---

### 2. Test Login
```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

### 3. Test Reset Password
```bash
curl -X POST http://localhost:8000/api/users/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

### 4. Test Submit Application
```bash
curl -X POST http://localhost:8000/api/users/submit-application \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "country": "USA",
    "gender": "Male",
    "birthDate": "1990-01-01",
    "institution": "Stanford University",
    "gradeYear": "Senior",
    "gpa": 3.8,
    "interest": "Machine Learning",
    "gradePrevious": "3.9",
    "essay1": "Why I want to apply...",
    "essay2": "My research interests...",
    "essay3": "My goals are...",
    "hoursAvailable": "20",
    "timeBlocks": "Flexible",
    "hearAbout": "Friend recommendation"
  }'
```

---

### 5. Test Get User Profile
```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Frontend Integration Checklist

- [x] Register component sends correct username field
- [x] Login component handles role in response
- [x] AuthContext methods call correct endpoints
- [x] ApplicationForm sends data to submit endpoint
- [ ] File uploads implemented (TODO)
- [ ] Email verification implemented (TODO)
- [ ] Token refresh logic (TODO)

---

## Important Notes

1. **Token Format:** Make sure to include the JWT token with Bearer prefix in Authorization header
2. **CORS:** If testing from different domain, CORS needs to be enabled on backend
3. **Email Service:** Email endpoints (reset password, verify) need email service configured
4. **File Uploads:** Currently file upload fields are tracked but not persisted - needs multipart/form-data handling
